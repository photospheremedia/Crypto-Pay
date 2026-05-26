import type { Metadata } from "next";
import { AdminStatsProvider } from "@/components/admin/admin-stats-provider";
import { getCachedAdminNavCounts } from "@/lib/admin/admin-stats-cache";
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
  const { isSuperAdmin, permissions } = await requireAdminSession();

  let initialNavCounts = { pendingWallets: 0, newLeads: 0 };

  try {
    initialNavCounts = await getCachedAdminNavCounts();
  } catch (error) {
    console.error("[AdminLayout] Failed to prefetch nav counts:", error);
  }

  return (
    <AdminStatsProvider
      initialNavCounts={initialNavCounts}
      initialIsSuperAdmin={isSuperAdmin}
      initialPermissions={permissions}
    >
      <AdminLayoutClient isSuperAdmin={isSuperAdmin}>{children}</AdminLayoutClient>
    </AdminStatsProvider>
  );
}
