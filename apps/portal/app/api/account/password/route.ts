import { NextRequest, NextResponse } from "next/server";
import { parseRequestJson } from "@/lib/api/parse-request-json";
import { routeError } from "@/lib/api/route-error";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, createRateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const body = await parseRequestJson<{
      currentPassword?: string;
      newPassword?: string;
    }>(request);
    if (body instanceof Response) return body;

    const supabase = await createClient();
    const { currentPassword, newPassword } = body;
    const normalizedPassword = String(newPassword || "");

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const providers = Array.isArray(user.app_metadata?.providers)
      ? (user.app_metadata.providers as string[])
      : [];
    const userHasPassword = providers.includes("email");

    if (userHasPassword && !String(currentPassword || "").trim()) {
      return NextResponse.json(
        { error: "Current password is required" },
        { status: 400 },
      );
    }

    if (normalizedPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Server-side strength check (match portal reset/change UI intent).
    const hasUppercase = /[A-Z]/.test(normalizedPassword);
    const hasLowercase = /[a-z]/.test(normalizedPassword);
    const hasNumber = /[0-9]/.test(normalizedPassword);
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return NextResponse.json(
        {
          error:
            "Password must include at least one uppercase letter, one lowercase letter, and one number",
        },
        { status: 400 },
      );
    }

    // Rate limiting - 5 attempts per 15 minutes per user (via Edge Function)
    const rateLimitResult = await checkRateLimit('login', user.id);
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.limit, rateLimitResult.remaining, rateLimitResult.reset);
    }

    if (userHasPassword) {
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
  } catch (error) {
    return routeError(error, { logContext: "account/password POST" });
  }
}
