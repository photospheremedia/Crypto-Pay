import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
import { SettingsForm } from "./settings-form";

export async function generateMetadata() {
  const t = await getTranslations("Account.settings");
  return {
    title: t("title"),
    description: t("description"),
  };
}

async function getUserSettings() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile and settings
  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("id", user.id).single(),
    supabase.from("user_settings").select("*").eq("user_id", user.id).single(),
  ]);

  return {
    user,
    profile,
    settings,
  };
}

export default async function SettingsPage() {
  const t = await getTranslations("Account.settings");
  const { user, profile, settings } = await getUserSettings();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{t("title")}</h1>
        <p className="mt-2 text-slate-600">{t("description")}</p>
      </div>

      <SettingsForm
        user={user}
        profile={profile}
        settings={settings}
      />
    </div>
  );
}
