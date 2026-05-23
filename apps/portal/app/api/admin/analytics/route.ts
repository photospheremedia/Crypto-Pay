import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withAdminAuth } from "@/lib/admin-auth";

// Uses withAdminAuth HOF for optimized single auth check
export const GET = withAdminAuth(async (req, { user }) => {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d";

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    let previousStartDate = new Date();
    
    switch (range) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        previousStartDate.setDate(now.getDate() - 60);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        previousStartDate.setDate(now.getDate() - 180);
        break;
      case "365d":
        startDate.setDate(now.getDate() - 365);
        previousStartDate.setDate(now.getDate() - 730);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
        previousStartDate.setDate(now.getDate() - 60);
    }

    const startDateStr = startDate.toISOString();
    const previousStartDateStr = previousStartDate.toISOString();

    // Current period orders
    const { data: currentOrders } = await supabase
      .from("orders")
      .select("id, total_cents, status, created_at")
      .gte("created_at", startDateStr);

    // Previous period orders for comparison
    const { data: previousOrders } = await supabase
      .from("orders")
      .select("id, total_cents, status, created_at")
      .gte("created_at", previousStartDateStr)
      .lt("created_at", startDateStr);

    // Current period customers
    const { count: currentCustomers } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDateStr);

    // Previous period customers
    const { count: previousCustomers } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .gte("created_at", previousStartDateStr)
      .lt("created_at", startDateStr);

    // Calculate metrics
    const currentRevenue = currentOrders?.reduce((sum, o) => sum + (o.total_cents || 0), 0) || 0;
    const previousRevenue = previousOrders?.reduce((sum, o) => sum + (o.total_cents || 0), 0) || 0;
    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    const currentOrderCount = currentOrders?.length || 0;
    const previousOrderCount = previousOrders?.length || 0;
    const ordersChange = previousOrderCount > 0 
      ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100 
      : 0;

    const currentCustomerCount = currentCustomers || 0;
    const previousCustomerCount = previousCustomers || 0;
    const customersChange = previousCustomerCount > 0 
      ? ((currentCustomerCount - previousCustomerCount) / previousCustomerCount) * 100 
      : 0;

    const currentAOV = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;
    const previousAOV = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;
    const aovChange = previousAOV > 0 
      ? ((currentAOV - previousAOV) / previousAOV) * 100 
      : 0;

    // Top products by quantity sold
    const { data: orderItems } = await supabase
      .from("order_items")
      .select(`
        product_id,
        quantity,
        unit_price_cents,
        products (
          id,
          name
        )
      `)
      .gte("created_at", startDateStr);

    // Aggregate by product
    const productStats: Record<string, { name: string; quantity: number; revenue: number }> = {};
    orderItems?.forEach((item: any) => {
      const productId = item.product_id;
      if (!productStats[productId]) {
        productStats[productId] = {
          name: item.products?.name || "Unknown Product",
          quantity: 0,
          revenue: 0,
        };
      }
      productStats[productId].quantity += item.quantity || 0;
      productStats[productId].revenue += (item.quantity || 0) * (item.unit_price_cents || 0);
    });

    const topProducts = Object.entries(productStats)
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Recent orders
    const { data: recentOrders } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        total_cents,
        status,
        created_at,
        customers (
          name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(5);

    const analytics = {
      revenue: {
        total: currentRevenue,
        change: revenueChange,
        trend: revenueChange >= 0 ? "up" : "down",
      },
      orders: {
        total: currentOrderCount,
        change: ordersChange,
        trend: ordersChange >= 0 ? "up" : "down",
      },
      customers: {
        total: currentCustomerCount,
        change: customersChange,
        trend: customersChange >= 0 ? "up" : "down",
      },
      avgOrderValue: {
        total: Math.round(currentAOV),
        change: aovChange,
        trend: aovChange >= 0 ? "up" : "down",
      },
      topProducts,
      recentOrders: recentOrders?.map((o: any) => ({
        id: o.id,
        order_number: o.order_number,
        customer_name: o.customers?.name || "Guest",
        total: o.total_cents,
        status: o.status,
        created_at: o.created_at,
      })) || [],
    };

    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
});
