"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Wallet,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { signOut } from "@/app/[locale]/(login)/actions";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { CryptoPayLogo } from "@/components/cryptopay/crypto-pay-logo";
import { AccountUserMenu } from "@/components/account/account-user-menu";
import { AccountHelpMenu } from "@/components/account/account-help-menu";
import { mainBelowHeaderClass, stickyBelowHeaderClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

export interface AccountLayoutClientProps {
  children: React.ReactNode;
  user: {
    email: string;
    displayName: string;
    initial: string;
  };
}

export function AccountLayoutClient({
  children,
  user,
}: AccountLayoutClientProps) {
  const t = useTranslations("Account.nav");
  const tHeader = useTranslations("Account.header");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab");

  const navItems = [
    { label: t("dashboard"), href: "/account", icon: LayoutDashboard },
    { label: t("wallet"), href: "/account?tab=wallets", icon: Wallet },
    { label: t("security"), href: "/account/security", icon: Shield },
    { label: t("settings"), href: "/account/settings", icon: Settings },
  ] as const;

  const isNavActive = (href: string) => {
    if (href.includes("tab=wallets")) {
      return pathname === "/account" && activeTab === "wallets";
    }
    if (href === "/account") {
      return pathname === "/account" && activeTab !== "wallets";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const sidebarNav = (
    <>
      <div className="mb-4 rounded-2xl border border-slate-200/60 bg-white/80 p-5 shadow-lg shadow-slate-200/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 via-emerald-400 to-cyan-600 text-2xl font-bold text-white shadow-md">
              {user.initial}
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-slate-900">
              {user.displayName}
            </p>
            <p className="truncate text-sm text-slate-600">{user.email}</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1.5" aria-label={tHeader("sidebarNav")}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "group flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm backdrop-blur-sm transition-all hover:-translate-x-0.5 hover:shadow-md",
              isNavActive(item.href)
                ? "border-emerald-300/60 bg-emerald-50/80 text-emerald-700"
                : "border-slate-200/60 bg-white/70 text-slate-700 hover:border-emerald-300/60 hover:bg-emerald-50/80 hover:text-emerald-600",
            )}
          >
            <item.icon
              className={cn(
                "h-4 w-4 transition-all group-hover:scale-110",
                isNavActive(item.href)
                  ? "text-emerald-600"
                  : "text-slate-500 group-hover:text-emerald-500",
              )}
            />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <form action={signOut} className="mt-3 border-t border-slate-200/60 pt-3">
        <button
          type="submit"
          className="group flex w-full items-center gap-3 rounded-xl border border-slate-200/60 bg-white/70 px-4 py-3 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm transition-all hover:-translate-x-0.5 hover:border-red-300/60 hover:bg-red-50/80 hover:text-red-600 hover:shadow-md"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:scale-110" />
          <span>{t("signOut")}</span>
        </button>
      </form>
    </>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          aria-label={tHeader("closeMenu")}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(100%,280px)] flex-col border-r border-slate-200 bg-white p-4 shadow-xl transition-transform duration-200 lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <CryptoPayLogo />
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label={tHeader("closeMenu")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{sidebarNav}</div>
      </aside>

      <header className="sticky top-0 z-30 flex h-16 min-w-0 items-center gap-2 border-b border-slate-200 bg-white px-4 shadow-sm sm:gap-4 sm:px-6">
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 active:bg-slate-200 lg:hidden"
            aria-label={tHeader("openMenu")}
          >
            <Menu className="h-6 w-6" />
          </button>
          <CryptoPayLogo href="/account" />
        </div>

        <div className="flex-1" />

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
          <div className="hidden md:flex">
            <LocaleSwitcher size="toolbar" />
          </div>
          <AccountHelpMenu />
          <AccountUserMenu
            email={user.email}
            displayName={user.displayName}
            initial={user.initial}
          />
        </div>
      </header>

      <div
        className={cn(
          "mx-auto grid w-full max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8",
          mainBelowHeaderClass,
        )}
      >
        <aside
          className={cn(
            "hidden lg:sticky lg:block lg:self-start lg:h-fit",
            stickyBelowHeaderClass,
          )}
        >
          {sidebarNav}
        </aside>

        <main className="min-w-0">
          <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-sm sm:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
