import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
import { signOut } from "@/app/(login)/actions";
import { CartProvider } from "@/components/store/cart-context";
import { WishlistProvider } from "@/components/store/wishlist-context";
import { RecentlyViewedProvider } from "@/components/store/recently-viewed-context";
import { StoreHeader } from "@/components/store/store-header";
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  List,
  MapPin, 
  CreditCard, 
  HeadphonesIcon,
  Settings,
  LogOut,
  Shield
} from "lucide-react";

// Prevent search engines from indexing user accounts
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

const navItems = [
  { label: "Dashboard", href: "/account", icon: LayoutDashboard },
  { label: "Orders", href: "/account/orders", icon: Package },
  { label: "Quotes & Cart", href: "/account/quotes", icon: FileText },
  { label: "Saved Lists", href: "/account/lists", icon: List },
  { label: "Shipping", href: "/account/shipping", icon: MapPin },
  { label: "Billing", href: "/account/billing", icon: CreditCard },
  { label: "Security", href: "/account/security", icon: Shield },
  { label: "Support", href: "/account/support", icon: HeadphonesIcon },
  { label: "Settings", href: "/account/settings", icon: Settings },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin - Handle potential RLS errors gracefully
  let isAdmin = false;
  try {
    const { data: membership, error } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("status", "active")
      .in("role", ["staff", "manager", "admin", "owner", "rhs_admin"])
      .maybeSingle();
    
    // Only set isAdmin if no error occurred and membership exists
    isAdmin = !error && !!membership;
  } catch (err) {
    // Silently handle errors - user simply won't see admin link
    console.error("Error checking admin status:", err);
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      <CartProvider>
        <WishlistProvider>
          <RecentlyViewedProvider>
            <StoreHeader />
            {/* Fixed gap and smooth scrolling with proper spacing using pt-20 for 72px header + 2rem gap */}
            <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:px-8 pb-16 pt-20 lg:pt-24 lg:grid-cols-[280px_1fr]">
              <aside className="lg:sticky lg:top-24 lg:self-start lg:h-fit">
                <div className="space-y-3">
                {/* User Info Card - More polished */}
                <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-lg shadow-slate-200/50 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-orange-500 via-teal-500 to-cyan-500 text-white font-bold text-2xl shadow-md">
                        {(user.user_metadata?.given_name || user.user_metadata?.full_name || user.email)?.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-orange-500 border-2 border-white shadow-sm"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-slate-900 truncate">
                        {user.user_metadata?.given_name || user.user_metadata?.full_name?.split(' ')[0] || user.email?.split("@")[0]}
                      </p>
                      <p className="text-sm text-slate-600 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Admin Dashboard Link - Only for admins */}
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="group flex items-center gap-3 rounded-xl border border-purple-200/60 bg-linear-to-r from-purple-50 via-indigo-50 to-purple-50 px-4 py-3.5 text-sm font-semibold text-purple-700 shadow-md shadow-purple-100/50 transition-all hover:border-purple-300 hover:shadow-lg hover:shadow-purple-200/50 hover:-translate-y-0.5 mb-3"
                  >
                    <Shield className="h-5 w-5 text-purple-600 transition-transform group-hover:scale-110" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                {/* Navigation - More modern with active states */}
                <nav className="space-y-1.5">
                  {navItems.map((item) => {
                    // Would need usePathname for client-side active detection, but keeping server-side simple
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/70 backdrop-blur-sm px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-orange-300/60 hover:bg-orange-50/80 hover:text-orange-600 hover:shadow-md hover:-translate-x-0.5"
                      >
                        <item.icon className="h-4.5 w-4.5 text-slate-500 transition-all group-hover:text-orange-500 group-hover:scale-110" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Sign Out - Using Server Action (Next.js 15 Best Practice) */}
                <form action={signOut} className="pt-3 border-t border-slate-200/60 mt-3">
                  <button
                    type="submit"
                    className="group flex w-full items-center gap-3 rounded-xl border border-slate-200/60 bg-white/70 backdrop-blur-sm px-4 py-3 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-red-300/60 hover:bg-red-50/80 hover:text-red-600 hover:shadow-md hover:-translate-x-0.5"
                  >
                    <LogOut className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />
                    <span>Sign Out</span>
                  </button>
                </form>
                </div>
              </aside>
              {/* Main content with better card styling */}
              <main className="min-w-0">
                <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-6 sm:p-8 shadow-xl shadow-slate-200/50">
                  {children}
                </div>
              </main>
            </div>
          </RecentlyViewedProvider>
        </WishlistProvider>
      </CartProvider>
    </div>
  );
}
