"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Package, 
  Heart, 
  MapPin, 
  CreditCard, 
  Settings, 
  ChevronRight,
  ShoppingBag,
  Truck,
  Clock,
  Star,
  Gift,
  TrendingUp,
  Shield,
  Sparkles,
  Eye,
  BarChart3,
  Award,
  Zap,
  FileText,
  AlertTriangle
} from "lucide-react";
import Image from "next/image";
import { getSupabaseBrowserClient } from "@crypto-pay/db/supabaseClient";

type OrderStats = {
  total_orders: number;
  total_spent_cents: number;
  pending_orders: number;
  delivered_orders: number;
};

type RecentOrder = {
  id: string;
  order_number: string;
  status: string;
  total_cents: number;
  created_at: string;
  updated_at?: string;
  payment_status?: string;
  tracking_number?: string;
  estimated_delivery_at?: string;
  shipping_address_id?: string;
};

type WishlistItem = {
  id: string;
  product: {
    id: string;
    name: string;
    thumbnail_url: string;
    price_cents: number;
  };
};

type RecentlyViewedItem = {
  id: string;
  product: {
    id: string;
    name: string;
    thumbnail_url: string;
    price_cents: number;
  };
  last_viewed_at: string;
};

type Quote = {
  id: string;
  quote_number?: string;
  status: string;
  total: number;
  created_at: string;
  updated_at?: string;
  expires_at?: string;
  valid_until?: string;
  requested_by?: string;
};

type LastSession = {
  id: string;
  created_at: string;
  last_activity_at: string;
  ip_address: string;
  user_agent: string;
  expires_at: string;
};

