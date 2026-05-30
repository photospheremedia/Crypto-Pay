import { hasLocale } from "next-intl";
import type { NextRequest, NextResponse } from "next/server";
import { routing, type Locale } from "@/i18n/routing";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/locale-cookie-client";
import { hasFunctionalConsentCookie } from "@/lib/i18n/functional-consent-cookie";
import { localeCookieOptions } from "@/lib/i18n/locale-preference";
import { getLocaleFromPathname } from "@/lib/i18n/strip-locale";

const INTL_LOCALE_HEADER = "x-next-intl-locale";

/**
 * Saved locale from the `NEXT_LOCALE` cookie (set from `user_settings.language`
 * at auth boundaries). Used by the proxy to route authenticated users without a
 * per-request DB read. Returns null when absent or invalid.
 */
export function readLocaleCookie(request: NextRequest): Locale | null {
  const value = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  if (value && hasLocale(routing.locales, value)) {
    return value;
  }
  return null;
}

/** Locale next-intl resolved for this request (header, then URL prefix, then default). */
export function getResolvedIntlLocale(
  request: NextRequest,
  response: NextResponse,
): Locale {
  const fromHeader = response.headers.get(INTL_LOCALE_HEADER);
  if (fromHeader && hasLocale(routing.locales, fromHeader)) {
    return fromHeader;
  }

  const fromPath = getLocaleFromPathname(request.nextUrl.pathname);
  if (fromPath) {
    return fromPath;
  }

  return routing.defaultLocale;
}

/**
 * Keep NEXT_LOCALE aligned with the active page locale.
 * Prevents unprefixed paths (e.g. /login for en) from re-detecting a stale cookie (e.g. es).
 */
export function syncLocaleCookieWithResolvedLocale(
  request: NextRequest,
  response: NextResponse,
): void {
  if (!hasFunctionalConsentCookie(request)) return;

  const locale = getResolvedIntlLocale(request, response);
  response.cookies.set(LOCALE_COOKIE_NAME, locale, localeCookieOptions());
}
