import { NextRequest, NextResponse } from "next/server";
import { parseRequestJson } from "@/lib/api/parse-request-json";
import { routeError } from "@/lib/api/route-error";
import { createClient } from "@/lib/supabase/server";
import { assertBotProtectionForRequest } from '@/lib/security/bot-protection';

export async function POST(request: NextRequest) {
  try {
    const parsed = await parseRequestJson<{ email?: string; turnstile_token?: string }>(request);
    if (parsed instanceof Response) return parsed;

    const botCheck = await assertBotProtectionForRequest(request, {
      limitType: 'password-reset',
      turnstileToken: parsed.turnstile_token,
    });
    if (!botCheck.ok) {
      return NextResponse.json({ error: botCheck.error }, { status: botCheck.status });
    }

    const supabase = await createClient();
    const { email } = parsed;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Minimal format check before invoking Auth.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${appUrl}/reset-password`,
    });

    if (error) {
      // Return generic success to avoid account enumeration details.
      console.error("Password reset request warning:", error.message);
    }

    return NextResponse.json({ 
      success: true,
      message: "If an account exists for this email, a reset link has been sent." 
    });
  } catch (error) {
    return routeError(error, { logContext: "account/password-reset POST" });
  }
}
