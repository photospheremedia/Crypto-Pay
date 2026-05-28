/**
 * Merchant SMS workflows — mirrors email guards in lib/email/workflows.ts
 */

import type { SendSmsResult } from "./sender";
import {
  getMerchantNotificationPreferences,
} from "@/lib/account/notification-settings";
import {
  getMerchantSmsDeliveryContext,
} from "@/lib/account/sms-preferences";
import {
  notifyMerchantWalletStatusSms,
  notifyMerchantWalletSubmittedSms,
} from "./notify-merchant";

export type SmsWorkflowSkip = { skipped: true; reason: string };
export type SmsTaskResult = SendSmsResult | { success: boolean; error?: string };

export function isSmsWorkflowSkipped(
  result: SmsTaskResult | SmsWorkflowSkip,
): result is SmsWorkflowSkip {
  return "skipped" in result && result.skipped === true;
}

export function logSmsWorkflow(context: string, result: SmsTaskResult): void {
  if (result.success) {
    console.info(`[SMS] ${context} sent`);
    return;
  }
  console.error(`[SMS] ${context} failed:`, result.error ?? "unknown");
}

export async function runWalletSubmittedSmsWorkflow(params: {
  merchantUserId: string;
  walletId: string;
  label: string;
}): Promise<SmsTaskResult | { skipped: true; reason: string }> {
  const [prefs, sms] = await Promise.all([
    getMerchantNotificationPreferences(params.merchantUserId),
    getMerchantSmsDeliveryContext(params.merchantUserId),
  ]);

  if (!prefs.smsEnabled || !prefs.walletAndPaymentEmails) {
    return { skipped: true, reason: "disabled_by_user_preferences" };
  }

  if (!sms.canReceiveTransactionalSms || !sms.phoneE164) {
    return { skipped: true, reason: "sms_not_configured_or_verified" };
  }

  return notifyMerchantWalletSubmittedSms({
    userId: params.merchantUserId,
    phoneE164: sms.phoneE164,
    walletId: params.walletId,
    label: params.label,
  });
}

export async function runWalletStatusSmsWorkflow(params: {
  walletId: string;
  merchantUserId: string;
  label: string;
  status: "verified" | "rejected";
  previousStatus: string;
  verificationRequestedAt: string;
  rejectionReason?: string | null;
}): Promise<SmsTaskResult | { skipped: true; reason: string }> {
  if (params.previousStatus === params.status) {
    return { skipped: true, reason: "status_unchanged" };
  }
  if (params.previousStatus !== "pending") {
    return { skipped: true, reason: "not_from_pending" };
  }

  const [prefs, sms] = await Promise.all([
    getMerchantNotificationPreferences(params.merchantUserId),
    getMerchantSmsDeliveryContext(params.merchantUserId),
  ]);

  if (!prefs.smsEnabled || !prefs.walletAndPaymentEmails) {
    return { skipped: true, reason: "disabled_by_user_preferences" };
  }

  if (!sms.canReceiveTransactionalSms || !sms.phoneE164) {
    return { skipped: true, reason: "sms_not_configured_or_verified" };
  }

  return notifyMerchantWalletStatusSms({
    userId: params.merchantUserId,
    phoneE164: sms.phoneE164,
    walletId: params.walletId,
    label: params.label,
    status: params.status,
    verificationRequestedAt: params.verificationRequestedAt.trim(),
    rejectionReason: params.rejectionReason,
  });
}
