import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccountContext } from "@/lib/account-context";

export default async function ListsPage() {
  const { tenant } = await getAccountContext();

  if (!tenant) {
    redirect("/account/setup");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-500">Saved lists</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Reorder lists
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Save your most common supply bundles and reorder in a few clicks.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">
          No saved lists yet. Build a cart and save it as a reorder template.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white"
          >
            Build a list
          </Link>
          <Link
            href="/account/quotes"
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700"
          >
            View quotes
          </Link>
        </div>
      </div>
    </div>
  );
}
