import type { EmailOtpType } from "@supabase/supabase-js";

/** Normalize `next` from auth email links (path or full app URL). */
export function normalizeAuthEmailNextParam(raw: string | null): string | null {
  if (!raw?.trim()) return null;
  const trimmed = raw.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }
  try {
    const url = new URL(trimmed);
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

/** Supabase may send `signup` in links; verifyOtp expects `email` for signup confirm. */
export function normalizeEmailOtpType(type: string | null): EmailOtpType | null {
  if (!type) return null;
  if (type === "signup") return "email";
  return type as EmailOtpType;
}
