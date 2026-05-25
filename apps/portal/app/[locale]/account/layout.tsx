import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
import { isAdminEmail } from "@/lib/admin-email";
import { signOut } from "@/app/[locale]/(login)/actions";
import { CryptoPayHeader } from "@/components/cryptopay/crypto-pay-header";
import { mainBelowHeaderClass, stickyBelowHeaderClass } from "@/lib/layout-spacing";
import {
  LayoutDashboard,
  Wallet,
  HeadphonesIcon,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const navItems = [
  { label: "Dashboard", href: "/account", icon: LayoutDashboard },
  { label: "Wallet", href: "/account/get-started", icon: Wallet },
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

  if (!user) redirect("/login");

  let isAdmin = isAdminEmail(user.email);
  try {
    const { data: membership, error } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("status", "active")
      .in("role", ["staff", "manager", "admin", "owner", "cp_admin", "rhs_admin"])
      .maybeSingle();
    isAdmin = isAdmin || (!error && !!membership);
  } catch {
    // non-critical
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">
      <CryptoPayHeader />
      <div
        className={`mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:px-8 pb-16 lg:grid-cols-[260px_1fr] ${mainBelowHeaderClass}`}
      >
        <aside className={`lg:sticky lg:self-start lg:h-fit ${stickyBelowHeaderClass}`}>
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-lg shadow-slate-200/50 mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 via-emerald-400 to-cyan-600 text-white font-bold text-2xl shadow-md">
                    {(
                      user.user_metadata?.given_name ||
                      user.user_metadata?.full_name ||
                      user.email
                    )
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-slate-900 truncate">
                    {user.user_metadata?.given_name ||
                      user.user_metadata?.full_name?.split(" ")[0] ||
                      user.email?.split("@")[0]}
                  </p>
                  <p className="text-sm text-slate-600 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="group flex items-center gap-3 rounded-xl border border-purple-200/60 bg-linear-to-r from-purple-50 via-indigo-50 to-purple-50 px-4 py-3.5 text-sm font-semibold text-purple-700 shadow-md shadow-purple-100/50 transition-all hover:border-purple-300 hover:shadow-lg hover:-translate-y-0.5 mb-3"
              >
                <Shield className="h-5 w-5 text-purple-600 transition-transform group-hover:scale-110" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            <nav className="space-y-1.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white/70 backdrop-blur-sm px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-emerald-300/60 hover:bg-emerald-50/80 hover:text-emerald-600 hover:shadow-md hover:-translate-x-0.5"
                >
                  <item.icon className="h-4 w-4 text-slate-500 transition-all group-hover:text-emerald-500 group-hover:scale-110" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <form action={signOut} className="pt-3 border-t border-slate-200/60 mt-3">
              <button
                type="submit"
                className="group flex w-full items-center gap-3 rounded-xl border border-slate-200/60 bg-white/70 backdrop-blur-sm px-4 py-3 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-red-300/60 hover:bg-red-50/80 hover:text-red-600 hover:shadow-md hover:-translate-x-0.5"
              >
                <LogOut className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-6 sm:p-8 shadow-xl shadow-slate-200/50">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
