"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Users,
  Settings,
  BarChart3,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Store,
  Mail,
  MessageSquare,
  Crown,
  Wallet,
} from "lucide-react";
import { AdminNotifications } from "@/components/admin/admin-notifications";
import { AdminUserMenu } from "@/components/admin/admin-user-menu";
import { AdminHelpMenu } from "@/components/admin/admin-help-menu";
import { AdminSearch } from "@/components/admin/admin-search";
import { mainBelowHeaderClass } from "@/lib/layout-spacing";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Conversations",
    href: "/admin/leads",
    icon: MessageSquare,
    badge: true, // Show notification badge for new leads
  },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Wallet review", href: "/admin/wallets", icon: Wallet },
  {
    name: "Growth",
    icon: Mail,
    children: [
      { name: "Email Campaigns", href: "/admin/marketing" },
      { name: "Automations", href: "/admin/marketing/automations" },
      { name: "Templates", href: "/admin/marketing/templates" },
      { name: "Contacts", href: "/admin/marketing/contacts" },
    ],
  },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

// Super admin only navigation
const superAdminNavigation = [
  {
    name: "Staff Management",
    href: "/admin/staff",
    icon: Users,
  },
  {
    name: "Audit Logs",
    href: "/admin/audit",
    icon: Activity,
  },
];

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Growth"]);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | undefined>(undefined);
  const pathname = usePathname();

  // Fetch new leads count for badge and check if super admin
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        if (data.success) {
          setNewLeadsCount(data.stats?.newLeadsToday || 0);
          setIsSuperAdmin(data.isSuperAdmin || false);
        }
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleMenu = (name: string) => {
    setExpandedMenus((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isParentActive = (children?: { href: string }[]) =>
    children?.some((child) => pathname === child.href);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar backdrop - now visible on all screen sizes when menu is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - now hamburger menu on all screens */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 transform bg-slate-900 shadow-2xl transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Crypto Pay Admin</span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white active:bg-slate-700 transition-colors"
            aria-label="Close sidebar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable navigation area */}
        <div className="h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="p-3 space-y-1 pb-20">
          {navigation.map((item) =>
            item.children ? (
              <div key={item.name}>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isParentActive(item.children)
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.name}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                      expandedMenus.includes(item.name) ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${
                  expandedMenus.includes(item.name) ? "max-h-96 mt-1" : "max-h-0"
                }`}>
                  <div className="ml-8 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                          isActive(child.href)
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "text-slate-500 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.name}
                href={item.href!}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(item.href!)
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </div>
                {item.badge && newLeadsCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white shrink-0 animate-in fade-in-0 zoom-in-95">
                    {newLeadsCount > 99 ? "99+" : newLeadsCount}
                  </span>
                )}
              </Link>
            )
          )}

          {/* Super Admin Section */}
          {isSuperAdmin === undefined ? (
            // Loading skeleton for super admin section
            <div className="mt-6 space-y-2">
              <div className="px-3 mb-2">
                <div className="h-4 w-32 bg-slate-800 rounded animate-pulse" />
              </div>
              <div className="px-3 space-y-1">
                <div className="h-9 bg-slate-800 rounded animate-pulse" />
                <div className="h-9 bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          ) : isSuperAdmin ? (
            <>
              <div className="mt-6 mb-2 px-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-400">
                  <Crown className="h-3.5 w-3.5" />
                  Super Admin
                </div>
              </div>
              {superAdminNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-purple-500/20 text-purple-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.name}
                </Link>
              ))}
            </>
          ) : null}

          {/* Bottom section - now inside scrollable area with proper spacing */}
          <div className="mt-8 pt-4 border-t border-slate-800">
            <Link
              href="/"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              Exit Admin
            </Link>
          </div>
        </nav>
        </div>
      </aside>

      {/* Main content - now full width since sidebar is always hamburger */}
      <div className="w-full">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 sm:gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 shadow-sm min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 active:bg-slate-200 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/admin" className="flex items-center gap-2 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 shrink-0">
                <Store className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 hidden sm:inline">Crypto Pay</span>
            </Link>
          </div>

          {/* Search - hide on very small screens */}
          <div className="hidden sm:flex flex-1 max-w-xl">
            <AdminSearch />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <AdminNotifications />
            <AdminHelpMenu />
            <AdminUserMenu isSuperAdmin={isSuperAdmin === true} />
          </div>
        </header>

        {/* Page content */}
        <main
          className={`px-4 pb-6 sm:px-5 sm:pb-6 lg:px-6 lg:pb-6 ${mainBelowHeaderClass}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
