/**
 * Crypto Pay — Resend / email defaults (same pattern as Crypto Pay EMAIL_SETUP.md)
 */

import { BRAND } from "@/lib/cryptopay/constants";

export const DEFAULT_FROM = "Crypto Pay <noreply@cryptopay.sale>";

export const EMAIL = {
  brandName: BRAND.name,
  tagline: BRAND.tagline,
  replyTo: process.env.EMAIL_REPLY_TO || "support@cryptopay.sale",
  support: BRAND.email,
  siteUrl: BRAND.siteUrl,
  /** Shown in footer — helps inbox “profile” recognition with consistent From name */
  fromDisplay: "Crypto Pay",
  social: {
    x: process.env.NEXT_PUBLIC_SOCIAL_X_URL || undefined,
    linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL || undefined,
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL || undefined,
  },
  /** Verified production domain (configure in Resend → Domains) */
  productionDomain: "cryptopay.sale",
  legal: {
    privacy: "/privacy-policy",
    terms: "/terms-of-service",
    contact: "/contact",
  },
} as const;

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM || DEFAULT_FROM;
}

export function getReplyTo(): string {
  return process.env.EMAIL_REPLY_TO || EMAIL.replyTo;
}

/** Logo brand colors for HTML templates */
export const emailBrandColors = {
  primary: BRAND.colors.primary,
  primaryDark: BRAND.colors.primaryDark,
  primaryLight: BRAND.colors.primaryLight,
  secondary: "#111827",
  background: "#f9fafb",
  surface: "#ffffff",
  text: "#374151",
  textLight: "#6b7280",
  textMuted: "#9ca3af",
  border: "#e5e7eb",
  success: BRAND.colors.primary,
  warning: "#f59e0b",
  error: "#ef4444",
} as const;
