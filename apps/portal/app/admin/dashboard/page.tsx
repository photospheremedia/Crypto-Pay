"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  MessageSquare,
  TrendingUp,
  Activity,
  Shield,
  UserCheck,
  UserPlus,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Eye,
  Settings,
  BarChart3,
  FileText,
  RefreshCw,
  Search,
  MoreVertical,
  Mail,
  Phone,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Stats {
  totalLeads: number;
  newLeadsToday: number;
  qualifiedLeads: number;
  convertedLeads: number;
  totalUsers?: number;
  staffCount?: number;
  totalTenants?: number;
  chatsToday?: number;
  totalOrders?: number;
  pendingOrders?: number;
  totalRevenue?: number;
  totalProducts?: number;
  recentLeads?: any[];
  recentActivity?: any[];
  onlineStaff?: any[];
  staffList?: any[];
  systemHealth?: {
    database: string;
    api: string;
    storage: string;
  };
}

const roleColors: Record<string, string> = {
  rhs_admin: "bg-purple-100 text-purple-800 border-purple-200",
  admin: "bg-blue-100 text-blue-800 border-blue-200",
  owner: "bg-orange-100 text-orange-800 border-orange-200",
  staff: "bg-slate-100 text-slate-800 border-slate-200",
};

const roleLabels: Record<string, string> = {
  rhs_admin: "Super Admin",
  admin: "Admin",
  owner: "Owner",
  staff: "Staff",
};

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentRole, setCurrentRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      
      if (data.success) {
        setStats(data.stats);
        setIsSuperAdmin(data.isSuperAdmin);
        setCurrentRole(data.role);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh every minute
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  const leadConversionRate = stats && stats.totalLeads > 0 
    ? ((stats.convertedLeads / stats.totalLeads) * 100).toFixed(1)
    : "0";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          {isSuperAdmin && (
            <Badge className="bg-purple-100 text-purple-800 border-purple-200 mb-2">
              <Crown className="h-3 w-3 mr-1" />
              Super Admin
            </Badge>
          )}
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isSuperAdmin ? "Super Admin Dashboard" : "Admin Dashboard"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isSuperAdmin 
              ? "Full system overview and control"
              : "Overview of your workspace"
            }
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Super Admin Stats Row */}
      {isSuperAdmin && (
        <>
          {/* Primary Super Admin Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <StatCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              icon={Users}
              color="purple"
              href="/admin/staff"
            />
            <StatCard
              title="Active Staff"
              value={stats?.staffCount || 0}
              icon={UserCheck}
              color="blue"
              href="/admin/staff"
            />
            <StatCard
              title="Tenants"
              value={stats?.totalTenants || 0}
              icon={Building2}
              color="orange"
            />
            <StatCard
              title="Chats Today"
              value={stats?.chatsToday || 0}
              icon={MessageSquare}
              color="amber"
              href="/admin/leads"
            />
          </div>

          {/* System Health Banner */}
          <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">System Status</p>
                  <p className="text-slate-400 text-sm">All systems operational</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <SystemStatusIndicator label="Database" status="healthy" />
                <SystemStatusIndicator label="API" status="healthy" />
                <SystemStatusIndicator label="Storage" status="healthy" />
              </div>
              <Link 
                href="/admin/settings" 
                className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1"
              >
                View Details <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Leads Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Leads"
          value={stats?.totalLeads || 0}
          icon={Users}
          color="slate"
          href="/admin/leads"
        />
        <StatCard
          title="New Today"
          value={stats?.newLeadsToday || 0}
          icon={UserPlus}
          color="orange"
          href="/admin/leads?status=new"
          highlight={(stats?.newLeadsToday ?? 0) > 0}
        />
        <StatCard
          title="Qualified"
          value={stats?.qualifiedLeads || 0}
          icon={CheckCircle}
          color="blue"
          href="/admin/leads?status=qualified"
        />
        <StatCard
          title="Conversion Rate"
          value={`${leadConversionRate}%`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Recent Leads</h2>
            <Link href="/admin/leads" className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {stats?.recentLeads?.length ? (
              stats.recentLeads.map((lead) => (
                <div key={lead.id} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        {lead.guest_name || "Anonymous"}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        {lead.guest_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {lead.guest_email}
                          </span>
                        )}
                        {lead.guest_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {lead.guest_phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusBadgeClass(lead.lead_status)}>
                      {lead.lead_status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {lead.message_count} messages
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(lead.started_at)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No leads captured yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Online Staff (Super Admin Only) */}
        {isSuperAdmin ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Staff Activity</h2>
              <Link href="/admin/staff" className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1">
                Manage <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {stats?.onlineStaff?.length ? (
                stats.onlineStaff.map((staff) => (
                  <div key={staff.user_id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-orange-500 border-2 border-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          Staff Member
                        </p>
                        <p className="text-sm text-slate-500 truncate">
                          {staff.current_page || "Unknown page"}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400">
                        {formatTime(staff.last_seen_at)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No staff currently online</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Quick Actions for non-super admins */
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Quick Actions</h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <QuickActionCard
                title="Chat Leads"
                description="View and manage leads"
                icon={MessageSquare}
                href="/admin/leads"
              />
              <QuickActionCard
                title="Products"
                description="Manage inventory"
                icon={BarChart3}
                href="/admin/products"
              />
              <QuickActionCard
                title="Analytics"
                description="View reports"
                icon={TrendingUp}
                href="/admin/analytics"
              />
              <QuickActionCard
                title="Settings"
                description="Configure system"
                icon={Settings}
                href="/admin/settings"
              />
            </div>
          </div>
        )}
      </div>

      {/* Super Admin Only: Recent Activity & Audit */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity Log */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Recent Activity</h2>
              <Link href="/admin/audit" className="text-sm text-orange-500 hover:text-orange-600 flex items-center gap-1">
                View logs <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {stats?.recentActivity?.length ? (
                stats.recentActivity.slice(0, 5).map((log: any) => (
                  <div key={log.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        log.action === "create" ? "bg-orange-100" :
                        log.action === "update" ? "bg-blue-100" :
                        log.action === "delete" ? "bg-red-100" : "bg-slate-100"
                      }`}>
                        <Activity className={`h-4 w-4 ${
                          log.action === "create" ? "text-orange-500" :
                          log.action === "update" ? "text-blue-600" :
                          log.action === "delete" ? "text-red-600" : "text-slate-600"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          {log.description || `${log.action} ${log.resource_type}`}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {log.user_email || "System"} · {formatTime(log.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No activity recorded yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Super Admin Quick Links */}
          <div className="bg-linear-to-br from-purple-600 to-indigo-700 rounded-xl shadow-sm text-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Super Admin Controls</h2>
                <p className="text-purple-200 text-sm">Full system access</p>
              </div>
            </div>
            
            <div className="space-y-2 mt-6">
              <Link 
                href="/admin/staff"
                className="flex items-center justify-between p-3 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <span>Staff Management</span>
                </div>
                <Badge className="bg-white/20 text-white border-0 text-xs">
                  {stats?.staffCount || 0} active
                </Badge>
              </Link>
              
              <Link 
                href="/admin/audit"
                className="flex items-center justify-between p-3 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5" />
                  <span>Audit Logs</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
              
              <Link 
                href="/admin/settings"
                className="flex items-center justify-between p-3 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5" />
                  <span>System Settings</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>

              <Link 
                href="/admin/analytics"
                className="flex items-center justify-between p-3 rounded-lg bg-white/10 hover:bg-white/20 transition"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5" />
                  <span>Platform Analytics</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-6 pt-4 border-t border-white/20">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/admin/staff/new"
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-white text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-50 transition"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Staff
                </Link>
                <Link
                  href="/admin/leads"
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition"
                >
                  <Eye className="h-4 w-4" />
                  View Leads
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  href,
  highlight 
}: { 
  title: string; 
  value: number | string; 
  icon: any; 
  color: string;
  href?: string;
  highlight?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    purple: "bg-purple-50 text-purple-600",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-500",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-50 text-slate-600",
  };

  const content = (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-4 ${href ? "hover:border-orange-300 transition cursor-pointer" : ""} ${highlight ? "ring-2 ring-orange-500 ring-offset-2" : ""}`}>
      <div className="flex items-center justify-between">
        <div className={`h-10 w-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="h-5 w-5" />
        </div>
        {highlight && (
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{title}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  description: string;
  icon: any;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="p-4 rounded-lg border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition"
    >
      <Icon className="h-6 w-6 text-orange-500 mb-2" />
      <p className="font-medium text-slate-900">{title}</p>
      <p className="text-xs text-slate-500">{description}</p>
    </Link>
  );
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "contacted":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "qualified":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "converted":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "lost":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
}

function formatTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

function SystemStatusIndicator({ 
  label, 
  status 
}: { 
  label: string; 
  status: "healthy" | "warning" | "error";
}) {
  const statusColors = {
    healthy: "bg-orange-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${statusColors[status]} animate-pulse`} />
      <span className="text-sm text-slate-300">{label}</span>
    </div>
  );
}
