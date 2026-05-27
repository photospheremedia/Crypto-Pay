import "server-only";

import { createHmac } from "crypto";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";
import type { MerchantWallet, WalletStatus } from "@/types/crypto-pay-db";

export type WalletStatusWebhookEvent = {
  type: "wallet.status.updated";
  wallet: {
    id: string;
    user_id: string;
    external_id: string | null;
    label: string;
    wallet_network: string;
    wallet_address: string;
    status: WalletStatus;
    source: string;
    is_primary: boolean;
    verification_requested_at: string;
    verified_at: string | null;
    rejection_reason: string | null;
  };
  previous_status: WalletStatus;
};

function signWebhook(secret: string, timestamp: number, rawBody: string): string {
  const payload = `${timestamp}.${rawBody}`;
  return createHmac("sha256", secret).update(payload).digest("hex");
}

async function logRunnerEvent(
  runnerClientId: string,
  eventType: string,
  payload: Record<string, unknown>,
  userId?: string,
  walletId?: string,
) {
  const supabase = getSupabaseServiceClient();
  await supabase.from("runner_api_events").insert({
    runner_client_id: runnerClientId,
    event_type: eventType,
    user_id: userId ?? null,
    merchant_wallet_id: walletId ?? null,
    payload,
  });
}

/**
 * Notify the runner app when a linked wallet leaves `pending` (verified / rejected).
 * No-op when the wallet was not created by a runner client or webhook_url is unset.
 */
export async function dispatchRunnerWalletStatusWebhook(params: {
  wallet: MerchantWallet;
  previousStatus: WalletStatus;
}): Promise<{ dispatched: boolean; skipped?: string; error?: string }> {
  const runnerClientId = params.wallet.runner_client_id;
  if (!runnerClientId || params.wallet.source !== "runner_api") {
    return { dispatched: false, skipped: "not_runner_wallet" };
  }

  const supabase = getSupabaseServiceClient();
  const { data: client, error } = await supabase
    .from("runner_api_clients")
    .select("id, slug, webhook_url, webhook_secret, is_active")
    .eq("id", runnerClientId)
    .maybeSingle();

  if (error || !client) {
    return { dispatched: false, skipped: "runner_client_not_found" };
  }

  if (!client.is_active) {
    return { dispatched: false, skipped: "runner_client_inactive" };
  }

  const webhookUrl = client.webhook_url?.trim();
  if (!webhookUrl) {
    return { dispatched: false, skipped: "webhook_url_not_configured" };
  }

  const event: WalletStatusWebhookEvent = {
    type: "wallet.status.updated",
    wallet: {
      id: params.wallet.id,
      user_id: params.wallet.user_id,
      external_id: params.wallet.external_id ?? null,
      label: params.wallet.label,
      wallet_network: params.wallet.wallet_network,
      wallet_address: params.wallet.wallet_address,
      status: params.wallet.status,
      source: params.wallet.source ?? "runner_api",
      is_primary: params.wallet.is_primary,
      verification_requested_at: params.wallet.verification_requested_at,
      verified_at: params.wallet.verified_at,
      rejection_reason: params.wallet.rejection_reason,
    },
    previous_status: params.previousStatus,
  };

  const rawBody = JSON.stringify(event);
  const timestamp = Math.floor(Date.now() / 1000);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-CryptoPay-Event": event.type,
    "X-CryptoPay-Timestamp": String(timestamp),
  };

  const secret = client.webhook_secret?.trim();
  if (secret) {
    headers["X-CryptoPay-Signature"] = signWebhook(secret, timestamp, rawBody);
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: rawBody,
      signal: AbortSignal.timeout(15_000),
    });

    const responseText = (await res.text()).slice(0, 500);

    await logRunnerEvent(
      runnerClientId,
      res.ok ? "webhook.wallet_status.delivered" : "webhook.wallet_status.failed",
      {
        status: res.status,
        response: responseText,
        wallet_id: params.wallet.id,
        external_id: params.wallet.external_id,
        new_status: params.wallet.status,
      },
      params.wallet.user_id,
      params.wallet.id,
    );

    if (!res.ok) {
      return {
        dispatched: false,
        error: `Runner webhook returned ${res.status}`,
      };
    }

    return { dispatched: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook request failed";
    await logRunnerEvent(
      runnerClientId,
      "webhook.wallet_status.error",
      { error: message, wallet_id: params.wallet.id },
      params.wallet.user_id,
      params.wallet.id,
    );
    return { dispatched: false, error: message };
  }
}
