"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { isAdminPathActive } from "@/lib/admin/navigation";
import { AdminSidebarPanel, type AdminNavCounts } from "@/components/admin/admin-app-sidebar";
import { AdminNotifications } from "@/components/admin/admin-notifications";
import { AdminUserMenu } from "@/components/admin/admin-user-menu";
import { AdminHelpMenu } from "@/components/admin/admin-help-menu";
import { AdminSearch } from "@/components/admin/admin-search";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { mainBelowHeaderClass } from "@/lib/layout-spacing";
import { cn } from "@/lib/utils";

const emptyCounts: AdminNavCounts = {
  pendingWallets: 0,
  newLeads: 0,
};

export function AdminLayoutClient({
  children,
  isSuperAdmin,
}: {
  children: React.ReactNode;
  isSuperAdmin: boolean;
}) {
  const tDashboard = useTranslations("Admin.dashboard");
  const pathname = usePathname();
  const onDashboard = isAdminPathActive(pathname, "/admin/dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counts, setCounts] = useState<AdminNavCounts>(emptyCounts);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (data.success && data.stats) {
          setCounts({
            pendingWallets: Number(data.stats.pendingWallets ?? 0),
            newLeads: Number(data.stats.newLeadsToday ?? 0),
          });
        }
      } catch (error) {
        console.error("Failed to fetch admin nav counts:", error);
      }
    };

    void fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    if (!sidebarOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSidebar();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-slate-100">
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          aria-label="Close navigation menu"
          onClick={closeSidebar}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(100%,20rem)] flex-col bg-slate-900 text-white shadow-2xl transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!sidebarOpen}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 px-4">
          <span className="text-sm font-semibold text-slate-300">Menu</span>
          <button
            type="button"
            onClick={closeSidebar}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="Close navigation menu"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <AdminSidebarPanel
            isSuperAdmin={isSuperAdmin}
            counts={counts}
            onNavigate={closeSidebar}
          />
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-4 shadow-sm sm:gap-3 sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 active:bg-slate-200"
            aria-label="Open navigation menu"
          >
            <Menu className="size-6" />
          </button>

          {onDashboard ? (
            <span className="truncate text-sm font-semibold text-slate-900 sm:text-base">
              {tDashboard("title")}
            </span>
          ) : (
            <Link
              href="/admin/dashboard"
              className="truncate text-sm font-semibold text-slate-900 transition-colors hover:text-emerald-600 sm:text-base"
            >
              {tDashboard("title")}
            </Link>
          )}

          <div className="hidden min-w-0 flex-1 sm:flex">
            <AdminSearch />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1.5">
            <LocaleSwitcher size="toolbar" />
            <AdminNotifications />
            <AdminHelpMenu />
            <AdminUserMenu isSuperAdmin={isSuperAdmin} />
          </div>
        </header>

        <main
          className={cn(
            "min-w-0 flex-1 px-4 pb-6 sm:px-5 lg:px-6",
            mainBelowHeaderClass,
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
