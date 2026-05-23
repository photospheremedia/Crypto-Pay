import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import { withAdminAuth } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/pricing/history
 * Fetch price change history
 */
export const GET = withAdminAuth(async (req, { user }) => {
  try {
    const supabase = await createClient();

    const url = new URL(req.url);
    const productId = url.searchParams.get('product_id');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    let query = supabase
      .from('price_change_history')
      .select(`
        *,
        product:products!price_change_history_product_id_fkey (
          sku,
          name
        )
      `)
      .order('changed_at', { ascending: false })
      .limit(limit);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data: history, error } = await query;

    if (error) {
      console.error('Error fetching price history:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ history: history || [] });
  } catch (error) {
    console.error('Price history fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch price history' }, { status: 500 });
  }
});
