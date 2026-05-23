"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Mail,
  RefreshCw,
  Eye,
  Ban,
} from "lucide-react";

// Subscription data from database
interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billing_period: string;
  features: string[];
  active: boolean;
}

interface CustomerSubscription {
  id: string;
  customer_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  customer?: {
    business_name: string;
    email: string;
  };
  plan?: {
    name: string;
    billing_period: string;
    price: number;
  };
}

const statusConfig = {
  active: { color: "bg-orange-100 text-orange-600", icon: CheckCircle },
  past_due: { color: "bg-red-100 text-red-700", icon: AlertTriangle },
  canceled: { color: "bg-slate-100 text-slate-700", icon: XCircle },
  trialing: { color: "bg-blue-100 text-blue-700", icon: Clock },
};

export default function SubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [subscriptionsRes, plansRes] = await Promise.all([
          fetch('/api/admin/subscriptions?type=subscriptions'),
          fetch('/api/admin/subscriptions?type=plans')
        ]);
        
        if (subscriptionsRes.ok) {
          const data = await subscriptionsRes.json();
          setSubscriptions(data.subscriptions || []);
        }
        
        if (plansRes.ok) {
          const data = await plansRes.json();
          setPlans(data.plans || []);
        }
      } catch (error) {
        console.error('Failed to fetch subscriptions:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const customerName = sub.customer?.business_name || '';
    const customerEmail = sub.customer?.email || '';
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    const matchesPlan = planFilter === "all" || sub.plan?.name === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Stats
  const totalMrr = subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + (s.plan?.price || 0), 0);
  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const trialingCount = subscriptions.filter((s) => s.status === "trialing").length;
  const churnedCount = subscriptions.filter((s) => s.status === "canceled").length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-orange-500" />
          <p className="mt-2 text-sm text-slate-500">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
          <p className="text-sm text-slate-500">
            Manage customer subscriptions and billing
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4" />
            Export
          </button>
          <Link
            href="/admin/subscriptions/plans"
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            Manage Plans
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-100 p-2">
              <DollarSign className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Monthly Revenue</p>
              <p className="text-2xl font-bold text-slate-900">${totalMrr.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Subscribers</p>
              <p className="text-2xl font-bold text-slate-900">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Trials</p>
              <p className="text-2xl font-bold text-slate-900">{trialingCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2">
              <TrendingUp className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Churned (30d)</p>
              <p className="text-2xl font-bold text-slate-900">{churnedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Quick View */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Subscription Plans</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-xl border border-slate-200 p-4 hover:border-orange-200 hover:shadow-md"
            >
              <h3 className="font-semibold text-slate-900">{plan.name}</h3>
              <p className="mb-3 text-2xl font-bold text-orange-500">${plan.price}<span className="text-sm font-normal text-slate-500">/mo</span></p>
              <ul className="space-y-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="h-3.5 w-3.5 text-orange-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        {/* Filters */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="past_due">Past Due</option>
              <option value="canceled">Canceled</option>
            </select>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="all">All Plans</option>
              <option value="Starter">Starter</option>
              <option value="Professional">Professional</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-left text-sm text-slate-600">
              <tr>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Plan</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">MRR</th>
                <th className="px-6 py-3 font-medium">Next Billing</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubscriptions.map((sub) => {
                const StatusIcon = statusConfig[sub.status as keyof typeof statusConfig].icon;
                return (
                  <tr key={sub.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-500">
                          {sub.customer?.business_name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{sub.customer?.business_name || "Unknown"}</p>
                          <p className="text-sm text-slate-500">{sub.customer?.email || "No email"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-700">{sub.plan?.name || "Unknown Plan"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          statusConfig[sub.status as keyof typeof statusConfig].color
                        }`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {sub.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">${sub.plan?.price || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      {sub.current_period_end ? (
                        <div>
                          <p className="text-sm text-slate-700">{new Date(sub.current_period_end).toLocaleDateString()}</p>
                          <p className="text-xs text-slate-500">{sub.plan?.billing_period || "monthly"}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="View details">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Send email">
                          <Mail className="h-4 w-4" />
                        </button>
                        {sub.status === "past_due" && (
                          <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-amber-600" title="Retry payment">
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                        {sub.status === "active" && (
                          <button className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Cancel subscription">
                            <Ban className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
