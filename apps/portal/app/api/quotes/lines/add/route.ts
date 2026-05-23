import { NextResponse } from "next/server";
import { SupplyQuoteLineAddInputSchema } from "@crypto-pay/shared";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
import { resolveTenantContext, canMutateCatalog } from "@/lib/tenant-context";
import { recalculateQuoteTotals } from "@/lib/quotes/quote-totals";
import { writeAuditLog } from "@/lib/audit";

function parseNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function POST(request: Request) {
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
  const parsed = SupplyQuoteLineAddInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid quote line" }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const { data: quote } = await supabase
    .from("quotes")
    .select("id, status, customer_id")
    .eq("id", parsed.data.quoteId)
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

  const { data: product } = await supabase
    .from("products")
    .select("id, resale_price, is_active")
    .eq("id", parsed.data.productId)
    .maybeSingle();

  if (!product || !product.is_active) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const unitPrice =
    parsed.data.unit_price !== undefined
      ? parsed.data.unit_price
      : parseNumber(product.resale_price);

  if (unitPrice === null) {
    return NextResponse.json(
      { error: "Product price is invalid" },
      { status: 400 },
    );
  }

  const lineTotal = unitPrice * parsed.data.quantity;

  const { data, error } = await supabase
    .from("quote_lines")
    .insert({
      quote_id: parsed.data.quoteId,
      product_id: parsed.data.productId,
      quantity: parsed.data.quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
    })
    .select(
      "id, quote_id, product_id, quantity, unit_price, line_total, products ( id, name, internal_sku )",
    )
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message || "Failed to add line" },
      { status: 500 },
    );
  }

  const updatedQuote = await recalculateQuoteTotals(parsed.data.quoteId);

  await writeAuditLog({
    tenantId: context.tenant.id,
    actorUserId: context.userId,
    action: "quote.line.add",
    entityType: "quote_line",
    entityId: data.id,
    before: null,
    after: data,
  });

  return NextResponse.json({ line: data, quote: updatedQuote });
}
