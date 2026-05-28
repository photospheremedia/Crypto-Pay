import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
import { ACCOUNT_WALLET_SETUP_PATH } from "@/lib/account/paths";
import {
  getHomePathForRealm,
  merchantOnboardingPath,
  resolveRealmForUser,
  sanitizePostAuthRedirect,
} from "@/lib/auth/user-realm";
import { scheduleEmailWork } from "@/lib/email/schedule";
import { runWelcomeEmailWorkflow } from "@/lib/email/workflows";
import { getUserPreferredLocale } from "@/lib/i18n/locale-actions";
import {
  localizeAppPath,
  localeCookieOptions,
} from "@/lib/i18n/locale-preference";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/locale-cookie-client";
import { getUserPreferredTheme } from "@/lib/theme/theme-actions";
import { THEME_COOKIE_NAME } from "@/lib/theme/theme-preference";
import { listUserMerchantWallets } from "@/lib/wallets/db";

function redirectWithAccountLocale(
  baseUrl: string,
  targetPath: string,
): NextResponse {
  return NextResponse.redirect(new URL(targetPath, baseUrl));
}

async function resolveRedirectTarget(
  userId: string,
  targetPath: string,
): Promise<{ path: string; localeCookie?: string; themeCookie?: string }> {
  const [preferredLocale, preferredTheme] = await Promise.all([
    getUserPreferredLocale(userId),
    getUserPreferredTheme(userId),
  ]);

  const path = preferredLocale
    ? localizeAppPath(preferredLocale, targetPath)
    : targetPath;

  return {
    path,
    localeCookie: preferredLocale ?? undefined,
    themeCookie: preferredTheme ?? undefined,
  };
}

function applyAccountPreferenceCookies(
  response: NextResponse,
  prefs: { localeCookie?: string; themeCookie?: string },
) {
  const cookieOpts = localeCookieOptions();
  if (prefs.localeCookie) {
    response.cookies.set(LOCALE_COOKIE_NAME, prefs.localeCookie, cookieOpts);
  }
  if (prefs.themeCookie) {
    response.cookies.set(THEME_COOKIE_NAME, prefs.themeCookie, cookieOpts);
  }
}

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
 * - signup: User signing up with new account → wallet onboarding on /account
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const mode = searchParams.get("mode") ?? "signin";

  const rawNext =
    next && next.startsWith("/") && !next.startsWith("//") && next !== "/"
      ? next
      : null;

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

    const realm = await resolveRealmForUser(supabase, data.session.user);

    if (realm === "admin") {
      const target = sanitizePostAuthRedirect(rawNext, "admin");
      const { path, localeCookie, themeCookie } = await resolveRedirectTarget(
        data.session.user.id,
        target,
      );
      const response = redirectWithAccountLocale(baseUrl, path);
      applyAccountPreferenceCookies(response, { localeCookie, themeCookie });
      return response;
    }

    if (mode === "signup" && data.session.user.email) {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || baseUrl;
      const meta = data.session.user.user_metadata as {
        first_name?: string;
      };
      scheduleEmailWork(`user.welcome.oauth.${data.session.user.id}`, () =>
        runWelcomeEmailWorkflow({
          email: data.session.user.email!,
          firstName: meta.first_name,
          dashboardUrl: `${appUrl}${ACCOUNT_WALLET_SETUP_PATH}`,
        }),
      );
    }

    let target = rawNext
      ? sanitizePostAuthRedirect(rawNext, "merchant")
      : null;

    if (!target) {
      if (mode === "signup") {
        target = merchantOnboardingPath();
      } else {
        const wallets = await listUserMerchantWallets(
          supabase,
          data.session.user.id,
        );
        target =
          wallets.length === 0 ? merchantOnboardingPath() : getHomePathForRealm("merchant");
      }
    }

    const { path, localeCookie, themeCookie } = await resolveRedirectTarget(
      data.session.user.id,
      target,
    );
    const response = redirectWithAccountLocale(baseUrl, path);
    applyAccountPreferenceCookies(response, { localeCookie, themeCookie });
    return response;

  } catch (err) {
    console.error("[OAuth Callback] Unexpected error:", err);
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=exchange_failed`
    );
  }
}
