import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import { withAdminAuth, checkAdminAccess } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/marketing/campaigns
 * Fetch all email campaigns
 */
export const GET = withAdminAuth(async (req, { user }) => {
  try {
    const supabase = await createClient();

    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    let query = supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: campaigns, error } = await query;

    if (error) {
      console.error('Error fetching campaigns:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ campaigns: campaigns || [] });
  } catch (error) {
    console.error('Campaigns fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
});

/**
 * POST /api/admin/marketing/campaigns
 * Create new email campaign
 */
export async function POST(request: Request) {
  try {
    const { user } = await checkAdminAccess();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();
    const { name, subject, template_id, from_email, from_name, scheduled_for, tags } = body;

    if (!name || !subject || !from_email) {
      return NextResponse.json(
        { error: 'Missing required fields: name, subject, from_email' },
        { status: 400 }
      );
    }

    const { data: campaign, error } = await supabase
      .from('email_campaigns')
      .insert({
        name,
        subject,
        template_id: template_id || null,
        from_email,
        from_name: from_name || 'Restaurant Hub',
        status: scheduled_for ? 'scheduled' : 'draft',
        scheduled_for: scheduled_for || null,
        tags: tags || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating campaign:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error) {
    console.error('Campaign creation error:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
