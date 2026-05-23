import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAdminAccess } from "@/lib/admin-auth";

// GET - List products with filters and pagination
export async function GET(req: NextRequest) {
  try {
    const { user, isAdmin } = await checkAdminAccess();
    
    if (!user || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }
    if (category) {
      query = query.eq("category_id", category);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data: products, count, error } = await query;

    if (error) {
      console.error("[Products] Error:", error);
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }

    // Get categories for filter dropdown
    const { data: categories } = await supabase
      .from("product_categories")
      .select("id, name")
      .order("name");

    // Get product stats
    const { count: totalProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    const { count: activeProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    const { count: lowStockProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .lt("stock_quantity", 10)
      .gt("stock_quantity", 0);

    const { count: outOfStockProducts } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("stock_quantity", 0);

    return NextResponse.json({
      success: true,
      products: products || [],
      categories: categories || [],
      stats: {
        total: totalProducts || 0,
        active: activeProducts || 0,
        lowStock: lowStockProducts || 0,
        outOfStock: outOfStockProducts || 0,
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("[Products] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a new product
export async function POST(req: NextRequest) {
  try {
    const { user, isAdmin } = await checkAdminAccess();
    
    if (!user || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await req.json();

    // Generate internal SKU if not provided
    const internalSku = body.internal_sku || body.sku || `SKU-${Date.now()}`;

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        name: body.name,
        description: body.description,
        sku: body.sku,
        internal_sku: internalSku,
        price_cents: body.price_cents,
        cost_estimate: body.cost_cents || body.cost_estimate,
        resale_price: body.resale_price || (body.price_cents ? body.price_cents / 100 : 0),
        supplier: body.supplier || "Manual Entry",
        stock_quantity: body.stock_quantity || 0,
        category_id: body.category_id,
        category: body.category,
        status: body.status || "draft",
        thumbnail_url: body.thumbnail_url,
        images: body.images || [],
        is_active: body.status === "active",
      })
      .select()
      .single();

    if (error) {
      console.error("[Products] Create error:", error);
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("[Products] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
