"use server";

import { hasLocale } from "next-intl";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
import { routing, type Locale } from "@/i18n/routing";

export async function persistUserLocale(locale: string): Promise<{ ok: boolean }> {
  if (!hasLocale(routing.locales, locale)) {
    return { ok: false };
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Anonymous visitors rely on next-intl's NEXT_LOCALE cookie only.
  if (!user) {
    return { ok: true };
  }

  const { error } = await supabase.from("user_settings").upsert(
    { user_id: user.id, language: locale },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("[persistUserLocale]", error.message);
    return { ok: false };
  }

  return { ok: true };
}

export async function getUserPreferredLocale(userId: string): Promise<Locale | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_settings")
    .select("language")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.language) {
    return null;
  }

  if (!hasLocale(routing.locales, data.language)) {
    return null;
  }

  return data.language as Locale;
}
