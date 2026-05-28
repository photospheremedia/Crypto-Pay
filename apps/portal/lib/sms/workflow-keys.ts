/** Canonical SMS workflow event names + idempotency key builder. */

export const SMS_WORKFLOW_EVENTS = {
  phoneVerification: "sms.phone_verification",
  walletSubmitted: "wallet.submitted",
  walletVerified: "wallet.verified",
  walletRejected: "wallet.rejected",
} as const;

export function smsWorkflowIdempotencyKey(
  event: string,
  entityId: string,
  phoneE164?: string,
): string {
  const parts = [
    event.replace(/[^a-zA-Z0-9._-]/g, "-"),
    entityId.replace(/[^a-zA-Z0-9._-]/g, "-"),
    phoneE164?.trim(),
  ].filter(Boolean);
  return parts.join("/").slice(0, 256);
}

export function walletStatusSmsIdempotencyKey(
  event: string,
  walletId: string,
  verificationRequestedAt: string,
  phoneE164: string,
): string {
  const requestToken = verificationRequestedAt.replace(/[:.]/g, "-");
  return smsWorkflowIdempotencyKey(event, `${walletId}/${requestToken}`, phoneE164);
}
