/**
 * Inboxes that receive wallet review requests and admin alerts.
 * Merges ADMIN_REVIEW_EMAIL + ADMIN_ALLOWED_EMAILS (same sources as admin login).
 */

export type AdminEmailRecipient = { email: string; name?: string };

const DEFAULT_OPS_EMAIL = "photospheremedia00@gmail.com";

export function getAdminReviewRecipientEmails(): string[] {
  const emails = new Set<string>();

  const review = process.env.ADMIN_REVIEW_EMAIL?.trim();
  if (review) emails.add(review.toLowerCase());

  for (const part of (process.env.ADMIN_ALLOWED_EMAILS || "").split(",")) {
    const trimmed = part.trim().toLowerCase();
    if (trimmed) emails.add(trimmed);
  }

  if (emails.size === 0) {
    emails.add(DEFAULT_OPS_EMAIL);
  }

  return [...emails];
}

export function getAdminReviewRecipients(): AdminEmailRecipient[] {
  return getAdminReviewRecipientEmails().map((email) => ({
    email,
    name: "Crypto Pay Admin",
  }));
}
