/**
 * Runner platform API — attach/list merchant wallets per user (HMAC handshake).
 *
 * Base: POST https://<project>.supabase.co/functions/v1/runner-api
 *
 * Headers (every request):
 *   X-CryptoPay-Key: <api_key>
 *   X-CryptoPay-Timestamp: <unix_seconds>
 *   X-CryptoPay-Signature: hex(hmac_sha256(secret, "{timestamp}.{METHOD}.{path}.{raw_body}"))
 *
 * Routes:
 *   GET  /v1/wallets?user_id=<uuid> | ?email=<email>
 *   POST /v1/wallets  — create/update by external_id
 *   DELETE /v1/wallets/:id — pending only
 */

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createSupabaseClient } from "../_shared/db.ts";
import { getRunnerApiPath, verifyRunnerRequest } from "../_shared/runner-auth.ts";
import { buildWalletPendingAdminHtml } from "../_shared/wallet-admin-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-CryptoPay-Key, X-CryptoPay-Timestamp, X-CryptoPay-Signature",
};

async function notifyAdminPendingWallet(params: {
  merchantEmail: string;
  wallet: Record<string, unknown>;
  runnerName: string;
}) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const adminEmail = Deno.env.get("ADMIN_REVIEW_EMAIL") ?? "photospheremedia00@gmail.com";
  const from = Deno.env.get("EMAIL_FROM") ?? "Crypto Pay <noreply@cryptopay.sale>";
  if (!resendKey) return;

  const w = params.wallet;
  const label = String(w.label ?? "Wallet");
  const html = buildWalletPendingAdminHtml({
    merchantEmail: params.merchantEmail,
    walletLabel: label,
    walletNetwork: String(w.wallet_network ?? "btc"),
    walletAddress: String(w.wallet_address ?? ""),
    walletId: String(w.id ?? ""),
    source: `runner:${params.runnerName}`,
    kind: "submitted",
  });

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [adminEmail],
      subject: `[Crypto Pay] New wallet pending: ${label}`,
      html,
    }),
  });
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function resolveUserId(
  supabase: ReturnType<typeof createSupabaseClient>,
  userId?: string | null,
  email?: string | null,
): Promise<string | null> {
  if (userId) return userId;
  if (!email) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (profile?.id) return profile.id;

  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const match = list?.users?.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  );
  return match?.id ?? null;
}

