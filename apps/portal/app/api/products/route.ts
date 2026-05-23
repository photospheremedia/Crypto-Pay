import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";
import { mapProductRow } from "@/lib/products/product-mapper";

// Force dynamic rendering since this route uses searchParams
export const dynamic = "force-dynamic";

// GET /api/products - List products with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const supabase = getSupabaseServiceClient();

    const category = searchParams.get("category") || undefined;
    const subcategory = searchParams.get("subcategory") || undefined;
    const search = searchParams.get("search") || undefined;
    const inStock = searchParams.get("inStock");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const brand = searchParams.get("brand") || undefined;
    const sortBy = searchParams.get("sortBy") as
      | "price-asc"
      | "price-desc"
      | "rating"
      | "newest"
      | "relevance"
      | undefined;
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page") || "1", 10)
      : 1;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit") || "24", 10)
      : 24;

    let query = supabase
      .from("products")
      .select("*, product_categories (slug, name)", { count: "exact" });

    if (category) {
      query = query.eq("category", category);
    }
    if (subcategory) {
      query = query.eq("subcategory", subcategory);
    }
    if (brand) {
      query = query.eq("brand", brand);
    }
    if (minPrice) {
      query = query.gte("price_cents", parseInt(minPrice, 10));
    }
    if (maxPrice) {
      query = query.lte("price_cents", parseInt(maxPrice, 10));
    }

    if (inStock !== null) {
      const inStockValue = inStock === "true";
      if (inStockValue) {
        query = query.or(
          "track_inventory.is.false,stock_quantity.gt.0,allow_backorder.is.true",
        );
      } else {
        query = query
          .eq("track_inventory", true)
          .lte("stock_quantity", 0)
          .eq("allow_backorder", false);
      }
    }

    if (search) {
      const safeSearch = search.replace(/,/g, " ").trim();
      const like = `%${safeSearch}%`;
      const orFilters = [
        `and(status.eq.active,name.ilike.${like})`,
        `and(status.is.null,name.ilike.${like})`,
        `and(status.eq.active,description.ilike.${like})`,
        `and(status.is.null,description.ilike.${like})`,
        `and(status.eq.active,brand.ilike.${like})`,
        `and(status.is.null,brand.ilike.${like})`,
        `and(status.eq.active,sku.ilike.${like})`,
        `and(status.is.null,sku.ilike.${like})`,
      ];
      query = query.or(orFilters.join(","));
    } else {
      query = query.or("status.eq.active,is_active.eq.true,status.is.null");
    }

    switch (sortBy) {
      case "price-asc":
        query = query.order("price_cents", { ascending: true });
        break;
      case "price-desc":
        query = query.order("price_cents", { ascending: false });
        break;
      case "rating":
        query = query.order("average_rating", { ascending: false });
        break;
      case "newest":
        query = query.order("updated_at", { ascending: false });
        break;
      default:
        query = query.order("updated_at", { ascending: false });
        break;
    }

    const start = (page - 1) * limit;
    const end = start + limit - 1;
    const { data, error, count } = await query.range(start, end);

    if (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 },
      );
    }

    const products = (data || []).map(mapProductRow);
    const total = count ?? products.length;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      products,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
