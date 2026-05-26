import { NextResponse } from "next/server";
import { checkAdminAccess, isSuperAdminRole } from "@/lib/admin-auth";
import { getCachedAdminDashboardStats } from "@/lib/admin/admin-stats-cache";

export const runtime = "nodejs";
export const revalidate = 30;

export async function GET() {
  try {
    const { user, isSuperAdmin, role, permissions } = await checkAdminAccess();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!permissions) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const stats = await getCachedAdminDashboardStats(isSuperAdmin);

    return NextResponse.json(
      {
        success: true,
        role,
        isSuperAdmin: isSuperAdminRole(role),
        permissions,
        stats,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=0, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    console.error("[Admin Stats] Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
