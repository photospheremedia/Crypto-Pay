import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";

// Cache categories for 1 hour - they change infrequently
export const revalidate = 3600;

// GET /api/products/categories - Get all categories with counts
export async function GET() {
  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("product_categories")
      .select(
        "id, slug, name, description, icon, image_url, product_count, parent_id, display_order, is_active",
      )
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500 },
      );
    }

    const activeRows = (data || []).filter((row) => row.is_active !== false);
    const byId = new Map<string, any>();

    activeRows.forEach((row) => {
      byId.set(row.id, {
        slug: row.slug,
        name: row.name,
        description: row.description || "",
        icon: row.icon || "",
        image: row.image_url || "",
        productCount: row.product_count || 0,
        subcategories: [],
      });
    });

    const roots: any[] = [];
    activeRows.forEach((row) => {
      const entry = byId.get(row.id);
      if (!entry) return;
      if (row.parent_id && byId.has(row.parent_id)) {
        byId.get(row.parent_id).subcategories.push({
          slug: entry.slug,
          name: entry.name,
          productCount: entry.productCount,
        });
      } else {
        roots.push(entry);
      }
    });

    return NextResponse.json(roots);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}
