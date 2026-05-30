import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
import { ACCOUNT_WALLET_SETUP_PATH } from "@/lib/account/paths";
import {
  normalizeAuthEmailNextParam,
  normalizeEmailOtpType,
} from "@/lib/auth/email-confirm";
import {
  getHomePathForRealm,
  merchantOnboardingPath,
  resolveRealmForUser,
  sanitizePostAuthRedirect,
} from "@/lib/auth/user-realm";
import { scheduleEmailWork } from "@/lib/email/schedule";
import { runWelcomeEmailWorkflow } from "@/lib/email/workflows";
import { listUserMerchantWallets } from "@/lib/wallets/db";
import {
  applyAccountPreferenceCookies,
  resolveAccountLocaleRedirect,
} from "@/lib/i18n/account-locale";

/**
 * Email confirmation / recovery / magic-link token exchange (PKCE / SSR).
 *
 * Supabase auth emails should link here with token_hash + type, e.g.:
 * /auth/confirm?token_hash=...&type=email&next=/account?tab=wallets
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = normalizeEmailOtpType(searchParams.get("type"));
  const rawNext = searchParams.get("next");

  if (!token_hash || !type) {
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=missing_token`,
    );
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error || !data.session?.user) {
    console.error("[Auth Confirm] verifyOtp failed:", error?.message);
    const errCode =
      error?.message?.toLowerCase().includes("expired") ||
      error?.message?.toLowerCase().includes("invalid")
        ? "link_expired"
        : "verify_failed";
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=${encodeURIComponent(errCode)}`,
    );
  }

  revalidatePath("/", "layout");

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  const baseUrl = isLocalEnv
    ? origin
    : forwardedHost
      ? `https://${forwardedHost}`
      : origin;

  const realm = await resolveRealmForUser(supabase, data.session.user);
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || baseUrl;

  const session = data.session;
  if (type === "email" && session) {
    const meta = session.user.user_metadata as { first_name?: string };
    scheduleEmailWork(`user.welcome.confirm.${session.user.id}`, () =>
      runWelcomeEmailWorkflow({
        email: session.user.email!,
        firstName: meta.first_name,
        dashboardUrl: `${appUrl}${ACCOUNT_WALLET_SETUP_PATH}`,
      }),
    );
  }

  const nextPath = normalizeAuthEmailNextParam(rawNext);

  let target: string;
  // Security: password recovery links must *always* land on the password update
  // screen, even if Supabase includes a `next`/RedirectTo param (e.g. /account).
  // The recovery link establishes a session; we should not grant normal app
  // access until the password has been changed.
  if (type === "recovery") {
    target = "/reset-password";
  } else if (nextPath) {
    target = sanitizePostAuthRedirect(nextPath, realm);
  } else if (realm === "admin") {
    target = getHomePathForRealm("admin");
  } else {
    const wallets = await listUserMerchantWallets(
      supabase,
      data.session.user.id,
    );
    target =
      wallets.length === 0
        ? merchantOnboardingPath()
        : getHomePathForRealm("merchant");
  }

  const { path, localeCookie, themeCookie } = await resolveAccountLocaleRedirect(
    data.session.user.id,
    target,
  );
  const response = NextResponse.redirect(new URL(path, baseUrl));
  applyAccountPreferenceCookies(response, { localeCookie, themeCookie });
  return response;
}
