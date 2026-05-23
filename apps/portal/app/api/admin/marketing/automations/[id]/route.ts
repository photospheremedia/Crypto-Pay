import { NextRequest, NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import { checkAdminAccess } from "@/lib/admin-auth";

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/marketing/automations/[id]
 * Update email automation
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await checkAdminAccess();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    const { data: automation, error } = await supabase
      .from('email_automations')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating automation:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!automation) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    return NextResponse.json({ automation });
  } catch (error) {
    console.error('Automation update error:', error);
    return NextResponse.json({ error: 'Failed to update automation' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/marketing/automations/[id]
 * Delete email automation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await checkAdminAccess();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id } = await params;

    const { error } = await supabase
      .from('email_automations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting automation:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Automation delete error:', error);
    return NextResponse.json({ error: 'Failed to delete automation' }, { status: 500 });
  }
}
