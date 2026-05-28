import "server-only";

import { cookies } from "next/headers";
import { hasSupabaseAuthTokenCookie } from "@/lib/auth/has-supabase-session-cookie";
import { createClient } from "@/lib/supabase/server";
import { getUserPreferredTheme } from "@/lib/theme/theme-actions";
import {
  parseThemeCookie,
  THEME_COOKIE_NAME,
  type ResolvedTheme,
} from "@/lib/theme/theme-preference";

/** Theme for SSR / first paint: cookie, then logged-in DB preference, else light. */
export async function getServerTheme(): Promise<ResolvedTheme> {
  const cookieStore = await cookies();
  const fromCookie = parseThemeCookie(
    cookieStore.get(THEME_COOKIE_NAME)?.value,
  );
  if (fromCookie) return fromCookie;

  if (!hasSupabaseAuthTokenCookie(cookieStore.getAll())) {
    return "light";
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return "light";
  }

  const fromDb = await getUserPreferredTheme(user.id);
  return fromDb ?? "light";
}
