import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Settings, Wallet, User } from "lucide-react";
import { CryptoConverter } from "@/components/cryptopay/crypto-converter";
import { getAccountContext } from "@/lib/account-context";
import { ADMIN_HOME_PATH } from "@/lib/auth/user-realm";
import { isStaffRole } from "@/lib/admin-auth";

export default async function AppHomePage() {
  const { user, tenant, membership } = await getAccountContext();
  const role = String(membership?.role ?? "member");

  if (isStaffRole(role)) {
    redirect(ADMIN_HOME_PATH);
  }

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

        <Link href="/account?tab=wallets" className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-300">
          <div className="mb-3 w-fit rounded-lg bg-emerald-50 p-2">
            <Wallet className="h-5 w-5 text-emerald-600" />
          </div>
          <h2 className="font-semibold text-slate-900">Wallet Setup</h2>
          <p className="mt-1 text-sm text-slate-600">Connect your crypto wallet to start accepting payments.</p>
        </Link>

        <Link href="/account/settings" className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-300">
          <div className="mb-3 w-fit rounded-lg bg-slate-100 p-2">
            <Settings className="h-5 w-5 text-slate-700" />
          </div>
          <h2 className="font-semibold text-slate-900">Settings</h2>
          <p className="mt-1 text-sm text-slate-600">Manage your profile, security, and preferences.</p>
        </Link>

        <Link href="/account/profile" className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-emerald-300">
          <div className="mb-3 w-fit rounded-lg bg-emerald-50 p-2">
            <User className="h-5 w-5 text-emerald-600" />
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

    </div>
  );
}
