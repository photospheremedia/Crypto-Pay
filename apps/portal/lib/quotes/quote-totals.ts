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
  const supabase = await getSupabaseServerClient();
  const { data: quote } = await supabase
    .from("quotes")
    .select("shipping_estimate, tax_estimate")
    .eq("id", quoteId)
    .maybeSingle();

  if (!quote) {
    throw new Error("Quote not found");
  }

  const { data: lines } = await supabase
    .from("quote_lines")
    .select("line_total")
    .eq("quote_id", quoteId);

  const subtotal = (lines || []).reduce((sum, line) => {
    const value = typeof line.line_total === "number"
      ? line.line_total
      : Number(line.line_total || 0);
    return sum + value;
  }, 0);

  const shippingEstimate =
    overrides.shipping_estimate !== undefined
      ? overrides.shipping_estimate
      : quote.shipping_estimate;
  const taxEstimate =
    overrides.tax_estimate !== undefined
      ? overrides.tax_estimate
      : quote.tax_estimate;

  const shippingValue = shippingEstimate ? Number(shippingEstimate) : 0;
  const taxValue = taxEstimate ? Number(taxEstimate) : 0;
  const total = subtotal + shippingValue + taxValue;

  const updatePayload: Record<string, unknown> = {
    subtotal,
    total,
  };

  if (overrides.shipping_estimate !== undefined) {
    updatePayload.shipping_estimate = overrides.shipping_estimate;
  }

  if (overrides.tax_estimate !== undefined) {
    updatePayload.tax_estimate = overrides.tax_estimate;
  }

  if (overrides.status !== undefined) {
    updatePayload.status = overrides.status;
  }

  if (overrides.notes !== undefined) {
    updatePayload.notes = overrides.notes;
  }

  const { data: updated, error } = await supabase
    .from("quotes")
    .update(updatePayload)
    .eq("id", quoteId)
    .select(
      "id, status, subtotal, shipping_estimate, tax_estimate, total, notes, updated_at",
    )
    .single();

  if (error || !updated) {
    throw new Error(error?.message || "Failed to update quote totals");
  }

  return updated;
}
