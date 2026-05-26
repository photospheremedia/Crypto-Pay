/**
 * Crypto Pay — Resend / email defaults (same pattern as Crypto Pay EMAIL_SETUP.md)
 */

import { BRAND } from "@/lib/cryptopay/constants";
import {
  getAppOrigin,
  INTERNAL_OPS_EMAIL,
  MERCHANT_SUPPORT_REPLY,
} from "@/lib/email/routing";

export const DEFAULT_FROM = "Crypto Pay <noreply@cryptopay.sale>";

export const EMAIL = {
  brandName: BRAND.name,
  tagline: BRAND.tagline,
  replyTo: MERCHANT_SUPPORT_REPLY,
  support: BRAND.email,
  operations: INTERNAL_OPS_EMAIL,
  siteUrl: getAppOrigin(),
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
  return MERCHANT_SUPPORT_REPLY;
}

export function getOperationsEmail(): string {
  return INTERNAL_OPS_EMAIL;
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
