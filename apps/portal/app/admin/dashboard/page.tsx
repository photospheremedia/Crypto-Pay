"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, Building2, Crown, MessageSquare, RefreshCw, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Lead = {
  id: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  lead_status: string;
  started_at: string;
  message_count: number;
};

type Stats = {
  totalLeads: number;
  newLeadsToday: number;
  qualifiedLeads: number;
  convertedLeads: number;
  totalUsers?: number;
  staffCount?: number;
  totalTenants?: number;
  recentLeads?: Lead[];
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();

      if (data.success) {
        setStats(data.stats);
        setIsSuperAdmin(Boolean(data.isSuperAdmin));
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const conversionRate = useMemo(() => {
    if (!stats || stats.totalLeads === 0) return "0.0";
    return ((stats.convertedLeads / stats.totalLeads) * 100).toFixed(1);
  }, [stats]);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-500" />
      </div>
    );
  }

  const recentLeads = stats?.recentLeads ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          {isSuperAdmin && (
            <Badge className="mb-2 border-purple-200 bg-purple-100 text-purple-800">
              <Crown className="mr-1 h-3 w-3" />
              Super Admin
            </Badge>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Crypto Pay Admin</h1>
          <p className="text-sm text-slate-500">Minimal control center for conversations, users, and growth.</p>
        </div>
        <Button onClick={() => { setRefreshing(true); fetchStats(); }} disabled={refreshing} variant="outline" size="sm">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard title="Total Conversations" value={stats?.totalLeads ?? 0} icon={MessageSquare} />
        <MetricCard title="New Today" value={stats?.newLeadsToday ?? 0} icon={Activity} />
        <MetricCard title="Qualified" value={stats?.qualifiedLeads ?? 0} icon={Users} />
        <MetricCard title="Conversion" value={`${conversionRate}%`} icon={Building2} />
      </div>

      {isSuperAdmin && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard title="Active Businesses" value={stats?.totalTenants ?? 0} icon={Building2} />
          <MetricCard title="Active Operators" value={stats?.staffCount ?? 0} icon={Users} />
          <MetricCard title="Active Members" value={stats?.totalUsers ?? 0} icon={Crown} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <h2 className="font-semibold text-slate-900">Recent Conversations</h2>
            <Link href="/admin/leads" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
              Open inbox
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentLeads.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">No conversations yet.</p>
            ) : (
              recentLeads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="space-y-1 p-4">
                  <p className="font-medium text-slate-900">{lead.guest_name || "Unknown contact"}</p>
                  <p className="text-sm text-slate-600">{lead.guest_email || lead.guest_phone || "No contact data yet"}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{lead.message_count} messages</span>
                    <span>{relativeTime(lead.started_at)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <h2 className="font-semibold text-slate-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
            <QuickAction href="/admin/leads" title="Conversation Inbox" description="Qualify and follow up quickly" />
            <QuickAction href="/admin/customers" title="Customers" description="Manage user and account records" />
            <QuickAction href="/admin/marketing" title="Email Campaigns" description="Run simple lifecycle campaigns" />
            <QuickAction href="/admin/analytics" title="Analytics" description="Track activation and conversion" />
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function QuickAction({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="rounded-lg border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40">
      <p className="font-medium text-slate-900">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </Link>
  );
}

function relativeTime(date: string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.max(0, now - then);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
