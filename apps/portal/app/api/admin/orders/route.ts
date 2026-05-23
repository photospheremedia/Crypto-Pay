import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withAdminAuth, checkAdminAccess } from "@/lib/admin-auth";

// GET - List orders with filters and pagination
// Uses withAdminAuth HOF for optimized single auth check
export const GET = withAdminAuth(async (req, { user }) => {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Build query with explicit filters for query planner optimization
    let query = supabase
      .from("orders")
      .select(`
        *,
        customer:customers(id, name, email),
        items:order_items(id, product_id, quantity, unit_price_cents)
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Explicit filters help query planner even with RLS
    if (search) {
      query = query.or(`order_number.ilike.%${search}%`);
    }
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data: orders, count, error } = await query;

    if (error) {
      console.error("[Orders] Error:", error);
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }

    // Get order stats
    const today = new Date().toISOString().split("T")[0];
    
    const { count: totalOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    const { count: pendingOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const { count: processingOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "processing");

    const { count: completedOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed");

    const { count: todayOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today);

    // Get revenue stats
    const { data: revenueData } = await supabase
      .from("orders")
      .select("total_cents")
      .eq("status", "completed");
    
    const totalRevenue = revenueData?.reduce((sum, o) => sum + (o.total_cents || 0), 0) || 0;

    return NextResponse.json({
      success: true,
      orders: orders || [],
      stats: {
        total: totalOrders || 0,
        pending: pendingOrders || 0,
        processing: processingOrders || 0,
        completed: completedOrders || 0,
        today: todayOrders || 0,
        totalRevenue,
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("[Orders] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

// PATCH - Update order status (uses checkAdminAccess since we need user.id)
export async function PATCH(req: NextRequest) {
  try {
    const { user, isAdmin } = await checkAdminAccess();
    
    if (!user || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await req.json();
    const { orderId, status, notes } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "Order ID and status are required" }, { status: 400 });
    }

    // Update order
    const { data: order, error } = await supabase
      .from("orders")
      .update({ 
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("[Orders] Update error:", error);
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }

    // Add status history
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status,
      notes,
      changed_by: user.id,
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("[Orders] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
