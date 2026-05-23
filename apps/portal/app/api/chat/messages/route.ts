import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";

// Note: Using service role for guest/public chat operations

// Save chat messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, sessionId, messages } = body;

    if (!conversationId && !sessionId) {
      return NextResponse.json(
        { error: "Conversation ID or Session ID is required" },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Get conversation ID if only session ID provided
    let convId = conversationId;
    if (!convId && sessionId) {
      const { data: conv } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("session_id", sessionId)
        .single();

      if (!conv) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }
      convId = conv.id;
    }

    // Format messages for insertion
    const formattedMessages = messages.map((msg: any) => ({
      conversation_id: convId,
      role: msg.role || "user",
      content: typeof msg.content === "string" 
        ? msg.content 
        : msg.parts?.map((p: any) => p.text).join("") || "",
    }));

    // Insert messages
    const { data, error } = await supabase
      .from("chat_messages")
      .insert(formattedMessages)
      .select("id");

    if (error) {
      console.error("[Chat Messages] Error saving:", error);
      return NextResponse.json(
        { error: "Failed to save messages" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      count: data?.length || 0 
    });
  } catch (error) {
    console.error("[Chat Messages] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get messages for a conversation
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    const sessionId = searchParams.get("sessionId");

    if (!conversationId && !sessionId) {
      return NextResponse.json(
        { error: "Conversation ID or Session ID is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceClient();

    // Get conversation ID if only session ID provided
    let convId = conversationId;
    if (!convId && sessionId) {
      const { data: conv } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("session_id", sessionId)
        .single();

      if (!conv) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }
      convId = conv.id;
    }

    if (!convId) {
      return NextResponse.json(
        { error: "Conversation ID could not be determined" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[Chat Messages] Error fetching:", error);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages: data });
  } catch (error) {
    console.error("[Chat Messages] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
