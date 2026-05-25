import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SettingsForm } from "./settings-form";

export const metadata = {
  title: "Settings",
  description: "Manage your account settings and preferences",
};

async function getUserSettings() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );
  
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
  const { user, profile, settings } = await getUserSettings();

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="mt-2 text-slate-600">
          Manage your account preferences and notification settings
        </p>
      </div>

      <SettingsForm
        user={user}
        profile={profile}
        settings={settings}
      />
    </div>
  );
}
