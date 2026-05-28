"use server";

import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
import {
  parseThemeCookie,
  toResolvedTheme,
  userThemeSchema,
  type ResolvedTheme,
} from "@/lib/theme/theme-preference";

export async function getUserPreferredTheme(
  userId: string,
): Promise<ResolvedTheme | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_settings")
    .select("theme")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.theme) {
    return null;
  }

  const parsed = userThemeSchema.safeParse(data.theme);
  if (!parsed.success) {
    return null;
  }

  return toResolvedTheme(parsed.data);
}
