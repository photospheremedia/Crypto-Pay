import "server-only";

import { sendSms } from "./sender";
import {
  SMS_WORKFLOW_EVENTS,
  smsWorkflowIdempotencyKey,
  walletStatusSmsIdempotencyKey,
} from "./workflow-keys";

export async function notifyMerchantWalletSubmittedSms(params: {
  userId: string;
  phoneE164: string;
  walletId: string;
  label: string;
}): Promise<{ success: boolean; error?: string }> {
  const body = `Crypto Pay: Your wallet "${params.label}" was submitted and is pending review.`;

  return sendSms({
    toE164: params.phoneE164,
    body,
    userId: params.userId,
    event: SMS_WORKFLOW_EVENTS.walletSubmitted,
    idempotencyKey: smsWorkflowIdempotencyKey(
      SMS_WORKFLOW_EVENTS.walletSubmitted,
      params.walletId,
      params.phoneE164,
    ),
  });
}

export async function notifyMerchantWalletStatusSms(params: {
  userId: string;
  phoneE164: string;
  walletId: string;
  label: string;
  status: "verified" | "rejected";
  verificationRequestedAt: string;
  rejectionReason?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  const verified = params.status === "verified";
  const event = verified
    ? SMS_WORKFLOW_EVENTS.walletVerified
    : SMS_WORKFLOW_EVENTS.walletRejected;

  const body = verified
    ? `Crypto Pay: Your wallet "${params.label}" is verified. You can receive payouts when checkout is live.`
    : `Crypto Pay: Your wallet "${params.label}" was not approved.${
        params.rejectionReason?.trim()
          ? ` Reason: ${params.rejectionReason.trim().slice(0, 80)}`
          : " Sign in to update it."
      }`;

  return sendSms({
    toE164: params.phoneE164,
    body,
    userId: params.userId,
    event,
    idempotencyKey: walletStatusSmsIdempotencyKey(
      event,
      params.walletId,
      params.verificationRequestedAt,
      params.phoneE164,
    ),
  });
}
