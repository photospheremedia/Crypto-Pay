import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";

export async function GET(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("wishlists")
    .select(`
      id,
      product_id,
      notify_on_sale,
      notify_on_stock,
      created_at,
      product:products (
        id,
        name,
        slug,
        price_cents,
        compare_at_price_cents,
        thumbnail_url,
        stock_quantity,
        status
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data });
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { product_id, notify_on_sale = false, notify_on_stock = false } = body;

  if (!product_id) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  // Check if already in wishlist
  const { data: existing } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", product_id)
    .single();

  if (existing) {
    return NextResponse.json({ message: "Already in wishlist", id: existing.id });
  }

  const { data, error } = await supabase
    .from("wishlists")
    .insert({
      user_id: user.id,
      product_id,
      notify_on_sale,
      notify_on_stock,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: data }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("product_id");

  if (!productId) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
