import { NextResponse } from "next/server";
import { SupplyQuoteLineUpdateInputSchema } from "@crypto-pay/shared";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
import { resolveTenantContext, canMutateCatalog } from "@/lib/tenant-context";
import { recalculateQuoteTotals } from "@/lib/quotes/quote-totals";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("tenant");

  if (!slug) {
    return NextResponse.json({ error: "Missing tenant" }, { status: 400 });
  }

  const context = await resolveTenantContext(slug);
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!canMutateCatalog(context.membership.role)) {
    return NextResponse.json({ error: "Insufficient role" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = SupplyQuoteLineUpdateInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid quote line update" }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const { data: existing } = await supabase
    .from("quote_lines")
    .select("id, quote_id, quantity, unit_price, line_total")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Quote line not found" }, { status: 404 });
  }

  const { data: quote } = await supabase
    .from("quotes")
    .select("id, status, customer_id")
    .eq("id", existing.quote_id)
    .eq("customer_id", context.tenant.id)
    .maybeSingle();

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  if (quote.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft quotes can be edited" },
      { status: 409 },
    );
  }

  const quantity = parsed.data.quantity ?? existing.quantity;
  const existingUnit = Number(existing.unit_price);
  const unitPrice =
    parsed.data.unit_price ?? (Number.isNaN(existingUnit) ? 0 : existingUnit);
  const lineTotal = unitPrice * quantity;

  const { data, error } = await supabase
    .from("quote_lines")
    .update({
      quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
    })
    .eq("id", parsed.data.id)
    .select(
      "id, quote_id, product_id, quantity, unit_price, line_total, products ( id, name, internal_sku )",
    )
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message || "Failed to update line" },
      { status: 500 },
    );
  }

  const updatedQuote = await recalculateQuoteTotals(existing.quote_id);

  await writeAuditLog({
    tenantId: context.tenant.id,
    actorUserId: context.userId,
    action: "quote.line.update",
    entityType: "quote_line",
    entityId: data.id,
    before: existing,
    after: data,
  });

  return NextResponse.json({ line: data, quote: updatedQuote });
}
