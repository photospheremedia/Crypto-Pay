import "server-only";

import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";

export type MerchantSmsPreferences = {
  smsNotificationsEnabled: boolean;
  smsOptIn: boolean;
  smsVerified: boolean;
  phoneE164: string | null;
  smsDisabledAt: string | null;
};

export type MerchantSmsDeliveryContext = MerchantSmsPreferences & {
  canReceiveTransactionalSms: boolean;
};

const DEFAULT_SMS_PREFS: MerchantSmsPreferences = {
  smsNotificationsEnabled: false,
  smsOptIn: false,
  smsVerified: false,
  phoneE164: null,
  smsDisabledAt: null,
};

export async function getMerchantSmsPreferences(
  userId: string,
): Promise<MerchantSmsPreferences> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("user_settings")
    .select(
      "sms_notifications, sms_phone_e164, sms_opt_in_at, sms_verified_at, sms_disabled_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_SMS_PREFS;
  }

  return {
    smsNotificationsEnabled: data.sms_notifications ?? false,
    smsOptIn: Boolean(data.sms_opt_in_at),
    smsVerified: Boolean(data.sms_verified_at),
    phoneE164: data.sms_phone_e164 ?? null,
    smsDisabledAt: data.sms_disabled_at ?? null,
  };
}

export function resolveSmsDeliveryContext(
  prefs: MerchantSmsPreferences,
): MerchantSmsDeliveryContext {
  const canReceiveTransactionalSms =
    prefs.smsNotificationsEnabled &&
    prefs.smsOptIn &&
    prefs.smsVerified &&
    Boolean(prefs.phoneE164) &&
    !prefs.smsDisabledAt;

  return { ...prefs, canReceiveTransactionalSms };
}

export async function getMerchantSmsDeliveryContext(
  userId: string,
): Promise<MerchantSmsDeliveryContext> {
  const prefs = await getMerchantSmsPreferences(userId);
  return resolveSmsDeliveryContext(prefs);
}
