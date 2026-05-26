import type { Metadata } from "next";
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

  return (
    <AdminLayoutClient isSuperAdmin={isSuperAdmin}>{children}</AdminLayoutClient>
  );
}
