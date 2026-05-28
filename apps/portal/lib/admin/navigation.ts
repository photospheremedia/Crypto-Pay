import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Bell,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Settings,
  Shield,
  Users,
  Wallet,
  UserCircle,
} from "lucide-react";

/** Keys resolved from `/api/admin/stats` for sidebar badges */
export type AdminNavBadgeKey = "pendingWallets" | "newLeads";

export type AdminNavLink = {
  titleKey: string;
  href: string;
  icon: LucideIcon;
  badgeKey?: AdminNavBadgeKey;
  /** Visible but intentionally disabled in sidebar. */
  comingSoon?: boolean;
  /** Hide unless `isSuperAdmin` from layout */
  superAdminOnly?: boolean;
};

export type AdminNavSection = {
  labelKey: string;
  items: AdminNavLink[];
};

export type AdminNavSubmenu = {
  titleKey: string;
  icon: LucideIcon;
  items: AdminNavLink[];
};

/** Primary admin navigation for Crypto Pay (merchant payouts + platform ops). */
export const adminNavSections: AdminNavSection[] = [
  {
    labelKey: "overview",
    items: [
      {
        titleKey: "dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    labelKey: "merchantOps",
    items: [
      {
        titleKey: "walletReview",
        href: "/admin/wallets",
        icon: Wallet,
        badgeKey: "pendingWallets",
      },
      {
        titleKey: "merchants",
        href: "/admin/users",
        icon: Users,
      },
      {
        titleKey: "leads",
        href: "/admin/leads",
        icon: MessageSquare,
        badgeKey: "newLeads",
        comingSoon: true,
      },
    ],
  },
  {
    labelKey: "insights",
    items: [
      {
        titleKey: "analytics",
        href: "/admin/analytics",
        icon: BarChart3,
        comingSoon: true,
      },
    ],
  },
  {
    labelKey: "platform",
    items: [
      {
        titleKey: "settings",
        href: "/admin/settings",
        icon: Settings,
      },
      {
        titleKey: "notifications",
        href: "/admin/notifications",
        icon: Bell,
      },
      {
        titleKey: "security",
        href: "/admin/profile",
        icon: Shield,
      },
    ],
  },
];

export const adminGrowthSubmenu: AdminNavSubmenu = {
  titleKey: "growth",
  icon: Mail,
  items: [
    {
      titleKey: "campaigns",
      href: "/admin/marketing",
      icon: Mail,
      comingSoon: true,
    },
    {
      titleKey: "automations",
      href: "/admin/marketing/automations",
      icon: Mail,
      comingSoon: true,
    },
    {
      titleKey: "templates",
      href: "/admin/marketing/templates",
      icon: Mail,
      comingSoon: true,
    },
    {
      titleKey: "contacts",
      href: "/admin/marketing/contacts",
      icon: UserCircle,
      comingSoon: true,
    },
  ],
};

export const adminSuperAdminSection: AdminNavSection = {
  labelKey: "superAdmin",
  items: [
    {
      titleKey: "staff",
      href: "/admin/staff",
      icon: Users,
      superAdminOnly: true,
    },
    {
      titleKey: "audit",
      href: "/admin/audit",
      icon: Activity,
      superAdminOnly: true,
    },
  ],
};

export function isAdminPathActive(pathname: string, href: string): boolean {
  if (href === "/admin/dashboard") {
    return pathname === "/admin/dashboard" || pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isGrowthPathActive(pathname: string): boolean {
  return pathname.startsWith("/admin/marketing");
}

