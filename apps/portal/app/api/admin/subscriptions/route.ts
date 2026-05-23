import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import { withAdminAuth, checkAdminAccess } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/subscriptions
 * Fetch all subscription plans and customer subscriptions
 */
export const GET = withAdminAuth(async (req, { user }) => {
  try {
    const supabase = await createClient();

    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'plans';

    if (type === 'plans') {
      const { data: plans, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching plans:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ plans: plans || [] });
    } else {
      const { data: subscriptions, error } = await supabase
        .from('customer_subscriptions')
        .select(`
          *,
          customer:customers!customer_subscriptions_customer_id_fkey (
            id,
            business_name,
            email
          ),
          plan:subscription_plans!customer_subscriptions_plan_id_fkey (
            name,
            billing_interval
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subscriptions:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ subscriptions: subscriptions || [] });
    }
  } catch (error) {
    console.error('Subscriptions fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
});

/**
 * POST /api/admin/subscriptions
 * Create new subscription plan
 */
export async function POST(request: Request) {
  try {
    const { user } = await checkAdminAccess();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();
    const { name, description, amount, billing_interval, features, stripe_price_id, stripe_product_id, trial_days, currency } = body;

    if (!name || amount === undefined || !billing_interval) {
      return NextResponse.json(
        { error: 'Missing required fields: name, amount, billing_interval' },
        { status: 400 }
      );
    }

    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .insert({
        name,
        description: description || null,
        amount,
        billing_interval,
        features: features || null,
        stripe_price_id: stripe_price_id || null,
        stripe_product_id: stripe_product_id || null,
        trial_days: trial_days || null,
        currency: currency || 'usd',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating plan:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    console.error('Plan creation error:', error);
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}
