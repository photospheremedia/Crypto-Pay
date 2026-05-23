import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import { withAdminAuth, checkAdminAccess } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/marketing/automations
 * Fetch all email automations
 */
export const GET = withAdminAuth(async (req, { user }) => {
  try {
    const supabase = await createClient();

    const { data: automations, error } = await supabase
      .from('email_automations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching automations:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ automations: automations || [] });
  } catch (error) {
    console.error('Automations fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch automations' }, { status: 500 });
  }
});

/**
 * POST /api/admin/marketing/automations
 * Create new email automation
 */
export async function POST(request: NextRequest) {
  try {
    const { user } = await checkAdminAccess();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();
    const {
      name,
      description,
      trigger_type,
      trigger_config,
      subject,
      from_name,
      from_email,
      template_id,
      content_html,
      content_json,
      delay_minutes,
      is_active,
    } = body;

    if (!name || !trigger_type || !subject || !from_email) {
      return NextResponse.json(
        { error: 'Missing required fields: name, trigger_type, subject, from_email' },
        { status: 400 }
      );
    }

    const { data: automation, error } = await supabase
      .from('email_automations')
      .insert({
        name,
        description,
        trigger_type,
        trigger_config: trigger_config || {},
        subject,
        from_name: from_name || 'Restaurant Hub',
        from_email,
        template_id,
        content_html,
        content_json,
        delay_minutes: delay_minutes || 0,
        is_active: is_active !== false,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating automation:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ automation }, { status: 201 });
  } catch (error) {
    console.error('Automation creation error:', error);
    return NextResponse.json({ error: 'Failed to create automation' }, { status: 500 });
  }
}
