/**
 * Email recipients and absolute app URLs for transactional mail.
 */

import { ACCOUNT_WALLET_SETUP_PATH } from "@/lib/account/paths";

import { getAdminReviewRecipientEmails } from "./admin-recipients";

/** Primary ops inbox (first configured admin review address). */
export const INTERNAL_OPS_EMAIL =
  getAdminReviewRecipientEmails()[0] ?? "photospheremedia00@gmail.com";

/**
 * Merchant-facing Reply-To — must be an inbox you monitor.
 * Defaults to ADMIN_REVIEW_EMAIL / photospheremedia00@gmail.com (not support@, unless forwarded).
 */
export const MERCHANT_SUPPORT_REPLY =
  process.env.EMAIL_REPLY_TO?.trim() || INTERNAL_OPS_EMAIL;

export function getAppOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    "https://cryptopay.sale";
  return raw.replace(/\/$/, "");
}

/** Build absolute https URL for portal routes (includes query strings). */
export function appAbsoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getAppOrigin()}${normalized}`;
}

export const EMAIL_ROUTES = {
  account: () => appAbsoluteUrl("/account"),
  accountWallets: () => appAbsoluteUrl(ACCOUNT_WALLET_SETUP_PATH),
  accountSetup: () => appAbsoluteUrl("/account/setup"),
  login: () => appAbsoluteUrl("/login"),
  adminWallets: (status: "pending" | "verified" | "rejected" | "all" = "pending") =>
    appAbsoluteUrl(
      status === "all" ? "/admin/wallets" : `/admin/wallets?status=${status}`,
    ),
  adminWalletPending: (walletId?: string) => {
    const base = `/admin/wallets?status=pending`;
    return appAbsoluteUrl(walletId ? `${base}&wallet=${walletId}` : base);
  },
  contact: () => appAbsoluteUrl("/contact"),
} as const;

export function merchantMailto(email: string, subject: string, body?: string): string {
  const params = new URLSearchParams({ subject });
  if (body) params.set("body", body);
  return `mailto:${encodeURIComponent(email)}?${params.toString()}`;
}