async function logEvent(
  supabase: ReturnType<typeof createSupabaseClient>,
  clientId: string,
  eventType: string,
  payload: Record<string, unknown>,
  userId?: string | null,
  walletId?: string | null,
) {
  await supabase.from("runner_api_events").insert({
    runner_client_id: clientId,
    event_type: eventType,
    user_id: userId ?? null,
    merchant_wallet_id: walletId ?? null,
    payload,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const rawBody = req.method === "GET" || req.method === "DELETE"
    ? ""
    : await req.text();

  const auth = await verifyRunnerRequest(req, rawBody);
  if (!auth.ok) {
    return json({ error: auth.error }, auth.status);
  }

  const { client } = auth;
  const supabase = createSupabaseClient();
  const url = new URL(req.url);
  const routePath = getRunnerApiPath(url);

  try {
    // GET /v1/wallets
    if (req.method === "GET" && routePath === "/v1/wallets") {
      const userId = await resolveUserId(
        supabase,
        url.searchParams.get("user_id"),
        url.searchParams.get("email"),
      );
      if (!userId) {
        return json({ error: "user_id or email required / user not found" }, 404);
      }

      const { data, error } = await supabase
        .from("merchant_wallets")
        .select(
          "id, user_id, label, wallet_network, wallet_address, status, is_primary, external_id, source, verification_requested_at, verified_at, created_at, updated_at",
        )
        .eq("user_id", userId)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        return json({ error: error.message }, 500);
      }

      return json({ user_id: userId, wallets: data ?? [] });
    }

    // POST /v1/wallets
    if (req.method === "POST" && routePath === "/v1/wallets") {
      let body: {
        user_id?: string;
        email?: string;
        external_id?: string;
        label?: string;
        wallet_network?: string;
        wallet_address?: string;
        is_primary?: boolean;
      };

      try {
        body = rawBody ? JSON.parse(rawBody) : {};
      } catch {
        return json({ error: "Invalid JSON body" }, 400);
      }

      const userId = await resolveUserId(supabase, body.user_id, body.email);
      if (!userId) {
        return json({ error: "user not found (user_id or email)" }, 404);
      }

      const label = (body.label ?? "Runner wallet").trim();
      const walletNetwork = (body.wallet_network ?? "btc").toLowerCase();
      const walletAddress = (body.wallet_address ?? "").trim();
      const externalId = body.external_id?.trim() || null;

      if (!walletAddress || walletAddress.length < 12) {
        return json({ error: "wallet_address required" }, 400);
      }

      const allowed = ["btc", "eth", "ltc", "usdt", "usdc"];
      if (!allowed.includes(walletNetwork)) {
        return json({ error: `wallet_network must be one of: ${allowed.join(", ")}` }, 400);
      }

      if (body.is_primary) {
        await supabase
          .from("merchant_wallets")
          .update({ is_primary: false })
          .eq("user_id", userId);
      }

      let existingId: string | null = null;
      if (externalId) {
        const { data: existing } = await supabase
          .from("merchant_wallets")
          .select("id")
          .eq("runner_client_id", client.id)
          .eq("external_id", externalId)
          .maybeSingle();
        existingId = existing?.id ?? null;
      }

      const row = {
        user_id: userId,
        label,
        wallet_network: walletNetwork,
        wallet_address: walletAddress,
        status: "pending",
        is_primary: body.is_primary ?? false,
        source: "runner_api",
        runner_client_id: client.id,
        external_id: externalId,
        verification_requested_at: new Date().toISOString(),
      };

      let wallet;
      if (existingId) {
        const { data, error } = await supabase
          .from("merchant_wallets")
          .update(row)
          .eq("id", existingId)
          .select()
          .single();
        if (error) return json({ error: error.message }, 500);
        wallet = data;
      } else {
        const { data, error } = await supabase
          .from("merchant_wallets")
          .insert(row)
          .select()
          .single();
        if (error) {
          if (error.code === "23505") {
            return json({ error: "Duplicate label or external_id for this user" }, 409);
          }
          return json({ error: error.message }, 500);
        }
        wallet = data;
      }

      if (wallet?.is_primary) {
        await supabase.from("user_wallet_profiles").upsert(
          {
            user_id: userId,
            wallet_network: wallet.wallet_network,
            wallet_address: wallet.wallet_address,
            wallet_verified: false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
      }

      await logEvent(supabase, client.id, "wallet.upsert", {
        external_id: externalId,
        label,
        wallet_network: walletNetwork,
      }, userId, wallet?.id);

      await notifyAdminPendingWallet({
        merchantEmail: body.email ?? userId,
        wallet,
        runnerName: client.name,
      });

      return json({ wallet }, existingId ? 200 : 201);
    }

    // DELETE /v1/wallets/:id
    const deleteMatch = routePath.match(/^\/v1\/wallets\/([0-9a-f-]{36})$/i);
    if (req.method === "DELETE" && deleteMatch) {
      const walletId = deleteMatch[1];
      const { data: wallet } = await supabase
        .from("merchant_wallets")
        .select("id, user_id, status, runner_client_id")
        .eq("id", walletId)
        .maybeSingle();

      if (!wallet) return json({ error: "Wallet not found" }, 404);
      if (wallet.runner_client_id !== client.id) {
        return json({ error: "Wallet not owned by this runner client" }, 403);
      }
      if (wallet.status !== "pending") {
        return json({ error: "Only pending wallets can be deleted" }, 400);
      }

      const { error } = await supabase
        .from("merchant_wallets")
        .delete()
        .eq("id", walletId);

      if (error) return json({ error: error.message }, 500);

      await logEvent(supabase, client.id, "wallet.delete", { wallet_id: walletId }, wallet.user_id);
      return json({ success: true });
    }

    return json({ error: "Not found", path: routePath }, 404);
  } catch (err) {
    console.error("[runner-api]", err);
    return json(
      { error: err instanceof Error ? err.message : "Internal error" },
      500,
    );
  }
});
