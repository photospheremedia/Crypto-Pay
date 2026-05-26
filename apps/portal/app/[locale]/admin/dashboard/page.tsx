"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useAdminStats } from "@/components/admin/admin-stats-provider";
import { Link } from "@/i18n/navigation";
import {
  Activity,
  Crown,
  MessageSquare,
  RefreshCw,
  Users,
  Wallet,
  UserCircle,
} from "lucide-react";
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
  qualifiedLeads?: number;
  convertedLeads?: number;
  pendingWallets?: number;
  verifiedMerchantWallets?: number;
  merchantAccounts?: number;
  totalUsers?: number;
  staffCount?: number;
  totalTenants?: number;
  recentLeads?: Lead[];
};

export default function AdminDashboard() {
  const t = useTranslations("Admin.dashboard");
  const { stats: rawStats, isSuperAdmin, loading, refreshing, refresh } =
    useAdminStats();
  const stats = rawStats as Stats | null;

  const conversionRate = useMemo(() => {
    if (!stats || stats.totalLeads === 0 || !stats.convertedLeads) return "0.0";
    return ((stats.convertedLeads / stats.totalLeads) * 100).toFixed(1);
  }, [stats]);

  if (loading && !stats) {
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("title")}</h1>
          <p className="text-sm text-slate-500">{t("subtitle")}</p>
        </div>
        <Button onClick={() => void refresh()} disabled={refreshing} variant="outline" size="sm">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title={t("pendingWallets")}
          value={stats?.pendingWallets ?? 0}
          icon={Wallet}
          href="/admin/wallets"
          highlight={(stats?.pendingWallets ?? 0) > 0}
        />
        <MetricCard
          title={t("verifiedWallets")}
          value={stats?.verifiedMerchantWallets ?? 0}
          icon={Wallet}
          href="/admin/wallets"
        />
        <MetricCard
          title={t("merchantAccounts")}
          value={stats?.merchantAccounts ?? 0}
          icon={UserCircle}
          href="/admin/users"
        />
        <MetricCard
          title={t("newLeadsToday")}
          value={stats?.newLeadsToday ?? 0}
          icon={MessageSquare}
          href="/admin/leads"
        />
      </div>

      {isSuperAdmin ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricCard title="Staff" value={stats?.staffCount ?? 0} icon={Users} />
          <MetricCard title="Active memberships" value={stats?.totalUsers ?? 0} icon={Crown} />
          <MetricCard title="Lead conversion" value={`${conversionRate}%`} icon={Activity} />
        </div>
      ) : null}

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
            <h2 className="font-semibold text-slate-900">{t("quickActions")}</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
            <QuickAction
              href="/admin/wallets"
              title={t("reviewWallets")}
              description="Approve or reject merchant payout addresses"
            />
            <QuickAction
              href="/admin/users"
              title={t("viewMerchants")}
              description="Browse merchant accounts and wallet status"
            />
            <QuickAction
              href="/admin/leads"
              title={t("openInbox")}
              description="Qualify inbound chat and contact requests"
            />
            <QuickAction
              href="/admin/analytics"
              title="Analytics"
              description="Track activation and conversion"
            />
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
  href,
  highlight = false,
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  highlight?: boolean;
}) {
  const card = (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm transition-colors ${
        highlight ? "border-amber-300 ring-1 ring-amber-200" : "border-slate-200"
      } ${href ? "hover:border-emerald-300 hover:bg-emerald-50/30" : ""}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
        {card}
      </Link>
    );
  }

  return card;
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
