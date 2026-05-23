import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event_type, metadata, tenant_id, user_id } = body;

    if (!event_type) {
      return NextResponse.json(
        { error: 'event_type is required' },
        { status: 400 }
      );
    }

    console.log('[Analytics API] Tracking event:', {
      event_type,
      tenant_id,
      user_id,
      metadata,
    });

    // Try to get authenticated user
    let userId = user_id;
    let tenantId = tenant_id;

    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        userId = userId || user.id;
        // Could get tenant from user's profile if needed
      }
    } catch (error) {
      console.log('[Analytics API] Could not get auth:', error);
    }

    // Here you would typically:
    // 1. Persist to analytics bucket/database
    // 2. Send to external analytics service
    // 3. Queue for batch processing

    return NextResponse.json({
      success: true,
      event_id: `evt_${Date.now()}`,
      tracked: {
        event_type,
        tenant_id: tenantId,
        user_id: userId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[Analytics API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
