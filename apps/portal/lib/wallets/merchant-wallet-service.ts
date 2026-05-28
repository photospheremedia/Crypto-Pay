import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { merchantWallets } from "@/lib/wallets/db";
import { RESEND_IDEMPOTENCY_MS, notifyAdminWalletReview } from "@/lib/wallets/notify-admin";
import { scheduleEmailWork } from "@/lib/email/schedule";
import { logEmailWorkflow } from "@/lib/email/workflows";
import {
  runWalletPendingAdminNotifyWorkflow,
  shouldNotifyAdminWalletPending,
} from "@/lib/email/workflows";
import { notifyMerchantWalletSubmitted } from "@/lib/wallets/notify-admin";
import { scheduleSmsWork } from "@/lib/sms/schedule";
import { runWalletSubmittedSmsWorkflow } from "@/lib/sms/workflows";
import type { MerchantWalletInput } from "@/lib/wallets/validation";
import type { MerchantWallet } from "@/types/crypto-pay-db";

export type WalletServiceErrorCode =
  | "invalid"
  | "not_found"
  | "duplicate_name"
  | "save_failed"
  | "update_failed"
  | "delete_only_pending"
  | "resend_only_pending"
  | "resend_cooldown"
  | "reminder_failed"
  | "request_update_failed";

export type WalletServiceResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; code: WalletServiceErrorCode; message: string };

type MerchantUser = { id: string; email?: string | null };

