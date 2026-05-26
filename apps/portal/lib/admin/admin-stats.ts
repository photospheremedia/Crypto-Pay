import type { SupabaseClient } from "@supabase/supabase-js";
import { getStaffUserIds } from "@/lib/admin/merchant-directory";
import { merchantWallets } from "@/lib/wallets/db";

export type AdminNavCounts = {
  pendingWallets: number;
  newLeads: number;
};

export type AdminDashboardStats = Record<string, unknown>;

function todayIsoDate(): string {
  return new Date().toISOString().split("T")[0]!;
}

/** Sidebar badges — two parallel count queries only. */
export async function getAdminNavCounts(
  supabase: SupabaseClient,
): Promise<AdminNavCounts> {
  const today = todayIsoDate();

  const [pendingWalletsRes, newLeadsRes] = await Promise.all([
    merchantWallets(supabase)
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("chat_conversations")
      .select("*", { count: "exact", head: true })
      .eq("lead_status", "new")
      .eq("contact_captured", true)
      .gte("started_at", today),
  ]);

  return {
    pendingWallets: pendingWalletsRes.count ?? 0,
    newLeads: newLeadsRes.count ?? 0,
  };
}

/** Dashboard metrics — parallelized; avoids loading all user_profiles rows. */
export async function getAdminDashboardStats(
  supabase: SupabaseClient,
  isSuperAdmin: boolean,
): Promise<AdminDashboardStats> {
  const today = todayIsoDate();

  const [
    totalLeadsRes,
    newLeadsTodayRes,
    profileCountRes,
    staffUserIds,
    walletsLinkedRes,
    walletsVerifiedRes,
    pendingWalletsRes,
    verifiedMerchantWalletsRes,
    totalMerchantWalletsRes,
    recentLeadsRes,
  ] = await Promise.all([
    supabase
      .from("chat_conversations")
      .select("*", { count: "exact", head: true })
      .eq("contact_captured", true),
    supabase
      .from("chat_conversations")
      .select("*", { count: "exact", head: true })
      .eq("lead_status", "new")
      .eq("contact_captured", true)
      .gte("started_at", today),
    supabase.from("user_profiles").select("*", { count: "exact", head: true }),
    getStaffUserIds(supabase),
    supabase
      .from("user_wallet_profiles")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("user_wallet_profiles")
      .select("*", { count: "exact", head: true })
      .eq("wallet_verified", true),
    merchantWallets(supabase)
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    merchantWallets(supabase)
      .select("*", { count: "exact", head: true })
      .eq("status", "verified"),
    merchantWallets(supabase).select("*", { count: "exact", head: true }),
    supabase
      .from("chat_conversations")
      .select(
        "id, guest_name, guest_email, guest_phone, lead_status, contact_captured, started_at, message_count",
      )
      .eq("contact_captured", true)
      .order("started_at", { ascending: false })
      .limit(5),
  ]);

  const stats: AdminDashboardStats = {
    totalLeads: totalLeadsRes.count ?? 0,
    newLeadsToday: newLeadsTodayRes.count ?? 0,
    merchantAccounts: Math.max(
      0,
      (profileCountRes.count ?? 0) - staffUserIds.size,
    ),
    walletsLinked: walletsLinkedRes.count ?? 0,
    walletsVerified: walletsVerifiedRes.count ?? 0,
    pendingWallets: pendingWalletsRes.count ?? 0,
    verifiedMerchantWallets: verifiedMerchantWalletsRes.count ?? 0,
    totalMerchantWallets: totalMerchantWalletsRes.count ?? 0,
    recentLeads: recentLeadsRes.data ?? [],
  };

  if (!isSuperAdmin) {
    return stats;
  }

  const [totalUsersRes, staffCountRes, chatsTodayRes, recentLogsRes, staffListRes] =
    await Promise.all([
      supabase
        .from("memberships")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("memberships")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .in("role", [
          "staff",
          "admin",
          "owner",
          "manager",
          "cp_admin",
          "rhs_admin",
        ]),
      supabase
        .from("chat_conversations")
        .select("*", { count: "exact", head: true })
        .gte("started_at", today),
      supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("memberships")
        .select("id, user_id, role, status, created_at, tenant_id")
        .eq("status", "active")
        .in("role", ["staff", "admin", "owner", "cp_admin", "rhs_admin"])
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

  stats.totalUsers = totalUsersRes.count ?? 0;
  stats.staffCount = staffCountRes.count ?? 0;
  stats.chatsToday = chatsTodayRes.count ?? 0;
  stats.recentActivity = recentLogsRes.error ? [] : recentLogsRes.data ?? [];

  const staffList = staffListRes.data ?? [];
  if (staffList.length === 0) {
    stats.staffList = [];
    return stats;
  }

  const userIds = staffList.map((s) => s.user_id);
  const { data: profiles } = await supabase
    .from("user_profiles")
    .select("id, email, full_name, avatar_url")
    .in("id", userIds);

  stats.staffList = staffList.map((s) => ({
    ...s,
    profile: profiles?.find((p) => p.id === s.user_id) ?? null,
  }));

  return stats;
}
