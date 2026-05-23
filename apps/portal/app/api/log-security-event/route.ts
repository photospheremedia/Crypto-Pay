import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, eventType, userAgent } = body;

    if (!userId || !eventType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServerClient();

    // Get client IP from headers
    const ipAddress = 
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Insert security event
    const { error: logError } = await supabase
      .from("user_security_events")
      .insert({
        user_id: userId,
        event_type: eventType,
        ip_address: ipAddress,
        user_agent: userAgent || request.headers.get("user-agent"),
        details: {
          timestamp: new Date().toISOString(),
          path: request.nextUrl.pathname,
        },
      });

    if (logError) {
      console.error("Security logging error:", logError);
    }

    // Update last_sign_in_at on user_profiles (non-blocking)
    (async () => {
      try {
        await supabase
          .from("user_profiles")
          .update({
            last_sign_in_at: new Date().toISOString(),
            last_sign_in_ip: ipAddress,
          })
          .eq("id", userId);
      } catch (error) {
        console.error("Failed to update profile sign-in time:", error);
      }
    })();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging security event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
