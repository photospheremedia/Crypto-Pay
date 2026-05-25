"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Eye,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

interface AnalyticsStats {
  revenue: {
    total: number;
    change: number;
    trend: "up" | "down";
  };
  orders: {
    total: number;
    change: number;
    trend: "up" | "down";
  };
  customers: {
    total: number;
    change: number;
    trend: "up" | "down";
  };
  avgOrderValue: {
    total: number;
    change: number;
    trend: "up" | "down";
  };
  topProducts: {
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  recentOrders: {
    id: string;
    order_number: string;
    customer_name: string;
    total: number;
    status: string;
    created_at: string;
  }[];
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d");

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${dateRange}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.analytics);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        description="Track your business performance"
        actions={
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
              aria-label="Select date range"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="365d">Last year</option>
            </select>
            <Button variant="outline" size="sm" onClick={fetchAnalytics} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        }
      />

      {loading && !stats ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-500" />
                </div>
                <span
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stats?.revenue.trend === "up" ? "text-emerald-500" : "text-red-600"
                  }`}
                >
                  {stats?.revenue.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {formatPercent(stats?.revenue.change || 0)}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {formatPrice(stats?.revenue.total || 0)}
              </p>
              <p className="text-sm text-slate-500 mt-1">Total Revenue</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
                <span
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stats?.orders.trend === "up" ? "text-emerald-500" : "text-red-600"
                  }`}
                >
                  {stats?.orders.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {formatPercent(stats?.orders.change || 0)}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats?.orders.total || 0}</p>
              <p className="text-sm text-slate-500 mt-1">Total Orders</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <span
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stats?.customers.trend === "up" ? "text-emerald-500" : "text-red-600"
                  }`}
                >
                  {stats?.customers.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {formatPercent(stats?.customers.change || 0)}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats?.customers.total || 0}</p>
              <p className="text-sm text-slate-500 mt-1">Total Customers</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-amber-600" />
                </div>
                <span
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stats?.avgOrderValue.trend === "up" ? "text-emerald-500" : "text-red-600"
                  }`}
                >
                  {stats?.avgOrderValue.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {formatPercent(stats?.avgOrderValue.change || 0)}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {formatPrice(stats?.avgOrderValue.total || 0)}
              </p>
              <p className="text-sm text-slate-500 mt-1">Avg Order Value</p>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Products</h3>
              {!stats?.topProducts?.length ? (
                <div className="text-center py-8">
                  <Package className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500">No product data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-4">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{product.name}</p>
                        <p className="text-sm text-slate-500">{product.quantity} sold</p>
                      </div>
                      <p className="font-medium text-slate-900">
                        {formatPrice(product.revenue)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Orders</h3>
              {!stats?.recentOrders?.length ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500">No recent orders</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900">#{order.order_number}</p>
                        <p className="text-sm text-slate-500 truncate">{order.customer_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900">{formatPrice(order.total)}</p>
                        <p className={`text-xs capitalize ${
                          order.status === "completed" ? "text-emerald-500" :
                          order.status === "pending" ? "text-amber-600" : "text-slate-500"
                        }`}>
                          {order.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
