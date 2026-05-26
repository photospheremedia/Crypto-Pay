"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "@/i18n/navigation";
import type { User } from "@supabase/supabase-js";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { refreshMerchantProfileCache } from "@/app/[locale]/account/actions";

function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

interface SettingsFormProps {
  user: User;
  profile: any;
  settings: any;
}

export function SettingsForm({ user, profile, settings }: SettingsFormProps) {
  const t = useTranslations("Account.settings");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [profileData, setProfileData] = useState({
    company_name: profile?.company_name || "",
    phone: profile?.phone || "",
    business_type: profile?.business_type || "online_store",
  });

  const [settingsData, setSettingsData] = useState({
    theme: settings?.theme || "light",
    currency: settings?.currency || "USD",
    email_notifications: settings?.email_notifications ?? true,
    sms_notifications: settings?.sms_notifications ?? false,
    order_updates: settings?.order_updates ?? true,
    marketing_emails: settings?.marketing_emails ?? false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update(profileData)
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update settings
      const { error: settingsError } = await supabase
        .from("user_settings")
        .update(settingsData)
        .eq("user_id", user.id);

      if (settingsError) throw settingsError;

      await refreshMerchantProfileCache();
      setMessage({ type: "success", text: t("savedSuccess") });
      router.refresh();
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || t("saveFailed") });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Information */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">{t("profileSection")}</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              {t("emailAddress")}
            </label>
            <input
              type="email"
              id="email"
              value={user.email}
              disabled
              className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-500"
            />
          </div>

          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-slate-700">
              {t("companyName")}
            </label>
            <input
              type="text"
              id="company_name"
              value={profileData.company_name}
              onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
              {t("phoneNumber")}
            </label>
            <input
              type="tel"
              id="phone"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="business_type" className="block text-sm font-medium text-slate-700">
              {t("businessType")}
            </label>
            <select
              id="business_type"
              value={profileData.business_type}
              onChange={(e) => setProfileData({ ...profileData, business_type: e.target.value })}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
            >
              {(
                [
                  "online_store",
                  "saas",
                  "retail",
                  "services",
                  "marketplace",
                  "other",
                ] as const
              ).map((type) => (
                <option key={type} value={type}>
                  {t(`businessTypes.${type}`)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">{t("preferencesSection")}</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-slate-700">
              {t("theme")}
            </label>
            <select
              id="theme"
              value={settingsData.theme}
              onChange={(e) => setSettingsData({ ...settingsData, theme: e.target.value })}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="light">{t("themeLight")}</option>
              <option value="dark">{t("themeDark")}</option>
              <option value="auto">{t("themeAuto")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              {t("language")}
            </label>
            <p className="mt-1 text-sm text-slate-500">{t("languageHint")}</p>
            <div className="mt-2">
              <LocaleSwitcher variant="select" className="w-full max-w-sm" />
            </div>
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-slate-700">
              {t("currency")}
            </label>
            <select
              id="currency"
              value={settingsData.currency}
              onChange={(e) => setSettingsData({ ...settingsData, currency: e.target.value })}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">{t("notificationsSection")}</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="email_notifications" className="font-medium text-slate-900">
                {t("emailNotifications")}
              </label>
              <p className="text-sm text-slate-600">{t("emailNotificationsHint")}</p>
            </div>
            <input
              type="checkbox"
              id="email_notifications"
              checked={settingsData.email_notifications}
              onChange={(e) =>
                setSettingsData({ ...settingsData, email_notifications: e.target.checked })
              }
              className="h-5 w-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="sms_notifications" className="font-medium text-slate-900">
                {t("smsNotifications")}
              </label>
              <p className="text-sm text-slate-600">{t("smsNotificationsHint")}</p>
            </div>
            <input
              type="checkbox"
              id="sms_notifications"
              checked={settingsData.sms_notifications}
              onChange={(e) =>
                setSettingsData({ ...settingsData, sms_notifications: e.target.checked })
              }
              className="h-5 w-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="order_updates" className="font-medium text-slate-900">
                {t("walletUpdates")}
              </label>
              <p className="text-sm text-slate-600">{t("walletUpdatesHint")}</p>
            </div>
            <input
              type="checkbox"
              id="order_updates"
              checked={settingsData.order_updates}
              onChange={(e) =>
                setSettingsData({ ...settingsData, order_updates: e.target.checked })
              }
              className="h-5 w-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="marketing_emails" className="font-medium text-slate-900">
                {t("marketingEmails")}
              </label>
              <p className="text-sm text-slate-600">{t("marketingEmailsHint")}</p>
            </div>
            <input
              type="checkbox"
              id="marketing_emails"
              checked={settingsData.marketing_emails}
              onChange={(e) =>
                setSettingsData({ ...settingsData, marketing_emails: e.target.checked })
              }
              className="h-5 w-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? tCommon("saving") : t("saveSettings")}
        </button>
      </div>
    </form>
  );
}
