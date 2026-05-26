import { NextResponse } from "next/server";
import { checkAdminAccess, isSuperAdminRole } from "@/lib/admin-auth";
import { getAdminDashboardStats } from "@/lib/admin/admin-stats";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";

export async function GET() {
  try {
    const { user, isSuperAdmin, role, permissions } = await checkAdminAccess();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!permissions) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = getSupabaseServiceClient();
    const stats = await getAdminDashboardStats(supabase, isSuperAdmin);

    return NextResponse.json({
      success: true,
      role,
      isSuperAdmin: isSuperAdminRole(role),
      permissions,
      stats,
    });
  } catch (error) {
    console.error("[Admin Stats] Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
