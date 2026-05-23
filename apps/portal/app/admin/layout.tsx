import type { Metadata } from "next";
import { AdminLayoutClient } from "./admin-layout-client";

// Prevent search engines from indexing admin area
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
