import type { Metadata } from "next";
import { AdminStatsProvider } from "@/components/admin/admin-stats-provider";
import {
  getAdminDashboardStats,
  getAdminNavCounts,
} from "@/lib/admin/admin-stats";
import { requireAdminSession } from "@/lib/auth/session";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";
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
  const supabase = getSupabaseServiceClient();
  const [initialNavCounts, initialStats] = await Promise.all([
    getAdminNavCounts(supabase),
    getAdminDashboardStats(supabase, isSuperAdmin),
  ]);

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
