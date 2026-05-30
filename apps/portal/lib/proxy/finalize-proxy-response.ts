import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stripLocaleCookieFromResponse } from "@/lib/i18n/functional-consent-cookie";
import { mergeIntlMiddlewareResponse } from "@/lib/i18n/merge-intl-middleware-response";
import { syncLocaleCookieWithResolvedLocale } from "@/lib/i18n/sync-locale-cookie";

/** Copy cookies (incl. httpOnly/options) from one Next response onto another. */
export function copyResponseCookies(
  source: NextResponse,
  target: NextResponse,
): void {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie);
  }
}

/**
 * Redirect while preserving Supabase session refresh cookies and next-intl state.
 * @see https://github.com/supabase/ssr — copy cookies when creating a new response
 */
export function redirectWithProxyCookies(
  request: NextRequest,
  url: URL | string,
  sessionResponse: NextResponse,
  intlResponse: NextResponse,
): NextResponse {
  const redirect = NextResponse.redirect(
    url instanceof URL ? url : new URL(url, request.url),
  );
  mergeIntlMiddlewareResponse(intlResponse, redirect);
  copyResponseCookies(sessionResponse, redirect);
  stripLocaleCookieFromResponse(request, redirect);
  syncLocaleCookieWithResolvedLocale(request, redirect);
  return redirect;
}
