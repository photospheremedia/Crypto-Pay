/**
 * Crypto Pay — Resend / email defaults (same pattern as Crypto Pay EMAIL_SETUP.md)
 */

import { BRAND } from "@/lib/cryptopay/constants";

export const DEFAULT_FROM = "Crypto Pay <noreply@cryptopay.sale>";

export const EMAIL = {
  brandName: BRAND.name,
  replyTo: process.env.EMAIL_REPLY_TO || "support@cryptopay.sale",
  support: BRAND.email,
  siteUrl: BRAND.siteUrl,
  social: {
    x: process.env.NEXT_PUBLIC_SOCIAL_X_URL || undefined,
    linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL || undefined,
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL || undefined,
  },
  /** Verified production domain (configure in Resend → Domains) */
  productionDomain: "cryptopay.sale",
} as const;

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM || DEFAULT_FROM;
}

export function getReplyTo(): string {
  return process.env.EMAIL_REPLY_TO || EMAIL.replyTo;
}

/** Emerald theme for HTML templates (matches portal UI) */
export const emailBrandColors = {
  primary: "#10b981",
  primaryDark: "#059669",
  primaryLight: "#34d399",
  secondary: "#111827",
  background: "#f9fafb",
  surface: "#ffffff",
  text: "#374151",
  textLight: "#6b7280",
  textMuted: "#9ca3af",
  border: "#e5e7eb",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
} as const;
