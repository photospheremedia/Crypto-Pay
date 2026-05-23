import { NextResponse } from "next/server";
import { SupplyProductCreateInputSchema } from "@crypto-pay/shared";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
import { writeAuditLog } from "@/lib/audit";
import { requireRhsAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  const adminUserId = await requireRhsAdmin();
  if (!adminUserId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = SupplyProductCreateInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const payload = {
    supplier: parsed.data.supplier?.trim() || "supplier",
    name: parsed.data.name.trim(),
    category: parsed.data.category?.trim() || null,
    supplier_url: parsed.data.supplier_url?.trim() || null,
    internal_sku: parsed.data.internal_sku.trim(),
    cost_estimate:
      parsed.data.cost_estimate !== undefined
        ? parsed.data.cost_estimate
        : null,
    resale_price: parsed.data.resale_price,
    notes: parsed.data.notes?.trim() || null,
    is_active: parsed.data.is_active ?? true,
  };

  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select(
      "id, supplier, name, category, supplier_url, internal_sku, cost_estimate, resale_price, notes, is_active, created_at",
    )
    .single();

  if (error) {
    const status = error.code === "23505" ? 409 : 500;
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status },
    );
  }

  await writeAuditLog({
    tenantId: null,
    actorUserId: adminUserId,
    action: "product.create",
    entityType: "product",
    entityId: data.id,
    before: null,
    after: data,
  });

  return NextResponse.json({ product: data });
}
