import { getTranslations } from "next-intl/server";
import { getMerchantAuth } from "@/lib/account/merchant-data";
import { Mail, Shield, Smartphone, Key, Clock, AlertTriangle } from "lucide-react";
import PasswordChangeForm from "./PasswordChangeForm";
import TwoFactorSettings from "./TwoFactorSettings";

export async function generateMetadata() {
  const t = await getTranslations("Account.security");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function SecurityPage() {
  const t = await getTranslations("Account.security");
  const { user } = await getMerchantAuth();

  const hasPassword = !!(user.app_metadata?.provider !== 'oauth' || user.app_metadata?.providers?.includes('email'));
  const identities = user.identities || [];
  const lastSignIn = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString()
    : t("never");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <p className="mt-2 text-slate-600 leading-relaxed">{t("description")}</p>
      </div>

      <div className="rounded-xl border border-emerald-200/60 bg-linear-to-br from-emerald-50/50 to-teal-50/30 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-200/50">
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

      <div className="rounded-xl border border-slate-200/60 bg-linear-to-br from-white to-slate-50/50 shadow-sm">
        <div className="p-6 border-b border-slate-200/60">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-emerald-500 shadow-md">
              <Key className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900">{t("password")}</h2>
              <p className="text-sm text-slate-600 mt-0.5">
                {hasPassword ? t("passwordUpdateHint") : t("passwordSetHint")}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <PasswordChangeForm hasPassword={hasPassword} userEmail={user.email || ''} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/60 bg-linear-to-br from-white to-slate-50/50 shadow-sm">
        <div className="p-6 border-b border-slate-200/60">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-500 shadow-md">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900">{t("twoFactor")}</h2>
              <p className="text-sm text-slate-600 mt-0.5">{t("twoFactorHint")}</p>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <TwoFactorSettings userId={user.id} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/60 bg-linear-to-br from-white to-slate-50/50 shadow-sm">
        <div className="p-6 border-b border-slate-200/60">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-pink-500 shadow-md">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900">{t("connectedAccounts")}</h2>
              <p className="text-sm text-slate-600 mt-0.5">{t("connectedAccountsHint")}</p>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <div className="space-y-3">
            {identities.map((identity) => (
              <div key={identity.id} className="flex items-center justify-between p-4 border border-slate-200/60 bg-white/50 rounded-xl hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 bg-linear-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                    <Mail className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 capitalize">
                      {identity.provider}
                    </p>
                    <p className="text-sm text-slate-600">
                      {identity.identity_data?.email || t("connected")}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600 border border-emerald-200">
                  ✓ {t("active")}
                </span>
              </div>
            ))}

            {identities.length === 0 && (
              <div className="text-center py-12">
                <Mail className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-sm font-medium text-slate-600">{t("noConnectedAccounts")}</p>
                <p className="text-xs text-slate-500 mt-1">{t("connectSocialHint")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/60 bg-linear-to-br from-white to-slate-50/50 shadow-sm">
        <div className="p-6 border-b border-slate-200/60">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500 to-blue-500 shadow-md">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900">{t("activeSessions")}</h2>
              <p className="text-sm text-slate-600 mt-0.5">{t("activeSessionsHint")}</p>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-5 border border-blue-200/60 bg-linear-to-r from-blue-50 to-cyan-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 bg-linear-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{t("currentSession")}</p>
                  <p className="text-sm text-slate-600">
                    {t("lastActive", { time: t("justNow") })}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
                {t("thisDevice")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border-2 border-red-200/60 bg-linear-to-br from-red-50/50 to-emerald-50/30 shadow-sm">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-red-500 to-emerald-500 shadow-md shrink-0">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-red-900">{t("dangerZone")}</h2>
              <p className="mt-2 text-sm text-red-700/90 leading-relaxed">{t("dangerZoneHint")}</p>
              <button
                type="button"
                className="mt-4 px-6 py-2.5 bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                {t("deleteAccount")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
