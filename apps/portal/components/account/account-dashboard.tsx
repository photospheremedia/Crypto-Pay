"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  Shield,
  Settings,
  Copy,
  CheckCircle2,
  Code2,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { MerchantWalletPublic } from "@/lib/wallets/merchant-wallet-public";
import { MerchantWalletDashboard } from "@/components/account/merchant-wallet-dashboard";

type AccountDashboardProps = {
  user: User;
  wallets: MerchantWalletPublic[];
  initialTab: string;
};

export function AccountDashboard({
  user,
  wallets,
  initialTab,
}: AccountDashboardProps) {
  const t = useTranslations("Account.dashboard");
  const tWallets = useTranslations("Account.wallets");
  const tNav = useTranslations("Account.nav");
  const [copied, setCopied] = useState(false);

  const displayName =
    user.user_metadata?.given_name || user.email?.split("@")[0] || "";

  const quickLinks = [
    {
      label: tNav("security"),
      href: "/account/security",
      icon: Shield,
      description: t("securityDescription"),
      color: "text-blue-500",
      bg: "bg-blue-50 border-blue-100",
    },
    {
      label: tNav("settings"),
      href: "/account/settings",
      icon: Settings,
      description: t("settingsDescription"),
      color: "text-slate-500",
      bg: "bg-slate-50 border-slate-100",
    },
    {
      label: t("developersTitle"),
      href: "/developers",
      icon: Code2,
      description: t("developersDescription"),
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100",
    },
  ];

  function copyEmail() {
    if (!user.email) return;
    navigator.clipboard.writeText(user.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t("welcome", { name: displayName })}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{t("subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={copyEmail}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
        >
          {copied ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {user.email}
        </button>
      </div>

      <section className="flex flex-col gap-4 border-t border-slate-200 pt-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-600">
            {tWallets("eyebrow")}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            {tWallets("title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{tWallets("description")}</p>
        </div>
        <MerchantWalletDashboard
          wallets={wallets}
          initialTab={initialTab}
          showHeader={false}
          autoOpenAddWallet={wallets.length === 0 && initialTab === "wallets"}
        />
      </section>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("quickAccess")}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-start gap-4 rounded-xl border p-4 transition hover:shadow-md ${item.bg}`}
            >
              <span
                className={`mt-0.5 rounded-lg bg-white p-2 shadow-sm ${item.color}`}
              >
                <item.icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900 transition group-hover:text-emerald-600">
                  {item.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
