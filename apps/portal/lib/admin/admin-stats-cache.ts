import "server-only";

import { unstable_cache } from "next/cache";
import {
  getAdminDashboardStats,
  getAdminNavCounts,
  type AdminNavCounts,
} from "@/lib/admin/admin-stats";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";

const STATS_REVALIDATE_SEC = 30;

export const ADMIN_STATS_CACHE_TAG = "admin-stats";

async function fetchNavCountsUncached(): Promise<AdminNavCounts> {
  const supabase = getSupabaseServiceClient();
  return getAdminNavCounts(supabase);
}

async function fetchDashboardStatsUncached(isSuperAdmin: boolean) {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase.rpc("admin_dashboard_stats", {
    p_include_super_admin: isSuperAdmin,
  });

  if (!error && data && typeof data === "object") {
    return data as Record<string, unknown>;
  }

  if (error) {
    console.warn(
      "[admin-stats] RPC admin_dashboard_stats unavailable, using parallel queries:",
      error.message,
    );
  }

  return getAdminDashboardStats(supabase, isSuperAdmin);
}

/** Cached nav badge counts — shared across layout + client refresh. */
export function getCachedAdminNavCounts() {
  return unstable_cache(fetchNavCountsUncached, ["admin-nav-counts"], {
    revalidate: STATS_REVALIDATE_SEC,
    tags: [ADMIN_STATS_CACHE_TAG],
  })();
}

/** Cached dashboard payload (RPC when migration applied, else parallel counts). */
export function getCachedAdminDashboardStats(isSuperAdmin: boolean) {
  return unstable_cache(
    () => fetchDashboardStatsUncached(isSuperAdmin),
    ["admin-dashboard-stats", isSuperAdmin ? "super" : "staff"],
    {
      revalidate: STATS_REVALIDATE_SEC,
      tags: [ADMIN_STATS_CACHE_TAG],
    },
  )();
}
