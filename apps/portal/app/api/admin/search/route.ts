import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";

interface SearchResult {
  id: string;
  type: "product" | "order" | "customer";
  title: string;
  subtitle: string;
  href: string;
}

export const GET = withAdminAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        results: [],
      });
    }

    const supabase = await createClient();
    const results: SearchResult[] = [];
    const searchTerm = `%${query}%`;

    // Search products with explicit filter (RLS + explicit filter for optimizer)
    const { data: products } = await supabase
      .from("products")
      .select("id, name, internal_sku, resale_price")
      .or(`name.ilike.${searchTerm},internal_sku.ilike.${searchTerm}`)
      .eq("is_active", true) // Explicit filter helps query planner
      .limit(5);

    if (products) {
      results.push(
        ...products.map((p) => ({
          id: p.id,
          type: "product" as const,
          title: p.name,
          subtitle: `SKU: ${p.internal_sku} • $${p.resale_price || 0}`,
          href: `/admin/products/${p.id}`,
        }))
      );
    }

    // Search orders with explicit filters
    const { data: orders } = await supabase
      .from("orders")
      .select("id, order_number, status, total_cents")
      .ilike("order_number", searchTerm)
      .order("created_at", { ascending: false }) // Use indexed column
      .limit(5);

    if (orders) {
      results.push(
        ...orders.map((o) => ({
          id: o.id,
          type: "order" as const,
          title: `Order #${o.order_number}`,
          subtitle: `${o.status} • $${((o.total_cents || 0) / 100).toFixed(2)}`,
          href: `/admin/orders/${o.id}`,
        }))
      );
    }

    // Search customers with explicit filters
    const { data: customers } = await supabase
      .from("customers")
      .select("id, name")
      .ilike("name", searchTerm)
      .eq("status", "active") // Explicit filter helps query planner
      .limit(5);

    if (customers) {
      results.push(
        ...customers.map((c) => ({
          id: c.id,
          type: "customer" as const,
          title: c.name,
          subtitle: "Customer",
          href: `/admin/customers/${c.id}`,
        }))
      );
    }

    return NextResponse.json({
      success: true,
      results: results.slice(0, 10), // Limit to 10 total results
    });
  } catch (error) {
    console.error("Search failed:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
});
