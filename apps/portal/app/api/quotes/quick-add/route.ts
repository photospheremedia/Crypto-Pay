import { NextResponse } from "next/server";
import { SupplyQuickAddInputSchema } from "@crypto-pay/shared";
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
  const parsed = SupplyQuickAddInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid quick add" }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, resale_price")
    .in("id", parsed.data.productIds)
    .eq("is_active", true);

  if (!products || products.length === 0) {
    return NextResponse.json({ error: "Products not found" }, { status: 404 });
  }

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .insert({
      customer_id: context.tenant.id,
      status: "draft",
      subtotal: 0,
      total: 0,
    })
    .select("id")
    .single();

  if (quoteError || !quote) {
    return NextResponse.json(
      { error: quoteError?.message || "Failed to create quote" },
      { status: 500 },
    );
  }

  const lines = products.map((product) => {
    const unitPrice = parseNumber(product.resale_price) ?? 0;
    return {
      quote_id: quote.id,
      product_id: product.id,
      quantity: 1,
      unit_price: unitPrice,
      line_total: unitPrice,
    };
  });

  const { error: lineError } = await supabase
    .from("quote_lines")
    .insert(lines);

  if (lineError) {
    await supabase.from("quotes").delete().eq("id", quote.id);
    return NextResponse.json(
      { error: lineError.message || "Failed to add quote lines" },
      { status: 500 },
    );
  }

  try {
    const updatedQuote = await recalculateQuoteTotals(quote.id);

    await writeAuditLog({
      tenantId: context.tenant.id,
      actorUserId: context.userId,
      action: "quote.quick_add",
      entityType: "quote",
      entityId: quote.id,
      before: null,
      after: updatedQuote,
    });

    return NextResponse.json({ quote: updatedQuote });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update quote";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
