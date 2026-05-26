import { NextResponse } from "next/server";
import { checkAdminAccess } from "@/lib/admin-auth";
import { getCachedAdminNavCounts } from "@/lib/admin/admin-stats-cache";

export const runtime = "nodejs";
export const revalidate = 30;

/** Lightweight badge counts for admin nav (no full dashboard payload). */
export async function GET() {
  try {
    const { user, permissions } = await checkAdminAccess();

    if (!user || !permissions) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const counts = await getCachedAdminNavCounts();

    return NextResponse.json(
      { success: true, counts },
      {
        headers: {
          "Cache-Control": "private, max-age=0, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    console.error("[Admin Nav Counts] Error:", error);
    return NextResponse.json({ error: "Failed to fetch counts" }, { status: 500 });
  }
}
