import { NextResponse } from "next/server";
import { SupplyQuoteLineDeleteInputSchema } from "@crypto-pay/shared";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
import { resolveTenantContext, canMutateCatalog } from "@/lib/tenant-context";
import { recalculateQuoteTotals } from "@/lib/quotes/quote-totals";
import { writeAuditLog } from "@/lib/audit";

export async function DELETE(request: Request) {
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
  const parsed = SupplyQuoteLineDeleteInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid quote line" }, { status: 400 });
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

  const { error } = await supabase
    .from("quote_lines")
    .delete()
    .eq("id", parsed.data.id);

  if (error) {
    return NextResponse.json(
      { error: error.message || "Failed to delete line" },
      { status: 500 },
    );
  }

  const updatedQuote = await recalculateQuoteTotals(existing.quote_id);

  await writeAuditLog({
    tenantId: context.tenant.id,
    actorUserId: context.userId,
    action: "quote.line.delete",
    entityType: "quote_line",
    entityId: existing.id,
    before: existing,
    after: null,
  });

  return NextResponse.json({ quote: updatedQuote });
}
