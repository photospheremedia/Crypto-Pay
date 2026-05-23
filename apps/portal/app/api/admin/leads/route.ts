import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withAdminAuth, checkAdminAccess } from "@/lib/admin-auth";

// Get all chat leads with filtering
// Uses withAdminAuth HOF for optimized single auth check
export const GET = withAdminAuth(async (req, { user }) => {
  try {
    const supabase = await createClient();

    // Parse query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const leadStatus = searchParams.get("leadStatus");
    const contactCaptured = searchParams.get("contactCaptured");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Build query with explicit filters for query planner
    let query = (supabase as any)
      .from("chat_conversations")
      .select(`
        *,
        user_profiles!chat_conversations_user_id_fkey(full_name, email),
        assigned_profile:user_profiles!chat_conversations_assigned_to_fkey(full_name)
      `, { count: "exact" });

    // Explicit filters help query planner even with RLS
    if (status) query = query.eq("status", status);
    if (leadStatus) query = query.eq("lead_status", leadStatus);
    if (contactCaptured === "true") query = query.eq("contact_captured", true);
    if (contactCaptured === "false") query = query.eq("contact_captured", false);
    if (search) {
      query = query.or(`guest_email.ilike.%${search}%,guest_name.ilike.%${search}%,guest_phone.ilike.%${search}%`);
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("[Admin Leads] Error:", error);
      return NextResponse.json(
        { error: "Failed to fetch leads" },
        { status: 500 }
      );
    }

    // Get stats
    const { data: stats } = await (supabase as any).rpc("get_chat_leads_stats").single();

    return NextResponse.json({
      leads: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      stats: stats || {
        total: count || 0,
        new: 0,
        contacted: 0,
        qualified: 0,
        converted: 0,
        withContact: 0,
      },
    });
  } catch (error) {
    console.error("[Admin Leads] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

// Update a lead (uses checkAdminAccess since we need user.id)
export async function PATCH(req: Request) {
  try {
    // Verify admin access
    const { user, isAdmin } = await checkAdminAccess();
    if (!user || !isAdmin) {
      return NextResponse.json(
        { error: user ? "Forbidden - Admin access required" : "Unauthorized" },
        { status: user ? 403 : 401 }
      );
    }

    const supabase = await createClient();
    const body = await req.json();
    const {
      id,
      leadStatus,
      assignedTo,
      internalNotes,
      followUpDate,
      followUpCompleted,
      leadScore,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {};
    if (leadStatus !== undefined) updates.lead_status = leadStatus;
    if (assignedTo !== undefined) {
      updates.assigned_to = assignedTo || null;
      updates.assigned_at = assignedTo ? new Date().toISOString() : null;
    }
    if (internalNotes !== undefined) updates.internal_notes = internalNotes;
    if (followUpDate !== undefined) updates.follow_up_date = followUpDate;
    if (followUpCompleted !== undefined) updates.follow_up_completed = followUpCompleted;
    if (leadScore !== undefined) updates.lead_score = leadScore;

    const { data, error } = await (supabase as any)
      .from("chat_conversations")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[Admin Leads] Update error:", error);
      return NextResponse.json(
        { error: "Failed to update lead" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, lead: data });
  } catch (error) {
    console.error("[Admin Leads] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
