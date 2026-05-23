import { NextResponse } from "next/server";
import { SupplyQuoteCreateInputSchema } from "@crypto-pay/shared";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
import { resolveTenantContext, canMutateCatalog } from "@/lib/tenant-context";
import { writeAuditLog } from "@/lib/audit";

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
  const parsed = SupplyQuoteCreateInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid quote" }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const locationId = parsed.data.locationId ?? null;

  if (locationId) {
    const { data: location } = await supabase
      .from("locations")
      .select("id")
      .eq("id", locationId)
      .eq("customer_id", context.tenant.id)
      .maybeSingle();

    if (!location) {
      return NextResponse.json({ error: "Invalid location" }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from("quotes")
    .insert({
      customer_id: context.tenant.id,
      location_id: locationId,
      status: "draft",
      subtotal: 0,
      total: 0,
      notes: parsed.data.notes?.trim() || null,
    })
    .select(
      "id, customer_id, location_id, status, subtotal, shipping_estimate, tax_estimate, total, notes, created_at",
    )
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message || "Failed to create quote" },
      { status: 500 },
    );
  }

  await writeAuditLog({
    tenantId: context.tenant.id,
    actorUserId: context.userId,
    action: "quote.create",
    entityType: "quote",
    entityId: data.id,
    before: null,
    after: data,
  });

  return NextResponse.json({ quote: data });
}
