"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import {
  getMerchantAuth,
  revalidateMerchantWallets,
} from "@/lib/account/merchant-data";
import { ACCOUNT_SETUP_LEGACY_PATH } from "@/lib/account/paths";
import {
  deleteMerchantWalletRecord,
  resendMerchantWalletVerification,
  upsertMerchantWallet,
  type WalletServiceErrorCode,
} from "@/lib/wallets/merchant-wallet-service";
import { merchantWalletSchema } from "@/lib/wallets/validation";

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

function mapServiceError(
  t: (key: string) => string,
  code: WalletServiceErrorCode,
): string {
  const keys: Record<WalletServiceErrorCode, string> = {
    invalid: "invalidDetails",
    not_found: "notFound",
    duplicate_name: "duplicateName",
    save_failed: "saveFailed",
    update_failed: "updateFailed",
    delete_only_pending: "deleteOnlyPending",
    resend_only_pending: "resendOnlyPending",
    resend_cooldown: "resendCooldown",
    reminder_failed: "reminderFailed",
    request_update_failed: "requestUpdateFailed",
  };
  return t(keys[code] ?? "saveFailed");
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

  const { supabase, user } = await getMerchantAuth();
  const result = await upsertMerchantWallet(supabase, user, parsed.data);

  if (!result.ok) {
    return { error: mapServiceError(t, result.code) };
  }

  revalidateAccountWallets(user.id);
  return { success: t("savedPending") };
}

export async function resendWalletVerification(
  walletId: string,
): Promise<WalletFormState> {
  const t = await getTranslations("Account.wallets.messages");
  if (!walletId) return { error: t("notFound") };

  const { supabase, user } = await getMerchantAuth();
  const result = await resendMerchantWalletVerification(supabase, user, walletId);

  if (!result.ok) {
    return { error: mapServiceError(t, result.code) };
  }

  revalidateAccountWallets(user.id);
  return { success: t("reminderSent") };
}

export async function deleteMerchantWallet(
  walletId: string,
): Promise<WalletFormState> {
  const t = await getTranslations("Account.wallets.messages");
  const { supabase, user } = await getMerchantAuth();
  const result = await deleteMerchantWalletRecord(supabase, user.id, walletId);

  if (!result.ok) {
    return { error: mapServiceError(t, result.code) };
  }

  revalidateAccountWallets(user.id);
  return { success: t("deleted") };
}
