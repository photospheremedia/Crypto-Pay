import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";
import { isUuid, mapProductRow } from "@/lib/products/product-mapper";

// GET /api/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServiceClient();

    let query = supabase
      .from("products")
      .select("*, product_categories (slug, name)")
      .limit(1);

    if (isUuid(id)) {
      query = query.eq("id", id);
    } else {
      query = query.or(`sku.eq.${id},internal_sku.eq.${id}`);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("Error fetching product:", error);
      return NextResponse.json(
        { error: "Failed to fetch product" },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(mapProductRow(data));
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}
