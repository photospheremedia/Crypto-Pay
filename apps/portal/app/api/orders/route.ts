import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";

export async function GET(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  let query = supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      payment_status,
      subtotal_cents,
      shipping_cents,
      tax_cents,
      discount_cents,
      total_cents,
      currency,
      shipping_method,
      tracking_number,
      estimated_delivery_date,
      shipped_at,
      delivered_at,
      shipping_address,
      created_at,
      updated_at
    `, { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ 
    orders: data, 
    total: count,
    hasMore: (count || 0) > offset + limit 
  });
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    items,
    shipping_address,
    billing_address,
    shipping_method,
    payment_method,
    promotion_code,
    customer_notes,
  } = body;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Order must have at least one item" }, { status: 400 });
  }

  if (!shipping_address) {
    return NextResponse.json({ error: "Shipping address is required" }, { status: 400 });
  }

  // Calculate totals
  const subtotal_cents = items.reduce(
    (sum: number, item: any) => sum + item.price_cents * item.quantity,
    0
  );

  // Shipping costs based on method
  const shippingCosts: Record<string, number> = {
    standard: 0, // Free for orders over $100
    express: 1499,
    overnight: 2999,
  };
  const shipping_cents = subtotal_cents >= 10000 
    ? 0 
    : (shippingCosts[shipping_method] || 0);

  // Tax (simplified - 8% for now)
  const tax_cents = Math.round(subtotal_cents * 0.08);

  // Apply promotion if provided
  let discount_cents = 0;
  let promotion_id = null;
  
  if (promotion_code) {
    const { data: promo } = await supabase
      .from("promotions")
      .select("*")
      .eq("code", promotion_code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (promo) {
      if (promo.discount_type === "percentage") {
        discount_cents = Math.round(subtotal_cents * (promo.discount_value / 100));
      } else if (promo.discount_type === "fixed") {
        discount_cents = Math.round(promo.discount_value * 100);
      } else if (promo.discount_type === "free_shipping") {
        discount_cents = shipping_cents;
      }
      
      if (promo.maximum_discount_cents) {
        discount_cents = Math.min(discount_cents, promo.maximum_discount_cents);
      }
      
      promotion_id = promo.id;
    }
  }

  const total_cents = subtotal_cents + shipping_cents + tax_cents - discount_cents;

  // Get customer_id if user has a tenant
  const { data: membership } = await supabase
    .from("memberships")
    .select("tenant_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      customer_id: membership?.tenant_id || null,
      status: "pending",
      payment_status: payment_method === "invoice" ? "pending" : "pending",
      subtotal_cents,
      shipping_cents,
      tax_cents,
      discount_cents,
      total_cents,
      shipping_method,
      shipping_address,
      billing_address: billing_address || shipping_address,
      payment_method,
      promotion_id,
      promotion_code,
      customer_notes,
    })
    .select()
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  // Create order items
  const orderItems = items.map((item: any) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.name,
    product_sku: item.sku || null,
    product_image: item.image || null,
    quantity: item.quantity,
    unit_price_cents: item.price_cents,
    total_cents: item.price_cents * item.quantity,
    options: item.options || {},
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    // Rollback order if items fail
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  // Log activity
  await supabase.from("user_activity_log").insert({
    user_id: user.id,
    activity_type: "order_created",
    description: `Order ${order.order_number} created`,
    metadata: { order_id: order.id, total_cents },
  });

  // Update promotion usage if used
  if (promotion_id) {
    await supabase.from("promotion_usage").insert({
      promotion_id,
      user_id: user.id,
      discount_applied_cents: discount_cents,
    });

    await supabase.rpc("increment_promotion_usage", { p_promotion_id: promotion_id });
  }

  return NextResponse.json({ 
    order: {
      ...order,
      items: orderItems,
    }
  }, { status: 201 });
}
