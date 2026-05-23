import { NextResponse } from "next/server";
import { SupplyQuoteUpdateInputSchema } from "@crypto-pay/shared";
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
  const parsed = SupplyQuoteUpdateInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid quote update" }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const { data: existing } = await supabase
    .from("quotes")
    .select(
      "id, customer_id, status, subtotal, shipping_estimate, tax_estimate, total, notes",
    )
    .eq("id", parsed.data.id)
    .eq("customer_id", context.tenant.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  try {
    const updated = await recalculateQuoteTotals(parsed.data.id, {
      shipping_estimate: parsed.data.shipping_estimate,
      tax_estimate: parsed.data.tax_estimate,
      status: parsed.data.status,
      notes: parsed.data.notes,
    });

    await writeAuditLog({
      tenantId: context.tenant.id,
      actorUserId: context.userId,
      action: "quote.update",
      entityType: "quote",
      entityId: existing.id,
      before: existing,
      after: updated,
    });

    return NextResponse.json({ quote: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
