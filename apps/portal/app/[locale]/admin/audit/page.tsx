"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Search,
  RefreshCw,
  Filter,
  Calendar,
  User,
  Activity,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Settings,
  Shield,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AuditLog {
  id: string;
  user_id: string;
  user_email?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  description?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

const actionColors: Record<string, string> = {
  create: "bg-emerald-100 text-emerald-800",
  update: "bg-blue-100 text-blue-800",
  delete: "bg-red-100 text-red-800",
  view: "bg-slate-100 text-slate-800",
  login: "bg-purple-100 text-purple-800",
  logout: "bg-slate-100 text-slate-800",
};

const actionIcons: Record<string, any> = {
  create: UserPlus,
  update: Edit,
  delete: Trash2,
  view: Eye,
  login: Shield,
  logout: Shield,
};

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [canViewAuditLogs, setCanViewAuditLogs] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [resourceFilter, setResourceFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      if (actionFilter !== "all") params.set("action", actionFilter);
      if (resourceFilter !== "all") params.set("resourceType", resourceFilter);

      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setLogs(data.logs);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
        setCanViewAuditLogs(Boolean(data.permissions?.canViewAuditLogs));
      } else {
        if (data.error === "Audit log access required") {
          router.push("/admin");
        } else {
          setError(data.error || "Failed to load audit logs");
        }
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      setError("Failed to load audit logs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, resourceFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const exportLogs = () => {
    // Create CSV content
    const headers = ["Date", "User", "Action", "Resource", "Description", "IP Address"];
    const rows = logs.map((log) => [
      new Date(log.created_at).toISOString(),
      log.user_email || log.user_id,
      log.action,
      log.resource_type,
      log.description || "",
      log.ip_address || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (!canViewAuditLogs) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Shield className="h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900">Access Restricted</h2>
        <p className="text-slate-500 mt-2">
          Audit logs are restricted for your current role
        </p>
        <Button onClick={() => router.push("/admin/dashboard")} className="mt-4">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Back Navigation */}
      <Link 
        href="/admin/dashboard" 
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track all system activity and changes ({totalCount.toLocaleString()} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportLogs} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">Filters:</span>
        </div>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="view">View</SelectItem>
            <SelectItem value="login">Login</SelectItem>
            <SelectItem value="logout">Logout</SelectItem>
          </SelectContent>
        </Select>

        <Select value={resourceFilter} onValueChange={setResourceFilter}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Resource" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Resources</SelectItem>
            <SelectItem value="user">Users</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="tenant">Tenants</SelectItem>
            <SelectItem value="lead">Leads</SelectItem>
            <SelectItem value="order">Orders</SelectItem>
            <SelectItem value="product">Products</SelectItem>
            <SelectItem value="settings">Settings</SelectItem>
          </SelectContent>
        </Select>

        {(actionFilter !== "all" || resourceFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setActionFilter("all");
              setResourceFilter("all");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Logs List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {logs.length > 0 ? (
            logs.map((log) => {
              const ActionIcon = actionIcons[log.action] || Activity;
              return (
                <div key={log.id} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                        actionColors[log.action] || actionColors.view
                      }`}
                    >
                      <ActionIcon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={actionColors[log.action] || actionColors.view}>
                          {log.action}
                        </Badge>
                        <Badge variant="outline">{log.resource_type}</Badge>
                        {log.resource_id && (
                          <span className="text-xs text-slate-400 font-mono">
                            #{log.resource_id.slice(0, 8)}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-slate-900">
                        {log.description || `${log.action} ${log.resource_type}`}
                      </p>

                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.user_email || log.user_id.slice(0, 8) + "..."}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(log.created_at)}
                        </span>
                        {log.ip_address && (
                          <span className="font-mono">{log.ip_address}</span>
                        )}
                      </div>

                      {/* Show changes if available */}
                      {(log.old_values || log.new_values) && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="mt-2">
                              <Eye className="h-3 w-3 mr-1" />
                              View Changes
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-3">
                              {log.old_values && (
                                <div>
                                  <p className="text-xs font-medium text-slate-600 mb-1">
                                    Previous:
                                  </p>
                                  <pre className="text-xs bg-red-50 p-2 rounded overflow-auto max-h-32">
                                    {JSON.stringify(log.old_values, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {log.new_values && (
                                <div>
                                  <p className="text-xs font-medium text-slate-600 mb-1">
                                    New:
                                  </p>
                                  <pre className="text-xs bg-emerald-50 p-2 rounded overflow-auto max-h-32">
                                    {JSON.stringify(log.new_values, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-500">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No audit logs found</p>
              {(actionFilter !== "all" || resourceFilter !== "all") && (
                <p className="text-sm mt-1">Try adjusting your filters</p>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50">
            <p className="text-sm text-slate-600">
              Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, totalCount)} of{" "}
              {totalCount.toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-slate-600 px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDateTime(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();

  if (isToday) {
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
