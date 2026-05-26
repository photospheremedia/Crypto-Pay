import type { NextResponse } from "next/server";

/** Headers next-intl middleware sets that must survive Supabase cookie refresh. */
const INTL_HEADER_PREFIXES = ["x-next-intl", "x-middleware-rewrite"] as const;

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
    target.cookies.set(cookie.name, cookie.value);
  }

  for (const [key, value] of intlResponse.headers) {
    const lower = key.toLowerCase();
    if (INTL_HEADER_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
      target.headers.set(key, value);
    }
  }

  return target;
}
