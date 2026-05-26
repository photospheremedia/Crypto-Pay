import { NextResponse } from "next/server";
import { checkAdminAccess, isSuperAdminRole } from "@/lib/admin-auth";
import {
  filterMerchantProfiles,
  getStaffUserIds,
} from "@/lib/admin/merchant-directory";
import { merchantWallets } from "@/lib/wallets/db";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";

export async function GET() {
  try {
    const { user, isSuperAdmin, role, permissions } = await checkAdminAccess();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseServiceClient();
    const stats: Record<string, unknown> = {};
    const staffUserIds = await getStaffUserIds(supabase);

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

    const { data: profileRows } = await supabase
      .from("user_profiles")
      .select("id, email");
    stats.merchantAccounts = filterMerchantProfiles(
      profileRows ?? [],
      staffUserIds,
    ).length;

    const { count: walletsLinked } = await supabase
      .from("user_wallet_profiles")
      .select("*", { count: "exact", head: true });
    stats.walletsLinked = walletsLinked || 0;

    const { count: walletsVerified } = await supabase
      .from("user_wallet_profiles")
      .select("*", { count: "exact", head: true })
      .eq("wallet_verified", true);
    stats.walletsVerified = walletsVerified || 0;

    const { count: pendingWallets } = await merchantWallets(supabase)
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    stats.pendingWallets = pendingWallets || 0;

    const { count: verifiedMerchantWallets } = await merchantWallets(supabase)
      .select("*", { count: "exact", head: true })
      .eq("status", "verified");
    stats.verifiedMerchantWallets = verifiedMerchantWallets || 0;

    const { count: totalMerchantWallets } = await merchantWallets(supabase)
      .select("*", { count: "exact", head: true });
    stats.totalMerchantWallets = totalMerchantWallets || 0;

    if (isSuperAdmin) {
      const { count: totalUsers } = await supabase
        .from("memberships")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
      stats.totalUsers = totalUsers || 0;

      const { count: staffCount } = await supabase
        .from("memberships")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .in("role", ["staff", "admin", "owner", "manager", "cp_admin", "rhs_admin"]);
      stats.staffCount = staffCount || 0;

      const { count: chatsToday } = await supabase
        .from("chat_conversations")
        .select("*", { count: "exact", head: true })
        .gte("started_at", new Date().toISOString().split("T")[0]);
      stats.chatsToday = chatsToday || 0;

      try {
        const { data: recentLogs } = await supabase
          .from("audit_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);
        stats.recentActivity = recentLogs || [];
      } catch {
        stats.recentActivity = [];
      }
    }

    const { data: recentLeads } = await supabase
      .from("chat_conversations")
      .select(
        "id, guest_name, guest_email, guest_phone, lead_status, contact_captured, started_at, message_count",
      )
      .eq("contact_captured", true)
      .order("started_at", { ascending: false })
      .limit(5);
    stats.recentLeads = recentLeads || [];

    if (isSuperAdmin) {
      const { data: staffList } = await supabase
        .from("memberships")
        .select("id, user_id, role, status, created_at, tenant_id")
        .eq("status", "active")
        .in("role", ["staff", "admin", "owner", "cp_admin", "rhs_admin"])
        .order("created_at", { ascending: false })
        .limit(20);

      if (staffList && staffList.length > 0) {
        const userIds = staffList.map((s) => s.user_id);
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("id, email, full_name, avatar_url")
          .in("id", userIds);

        stats.staffList = staffList.map((s) => ({
          ...s,
          profile: profiles?.find((p) => p.id === s.user_id) || null,
        }));
      } else {
        stats.staffList = [];
      }
    }

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
