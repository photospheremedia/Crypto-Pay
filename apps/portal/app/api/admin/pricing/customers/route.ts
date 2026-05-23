import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import { withAdminAuth, checkAdminAccess } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/pricing/customers
 * Fetch customer pricing tiers
 */
export const GET = withAdminAuth(async (req, { user }) => {
  try {
    const supabase = await createClient();

    const { data: tiers, error } = await supabase
      .from('customer_price_tiers')
      .select(`
        *,
        customer:customers!customer_price_tiers_customer_id_fkey (
          id,
          business_name,
          email
        ),
        price_tier:price_tiers!customer_price_tiers_tier_id_fkey (
          name,
          discount_percentage
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer tiers:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tiers: tiers || [] });
  } catch (error) {
    console.error('Customer tiers fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch customer tiers' }, { status: 500 });
  }
});

/**
 * POST /api/admin/pricing/customers
 * Assign pricing tier to customer
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await checkAdminAccess();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();
    const { customer_id, tier_id } = body;

    if (!customer_id || !tier_id) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_id, tier_id' },
        { status: 400 }
      );
    }

    const { data: assignment, error } = await supabase
      .from('customer_price_tiers')
      .insert({
        customer_id,
        tier_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error assigning tier:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    console.error('Tier assignment error:', error);
    return NextResponse.json({ error: 'Failed to assign tier' }, { status: 500 });
  }
}
