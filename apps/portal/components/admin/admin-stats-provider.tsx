"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AdminNavCounts } from "@/lib/admin/admin-stats";
import type { Permission } from "@/lib/admin-auth";

type AdminPermissions = Record<Permission, boolean> | null;

type AdminStatsContextValue = {
  stats: Record<string, unknown> | null;
  navCounts: AdminNavCounts;
  isSuperAdmin: boolean;
  permissions: AdminPermissions;
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
  loadFullStats: () => Promise<void>;
};

function navCountsFromStats(
  stats: Record<string, unknown> | null,
): AdminNavCounts {
  return {
    pendingWallets: Number(stats?.pendingWallets ?? 0),
    newLeads: Number(stats?.newLeadsToday ?? 0),
  };
}

const AdminStatsContext = createContext<AdminStatsContextValue | null>(null);

export function AdminStatsProvider({
  children,
  initialStats,
  initialIsSuperAdmin = false,
  initialPermissions = null,
}: {
  children: ReactNode;
  initialStats?: Record<string, unknown> | null;
  initialIsSuperAdmin?: boolean;
  initialPermissions?: AdminPermissions;
}) {
  const [stats, setStats] = useState<Record<string, unknown> | null>(
    initialStats ?? null,
  );
  const [isSuperAdmin, setIsSuperAdmin] = useState(initialIsSuperAdmin);
  const [permissions, setPermissions] = useState<AdminPermissions>(
    initialPermissions,
  );
  const [loading, setLoading] = useState(!initialStats);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setRefreshing(true);
    }
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats ?? null);
        setIsSuperAdmin(Boolean(data.isSuperAdmin));
        setPermissions(data.permissions ?? null);
      }
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const statsLoaded = useRef(Boolean(initialStats));

  useEffect(() => {
    if (!statsLoaded.current) return;
    const interval = setInterval(() => void refresh({ silent: true }), 60_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const loadFullStats = useCallback(async () => {
    await refresh({ silent: statsLoaded.current });
    statsLoaded.current = true;
  }, [refresh]);

  const navCounts = useMemo(() => navCountsFromStats(stats), [stats]);

  const value = useMemo(
    () => ({
      stats,
      navCounts,
      isSuperAdmin,
      permissions,
      loading,
      refreshing,
      refresh: () => refresh({ silent: false }),
      loadFullStats,
    }),
    [
      stats,
      navCounts,
      isSuperAdmin,
      permissions,
      loading,
      refreshing,
      refresh,
      loadFullStats,
    ],
  );

  return (
    <AdminStatsContext.Provider value={value}>{children}</AdminStatsContext.Provider>
  );
}

export function useAdminStats(): AdminStatsContextValue {
  const ctx = useContext(AdminStatsContext);
  if (!ctx) {
    throw new Error("useAdminStats must be used within AdminStatsProvider");
  }
  return ctx;
}
