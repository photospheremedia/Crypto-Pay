import { LOCALE_COOKIE_NAME } from "@/lib/i18n/locale-cookie-client";
import { localeCookieOptions } from "@/lib/i18n/locale-preference";
import { THEME_COOKIE_NAME } from "@/lib/theme/theme-preference";
import { SIDEBAR_COOKIE_NAME } from "@/lib/ui/sidebar-cookie";
import { hasSupabaseSessionCookie } from "@/lib/auth/has-supabase-session-cookie";
import type { NextRequest, NextResponse } from "next/server";

/** Set when the visitor allows functional cookies (mirrors localStorage consent). */
export const FUNCTIONAL_CONSENT_COOKIE = "cryptopay-functional";

const PREFERENCE_COOKIE_NAMES = [
  LOCALE_COOKIE_NAME,
  THEME_COOKIE_NAME,
  SIDEBAR_COOKIE_NAME,
] as const;

export function hasFunctionalConsentCookie(
  request: Pick<NextRequest, "cookies">,
): boolean {
  return request.cookies.get(FUNCTIONAL_CONSENT_COOKIE)?.value === "1";
}

export function setFunctionalConsentCookieClient(): void {
  if (typeof document === "undefined") return;

  const { path, maxAge, sameSite, secure } = localeCookieOptions();
  const secureFlag = secure ? "; Secure" : "";

  document.cookie = `${FUNCTIONAL_CONSENT_COOKIE}=1; Path=${path}; Max-Age=${maxAge}; SameSite=${sameSite}${secureFlag}`;
}

export function clearFunctionalConsentCookieClient(): void {
  if (typeof document === "undefined") return;

  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  document.cookie = `${FUNCTIONAL_CONSENT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

function stripPreferenceCookies(
  request: NextRequest,
  response?: NextResponse,
): void {
  if (hasFunctionalConsentCookie(request)) return;
  // Logged-in users keep their preference cookies (language/theme are first-party
  // account settings tied to the session, not consent-gated tracking).
  if (hasSupabaseSessionCookie(request)) return;
  for (const name of PREFERENCE_COOKIE_NAMES) {
    request.cookies.delete(name);
    response?.cookies.delete(name);
  }
}

export function stripLocaleCookieFromRequest(request: NextRequest): void {
  stripPreferenceCookies(request);
}

export function stripLocaleCookieFromResponse(
  request: NextRequest,
  response: NextResponse,
): void {
  stripPreferenceCookies(request, response);
}
