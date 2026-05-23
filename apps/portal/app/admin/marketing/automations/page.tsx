"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Play,
  Pause,
  MoreVertical,
  Zap,
  Mail,
  Clock,
  CheckCircle2,
  Settings2,
  Loader2,
  Trash2,
  Copy,
  Edit2,
  ArrowRight,
  Users,
  ShoppingCart,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useToast } from "@/hooks/use-toast";

interface Automation {
  id: string;
  name: string;
  description?: string;
  trigger_type: "welcome" | "abandoned_cart" | "post_purchase" | "re_engagement" | "birthday" | "custom";
  trigger_config: Record<string, any>;
  subject: string;
  from_name: string;
  from_email: string;
  template_id?: string;
  content_html?: string;
  content_json?: Record<string, any>;
  delay_minutes?: number;
  is_active: boolean;
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  created_at: string;
  updated_at: string;
}

const triggerIcons = {
  welcome: Users,
  abandoned_cart: ShoppingCart,
  post_purchase: CheckCircle2,
  re_engagement: Zap,
  birthday: Star,
  custom: Settings2,
};

const triggerColors = {
  welcome: "bg-green-100 text-green-600",
  abandoned_cart: "bg-red-100 text-red-600",
  post_purchase: "bg-blue-100 text-blue-600",
  re_engagement: "bg-purple-100 text-purple-600",
  birthday: "bg-pink-100 text-pink-600",
  custom: "bg-slate-100 text-slate-600",
};

const triggerLabels = {
  welcome: "Welcome",
  abandoned_cart: "Abandoned Cart",
  post_purchase: "Post Purchase",
  re_engagement: "Re-engagement",
  birthday: "Birthday",
  custom: "Custom",
};

export default function AutomationsPage() {
  const { toast } = useToast();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      const response = await fetch("/api/admin/marketing/automations");
      if (!response.ok) {
        throw new Error("Failed to fetch automations");
      }
      const data = await response.json();
      setAutomations(data.automations || []);
    } catch (error) {
      console.error("Error fetching automations:", error);
      toast({
        title: "Error",
        description: "Failed to load automations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const automation = automations.find((a) => a.id === id);
    if (!automation) return;

    try {
      const response = await fetch(`/api/admin/marketing/automations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !automation.is_active }),
      });

      if (!response.ok) {
        throw new Error("Failed to update automation");
      }

      setAutomations(
        automations.map((a) =>
          a.id === id ? { ...a, is_active: !a.is_active } : a
        )
      );
      toast({ 
        title: "Status Updated", 
        description: `Automation ${automation.is_active ? "paused" : "activated"}.` 
      });
    } catch (error) {
      console.error("Error toggling automation status:", error);
      toast({
        title: "Error",
        description: "Failed to update automation status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/marketing/automations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete automation");
      }

      setAutomations(automations.filter((a) => a.id !== id));
      toast({ title: "Deleted", description: "Automation has been deleted." });
    } catch (error) {
      console.error("Error deleting automation:", error);
      toast({
        title: "Error",
        description: "Failed to delete automation",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (automation: Automation) => {
    try {
      const response = await fetch("/api/admin/marketing/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${automation.name} (Copy)`,
          description: automation.description,
          trigger_type: automation.trigger_type,
          trigger_config: automation.trigger_config,
          subject: automation.subject,
          from_name: automation.from_name,
          from_email: automation.from_email,
          template_id: automation.template_id,
          content_html: automation.content_html,
          content_json: automation.content_json,
          delay_minutes: automation.delay_minutes,
          is_active: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate automation");
      }

      const data = await response.json();
      setAutomations([data.automation, ...automations]);
      toast({ title: "Duplicated", description: "Automation has been duplicated." });
    } catch (error) {
      console.error("Error duplicating automation:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate automation",
        variant: "destructive",
      });
    }
  };

  const filteredAutomations = automations.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Email Automations"
        description="Set up automated email workflows triggered by customer actions"
        backHref="/admin/marketing"
        backLabel="Marketing"
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Play className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active</p>
              <p className="text-xl font-bold text-slate-900">
                {automations.filter((a) => a.is_active).length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <Mail className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Emails Sent</p>
              <p className="text-xl font-bold text-slate-900">
                {automations.reduce((sum, a) => sum + (a.sent_count || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
              <Mail className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Opens</p>
              <p className="text-xl font-bold text-slate-900">
                {automations.reduce((sum, a) => sum + (a.opened_count || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total</p>
              <p className="text-xl font-bold text-slate-900">{automations.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search automations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Create Automation
        </Button>
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : filteredAutomations.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-slate-200 bg-white">
            <Zap className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">No automations found</p>
          </div>
        ) : (
          filteredAutomations.map((automation) => {
            const TriggerIcon = triggerIcons[automation.trigger_type];
            return (
              <div
                key={automation.id}
                className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">{automation.name}</h3>
                      <Badge
                        className={
                          automation.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }
                      >
                        {automation.is_active ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    {automation.description && (
                      <p className="text-sm text-slate-600 mb-4">{automation.description}</p>
                    )}

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${triggerColors[automation.trigger_type]}`}>
                          <TriggerIcon className="h-4 w-4" />
                        </div>
                        <span className="text-slate-600">{triggerLabels[automation.trigger_type]}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300" />
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-slate-100">
                          <Mail className="h-4 w-4 text-slate-600" />
                        </div>
                        <span className="text-slate-600 truncate">{automation.subject}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">{(automation.sent_count || 0).toLocaleString()}</p>
                      <p className="text-xs text-slate-500">emails sent</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={automation.is_active ? "outline" : "default"}
                        onClick={() => handleToggleStatus(automation.id)}
                        className={!automation.is_active ? "bg-green-500 hover:bg-green-600" : ""}
                      >
                        {automation.is_active ? (
                          <>
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(automation)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(automation.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
                {automation.delay_minutes && (
                  <p className="text-xs text-slate-400 mt-3">
                    Delay: {automation.delay_minutes} minute{automation.delay_minutes > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Quick Create Templates */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Start Templates</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {[
            { icon: Users, name: "Welcome", type: "welcome", desc: "New customer" },
            { icon: ShoppingCart, name: "Abandoned Cart", type: "abandoned_cart", desc: "Cart recovery" },
            { icon: CheckCircle2, name: "Post Purchase", type: "post_purchase", desc: "Order follow-up" },
            { icon: Zap, name: "Re-engagement", type: "re_engagement", desc: "Win back inactive" },
            { icon: Star, name: "Birthday", type: "birthday", desc: "Special offers" },
            { icon: Settings2, name: "Custom", type: "custom", desc: "Custom workflow" },
          ].map((template) => (
            <button
              key={template.type}
              className="flex flex-col items-center gap-3 p-4 rounded-lg border border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-center transition"
            >
              <div className="p-2 rounded-lg bg-orange-100">
                <template.icon className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900 text-sm">{template.name}</p>
                <p className="text-xs text-slate-500">{template.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
