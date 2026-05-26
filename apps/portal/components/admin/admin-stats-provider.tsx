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

type AdminStatsContextValue = {
  stats: Record<string, unknown> | null;
  navCounts: AdminNavCounts;
  isSuperAdmin: boolean;
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
};

const defaultNavCounts: AdminNavCounts = {
  pendingWallets: 0,
  newLeads: 0,
};

const AdminStatsContext = createContext<AdminStatsContextValue | null>(null);

export function AdminStatsProvider({
  children,
  initialNavCounts,
  initialStats,
  initialIsSuperAdmin = false,
}: {
  children: ReactNode;
  initialNavCounts?: AdminNavCounts;
  initialStats?: Record<string, unknown> | null;
  initialIsSuperAdmin?: boolean;
}) {
  const [stats, setStats] = useState<Record<string, unknown> | null>(
    initialStats ?? null,
  );
  const [navCounts, setNavCounts] = useState<AdminNavCounts>(
    initialNavCounts ?? defaultNavCounts,
  );
  const [isSuperAdmin, setIsSuperAdmin] = useState(initialIsSuperAdmin);
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
        setNavCounts({
          pendingWallets: Number(data.stats?.pendingWallets ?? 0),
          newLeads: Number(data.stats?.newLeadsToday ?? 0),
        });
      }
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const skipInitialSpinner = useRef(Boolean(initialStats));

  useEffect(() => {
    void refresh({ silent: skipInitialSpinner.current });
    skipInitialSpinner.current = false;
    const interval = setInterval(() => void refresh({ silent: true }), 60_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const value = useMemo(
    () => ({
      stats,
      navCounts,
      isSuperAdmin,
      loading,
      refreshing,
      refresh: () => refresh({ silent: false }),
    }),
    [stats, navCounts, isSuperAdmin, loading, refreshing, refresh],
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
