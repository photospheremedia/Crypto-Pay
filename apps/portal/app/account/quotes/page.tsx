import Link from "next/link";
import { redirect } from "next/navigation";
import { getAccountContext } from "@/lib/account-context";

export default async function QuotesPage() {
  const { supabase, tenant } = await getAccountContext();

  if (!tenant) {
    redirect("/account/setup");
  }

  const { data: quotes } = await supabase
    .from("quotes")
    .select("id, status, subtotal, shipping_estimate, tax_estimate, total, created_at")
    .eq("customer_id", tenant.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-500">
          Quotes & cart
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Supply quotes
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Build a cart, request a quote, and convert to recurring restocks.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white"
          >
            Add supplies
          </Link>
          <Link
            href="/cart"
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700"
          >
            View cart
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Quote history</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          {quotes && quotes.length > 0 ? (
            quotes.map((quote) => (
              <div
                key={quote.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {quote.status}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(quote.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    ${Number(quote.total).toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500">Subtotal ${Number(quote.subtotal).toFixed(2)}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No quotes yet. Start building your first cart.</p>
          )}
        </div>
      </div>
    </div>
  );
}
