"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  MessageSquare,
  Users,
  UserCheck,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Clock,
  Search,
  Filter,
  MoreVertical,
  ChevronDown,
  ChevronLeft,
  ExternalLink,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Lead {
  id: string;
  session_id: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  is_guest: boolean;
  status: string;
  lead_status: string;
  lead_score: number;
  interested_in: string[] | null;
  contact_captured: boolean;
  message_count: number;
  started_at: string;
  ended_at: string | null;
  assigned_to: string | null;
  internal_notes: string | null;
  follow_up_date: string | null;
  follow_up_completed: boolean;
  created_at: string;
  user_profiles?: { full_name: string; email: string } | null;
  assigned_profile?: { full_name: string } | null;
}

interface Stats {
  total: number;
  new_leads: number;
  contacted: number;
  qualified: number;
  converted: number;
  lost: number;
  with_contact: number;
  today: number;
  this_week: number;
  pending_follow_up: number;
}

const leadStatusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  qualified: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  converted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  lost: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
};

const statusIcons: Record<string, any> = {
  new: UserPlus,
  contacted: Mail,
  qualified: UserCheck,
  converted: Check,
  lost: X,
};

export default function LeadsPage() {
  const tCommon = useTranslations("Common");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [contactFilter, setContactFilter] = useState<string>("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());
      if (search) params.set("search", search);
      if (statusFilter) params.set("leadStatus", statusFilter);
      if (contactFilter) params.set("contactCaptured", contactFilter);

      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      const data = await res.json();

      if (data.error) {
        console.error("Error fetching leads:", data.error);
        return;
      }

      setLeads(data.leads || []);
      setStats(data.stats || null);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
      }));
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter, contactFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, leadStatus: newStatus }),
      });

      if (res.ok) {
        fetchLeads();
      }
    } catch (error) {
      console.error("Error updating lead:", error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
  };

  const getName = (lead: Lead) => {
    if (lead.guest_name && lead.guest_name !== "Guest") return lead.guest_name;
    if (lead.user_profiles?.full_name) return lead.user_profiles.full_name;
    if (lead.guest_email) return lead.guest_email.split("@")[0];
    return "Anonymous";
  };

  const getEmail = (lead: Lead) => {
    return lead.guest_email || lead.user_profiles?.email || null;
  };

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Chat Leads
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage conversations and leads from the chat widget
          </p>
        </div>
        <Button onClick={fetchLeads} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-6">
          <StatCard
            title="Total Chats"
            value={stats.total}
            icon={MessageSquare}
            color="slate"
          />
          <StatCard
            title="New Leads"
            value={stats.new_leads}
            icon={UserPlus}
            color="blue"
            highlight
          />
          <StatCard
            title="With Contact"
            value={stats.with_contact}
            icon={Mail}
            color="orange"
          />
          <StatCard
            title="Qualified"
            value={stats.qualified}
            icon={UserCheck}
            color="purple"
          />
          <StatCard
            title="Converted"
            value={stats.converted}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Follow-ups Due"
            value={stats.pending_follow_up}
            icon={AlertCircle}
            color="amber"
            highlight={stats.pending_follow_up > 0}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Status
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter("")}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter("new")}>
                New
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("contacted")}>
                Contacted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("qualified")}>
                Qualified
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("converted")}>
                Converted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("lost")}>
                Lost
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                Contact
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setContactFilter("")}>
                All
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setContactFilter("true")}>
                With Contact Info
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setContactFilter("false")}>
                No Contact Info
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Leads Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Messages
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Started
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                    <p className="mt-2 text-sm text-slate-500">Loading leads...</p>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <MessageSquare className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm font-medium text-slate-600">No leads found</p>
                    <p className="text-xs text-slate-500">Leads from chat conversations will appear here</p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedLead(lead);
                      setDetailsOpen(true);
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400">
                          {lead.is_guest ? (
                            <Users className="h-5 w-5" />
                          ) : (
                            <UserCheck className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {getName(lead)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {lead.is_guest ? "Guest" : "Registered User"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {lead.contact_captured ? (
                        <div className="space-y-1">
                          {getEmail(lead) && (
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                              <Mail className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[180px]">{getEmail(lead)}</span>
                            </div>
                          )}
                          {lead.guest_phone && (
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                              <Phone className="h-3.5 w-3.5" />
                              {lead.guest_phone}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">No contact info</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={leadStatusColors[lead.lead_status] || leadStatusColors.new}>
                        {lead.lead_status.charAt(0).toUpperCase() + lead.lead_status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <MessageSquare className="h-4 w-4" />
                        {lead.message_count}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">
                        {formatRelativeTime(lead.created_at)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {formatDate(lead.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLead(lead);
                              setDetailsOpen(true);
                            }}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              updateLeadStatus(lead.id, "contacted");
                            }}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Mark as Contacted
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              updateLeadStatus(lead.id, "qualified");
                            }}
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Mark as Qualified
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              updateLeadStatus(lead.id, "converted");
                            }}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Mark as Converted
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              updateLeadStatus(lead.id, "lost");
                            }}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Mark as Lost
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-sm text-slate-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lead Details Dialog */}
      <LeadDetailsDialog
        lead={selectedLead}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onUpdate={fetchLeads}
      />
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  highlight = false,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  highlight?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    orange: "bg-emerald-100 text-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  };

  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-900/20"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
        {highlight && value > 0 && (
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500">{title}</p>
    </div>
  );
}

// Lead Details Dialog Component
function LeadDetailsDialog({
  lead,
  open,
  onOpenChange,
  onUpdate,
}: {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}) {
  const tCommon = useTranslations("Common");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (lead) {
      setNotes(lead.internal_notes || "");
      setFollowUpDate(lead.follow_up_date || "");
      fetchMessages();
    }
  }, [lead]);

  const fetchMessages = async () => {
    if (!lead) return;
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${lead.id}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const saveChanges = async () => {
    if (!lead) return;
    setSaving(true);
    try {
      await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lead.id,
          internalNotes: notes,
          followUpDate: followUpDate || null,
        }),
      });
      onUpdate();
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!lead) return null;

  const getName = () => {
    if (lead.guest_name && lead.guest_name !== "Guest") return lead.guest_name;
    if (lead.user_profiles?.full_name) return lead.user_profiles.full_name;
    return "Anonymous";
  };

  const getEmail = () => lead.guest_email || lead.user_profiles?.email;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p>{getName()}</p>
              <p className="text-sm font-normal text-slate-500">
                {lead.is_guest ? "Guest Lead" : "Registered User"}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-slate-500">Email</Label>
              <p className="text-sm font-medium">
                {getEmail() || (
                  <span className="text-slate-400">Not provided</span>
                )}
              </p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Phone</Label>
              <p className="text-sm font-medium">
                {lead.guest_phone || (
                  <span className="text-slate-400">Not provided</span>
                )}
              </p>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Status</Label>
              <Badge className={`${leadStatusColors[lead.lead_status]} mt-1`}>
                {lead.lead_status.charAt(0).toUpperCase() + lead.lead_status.slice(1)}
              </Badge>
            </div>
            <div>
              <Label className="text-xs text-slate-500">Messages</Label>
              <p className="text-sm font-medium">{lead.message_count} messages</p>
            </div>
          </div>

          {/* Interested In */}
          {lead.interested_in && lead.interested_in.length > 0 && (
            <div>
              <Label className="text-xs text-slate-500">Interested In</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {lead.interested_in.map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Chat Transcript */}
          <div>
            <Label className="text-xs text-slate-500 mb-2 block">Chat Transcript</Label>
            <div className="rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 max-h-48 overflow-y-auto">
              {loadingMessages ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  No messages recorded
                </div>
              ) : (
                <div className="p-3 space-y-3">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`text-sm ${
                        msg.role === "user"
                          ? "text-slate-700 dark:text-slate-300"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      <span className="font-medium">
                        {msg.role === "user" ? "User" : "AI"}:
                      </span>{" "}
                      {msg.content}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <Label htmlFor="notes" className="text-xs text-slate-500">
              Internal Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this lead..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Follow-up Date */}
          <div>
            <Label htmlFor="followUp" className="text-xs text-slate-500">
              Follow-up Date
            </Label>
            <Input
              id="followUp"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={saveChanges} disabled={saving}>
            {saving ? tCommon("saving") : tCommon("saveChanges")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