async function syncLegacyPrimaryWallet(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data: primary } = await merchantWallets(supabase)
    .select("wallet_network, wallet_address, status")
    .eq("user_id", userId)
    .eq("is_primary", true)
    .maybeSingle();

  if (!primary) return;

  await supabase.from("user_wallet_profiles").upsert(
    {
      user_id: userId,
      wallet_network: primary.wallet_network,
      wallet_address: primary.wallet_address,
      wallet_verified: primary.status === "verified",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

export async function upsertMerchantWallet(
  supabase: SupabaseClient,
  user: MerchantUser,
  input: MerchantWalletInput,
): Promise<WalletServiceResult<MerchantWallet>> {
  const { id, label, walletNetwork, walletAddress, isPrimary } = input;
  const isCreate = !id;

  let previousWallet: {
    wallet_network: string;
    wallet_address: string;
    status: string;
    verification_requested_at: string;
  } | null = null;

  if (id) {
    const { data: existing } = await merchantWallets(supabase)
      .select("wallet_network, wallet_address, status, verification_requested_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    previousWallet = existing;
    if (!existing) {
      return { ok: false, code: "not_found", message: "Wallet not found" };
    }
  }

  if (isPrimary) {
    await merchantWallets(supabase).update({ is_primary: false }).eq("user_id", user.id);
  }

  const materialChange =
    isCreate ||
    !previousWallet ||
    previousWallet.wallet_network !== walletNetwork ||
    previousWallet.wallet_address !== walletAddress;

  const row: Record<string, unknown> = {
    user_id: user.id,
    label,
    wallet_network: walletNetwork,
    wallet_address: walletAddress,
    is_primary: isPrimary ?? false,
  };

  if (isCreate) {
    row.status = "pending";
    row.verification_requested_at = new Date().toISOString();
  } else if (materialChange) {
    row.status = "pending";
    row.verification_requested_at = new Date().toISOString();
    row.verified_at = null;
    row.verified_by = null;
    row.rejection_reason = null;
    row.merchant_status_emailed_at = null;
    row.merchant_status_emailed_for_request = null;
  }

  let walletId = id;
  if (id) {
    const { error } = await merchantWallets(supabase)
      .update(row)
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) {
      if (error.code === "23505") {
        return { ok: false, code: "duplicate_name", message: "Wallet name already exists" };
      }
      return { ok: false, code: "update_failed", message: "Update failed" };
    }
  } else {
    const { data, error } = await merchantWallets(supabase)
      .insert(row)
      .select("id, label, wallet_network, wallet_address, status, is_primary, verification_requested_at, created_at, updated_at, verified_at, verified_by, rejection_reason")
      .single();
    if (error) {
      if (error.code === "23505") {
        return { ok: false, code: "duplicate_name", message: "Wallet name already exists" };
      }
      return { ok: false, code: "save_failed", message: "Save failed" };
    }
    walletId = data.id;
  }

  const { data: saved, error: loadError } = await merchantWallets(supabase)
    .select("*")
    .eq("id", walletId!)
    .single();

  if (loadError || !saved) {
    return { ok: false, code: "save_failed", message: "Save failed" };
  }

  if (saved.status === "pending") {
    const notifyAdmin =
      materialChange &&
      shouldNotifyAdminWalletPending({
        isCreate,
        previous: previousWallet as Pick<MerchantWallet, "wallet_network" | "wallet_address"> | null,
        next: saved,
      });

    if (notifyAdmin) {
      const merchantEmail = user.email ?? "";
      const reason = isCreate ? "created" : "updated_material";

      const adminResult = await runWalletPendingAdminNotifyWorkflow({
        reason,
        wallet: saved,
        merchantEmail,
        merchantUserId: user.id,
      });
      logEmailWorkflow(`wallet.pending.admin.${saved.id}`, adminResult);

      if (isCreate && merchantEmail) {
        scheduleEmailWork(`wallet.pending.merchant.${saved.id}`, () =>
          notifyMerchantWalletSubmitted({
            merchantEmail,
            merchantUserId: user.id,
            walletId: saved.id,
            label: saved.label,
            walletNetwork: saved.wallet_network,
          }),
        );
      }

      if (isCreate) {
        scheduleSmsWork(`wallet.pending.merchant.sms.${saved.id}`, () =>
          runWalletSubmittedSmsWorkflow({
            merchantUserId: user.id,
            walletId: saved.id,
            label: saved.label,
          }),
        );
      }
    }
  }

  await syncLegacyPrimaryWallet(supabase, user.id);
  return { ok: true, data: saved as MerchantWallet };
}

export async function deleteMerchantWalletRecord(
  supabase: SupabaseClient,
  userId: string,
  walletId: string,
): Promise<WalletServiceResult> {
  const { error } = await merchantWallets(supabase)
    .delete()
    .eq("id", walletId)
    .eq("user_id", userId)
    .eq("status", "pending");

  if (error) {
    return {
      ok: false,
      code: "delete_only_pending",
      message: "Only pending wallets can be deleted",
    };
  }

  await syncLegacyPrimaryWallet(supabase, userId);
  return { ok: true };
}

export async function resendMerchantWalletVerification(
  supabase: SupabaseClient,
  user: MerchantUser,
  walletId: string,
): Promise<WalletServiceResult> {
  const { data: wallet, error } = await merchantWallets(supabase)
    .select(
      "id, label, wallet_network, wallet_address, status, last_admin_reminder_at",
    )
    .eq("id", walletId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !wallet) {
    return { ok: false, code: "not_found", message: "Wallet not found" };
  }

  if (wallet.status !== "pending") {
    return {
      ok: false,
      code: "resend_only_pending",
      message: "Only pending wallets can be resent",
    };
  }

  const lastReminder = (wallet as { last_admin_reminder_at?: string | null })
    .last_admin_reminder_at;
  if (lastReminder) {
    const elapsed = Date.now() - new Date(lastReminder).getTime();
    if (elapsed < RESEND_IDEMPOTENCY_MS) {
      return { ok: false, code: "resend_cooldown", message: "Please wait before resending" };
    }
  }

  const emailResult = await notifyAdminWalletReview({
    kind: "resend",
    wallet,
    merchantEmail: user.email ?? "unknown",
    merchantUserId: user.id,
  });

  if (!emailResult.success) {
    return { ok: false, code: "reminder_failed", message: "Reminder failed" };
  }

  const { error: touchError } = await merchantWallets(supabase)
    .update({ last_admin_reminder_at: new Date().toISOString() })
    .eq("id", walletId)
    .eq("user_id", user.id);

  if (touchError) {
    return {
      ok: false,
      code: "request_update_failed",
      message: "Failed to update request",
    };
  }

  return { ok: true };
}
