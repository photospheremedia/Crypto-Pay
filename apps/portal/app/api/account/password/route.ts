import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, createRateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { currentPassword, newPassword } = await request.json();
    const normalizedPassword = String(newPassword || "");

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (normalizedPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Rate limiting - 5 attempts per 15 minutes per user (via Edge Function)
    const rateLimitResult = await checkRateLimit('login', user.id);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.limit, rateLimitResult.remaining, rateLimitResult.reset);
    }

    if (currentPassword) {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email || "",
        password: String(currentPassword),
      });
      if (verifyError) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: normalizedPassword,
    });

    if (updateError) {
      const message = updateError.message.toLowerCase().includes("current password")
        ? "Current password is incorrect"
        : updateError.message;
      return NextResponse.json(
        { error: message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Password update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update password" },
      { status: 500 }
    );
  }
}
