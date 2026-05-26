import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Mail, Shield, Smartphone, Key, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { checkAdminAccess } from "@/lib/admin-auth";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import PasswordChangeForm from "@/app/[locale]/account/security/PasswordChangeForm";
import TwoFactorSettings from "@/app/[locale]/account/security/TwoFactorSettings";

export async function generateMetadata() {
  const t = await getTranslations("Account.security");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AdminProfilePage() {
  const t = await getTranslations("Account.security");
  const { user, isAdmin } = await checkAdminAccess();

  if (!user) {
    redirect("/login");
  }

  if (!isAdmin) {
    redirect("/account");
  }

  const supabase = await createClient();
  const { data: authUser } = await supabase.auth.getUser();
  const sessionUser = authUser.user ?? user;

  const hasPassword = !!(
    sessionUser.app_metadata?.provider !== "oauth" ||
    sessionUser.app_metadata?.providers?.includes("email")
  );
  const identities = sessionUser.identities || [];
  const lastSignIn = sessionUser.last_sign_in_at
    ? new Date(sessionUser.last_sign_in_at).toLocaleString()
    : t("never");

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={t("title")}
        description={t("description")}
        backHref="/admin/dashboard"
      />

      <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900">{t("accountSecure")}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {t("lastSignIn", { date: lastSignIn })}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500">
              <Key className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{t("password")}</h2>
              <p className="mt-0.5 text-sm text-slate-600">
                {hasPassword ? t("passwordUpdateHint") : t("passwordSetHint")}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <PasswordChangeForm
            hasPassword={hasPassword}
            userEmail={sessionUser.email || ""}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{t("twoFactor")}</h2>
              <p className="mt-0.5 text-sm text-slate-600">{t("twoFactorHint")}</p>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <TwoFactorSettings userId={sessionUser.id} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {t("connectedAccounts")}
              </h2>
              <p className="mt-0.5 text-sm text-slate-600">{t("connectedAccountsHint")}</p>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <div className="space-y-3">
            {identities.map((identity) => (
              <div
                key={identity.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                    <Mail className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold capitalize text-slate-900">
                      {identity.provider}
                    </p>
                    <p className="text-sm text-slate-600">
                      {identity.identity_data?.email || t("connected")}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                  ✓ {t("active")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{t("activeSessions")}</h2>
              <p className="mt-0.5 text-sm text-slate-600">{t("activeSessionsHint")}</p>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{t("currentSession")}</p>
                <p className="text-sm text-slate-600">
                  {t("lastActive", { time: t("justNow") })}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              {t("thisDevice")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