export default function AccountDashboardPage() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentQuotes, setRecentQuotes] = useState<Quote[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [lastSession, setLastSession] = useState<LastSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdminError, setShowAdminError] = useState(errorParam === "admin_required");
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUser(user);

        // Load profile
        const { data: profileData } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profileData);

        // Load membership and tenant
        const { data: memberships } = await supabase
          .from("memberships")
          .select("tenant_id, role, tenants ( id, name, slug )")
          .eq("status", "active");

        const membershipData = memberships?.[0];
        setMembership(membershipData);
        const tenantData = membershipData?.tenants as { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[] | null;
        const resolvedTenant = Array.isArray(tenantData) ? tenantData[0] : tenantData;
        setTenant(resolvedTenant);

        // Log dashboard access
        try {
          await fetch("/api/log-security-event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              eventType: "dashboard_access",
              userAgent: navigator.userAgent,
            }),
          });
        } catch {
          console.error("Failed to log security event");
        }

        // Load last session
        try {
          const { data: sessionData } = await supabase
            .from("user_sessions")
            .select("id, created_at, last_activity_at, ip_address, user_agent, expires_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
          
          if (sessionData) {
            setLastSession(sessionData as any);
          }
        } catch {
          // No sessions found yet
        }

        // Load order stats - calculate directly from orders
        try {
          const { data: ordersForStats } = await supabase
            .from("orders")
            .select("status, total_cents")
            .eq("user_id", user.id);
          
          if (ordersForStats && ordersForStats.length > 0) {
            const statsData = {
              total_orders: ordersForStats.length,
              total_spent_cents: ordersForStats.reduce((sum: number, order: { total_cents: number | null }) => sum + (order.total_cents || 0), 0),
              pending_orders: ordersForStats.filter((o: { status: string }) => ["pending", "processing"].includes(o.status)).length,
              delivered_orders: ordersForStats.filter((o: { status: string }) => o.status === "delivered").length,
            };
            setStats(statsData as OrderStats);
          } else {
            setStats({
              total_orders: 0,
              total_spent_cents: 0,
              pending_orders: 0,
              delivered_orders: 0,
            });
          }
        } catch {
          // Table may not exist yet
          setStats({
            total_orders: 0,
            total_spent_cents: 0,
            pending_orders: 0,
            delivered_orders: 0,
          });
        }

        // Load recent orders with expanded fields
        try {
          const { data: ordersData } = await supabase
            .from("orders")
            .select(`
              id,
              order_number,
              status,
              total_cents,
              created_at,
              updated_at,
              payment_status,
              tracking_number,
              estimated_delivery_at,
              shipping_address_id
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(3);
          setRecentOrders(ordersData || []);
        } catch {
          // Table may not exist yet
        }

        // Load recent quotes with expanded fields
        if (resolvedTenant) {
          try {
            const { data: quotesData } = await supabase
              .from("quotes")
              .select(`
                id,
                quote_number,
                status,
                total,
                created_at,
                updated_at,
                expires_at,
                valid_until,
                requested_by
              `)
              .eq("customer_id", resolvedTenant.id)
              .order("created_at", { ascending: false })
              .limit(3);
            setRecentQuotes(quotesData || []);
          } catch {
            // Table may not exist yet
          }

          // Load subscription
          const { data: subData } = await supabase
            .from("billing_subscriptions")
            .select("status, current_period_end")
            .eq("customer_id", resolvedTenant.id)
            .maybeSingle();
          setSubscription(subData);
        }

        // Load wishlist with all fields
        try {
          const { data: wishlistData } = await supabase
            .from("wishlists")
            .select(`
              id,
              added_at,
              priority,
              notes,
              product:products (
                id,
                name,
                thumbnail_url,
                price_cents
              )
            `)
            .eq("user_id", user.id)
            .order("added_at", { ascending: false })
            .limit(4);
          setWishlistItems((wishlistData as any) || []);
        } catch {
          // Table may not be ready
        }

        // Load recently viewed (gracefully handle if table doesn't exist)
        try {
          const { data: recentlyViewedData } = await supabase
            .from("recently_viewed")
            .select(`
              id,
              last_viewed_at,
              product:products (
                id,
                name,
                thumbnail_url,
                price_cents
              )
            `)
            .eq("user_id", user.id)
            .order("last_viewed_at", { ascending: false })
            .limit(6);
          setRecentlyViewed((recentlyViewedData as any) || []);
        } catch {
          // Table may not exist yet
        }

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [supabase]);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-orange-100 text-orange-600";
      case "shipped": return "bg-blue-100 text-blue-700";
      case "processing": return "bg-amber-100 text-amber-700";
      case "pending": case "draft": return "bg-slate-100 text-slate-700";
      case "cancelled": return "bg-red-100 text-red-700";
      case "approved": return "bg-orange-100 text-orange-600";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const parseUserAgent = (ua: string): { browser: string; os: string } => {
    let browser = "Unknown";
    let os = "Unknown";
    
    if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Edge")) browser = "Edge";
    
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("iPhone")) os = "iOS";
    else if (ua.includes("Android")) os = "Android";
    
    return { browser, os };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If no tenant, show setup prompt
  if (!tenant) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-500">
          Complete setup
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">
          You&apos;re almost ready to order.
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Add your organization details so we can configure integrations and quotes.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link
            href="/account/setup"
            className="rounded-full bg-orange-500 px-5 py-2 text-white"
          >
            Finish setup
          </Link>
          <Link
            href="/shop"
            className="rounded-full border border-slate-300 px-5 py-2 text-slate-700"
          >
            Browse shop
          </Link>
        </div>
      </div>
    );
  }

  const quickActions = [
    { icon: Package, label: "Orders", href: "/account/orders", color: "bg-blue-500" },
    { icon: Heart, label: "Wishlist", href: "/wishlist", color: "bg-rose-500" },
    { icon: FileText, label: "Quotes", href: "/account/quotes", color: "bg-violet-500" },
    { icon: MapPin, label: "Addresses", href: "/account/shipping", color: "bg-amber-500" },
    { icon: CreditCard, label: "Billing", href: "/account/billing", color: "bg-purple-500" },
    { icon: Settings, label: "Settings", href: "/account/settings", color: "bg-slate-500" },
  ];

  return (
    <div className="space-y-5">
      {/* Admin Access Error Banner */}
      {showAdminError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800">Admin Access Required</h3>
              <p className="mt-1 text-sm text-amber-700">
                You don&apos;t have permission to access the admin area. If you believe this is an error, 
                please contact your administrator.
              </p>
            </div>
            <button
              onClick={() => setShowAdminError(false)}
              className="text-amber-600 hover:text-amber-800"
            >
              <span className="sr-only">Dismiss</span>
              ×
            </button>
          </div>
        </div>
      )}

      {/* Welcome Hero Section - Modern Design */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-50 via-white to-orange-50 border border-slate-200/50 p-8 shadow-sm">
        {/* Decorative gradient orb */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-linear-to-br from-orange-300 to-teal-300 opacity-10 blur-3xl" />
        
        <div className="relative z-10">
          {/* Greeting with time-based message */}
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 mb-4">
            <Sparkles className="h-4 w-4 text-orange-600" />
            <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider">
              {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}
            </span>
          </div>
          
          {/* Main Welcome */}
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-slate-900">
              Welcome back, {user?.user_metadata?.given_name || user?.user_metadata?.full_name?.split(' ')[0] || profile?.full_name?.split(' ')[0] || user?.email?.split("@")[0] || "there"}! 👋
            </h1>
            <p className="mt-3 text-lg text-slate-600">
              {membership?.role && <span className="font-semibold text-orange-600">{membership.role.charAt(0).toUpperCase() + membership.role.slice(1)} Account</span>}
              {subscription?.status && subscription.status === 'active' && (
                <span className="ml-3 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1">
                  <div className="h-2 w-2 rounded-full bg-green-600" />
                  <span className="text-sm font-medium text-green-700">Active Subscription</span>
                </span>
              )}
            </p>
            {tenant?.name && (
              <p className="mt-2 text-sm text-slate-500">
                {tenant.name} • Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'recently'}
              </p>
            )}
          </div>

          {/* Personalized VIP Message */}
          {stats && stats.total_orders > 0 && (
            <div className="mt-6 inline-block rounded-xl bg-linear-to-r from-orange-50 to-teal-50 border border-orange-200/50 px-4 py-3">
              <p className="text-sm font-medium text-slate-700">
                {stats.total_orders === 1 
                  ? "🎉 Thanks for your first order! We're excited to serve you."
                  : stats.total_orders < 5
                  ? "🚀 You're building momentum! Keep exploring our solutions."
                  : stats.total_orders < 10
                  ? "⭐ You're a valued customer! Thank you for your continued trust."
                  : "👑 VIP Status! You're one of our top customers. Thank you for your loyalty!"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Key Stats Section */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Total Orders */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-100 opacity-50 blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-slate-900">{stats?.total_orders || 0}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">lifetime orders</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
              <TrendingUp className="h-4 w-4" />
              Your purchase history
            </div>
          </div>
        </div>

        {/* Total Spent */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-100 opacity-50 blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-slate-900">{stats ? formatPrice(stats.total_spent_cents) : "$0"}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">total investment</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-orange-600 font-semibold">
              <Award className="h-4 w-4" />
              All-time value
            </div>
          </div>
        </div>

        {/* In Progress Orders */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-100 opacity-50 blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-slate-900">{stats?.pending_orders || 0}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">active orders</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
              <Zap className="h-4 w-4" />
              Currently processing
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid - Modern Design */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group relative overflow-hidden flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-orange-300 hover:shadow-md hover:scale-105 active:scale-95"
            >
              {/* Hover gradient background */}
              <div className="absolute inset-0 bg-linear-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-lg bg-white group-hover:bg-slate-50 transition-colors duration-200">
                <action.icon className={`h-6 w-6 transition-all duration-200 ${action.color.replace('bg-', 'text-')}`} />
              </div>
              
              <span className="relative z-10 text-center text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Security & Access Card */}
      {lastSession && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Security & Access</h2>
          </div>
          
          <div className="space-y-4">
            {/* Last Sign In */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Last Sign In</p>
              <p className="text-xl font-bold text-slate-900 mt-2">
                {new Date(lastSession.created_at).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-slate-600 flex-wrap">
                <span className="flex items-center gap-1">
                  💻 {parseUserAgent(lastSession.user_agent || "").browser}
                </span>
                <span className="flex items-center gap-1">
                  🖥️ {parseUserAgent(lastSession.user_agent || "").os}
                </span>
              </div>
            </div>
            
            {/* Session Expires */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Session Expires</p>
              <p className="text-sm font-semibold text-slate-900 mt-2">
                {new Date(lastSession.expires_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>

            {/* Security Recommendations */}
            <div className="rounded-xl border-l-2 border-l-amber-400 border border-slate-100 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">Security Tip</p>
              <p className="text-xs text-amber-800 mt-1">
                Enable two-factor authentication for enhanced account security.
              </p>
              <Link
                href="/account/settings"
                className="mt-2 inline-block text-xs font-semibold text-amber-600 hover:text-amber-700 underline"
              >
                Go to Security Settings
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Orders and Quotes Row - Modern Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
            </div>
            <Link 
              href="/account/orders" 
              className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <ShoppingBag className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">No orders yet</h3>
              <p className="mt-1 text-sm text-slate-500">Start shopping to see your orders here</p>
              <Link
                href="/shop"
                className="mt-4 rounded-lg bg-orange-500 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all duration-200 hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm group-hover:shadow-md transition-shadow">
                      <Truck className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{order.order_number}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-slate-900 text-sm">{formatPrice(order.total_cents)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quotes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                <FileText className="h-5 w-5 text-violet-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Recent Quotes</h2>
            </div>
            <Link 
              href="/account/quotes" 
              className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {recentQuotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">No quotes yet</h3>
              <p className="mt-1 text-sm text-slate-500">Request a quote for bulk orders</p>
              <Link
                href="/account/quotes"
                className="mt-4 rounded-lg border border-slate-300 px-6 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Request Quote
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentQuotes.map((quote) => (
                <Link
                  key={quote.id}
                  href={`/account/quotes/${quote.id}`}
                  className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all duration-200 hover:border-violet-200 hover:bg-violet-50/50 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm group-hover:shadow-md transition-shadow">
                      <FileText className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Quote Request</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(quote.status)}`}>
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(quote.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-slate-900 text-sm">{formatPrice(quote.total)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Wishlist and Benefits Row - Modern Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Wishlist Preview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100">
                <Heart className="h-5 w-5 text-rose-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Your Wishlist</h2>
            </div>
            <Link 
              href="/wishlist" 
              className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Heart className="h-16 w-16 text-slate-200" />
              <p className="mt-4 text-base font-semibold text-slate-900">Save items you love</p>
              <p className="mt-1 text-sm text-slate-500">Bookmark products to buy later</p>
              <Link
                href="/shop"
                className="mt-4 rounded-lg bg-orange-500 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
              >
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {wishlistItems.slice(0, 4).map((item) => (
                <Link
                  key={item.id}
                  href={`/shop/product/${item.product?.id}`}
                  className="group flex flex-col rounded-xl border border-slate-100 bg-slate-50 p-3 transition-all duration-200 hover:border-orange-200 hover:shadow-md"
                >
                  <div className="relative aspect-square rounded-lg bg-white overflow-hidden mb-2">
                    {item.product?.thumbnail_url ? (
                      <Image
                        src={item.product.thumbnail_url}
                        alt={item.product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-200"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-8 w-8 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-900 line-clamp-2">{item.product?.name}</p>
                  <p className="text-sm font-bold text-orange-600 mt-1">
                    {formatPrice(item.product?.price_cents || 0)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Account Benefits */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Gift className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Your Benefits</h2>
          </div>

          <div className="space-y-4">
            {/* Pro Member Badge */}
            <div className="flex items-center gap-4 rounded-xl bg-linear-to-r from-purple-50 to-indigo-50 p-4 border border-purple-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-purple-500 to-indigo-500 text-white">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Restaurant Pro Member</p>
                <p className="text-sm text-slate-600">Free shipping on orders $100+</p>
              </div>
            </div>

            {/* Benefits List */}
            <div className="space-y-2">
              {[
                { icon: Truck, text: "Free shipping on bulk orders", active: true },
                { icon: Shield, text: "Extended 60-day returns", active: true },
                { icon: BarChart3, text: "Priority customer support", active: true },
                { icon: Clock, text: "Early access to new products", active: subscription?.status === "active" },
              ].map((benefit, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center gap-3 rounded-xl p-3 transition-all ${benefit.active ? "bg-orange-50 border border-orange-100" : "bg-slate-50 border border-slate-100"}`}
                >
                  <benefit.icon className={`h-5 w-5 shrink-0 ${benefit.active ? "text-orange-600" : "text-slate-400"}`} />
                  <span className={`text-sm ${benefit.active ? "text-slate-900 font-medium" : "text-slate-500"}`}>
                    {benefit.text}
                  </span>
                  {benefit.active && (
                    <span className="ml-auto text-xs font-bold text-orange-600">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <Eye className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Recently Viewed</h2>
            </div>
            <Link 
              href="/shop" 
              className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              Continue Shopping <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {recentlyViewed.map((item) => (
              <Link
                key={item.id}
                href={`/shop/product/${item.product?.id}`}
                className="group flex flex-col rounded-xl border border-slate-100 bg-slate-50 p-3 transition-all duration-200 hover:border-orange-200 hover:shadow-md"
              >
                <div className="relative aspect-square rounded-lg bg-white overflow-hidden mb-2">
                  {item.product?.thumbnail_url ? (
                    <Image
                      src={item.product.thumbnail_url}
                      alt={item.product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-200"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-6 w-6 text-slate-300" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-slate-900 line-clamp-2">{item.product?.name}</p>
                <p className="text-sm font-bold text-orange-600 mt-1">
                  {formatPrice(item.product?.price_cents || 0)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Integration Status */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100">
            <Zap className="h-5 w-5 text-teal-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Integration Status</h2>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Track delivery channel consolidation and POS routing status.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Integration request", status: "received", active: true },
            { label: "Routing rules", status: "confirmed", active: true },
            { label: "Menu sync", status: "in progress", active: false },
            { label: "Go-live", status: "scheduling", active: false },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-xl border px-4 py-3 ${item.active ? "border-orange-200 bg-orange-50" : "border-slate-100 bg-slate-50"}`}
            >
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className={`text-xs mt-1 capitalize ${item.active ? "text-orange-500" : "text-slate-500"}`}>{item.status}</p>
            </div>
          ))}
        </div>
        <Link
          href={`/app/integrations/delivery?tenant=${tenant?.slug}`}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-orange-300 hover:bg-orange-50"
        >
          View integration details <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Account Security & Support */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/account/settings"
          className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-300 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <Shield className="h-6 w-6 text-slate-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Security & Privacy</p>
            <p className="text-sm text-slate-500">Manage password, 2FA, and data</p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </Link>

        <Link
          href="/account/support"
          className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-300 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
            <Sparkles className="h-6 w-6 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">Get Help</p>
            <p className="text-sm text-slate-500">Contact support or browse FAQs</p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </Link>
      </div>
    </div>
  );
}
