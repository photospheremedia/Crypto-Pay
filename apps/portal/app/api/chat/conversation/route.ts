import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";

// Note: Using service role for guest/public chat operations
// This endpoint creates conversations without auth context

// Start a new chat conversation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      userId,
      guestName,
      guestEmail,
      isGuest,
      userAgent,
      referrer,
      landingPage,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("session_id", sessionId)
      .single();

    if (existing) {
      return NextResponse.json({ id: existing.id, existing: true });
    }

    // Create new conversation
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({
        session_id: sessionId,
        user_id: userId || null,
        guest_name: guestName || null,
        guest_email: guestEmail || null,
        is_guest: isGuest ?? true,
        user_agent: userAgent,
        referrer: referrer,
        landing_page: landingPage,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        contact_captured: !!guestEmail,
        contact_captured_at: guestEmail ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[Chat Conversation] Error creating:", error);
      return NextResponse.json(
        { error: "Failed to create conversation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id, existing: false });
  } catch (error) {
    console.error("[Chat Conversation] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update conversation (end chat, update contact info, etc.)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      conversationId,
      sessionId,
      status,
      guestName,
      guestEmail,
      guestPhone,
      interestedIn,
    } = body;

    if (!conversationId && !sessionId) {
      return NextResponse.json(
        { error: "Conversation ID or Session ID is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient();

    const updates: Record<string, any> = {};

    if (status) updates.status = status;
    if (status === "ended") updates.ended_at = new Date().toISOString();
    if (guestName) updates.guest_name = guestName;
    if (guestEmail) {
      updates.guest_email = guestEmail;
      updates.contact_captured = true;
      updates.contact_captured_at = new Date().toISOString();
    }
    if (guestPhone) {
      updates.guest_phone = guestPhone;
      updates.contact_captured = true;
      updates.contact_captured_at = new Date().toISOString();
    }
    if (interestedIn) updates.interested_in = interestedIn;

    let query = supabase.from("chat_conversations").update(updates);

    if (conversationId) {
      query = query.eq("id", conversationId);
    } else if (sessionId) {
      query = query.eq("session_id", sessionId);
    }

    const { data, error } = await query.select("id").single();

    if (error) {
      console.error("[Chat Conversation] Error updating:", error);
      return NextResponse.json(
        { error: "Failed to update conversation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error("[Chat Conversation] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
