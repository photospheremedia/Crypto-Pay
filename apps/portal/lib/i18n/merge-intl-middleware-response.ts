import type { NextResponse } from "next/server";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/locale-cookie-client";
import { localeCookieOptions } from "@/lib/i18n/locale-preference";
import { THEME_COOKIE_NAME } from "@/lib/theme/theme-preference";

/** Headers next-intl middleware sets that must survive Supabase cookie refresh. */
const INTL_HEADER_PREFIXES = ["x-next-intl", "x-middleware-rewrite"] as const;

const PREFERENCE_COOKIE_OPTIONS: Record<string, ReturnType<typeof localeCookieOptions>> = {
  [LOCALE_COOKIE_NAME]: localeCookieOptions(),
  [THEME_COOKIE_NAME]: localeCookieOptions(),
};

/**
 * Copies next-intl middleware cookies/headers onto a new response.
 * Supabase SSR recreates the response for auth cookies; without this merge,
 * NEXT_LOCALE is dropped and locale switches appear to do nothing.
 */
export function mergeIntlMiddlewareResponse(
  intlResponse: NextResponse,
  target: NextResponse,
): NextResponse {
  for (const cookie of intlResponse.cookies.getAll()) {
    const opts = PREFERENCE_COOKIE_OPTIONS[cookie.name];
    if (opts) {
      target.cookies.set(cookie.name, cookie.value, opts);
    } else {
      target.cookies.set(cookie);
    }
  }

  for (const [key, value] of intlResponse.headers) {
    const lower = key.toLowerCase();
    if (INTL_HEADER_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
      target.headers.set(key, value);
    }
  }

  return target;
}
