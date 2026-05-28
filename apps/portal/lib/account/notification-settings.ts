import "server-only";

import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";

export type MerchantNotificationPreferences = {
  emailEnabled: boolean;
  smsEnabled: boolean;
  walletAndPaymentEmails: boolean;
  productUpdates: boolean;
};

const DEFAULT_PREFS: MerchantNotificationPreferences = {
  emailEnabled: true,
  smsEnabled: false,
  walletAndPaymentEmails: true,
  productUpdates: false,
};

export async function getMerchantNotificationPreferences(
  userId: string,
): Promise<MerchantNotificationPreferences> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("user_settings")
    .select("email_notifications, sms_notifications, order_updates, marketing_emails")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    // Be fail-open for transactional wallet emails; the workflow already has idempotency.
    return DEFAULT_PREFS;
  }

  return {
    emailEnabled: data?.email_notifications ?? DEFAULT_PREFS.emailEnabled,
    smsEnabled: data?.sms_notifications ?? DEFAULT_PREFS.smsEnabled,
    walletAndPaymentEmails: data?.order_updates ?? DEFAULT_PREFS.walletAndPaymentEmails,
    productUpdates: data?.marketing_emails ?? DEFAULT_PREFS.productUpdates,
  };
}

