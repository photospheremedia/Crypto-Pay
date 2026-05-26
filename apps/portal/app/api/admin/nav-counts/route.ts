import { NextResponse } from "next/server";
import { checkAdminAccess } from "@/lib/admin-auth";
import { getAdminNavCounts } from "@/lib/admin/admin-stats";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";

/** Lightweight badge counts for admin nav (no full dashboard payload). */
export async function GET() {
  try {
    const { user, permissions } = await checkAdminAccess();

    if (!user || !permissions) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServiceClient();
    const counts = await getAdminNavCounts(supabase);

    return NextResponse.json({ success: true, counts });
  } catch (error) {
    console.error("[Admin Nav Counts] Error:", error);
    return NextResponse.json({ error: "Failed to fetch counts" }, { status: 500 });
  }
}
