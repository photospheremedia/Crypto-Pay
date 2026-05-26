/** Canonical workflow event names + Resend idempotency key builder (no side effects). */

export const EMAIL_WORKFLOW_EVENTS = {
  userWelcome: "user.welcome",
  walletSubmittedMerchant: "wallet.submitted",
  walletVerificationRequested: "wallet.verification_requested",
  walletVerificationResend: "wallet.verification_resend",
  walletVerified: "wallet.verified",
  walletRejected: "wallet.rejected",
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
