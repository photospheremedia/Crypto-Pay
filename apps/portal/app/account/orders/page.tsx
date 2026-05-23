"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Package, 
  Truck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Search,
  Filter,
  ShoppingBag,
  MapPin,
  Calendar,
  RefreshCw,
  Download,
  Eye
} from "lucide-react";
import { getSupabaseBrowserClient } from "@crypto-pay/db/supabaseClient";

type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_cents: number;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  discount_cents: number;
  shipping_method: string;
  tracking_number: string | null;
  estimated_delivery_date: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  shipping_address: {
    first_name: string;
    last_name: string;
    city: string;
    state: string;
  };
  created_at: string;
};

const statusConfig: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-600", bgColor: "bg-amber-100", label: "Pending" },
  confirmed: { icon: CheckCircle2, color: "text-blue-600", bgColor: "bg-blue-100", label: "Confirmed" },
  processing: { icon: RefreshCw, color: "text-violet-600", bgColor: "bg-violet-100", label: "Processing" },
  shipped: { icon: Truck, color: "text-indigo-600", bgColor: "bg-indigo-100", label: "Shipped" },
  delivered: { icon: CheckCircle2, color: "text-orange-500", bgColor: "bg-orange-100", label: "Delivered" },
  cancelled: { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100", label: "Cancelled" },
  refunded: { icon: RefreshCw, color: "text-slate-600", bgColor: "bg-slate-100", label: "Refunded" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    async function loadOrders() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        let query = supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (filter !== "all") {
          query = query.eq("status", filter);
        }

        const { data } = await query;
        setOrders(data || []);
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [supabase, filter]);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    return (
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_address?.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getStatusInfo = (status: string) => {
    return statusConfig[status] || statusConfig.pending;
  };

  const filterTabs = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Your Orders</h1>
                <p className="text-sm text-slate-500">{orders.length} total orders</p>
              </div>
            </div>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-orange-600 transition"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order number or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  filter === tab.value
                    ? "bg-orange-100 text-orange-600"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 shadow-sm text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mx-auto">
            <Package className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-slate-900">No orders found</h3>
          <p className="mt-2 text-slate-500">
            {searchQuery
              ? "Try adjusting your search"
              : filter !== "all"
              ? `No ${filter} orders yet`
              : "Start shopping to see your orders here"}
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-medium text-white hover:bg-orange-600"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${statusInfo.bgColor}`}>
                      <StatusIcon className={`h-6 w-6 ${statusInfo.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-slate-900">{order.order_number}</p>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {order.shipping_address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {order.shipping_address.city}, {order.shipping_address.state}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-900">{formatPrice(order.total_cents)}</p>
                      {order.discount_cents > 0 && (
                        <p className="text-xs text-orange-500">Saved {formatPrice(order.discount_cents)}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-5">
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <p className="text-slate-500 mb-1">Subtotal</p>
                      <p className="font-medium text-slate-900">{formatPrice(order.subtotal_cents)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Shipping</p>
                      <p className="font-medium text-slate-900">
                        {order.shipping_cents === 0 ? (
                          <span className="text-orange-500">Free</span>
                        ) : (
                          formatPrice(order.shipping_cents)
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Tax</p>
                      <p className="font-medium text-slate-900">{formatPrice(order.tax_cents)}</p>
                    </div>
                    {order.tracking_number && (
                      <div>
                        <p className="text-slate-500 mb-1">Tracking</p>
                        <p className="font-medium text-blue-600">{order.tracking_number}</p>
                      </div>
                    )}
                    {order.estimated_delivery_date && (
                      <div>
                        <p className="text-slate-500 mb-1">Est. Delivery</p>
                        <p className="font-medium text-slate-900">
                          {new Date(order.estimated_delivery_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-slate-100">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                    {order.status === "delivered" && (
                      <button className="inline-flex items-center gap-2 rounded-lg bg-orange-100 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-200 transition">
                        <RefreshCw className="h-4 w-4" />
                        Buy Again
                      </button>
                    )}
                    {order.tracking_number && (
                      <a
                        href={`https://www.google.com/search?q=${order.tracking_number}+tracking`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 transition"
                      >
                        <Truck className="h-4 w-4" />
                        Track Package
                      </a>
                    )}
                    <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                      <Download className="h-4 w-4" />
                      Invoice
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More (if needed) */}
      {filteredOrders.length >= 20 && (
        <div className="text-center">
          <button className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 hover:border-orange-300 hover:bg-orange-50 transition">
            Load More Orders
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
