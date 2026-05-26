import type { NextRequest } from "next/server";

/** True when the browser likely has a Supabase session (avoids auth API on public pages). */
export function hasSupabaseSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    (cookie) =>
      cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token"),
  );
}
