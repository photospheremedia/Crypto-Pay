/** Canonical workflow event names + Resend idempotency key builder (no side effects). */

export const EMAIL_WORKFLOW_EVENTS = {
  userWelcome: "user.welcome",
  walletSubmittedMerchant: "wallet.submitted",
  walletVerificationRequested: "wallet.verification_requested",
  walletVerificationResend: "wallet.verification_resend",
  walletVerified: "wallet.verified",
  walletRejected: "wallet.rejected",
  adminMerchantMessage: "admin.merchant_message",
} as const;

export function workflowIdempotencyKey(
  event: string,
  entityId: string,
  recipientEmail?: string,
): string {
  const parts = [
    event.replace(/[^a-zA-Z0-9._-]/g, "-"),
    entityId.replace(/[^a-zA-Z0-9._-]/g, "-"),
    recipientEmail?.trim().toLowerCase(),
  ].filter(Boolean);
  return parts.join("/").slice(0, 256);
}

/** One status email per wallet + verification request (pending → verified/rejected). */
export function walletStatusEmailIdempotencyKey(
  event: string,
  walletId: string,
  verificationRequestedAt: string,
  merchantEmail: string,
): string {
  const requestToken = verificationRequestedAt.replace(/[:.]/g, "-");
  return workflowIdempotencyKey(
    event,
    `${walletId}/${requestToken}`,
    merchantEmail,
  );
}
