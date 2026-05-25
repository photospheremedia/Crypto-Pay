"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Plus,
  Search,
  Play,
  Pause,
  Edit2,
  Trash2,
  Clock,
  Users,
  MousePointer,
  TrendingUp,
  Send,
  Eye,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Zap,
  Gift,
  UserPlus,
  ShoppingCart,
  Repeat,
  RefreshCw,
} from "lucide-react";

// Email campaigns and automations from database
interface Campaign {
  id: string;
  name: string;
  status: string;
  subject?: string;
  scheduled_at?: string;
  sent_at?: string;
  recipients?: number;
  opened?: number;
  clicked?: number;
  created_at?: string;
}

interface Automation {
  id: string;
  name: string;
  trigger_event: string;
  active: boolean;
  template_id?: string;
  delay_minutes?: number;
  created_by?: string;
  created_at?: string;
}

const statusConfig = {
  active: { color: "bg-emerald-100 text-emerald-600" },
  draft: { color: "bg-slate-100 text-slate-600" },
  sent: { color: "bg-blue-100 text-blue-700" },
  scheduled: { color: "bg-purple-100 text-purple-700" },
};

export default function EmailMarketingPage() {
  const [activeTab, setActiveTab] = useState<"automations" | "campaigns">("automations");
  const [searchTerm, setSearchTerm] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [campaignsRes, automationsRes] = await Promise.all([
          fetch('/api/admin/marketing/campaigns'),
          fetch('/api/admin/marketing/automations')
        ]);
        
        if (campaignsRes.ok) {
          const data = await campaignsRes.json();
          setCampaigns(data.campaigns || []);
        }
        
        if (automationsRes.ok) {
          const data = await automationsRes.json();
          setAutomations(data.automations || []);
        }
      } catch (error) {
        console.error('Failed to fetch marketing data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Stats
  const totalCampaigns = campaigns.length;
  const sentCampaigns = campaigns.filter(c => c.status === 'sent').length;
  const scheduledCampaigns = campaigns.filter(c => c.status === 'scheduled').length;
  const activeAutomationsCount = automations.filter(a => a.active).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-emerald-500" />
          <p className="mt-2 text-sm text-slate-500">Loading marketing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Email Marketing</h1>
          <p className="text-sm text-slate-500">
            Automations, campaigns, and promotional emails
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/marketing/automations/new"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Zap className="h-4 w-4" />
            New Automation
          </Link>
          <Link
            href="/admin/marketing/campaigns/new"
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
          >
            <Send className="h-4 w-4" />
            New Campaign
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Send className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Campaigns</p>
              <p className="text-2xl font-bold text-slate-900">{totalCampaigns}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2">
              <Eye className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Sent</p>
              <p className="text-2xl font-bold text-slate-900">{sentCampaigns}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <MousePointer className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Scheduled</p>
              <p className="text-2xl font-bold text-slate-900">{scheduledCampaigns}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Automations</p>
              <p className="text-2xl font-bold text-slate-900">
                {activeAutomationsCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("automations")}
          className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "automations"
              ? "border-emerald-500 text-emerald-500"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Automations
        </button>
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "campaigns"
              ? "border-emerald-500 text-emerald-500"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Campaigns
        </button>
      </div>

      {/* Automations Tab */}
      {activeTab === "automations" && (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search automations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {automations
              .filter(
                (a) =>
                  a.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((automation) => {

                return (
                  <div key={automation.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50">
                    <div className="rounded-lg bg-purple-100 p-2.5">
                      <Zap className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{automation.name}</h3>
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                          {automation.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">Trigger: {automation.trigger_event}</p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-sm text-slate-500">Delay: {automation.delay_minutes || 0} min</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/marketing/automations/${automation.id}/edit`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        title="Edit automation"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button 
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete automation"
                        aria-label="Delete automation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === "campaigns" && (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {campaigns
              .filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false))
              .map((campaign) => {
                const openRate = campaign.recipients ? ((campaign.opened ?? 0) / campaign.recipients) * 100 : 0;
                const clickRate = campaign.opened ? (((campaign.clicked ?? 0) / campaign.opened) * 100) : 0;

                return (
                  <div key={campaign.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50">
                    <div className="rounded-lg bg-pink-100 p-2.5 text-pink-600">
                      <Gift className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{campaign.name}</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            statusConfig[campaign.status as keyof typeof statusConfig].color
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{campaign.subject ?? 'No subject'}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {campaign.sent_at ? (campaign.status === "scheduled" ? `Scheduled: ${campaign.sent_at}` : `Sent: ${campaign.sent_at}`) : "Not scheduled"}
                      </p>
                    </div>
                    {campaign.status === "sent" && (
                      <div className="hidden text-right sm:block">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-semibold text-slate-700">{(campaign.recipients ?? 0).toLocaleString()}</p>
                            <p className="text-xs text-slate-400">Sent</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700">{openRate}%</p>
                            <p className="text-xs text-slate-400">Opened</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-700">{clickRate}%</p>
                            <p className="text-xs text-slate-400">Clicked</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      {campaign.status === "draft" && (
                        <Link
                          href={`/admin/marketing/campaigns/${campaign.id}/send`}
                          className="flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-200"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Send
                        </Link>
                      )}
                      <Link
                        href={`/admin/marketing/campaigns/${campaign.id}/edit`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      {campaign.status === "sent" && (
                        <Link
                          href={`/admin/marketing/campaigns/${campaign.id}/stats`}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          title="View campaign stats"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Link>
                      )}
                      <button 
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete campaign"
                        aria-label="Delete campaign"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Onboarding Email Preview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
          <UserPlus className="h-5 w-5 text-blue-600" />
          Welcome Series Preview
        </h2>
        <div className="grid gap-4 sm:grid-cols-5">
          {[
            { day: "Day 0", subject: "Welcome to Crypto Pay! 🎉", desc: "Account setup guide" },
            { day: "Day 1", subject: "Complete your store profile", desc: "Profile optimization tips" },
            { day: "Day 3", subject: "Your first order guide", desc: "How to place orders" },
            { day: "Day 5", subject: "Unlock exclusive discounts", desc: "Subscription benefits" },
            { day: "Day 7", subject: "How's it going?", desc: "Feedback request" },
          ].map((email, idx) => (
            <div key={idx} className="relative">
              {idx < 4 && <div className="absolute -right-4 top-1/2 hidden h-px w-8 bg-slate-200 sm:block" />}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-medium text-emerald-500">{email.day}</p>
                <p className="mt-1 text-sm font-medium text-slate-700">{email.subject}</p>
                <p className="text-xs text-slate-500">{email.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
