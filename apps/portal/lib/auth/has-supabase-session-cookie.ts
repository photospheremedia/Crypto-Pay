import type { NextRequest } from "next/server";

/** True when the browser likely has a Supabase session (avoids auth API on public pages). */
export function hasSupabaseAuthTokenCookie(
  cookies: Iterable<{ name: string }>,
): boolean {
  for (const cookie of cookies) {
    if (
      cookie.name.startsWith("sb-") &&
      cookie.name.includes("-auth-token")
    ) {
      return true;
    }
  }
  return false;
}

export function hasSupabaseSessionCookie(request: NextRequest): boolean {
  return hasSupabaseAuthTokenCookie(request.cookies.getAll());
}
