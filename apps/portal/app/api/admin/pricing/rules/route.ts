import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import { withAdminAuth, checkAdminAccess } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/pricing/rules
 * Fetch all pricing rules
 */
export const GET = withAdminAuth(async (req, { user }) => {
  try {
    const supabase = await createClient();

    const { data: rules, error } = await supabase
      .from('pricing_rules')
      .select('*')
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching pricing rules:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rules: rules || [] });
  } catch (error) {
    console.error('Pricing rules fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch pricing rules' }, { status: 500 });
  }
});

/**
 * POST /api/admin/pricing/rules
 * Create new pricing rule
 */
export async function POST(request: Request) {
  try {
    const { user } = await checkAdminAccess();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();
    const { name, rule_type, applies_to, value, priority, description, target_id, min_price, max_price, starts_at, ends_at } = body;

    if (!name || !rule_type || !applies_to || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, rule_type, applies_to, value' },
        { status: 400 }
      );
    }

    const { data: rule, error } = await supabase
      .from('pricing_rules')
      .insert({
        name,
        rule_type,
        applies_to,
        value,
        priority: priority || 1,
        description: description || null,
        target_id: target_id || null,
        min_price: min_price || null,
        max_price: max_price || null,
        starts_at: starts_at || null,
        ends_at: ends_at || null,
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating pricing rule:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    console.error('Pricing rule creation error:', error);
    return NextResponse.json({ error: 'Failed to create pricing rule' }, { status: 500 });
  }
}
