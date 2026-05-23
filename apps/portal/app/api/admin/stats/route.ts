import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAdminAccess } from "@/lib/admin-auth";

// Super Admin Dashboard Stats API
export async function GET() {
  try {
    const { user, isSuperAdmin, role } = await checkAdminAccess();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Base stats available to all admins
    const stats: Record<string, any> = {};

    // Get lead stats
    const { count: totalLeads } = await supabase
      .from("chat_conversations")
      .select("*", { count: "exact", head: true })
      .eq("contact_captured", true);
    stats.totalLeads = totalLeads || 0;

    const { count: newLeadsToday } = await supabase
      .from("chat_conversations")
      .select("*", { count: "exact", head: true })
      .eq("lead_status", "new")
      .eq("contact_captured", true)
      .gte("started_at", new Date().toISOString().split("T")[0]);
    stats.newLeadsToday = newLeadsToday || 0;

    const { count: qualifiedLeads } = await supabase
      .from("chat_conversations")
      .select("*", { count: "exact", head: true })
      .eq("lead_status", "qualified");
    stats.qualifiedLeads = qualifiedLeads || 0;

    const { count: convertedLeads } = await supabase
      .from("chat_conversations")
      .select("*", { count: "exact", head: true })
      .eq("lead_status", "converted");
    stats.convertedLeads = convertedLeads || 0;

    // Super admin only stats
    if (isSuperAdmin) {
      // Total users
      const { count: totalUsers } = await supabase
        .from("memberships")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
      stats.totalUsers = totalUsers || 0;

      // Staff count
      const { count: staffCount } = await supabase
        .from("memberships")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .in("role", ["staff", "admin", "owner"]);
      stats.staffCount = staffCount || 0;

      // Tenants
      const { count: totalTenants } = await supabase
        .from("tenants")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
      stats.totalTenants = totalTenants || 0;

      // Chat conversations today
      const { count: chatsToday } = await supabase
        .from("chat_conversations")
        .select("*", { count: "exact", head: true })
        .gte("started_at", new Date().toISOString().split("T")[0]);
      stats.chatsToday = chatsToday || 0;

      // Recent activity (audit logs if exists)
      try {
        const { data: recentLogs } = await supabase
          .from("audit_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);
        stats.recentActivity = recentLogs || [];
      } catch {
        stats.recentActivity = [];
      }

      // Online staff
      try {
        const { data: onlineStaff } = await supabase
          .from("staff_activity")
          .select(`
            user_id,
            last_seen_at,
            current_page,
            last_action,
            is_online
          `)
          .eq("is_online", true)
          .gte("last_seen_at", new Date(Date.now() - 5 * 60 * 1000).toISOString())
          .order("last_seen_at", { ascending: false });
        stats.onlineStaff = onlineStaff || [];
      } catch {
        stats.onlineStaff = [];
      }
    }

    // Get recent leads for all admins
    const { data: recentLeads } = await supabase
      .from("chat_conversations")
      .select(`
        id,
        guest_name,
        guest_email,
        guest_phone,
        lead_status,
        contact_captured,
        started_at,
        message_count
      `)
      .eq("contact_captured", true)
      .order("started_at", { ascending: false })
      .limit(5);
    stats.recentLeads = recentLeads || [];

    // Get staff list for super admin
    if (isSuperAdmin) {
      const { data: staffList } = await supabase
        .from("memberships")
        .select(`
          id,
          user_id,
          role,
          status,
          created_at,
          tenant_id
        `)
        .eq("status", "active")
        .in("role", ["staff", "admin", "owner", "rhs_admin"])
        .order("created_at", { ascending: false })
        .limit(20);
      
      // Get user profiles for each staff member
      if (staffList && staffList.length > 0) {
        const userIds = staffList.map(s => s.user_id);
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("id, email, full_name, avatar_url")
          .in("id", userIds);
        
        // Merge profiles with staff list
        stats.staffList = staffList.map(s => ({
          ...s,
          profile: profiles?.find(p => p.id === s.user_id) || null
        }));
      } else {
        stats.staffList = [];
      }
    }

    return NextResponse.json({
      success: true,
      role,
      isSuperAdmin,
      stats,
    });
  } catch (error) {
    console.error("[Super Admin Stats] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
