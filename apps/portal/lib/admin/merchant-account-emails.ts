import { notifyMerchantAdminMessage } from "@/lib/admin/notify-merchant-message";
import {
  notifyAdminWalletReview,
  notifyMerchantWalletSubmitted,
  RESEND_IDEMPOTENCY_MS,
} from "@/lib/wallets/notify-admin";
import { merchantWallets } from "@/lib/wallets/db";
import { getServiceClient } from "@/lib/admin/merchant-supabase-admin";
import type { MerchantWallet } from "@/types/crypto-pay-db";

export {
  sendMerchantVerificationEmail as sendMerchantEmailVerification,
  sendMerchantPasswordResetEmail as sendMerchantPasswordReset,
  revokeMerchantSessionsGlobal as revokeMerchantSessions,
} from "@/lib/admin/merchant-supabase-admin";

export async function notifyMerchantSessionsRevoked(params: {
  merchantEmail: string;
  merchantName?: string | null;
  adminEmail: string;
  adminName?: string | null;
  merchantUserId: string;
  adminUserId: string;
}): Promise<{ success: boolean; error?: string }> {
  return notifyMerchantAdminMessage({
    ...params,
    subject: "You have been signed out of all devices",
    message:
      "For your security, an administrator signed you out of all active Crypto Pay sessions. Sign in again with your email and password. If you did not expect this, contact support immediately.",
  });
}

export async function notifyMerchantAccountDeleted(params: {
  merchantUserId: string;
  merchantEmail: string;
  merchantName?: string | null;
  adminEmail: string;
  adminUserId: string;
}): Promise<{ success: boolean; error?: string }> {
  return notifyMerchantAdminMessage({
    merchantUserId: params.merchantUserId,
    adminUserId: params.adminUserId,
    merchantEmail: params.merchantEmail,
    merchantName: params.merchantName,
    adminEmail: params.adminEmail,
    adminName: "Crypto Pay",
    subject: "Your Crypto Pay account was closed",
    message:
      "Your merchant account has been closed by an administrator. If you believe this was a mistake, reply to this email.",
  });
}

export async function adminResendWalletVerification(params: {
  walletId: string;
  merchantUserId: string;
  adminUserId: string;
}): Promise<{
  success: boolean;
  error?: string;
  merchantNotified?: boolean;
  adminNotified?: boolean;
}> {
  const service = getServiceClient();
  const { walletId, merchantUserId } = params;

  const { data: wallet, error } = await merchantWallets(service)
    .select(
      "id, user_id, label, wallet_network, wallet_address, status, verification_requested_at, last_admin_reminder_at",
    )
    .eq("id", walletId)
    .eq("user_id", merchantUserId)
    .maybeSingle();

  if (error || !wallet) {
    return { success: false, error: "Wallet not found" };
  }

  const row = wallet as MerchantWallet & { last_admin_reminder_at?: string | null };

  if (row.status !== "pending") {
    return {
      success: false,
      error: "Only pending wallets can receive verification reminders",
    };
  }

  const lastReminder = row.last_admin_reminder_at;
  if (lastReminder) {
    const elapsed = Date.now() - new Date(lastReminder).getTime();
    if (elapsed < RESEND_IDEMPOTENCY_MS) {
      return {
        success: false,
        error: "A reminder was sent recently. Wait 24 hours before sending again.",
      };
    }
  }

  const { data: authUser } = await service.auth.admin.getUserById(merchantUserId);
  const merchantEmail = authUser?.user?.email;
  if (!merchantEmail) {
    return { success: false, error: "Merchant email not found" };
  }

  const merchantResult = await notifyMerchantWalletSubmitted({
    merchantEmail,
    merchantUserId,
    walletId: row.id,
    label: row.label,
    walletNetwork: row.wallet_network,
  });

  const adminResult = await notifyAdminWalletReview({
    kind: "resend",
    wallet: row,
    merchantEmail,
    merchantUserId,
    source: "admin_panel",
  });

  await merchantWallets(service)
    .update({ last_admin_reminder_at: new Date().toISOString() })
    .eq("id", walletId);

  const ok = merchantResult.success || adminResult.success;
  return {
    success: ok,
    error: ok
      ? undefined
      : merchantResult.error ?? adminResult.error ?? "Failed to send emails",
    merchantNotified: merchantResult.success,
    adminNotified: adminResult.success,
  };
}
