import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccountContext } from "@/lib/account-context";

export default async function SupportPage() {
  const { tenant } = await getAccountContext();

  if (!tenant) {
    redirect("/account/setup");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-500">Support</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Get help fast
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Reach out for onboarding, integrations, supply questions, or billing.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Priority support</h2>
          <p className="mt-2 text-sm text-slate-600">
            Concierge support for active locations and rollouts.
          </p>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>support@restauranthubsolution.com</p>
            <p>+1 (555) 013-2222</p>
          </div>
          <Link
            href="/contact"
            className="mt-4 inline-flex rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
          >
            Contact support
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Operations help</h2>
          <p className="mt-2 text-sm text-slate-600">
            Need a menu update, supply reorder, or integration change? Submit a request.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700"
          >
            Submit a request
          </Link>
        </div>
      </div>
    </div>
  );
}
