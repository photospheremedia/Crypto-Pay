"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { merchantWallets } from "@/lib/wallets/db";
import { RESEND_IDEMPOTENCY_MS, notifyAdminWalletReview } from "@/lib/wallets/notify-admin";
import { scheduleEmailWork } from "@/lib/email/schedule";
import { logEmailWorkflow } from "@/lib/email/workflows";
import {
  runWalletPendingAdminNotifyWorkflow,
  shouldNotifyAdminWalletPending,
} from "@/lib/email/workflows";
import { notifyMerchantWalletSubmitted } from "@/lib/wallets/notify-admin";
import { ACCOUNT_SETUP_LEGACY_PATH } from "@/lib/account/paths";
import {
  getMerchantAuth,
  revalidateMerchantWallets,
} from "@/lib/account/merchant-data";
import { merchantWalletSchema } from "@/lib/wallets/validation";
import type { MerchantWallet } from "@/types/crypto-pay-db";

export type WalletFormState = {
  error?: string;
  success?: string;
};

function revalidateAccountWallets(userId: string) {
  revalidateMerchantWallets(userId);
  revalidatePath("/account");
  revalidatePath("/account/get-started");
  revalidatePath(ACCOUNT_SETUP_LEGACY_PATH);
}

async function requireUser() {
  return getMerchantAuth();
}

async function syncLegacyPrimaryWallet(
  supabase: Awaited<ReturnType<typeof getMerchantAuth>>["supabase"],
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

export async function saveMerchantWallet(
  _prev: WalletFormState,
  formData: FormData,
): Promise<WalletFormState> {
  const t = await getTranslations("Account.wallets.messages");
  const parsed = merchantWalletSchema.safeParse({
    id: String(formData.get("id") || "").trim() || undefined,
    label: String(formData.get("label") || "").trim(),
    walletNetwork: String(formData.get("wallet_network") || ""),
    walletAddress: String(formData.get("wallet_address") || "").trim(),
    isPrimary: formData.get("is_primary") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? t("invalidDetails") };
  }

  const { supabase, user } = await requireUser();
  const { id, label, walletNetwork, walletAddress, isPrimary } = parsed.data;
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
  }

  if (isPrimary) {
    await merchantWallets(supabase)
      .update({ is_primary: false })
      .eq("user_id", user.id);
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
        return { error: t("duplicateName") };
      }
      return { error: t("updateFailed") };
    }
  } else {
    const { data, error } = await merchantWallets(supabase)
      .insert(row)
      .select("id, label, wallet_network, wallet_address, status")
      .single();
    if (error) {
      if (error.code === "23505") {
        return { error: t("duplicateName") };
      }
      return { error: t("saveFailed") };
    }
    walletId = data.id;
  }

  const { data: saved } = await merchantWallets(supabase)
    .select("id, label, wallet_network, wallet_address, status")
    .eq("id", walletId!)
    .single();

  if (saved && saved.status === "pending") {
    const notifyAdmin =
      materialChange &&
      shouldNotifyAdminWalletPending({
        isCreate,
        previous: previousWallet as Pick<
          MerchantWallet,
          "wallet_network" | "wallet_address"
        > | null,
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
            walletId: saved.id,
            label: saved.label,
            walletNetwork: saved.wallet_network,
          }),
        );
      }
    }
  }

  await syncLegacyPrimaryWallet(supabase, user.id);
  revalidateAccountWallets(user.id);

  return { success: t("savedPending") };
}

export async function resendWalletVerification(
  walletId: string,
): Promise<WalletFormState> {
  const t = await getTranslations("Account.wallets.messages");
  if (!walletId) return { error: t("notFound") };

  const { supabase, user } = await requireUser();

  const { data: wallet, error } = await merchantWallets(supabase)
    .select(
      "id, label, wallet_network, wallet_address, status, last_admin_reminder_at",
    )
    .eq("id", walletId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !wallet) {
    return { error: t("notFound") };
  }

  if (wallet.status !== "pending") {
    return { error: t("resendOnlyPending") };
  }

  const lastReminder = (wallet as { last_admin_reminder_at?: string | null })
    .last_admin_reminder_at;
  if (lastReminder) {
    const elapsed = Date.now() - new Date(lastReminder).getTime();
    if (elapsed < RESEND_IDEMPOTENCY_MS) {
      return { error: t("resendCooldown") };
    }
  }

  const emailResult = await notifyAdminWalletReview({
    kind: "resend",
    wallet,
    merchantEmail: user.email ?? "unknown",
    merchantUserId: user.id,
  });

  if (!emailResult.success) {
    return { error: t("reminderFailed") };
  }

  const { error: touchError } = await merchantWallets(supabase)
    .update({
      last_admin_reminder_at: new Date().toISOString(),
    })
    .eq("id", walletId)
    .eq("user_id", user.id);

  if (touchError) {
    return { error: t("requestUpdateFailed") };
  }

  revalidateAccountWallets(user.id);
  return { success: t("reminderSent") };
}

export async function deleteMerchantWallet(
  walletId: string,
): Promise<WalletFormState> {
  const t = await getTranslations("Account.wallets.messages");
  const { supabase, user } = await requireUser();

  const { error } = await merchantWallets(supabase)
    .delete()
    .eq("id", walletId)
    .eq("user_id", user.id)
    .eq("status", "pending");

  if (error) {
    return { error: t("deleteOnlyPending") };
  }

  await syncLegacyPrimaryWallet(supabase, user.id);
  revalidateAccountWallets(user.id);
  return { success: t("deleted") };
}
