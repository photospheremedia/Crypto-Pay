"use server";

import { z } from "zod";
import { getMerchantAuth, revalidateMerchantProfile } from "@/lib/account/merchant-data";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";

const profileSchema = z.object({
  company_name: z.string().trim().max(200).optional().nullable(),
  phone: z.string().trim().max(50).optional().nullable(),
  business_type: z.string().trim().max(64).optional().nullable(),
});

const settingsSchema = z.object({
  theme: z.enum(["light", "dark", "auto"]).optional().nullable(),
  currency: z.string().trim().max(8).optional().nullable(),
  email_notifications: z.boolean().optional().nullable(),
  sms_notifications: z.boolean().optional().nullable(),
  order_updates: z.boolean().optional().nullable(),
  marketing_emails: z.boolean().optional().nullable(),
});

export async function saveMerchantSettings(input: {
  profile: z.input<typeof profileSchema>;
  settings: z.input<typeof settingsSchema>;
}) {
  const { user } = await getMerchantAuth();
  const profile = profileSchema.parse(input.profile);
  const settings = settingsSchema.parse(input.settings);

  const service = getSupabaseServiceClient();

  const [{ error: profileError }, { error: settingsError }] = await Promise.all([
    service.from("user_profiles").upsert(
      {
        id: user.id,
        company_name: profile.company_name ?? null,
        phone: profile.phone ?? null,
        business_type: profile.business_type ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    ),
    service.from("user_settings").upsert(
      {
        user_id: user.id,
        theme: settings.theme ?? null,
        currency: settings.currency ?? null,
        email_notifications: settings.email_notifications ?? null,
        sms_notifications: settings.sms_notifications ?? null,
        order_updates: settings.order_updates ?? null,
        marketing_emails: settings.marketing_emails ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    ),
  ]);

  if (profileError) throw profileError;
  if (settingsError) throw settingsError;

  revalidateMerchantProfile(user.id);
}

