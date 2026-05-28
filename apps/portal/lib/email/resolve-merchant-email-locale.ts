import { hasLocale } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";

/** Preferred communication locale for merchant transactional email. */
export async function resolveMerchantEmailLocale(
  userId: string | null | undefined,
): Promise<Locale> {
  if (!userId) {
    return routing.defaultLocale;
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("user_settings")
    .select("language")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.language) {
    return routing.defaultLocale;
  }

  if (!hasLocale(routing.locales, data.language)) {
    return routing.defaultLocale;
  }

  return data.language;
}
