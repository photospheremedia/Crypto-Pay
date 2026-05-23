import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAdminAccess } from "@/lib/admin-auth";

// Get count of new leads (for badge)
export async function GET() {
  try {
    // Verify admin access - returns 0 silently for non-admins (badge use case)
    const { isAdmin } = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ count: 0 });
    }

    const supabase = await createClient();

    // Count new leads (not yet contacted)
    const { count, error } = await (supabase as any)
      .from("chat_conversations")
      .select("*", { count: "exact", head: true })
      .eq("lead_status", "new")
      .eq("contact_captured", true);

    if (error) {
      console.error("[Leads Count] Error:", error);
      return NextResponse.json({ count: 0 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error("[Leads Count] Error:", error);
    return NextResponse.json({ count: 0 });
  }
}
