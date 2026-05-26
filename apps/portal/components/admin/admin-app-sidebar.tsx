"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Bitcoin,
  ChevronDown,
  ChevronRight,
  Crown,
  ExternalLink,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import {
  adminGrowthSubmenu,
  adminNavSections,
  adminSuperAdminSection,
  isAdminPathActive,
  isGrowthPathActive,
  type AdminNavBadgeKey,
} from "@/lib/admin/navigation";
import type { AdminNavCounts } from "@/lib/admin/admin-stats";
import { cn } from "@/lib/utils";

function badgeCount(key: AdminNavBadgeKey, counts: AdminNavCounts): number {
  if (key === "pendingWallets") return counts.pendingWallets;
  if (key === "newLeads") return counts.newLeads;
  return 0;
}

/** Dark admin shell — matches original slate-900 sidebar. */
const navLinkClass = (active: boolean) =>
  cn(
    "flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
    active
      ? "bg-emerald-500/10 text-emerald-400"
      : "text-slate-400 hover:bg-slate-800 hover:text-white",
  );

const subLinkClass = (active: boolean) =>
  cn(
    "block rounded-lg px-3 py-2 text-sm transition-colors",
    active
      ? "bg-emerald-500/10 text-emerald-400"
      : "text-slate-500 hover:bg-slate-800 hover:text-white",
  );

export function AdminSidebarPanel({
  isSuperAdmin,
  counts,
  onNavigate,
}: {
  isSuperAdmin: boolean;
  counts: AdminNavCounts;
  onNavigate?: () => void;
}) {
  const t = useTranslations("Admin.nav");
  const pathname = usePathname();
  const growthOpen = isGrowthPathActive(pathname);
  const [growthExpanded, setGrowthExpanded] = React.useState(growthOpen);

  React.useEffect(() => {
    if (growthOpen) setGrowthExpanded(true);
  }, [growthOpen]);

  const superAdminLinkClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
      active
        ? "bg-purple-500/20 text-purple-400"
        : "text-slate-400 hover:bg-slate-800 hover:text-white",
    );

  return (
    <div className="flex flex-col p-3 pb-6">
      <Link
        href="/admin/dashboard"
        onClick={onNavigate}
        className="mb-5 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-800"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500 shadow-sm">
          <Bitcoin className="size-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{t("brand")}</p>
          <p className="truncate text-xs text-slate-400">{t("brandTagline")}</p>
        </div>
      </Link>

      {adminNavSections.map((section) => (
        <div key={section.labelKey} className="mb-5">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t(section.labelKey)}
          </p>
          <nav className="space-y-0.5" aria-label={t(section.labelKey)}>
            {section.items.map((item) => {
              const active = isAdminPathActive(pathname, item.href);
              const count = item.badgeKey
                ? badgeCount(item.badgeKey, counts)
                : 0;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={navLinkClass(active)}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <item.icon className="size-5 shrink-0" />
                    <span className="truncate">{t(item.titleKey)}</span>
                  </span>
                  {count > 0 && item.badgeKey ? (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                      {count > 99 ? "99+" : count}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}

      <div className="mb-5">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t("growth")}
        </p>
        <button
          type="button"
          onClick={() => setGrowthExpanded((open) => !open)}
          className={cn(navLinkClass(growthOpen), "w-full")}
        >
          <span className="flex min-w-0 items-center gap-3">
            <adminGrowthSubmenu.icon className="size-5 shrink-0" />
            <span className="truncate">{t(adminGrowthSubmenu.titleKey)}</span>
          </span>
          {growthExpanded ? (
            <ChevronDown className="size-4 shrink-0 text-slate-400" />
          ) : (
            <ChevronRight className="size-4 shrink-0 text-slate-400" />
          )}
        </button>
        {growthExpanded ? (
          <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-700 pl-3">
            {adminGrowthSubmenu.items.map((sub) => (
              <Link
                key={sub.href}
                href={sub.href}
                onClick={onNavigate}
                className={subLinkClass(isAdminPathActive(pathname, sub.href))}
              >
                {t(sub.titleKey)}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      {isSuperAdmin ? (
        <div className="mb-5">
          <p className="mb-2 flex items-center gap-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-purple-400">
            <Crown className="size-3.5" />
            {t(adminSuperAdminSection.labelKey)}
          </p>
          <nav className="space-y-0.5" aria-label={t(adminSuperAdminSection.labelKey)}>
            {adminSuperAdminSection.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={superAdminLinkClass(
                  isAdminPathActive(pathname, item.href),
                )}
              >
                <item.icon className="size-5 shrink-0" />
                <span className="truncate">{t(item.titleKey)}</span>
              </Link>
            ))}
          </nav>
        </div>
      ) : null}

      <div className="mt-auto border-t border-slate-800 pt-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <ExternalLink className="size-5 shrink-0" />
          <span>{t("exitAdmin")}</span>
        </Link>
      </div>
    </div>
  );
}

/** @deprecated Use AdminSidebarPanel inside admin layout aside */
export function AdminAppSidebar(
  props: React.ComponentProps<typeof AdminSidebarPanel>,
) {
  return <AdminSidebarPanel {...props} />;
}
