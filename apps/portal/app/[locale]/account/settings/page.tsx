import { getTranslations } from "next-intl/server";
import { getMerchantProfileBundle } from "@/lib/account/merchant-data";
import { SettingsForm } from "./settings-form";

export async function generateMetadata() {
  const t = await getTranslations("Account.settings");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function SettingsPage() {
  const t = await getTranslations("Account.settings");
  const { user, profile, settings } = await getMerchantProfileBundle();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{t("title")}</h1>
        <p className="mt-2 text-slate-600">{t("description")}</p>
      </div>

      <SettingsForm user={user} profile={profile} settings={settings} />
    </div>
  );
}
