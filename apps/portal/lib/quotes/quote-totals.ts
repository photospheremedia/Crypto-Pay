import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";

export type QuoteTotalsUpdate = {
  shipping_estimate?: number | null;
  tax_estimate?: number | null;
  status?: string;
  notes?: string | null;
};

export async function recalculateQuoteTotals(
  quoteId: string,
  overrides: QuoteTotalsUpdate = {},
) {
  // Legacy Restaurant Hub "quotes" schema has been removed from Crypto Pay.
  // This helper remains only to avoid breaking any stale imports.
  void quoteId;
  void overrides;
  void getSupabaseServerClient;
  throw new Error("Quotes are not supported in Crypto Pay.");
}
