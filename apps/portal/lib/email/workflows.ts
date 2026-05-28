/**
 * Account onboarding email workflows — triggers, guards, orchestration.
 */

import type { EmailResult } from "./sender";
import { sendWelcomeEmail } from "./triggers";
import {
  notifyAdminWalletReview,
  notifyMerchantWalletSubmitted,
  notifyMerchantWalletStatus,
} from "@/lib/wallets/notify-admin";
import { EMAIL_WORKFLOW_EVENTS, workflowIdempotencyKey } from "./workflow-keys";
import type { MerchantWallet } from "@/types/crypto-pay-db";
import { getMerchantNotificationPreferences } from "@/lib/account/notification-settings";

export { EMAIL_WORKFLOW_EVENTS, workflowIdempotencyKey } from "./workflow-keys";

export type EmailTaskResult = EmailResult | { success: boolean; error?: string; messageId?: string };

export function logEmailWorkflow(context: string, result: EmailTaskResult): void {
  if (result.success) {
    console.info(
      `[Email] ${context} sent`,
      "messageId" in result && result.messageId ? result.messageId : "",
    );
    return;
  }
  console.error(`[Email] ${context} failed:`, result.error ?? "unknown");
}

export async function runWelcomeEmailWorkflow(params: {
  email: string;
  firstName?: string;
  dashboardUrl: string;
}): Promise<EmailTaskResult> {
  return sendWelcomeEmail(params.email, {
    firstName: params.firstName,
    dashboardUrl: params.dashboardUrl,
  });
}

export type WalletPendingNotifyReason = "created" | "updated_material";

export function shouldNotifyAdminWalletPending(params: {
  isCreate: boolean;
  previous?: Pick<MerchantWallet, "wallet_network" | "wallet_address"> | null;
  next: Pick<MerchantWallet, "wallet_network" | "wallet_address">;
}): boolean {
  if (params.isCreate) return true;
  if (!params.previous) return true;
  return (
    params.previous.wallet_network !== params.next.wallet_network ||
    params.previous.wallet_address !== params.next.wallet_address
  );
}

/** Notify ops/admin inboxes — awaited so wallet requests are not lost on serverless. */
export async function runWalletPendingAdminNotifyWorkflow(params: {
  reason: WalletPendingNotifyReason;
  wallet: Pick<
    MerchantWallet,
    "id" | "label" | "wallet_network" | "wallet_address" | "status"
  >;
  merchantEmail: string;
  merchantUserId: string;
}): Promise<EmailTaskResult> {
  return notifyAdminWalletReview({
    kind: "submitted",
    wallet: params.wallet,
    merchantEmail: params.merchantEmail,
    merchantUserId: params.merchantUserId,
    idempotencyKey:
      params.reason === "created"
        ? workflowIdempotencyKey(
            EMAIL_WORKFLOW_EVENTS.walletVerificationRequested,
            params.wallet.id,
          )
        : workflowIdempotencyKey(
            `${EMAIL_WORKFLOW_EVENTS.walletVerificationRequested}-update`,
            `${params.wallet.id}/${params.wallet.wallet_network}/${params.wallet.wallet_address}`,
          ),
  });
}

export async function runWalletPendingEmailsWorkflow(params: {
  reason: WalletPendingNotifyReason;
  wallet: Pick<
    MerchantWallet,
    "id" | "label" | "wallet_network" | "wallet_address" | "status"
  >;
  merchantEmail: string;
  merchantUserId: string;
  sendMerchantCopy: boolean;
}): Promise<{ admin: EmailTaskResult; merchant?: EmailTaskResult }> {
  const admin = await runWalletPendingAdminNotifyWorkflow({
    reason: params.reason,
    wallet: params.wallet,
    merchantEmail: params.merchantEmail,
    merchantUserId: params.merchantUserId,
  });

  let merchant: EmailTaskResult | undefined;
  if (params.sendMerchantCopy && params.merchantEmail) {
    const prefs = await getMerchantNotificationPreferences(params.merchantUserId);
    if (!prefs.emailEnabled || !prefs.walletAndPaymentEmails) {
      return { admin, merchant: { success: true, error: "skipped:disabled_by_user_preferences" } };
    }
    merchant = await notifyMerchantWalletSubmitted({
      merchantEmail: params.merchantEmail,
      walletId: params.wallet.id,
      label: params.wallet.label,
      walletNetwork: params.wallet.wallet_network,
    });
  }

  return { admin, merchant };
}

export async function runWalletStatusEmailWorkflow(params: {
  walletId: string;
  merchantEmail: string;
  merchantUserId: string;
  label: string;
  status: "verified" | "rejected";
  previousStatus: string;
  verificationRequestedAt: string;
  statusEmailedForRequest?: string | null;
  rejectionReason?: string | null;
  walletNetwork?: string;
  walletAddress?: string;
}): Promise<EmailTaskResult | { skipped: true; reason: string }> {
  if (params.previousStatus === params.status) {
    return { skipped: true, reason: "status_unchanged" };
  }
  if (params.previousStatus !== "pending") {
    return { skipped: true, reason: "not_from_pending" };
  }

  const emailedFor = params.statusEmailedForRequest?.trim();
  const requestAt = params.verificationRequestedAt.trim();
  if (emailedFor && emailedFor === requestAt) {
    return { skipped: true, reason: "already_notified_this_request" };
  }

  const prefs = await getMerchantNotificationPreferences(params.merchantUserId);
  if (!prefs.emailEnabled || !prefs.walletAndPaymentEmails) {
    return { skipped: true, reason: "disabled_by_user_preferences" };
  }

  return notifyMerchantWalletStatus({
    merchantEmail: params.merchantEmail,
    walletId: params.walletId,
    label: params.label,
    status: params.status,
    verificationRequestedAt: requestAt,
    rejectionReason: params.rejectionReason,
    walletNetwork: params.walletNetwork,
    walletAddress: params.walletAddress,
  });
}
