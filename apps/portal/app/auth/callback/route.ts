import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
import { isAdminEmail } from "@/lib/admin-email";

/**
 * OAuth Callback Handler
 * 
 * Exchanges authorization code from OAuth provider for user session.
 * Called by Supabase after user grants permission on an OAuth provider.
 * 
 * PKCE Flow (Supabase Best Practice):
 * 1. User starts OAuth login/signup → server action initializes OAuth flow
 * 2. @supabase/ssr automatically stores PKCE code_verifier in cookies (server-side)
 * 3. OAuth provider redirects to this route with ?code=XXX&mode=signin|signup
 * 4. exchangeCodeForSession reads code_verifier from cookies automatically
 * 5. Session is stored in cookies via @supabase/ssr
 * 6. Redirect to account dashboard (customer) or admin dashboard (staff)
 * 
 * Modes:
 * - signin: User signing in with existing account → redirect to /account or /admin
 * - signup: User signing up with new account → redirect to /account
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const mode = searchParams.get("mode") ?? "signin";
  const priceId = searchParams.get("priceId");

  // Validate redirect URL - must start with /
  let redirectPath = next ?? "/account";
  if (!redirectPath.startsWith("/")) {
    redirectPath = "/account";
  }

  // No authorization code - redirect to error page
  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`);
  }

  const supabase = await getSupabaseServerClient();

  try {
    // Exchange authorization code for session
    // @supabase/ssr automatically handles PKCE code_verifier from cookies
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[OAuth Callback] Code exchange error:", error.message);
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`
      );
    }

    if (!data.session?.user) {
      console.error("[OAuth Callback] No user in session after exchange");
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=no_session`
      );
    }

    // Determine the base URL for redirects (handle load balancers)
    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";
    const baseUrl = isLocalEnv
      ? origin
      : forwardedHost
        ? `https://${forwardedHost}`
        : origin;

    // Check for admin/staff role first
    const { data: membership } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", data.session.user.id)
      .eq("status", "active")
      .in("role", ["rhs_admin", "admin", "owner", "manager", "staff"])
      .maybeSingle();

    if (membership || isAdminEmail(data.session.user.email)) {
      // Staff/Admin user → admin dashboard
      const target = next && next !== "/" ? next : "/admin/dashboard";
      return NextResponse.redirect(new URL(target, baseUrl));
    }

    // Regular customer user → account dashboard
    // Note: /onboarding removed as it doesn't exist
    const target = next && next !== "/" ? next : "/account";
    return NextResponse.redirect(new URL(target, baseUrl));

  } catch (err) {
    console.error("[OAuth Callback] Unexpected error:", err);
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=exchange_failed`
    );
  }
}
