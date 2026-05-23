import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";

export async function GET(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "12");

  const { data, error } = await supabase
    .from("recently_viewed")
    .select(`
      id,
      product_id,
      view_count,
      last_viewed_at,
      product:products (
        id,
        name,
        slug,
        price_cents,
        compare_at_price_cents,
        thumbnail_url,
        status
      )
    `)
    .eq("user_id", user.id)
    .order("last_viewed_at", { ascending: false })
    .limit(limit);

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
  const { product_id } = body;

  if (!product_id) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  // Use the upsert function we created in the migration
  const { error } = await supabase.rpc("upsert_recently_viewed", {
    p_user_id: user.id,
    p_product_id: product_id,
  });

  if (error) {
    // Fallback to manual upsert if function doesn't exist
    const { error: upsertError } = await supabase
      .from("recently_viewed")
      .upsert(
        {
          user_id: user.id,
          product_id,
          last_viewed_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,product_id",
        }
      );

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Clear all recently viewed for user
  const { error } = await supabase
    .from("recently_viewed")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
