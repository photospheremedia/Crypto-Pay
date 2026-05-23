import { NextResponse } from "next/server";
import { SupplyProductUpdateInputSchema } from "@crypto-pay/shared";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
import { writeAuditLog } from "@/lib/audit";
import { requireRhsAdmin } from "@/lib/admin";

export async function PATCH(request: Request) {
  const adminUserId = await requireRhsAdmin();
  if (!adminUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = SupplyProductUpdateInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product update" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name.trim();
  if (parsed.data.internal_sku !== undefined) {
    updates.internal_sku = parsed.data.internal_sku.trim();
  }
  if (parsed.data.supplier !== undefined) {
    updates.supplier = parsed.data.supplier.trim() || "supplier";
  }
  if (parsed.data.category !== undefined) {
    updates.category = parsed.data.category?.trim() || null;
  }
  if (parsed.data.supplier_url !== undefined) {
    updates.supplier_url = parsed.data.supplier_url?.trim() || null;
  }
  if (parsed.data.cost_estimate !== undefined) {
    updates.cost_estimate = parsed.data.cost_estimate;
  }
  if (parsed.data.resale_price !== undefined) {
    updates.resale_price = parsed.data.resale_price;
  }
  if (parsed.data.notes !== undefined) {
    updates.notes = parsed.data.notes?.trim() || null;
  }
  if (parsed.data.is_active !== undefined) {
    updates.is_active = parsed.data.is_active;
  }

  const supabase = await getSupabaseServerClient();
  const { data: before } = await supabase
    .from("products")
    .select(
      "id, supplier, name, category, supplier_url, internal_sku, cost_estimate, resale_price, notes, is_active",
    )
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (!before) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", parsed.data.id)
    .select(
      "id, supplier, name, category, supplier_url, internal_sku, cost_estimate, resale_price, notes, is_active, created_at",
    )
    .single();

  if (error) {
    const status = error.code === "23505" ? 409 : 500;
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status },
    );
  }

  await writeAuditLog({
    tenantId: null,
    actorUserId: adminUserId,
    action: "product.update",
    entityType: "product",
    entityId: data.id,
    before,
    after: data,
  });

  return NextResponse.json({ product: data });
}
