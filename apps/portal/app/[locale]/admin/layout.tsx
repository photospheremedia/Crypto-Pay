import type { Metadata } from "next";
import { AdminStatsProvider } from "@/components/admin/admin-stats-provider";
import {
  getCachedAdminDashboardStats,
  getCachedAdminNavCounts,
} from "@/lib/admin/admin-stats-cache";
import { requireAdminSession } from "@/lib/auth/session";
import { AdminLayoutClient } from "./admin-layout-client";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSuperAdmin } = await requireAdminSession();

  let initialNavCounts = { pendingWallets: 0, newLeads: 0 };
  let initialStats: Record<string, unknown> | null = null;

  try {
    [initialNavCounts, initialStats] = await Promise.all([
      getCachedAdminNavCounts(),
      getCachedAdminDashboardStats(isSuperAdmin),
    ]);
  } catch (error) {
    console.error("[AdminLayout] Failed to prefetch stats:", error);
  }

  return (
    <AdminStatsProvider
      initialNavCounts={initialNavCounts}
      initialStats={initialStats}
      initialIsSuperAdmin={isSuperAdmin}
    >
      <AdminLayoutClient isSuperAdmin={isSuperAdmin}>{children}</AdminLayoutClient>
    </AdminStatsProvider>
  );
}
