import type { Metadata } from "next";
import { AdminStatsProvider } from "@/components/admin/admin-stats-provider";
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

  return (
    <AdminStatsProvider
      initialIsSuperAdmin={isSuperAdmin}
      initialPermissions={permissions}
    >
      <AdminLayoutClient isSuperAdmin={isSuperAdmin}>{children}</AdminLayoutClient>
    </AdminStatsProvider>
  );
}
