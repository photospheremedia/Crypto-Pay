import Link from "next/link";
import { LayoutDashboard, Settings, ShoppingBag, User } from "lucide-react";
import { CryptoConverter } from "@/components/cryptopay/crypto-converter";
import { getAccountContext } from "@/lib/account-context";

export default async function AppHomePage() {
  const { user, tenant, membership } = await getAccountContext();
  const role = String(membership?.role ?? "member");
  const isAdminUser = ["rhs_admin", "admin", "owner", "manager", "staff"].includes(role);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Crypto Pay App</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">
          Signed in as <span className="font-medium">{user.email}</span>
          {tenant ? (
            <>
              {" "}for <span className="font-medium">{tenant.name}</span>
            </>
          ) : null}
          . Role: <span className="font-medium">{role}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/account" className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-300">
          <div className="mb-3 w-fit rounded-lg bg-emerald-50 p-2">
            <LayoutDashboard className="h-5 w-5 text-emerald-600" />
          </div>
          <h2 className="font-semibold text-slate-900">Account Dashboard</h2>
          <p className="mt-1 text-sm text-slate-600">Orders, quotes, profile, and account activity.</p>
        </Link>

        <Link href="/shop" className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-300">
          <div className="mb-3 w-fit rounded-lg bg-cyan-50 p-2">
            <ShoppingBag className="h-5 w-5 text-cyan-700" />
          </div>
          <h2 className="font-semibold text-slate-900">Storefront</h2>
          <p className="mt-1 text-sm text-slate-600">Browse products and start a new order.</p>
        </Link>

        <Link href="/account/settings" className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-300">
          <div className="mb-3 w-fit rounded-lg bg-slate-100 p-2">
            <Settings className="h-5 w-5 text-slate-700" />
          </div>
          <h2 className="font-semibold text-slate-900">Settings</h2>
          <p className="mt-1 text-sm text-slate-600">Manage your profile, security, and preferences.</p>
        </Link>

        <Link href="/account/profile" className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-300">
          <div className="mb-3 w-fit rounded-lg bg-orange-50 p-2">
            <User className="h-5 w-5 text-orange-600" />
          </div>
          <h2 className="font-semibold text-slate-900">Profile</h2>
          <p className="mt-1 text-sm text-slate-600">Keep your contact and company details up to date.</p>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Real-time crypto to fiat converter</h2>
        <p className="mt-1 text-sm text-slate-600">
          Price tickets and checkouts quickly in your local currency from live market rates.
        </p>
        <div className="mt-4">
          <CryptoConverter compact />
        </div>
      </div>

      {isAdminUser ? (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <h3 className="font-semibold text-slate-900">Admin Access</h3>
          <p className="mt-1 text-sm text-slate-600">You have elevated permissions for organization management.</p>
          <Link
            href="/admin/dashboard"
            className="mt-4 inline-flex rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Open Admin Dashboard
          </Link>
        </div>
      ) : null}
    </div>
  );
}
