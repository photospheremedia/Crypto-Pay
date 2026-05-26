import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  getSupabaseServerApiKey,
  getSupabaseUrl,
} from "@crypto-pay/db/supabaseEnv";
import createIntlMiddleware from "next-intl/middleware";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { isAdminEmail } from "@/lib/admin-email";
import {
  getHomePathForRealm,
  isAdminPath,
  isStaffOnlyPath,
  resolveRealmForUser,
} from "@/lib/auth/user-realm";
import { ADMIN_ROLES } from "@/lib/admin-auth";
import { stripLocale } from "@/lib/i18n/strip-locale";
import { isMetadataRoute } from "@/lib/routing/metadata-routes";

const handleIntl = createIntlMiddleware(routing);

// ============================================
// ROUTE PROTECTION CONFIGURATION
// ============================================

const protectedPrefixes = ["/app", "/account"];
const authPrefixes = ["/login", "/signup", "/sign-in", "/sign-up"];
const adminPrefixes = ["/admin"];

export async function proxy(request: NextRequest) {
  const { pathname: rawPathname } = request.nextUrl;
  const pathname = stripLocale(rawPathname);

  // Favicon / OG / manifest — never locale-prefix or run auth redirects
  if (isMetadataRoute(pathname) || isMetadataRoute(rawPathname)) {
    return NextResponse.next();
  }

  const intlResponse = handleIntl(request);

  if (
    rawPathname.startsWith("/auth/callback") ||
    rawPathname.startsWith("/auth/confirm") ||
    rawPathname.startsWith("/auth/auth-code-error")
  ) {
    return NextResponse.next();
  }

  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthRoute = authPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAdminRoute = adminPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  let response = intlResponse;

  const url = getSupabaseUrl();
  const apiKey = getSupabaseServerApiKey();

  if (!url || !apiKey) {
    return response;
  }

  const supabase = createServerClient(url, apiKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options?: Parameters<typeof response.cookies.set>[2];
        }>,
      ) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const hasAdminEmail = isAdminEmail(user?.email);

  const localizedPath = (path: string, localeOverride?: string) => {
    const locale =
      localeOverride ??
      request.headers.get("x-next-intl-locale") ??
      routing.defaultLocale;
    if (locale === routing.defaultLocale) return path;
    return `/${locale}${path}`;
  };

  if (isAdminRoute && !user) {
    const redirectUrl = new URL(localizedPath("/login"), request.url);
    redirectUrl.searchParams.set("redirect", rawPathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAdminRoute && user) {
    const { data: membership } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("status", "active")
      .in("role", [...ADMIN_ROLES])
      .maybeSingle();

    if (!membership && !hasAdminEmail) {
      const redirectUrl = new URL(localizedPath("/account"), request.url);
      redirectUrl.searchParams.set("error", "admin_required");
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Staff must use /admin/* — block merchant account and /app surfaces
  if (user && isStaffOnlyPath(pathname)) {
    const realm = await resolveRealmForUser(supabase, user);
    if (realm === "admin") {
      const redirectUrl = new URL(
        localizedPath(getHomePathForRealm("admin")),
        request.url,
      );
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Merchants must not access admin routes (handled above for unauthenticated)
  if (user && isAdminPath(pathname)) {
    const realm = await resolveRealmForUser(supabase, user);
    if (realm === "merchant") {
      const redirectUrl = new URL(
        localizedPath(getHomePathForRealm("merchant")),
        request.url,
      );
      redirectUrl.searchParams.set("error", "admin_required");
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL(localizedPath("/login"), request.url);
    redirectUrl.searchParams.set("redirect", rawPathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && user && pathname !== "/app") {
    const realm = await resolveRealmForUser(supabase, user);

    let preferredLocale: string | null = null;
    const { data: settings } = await supabase
      .from("user_settings")
      .select("language")
      .eq("user_id", user.id)
      .maybeSingle();

    if (settings?.language && hasLocale(routing.locales, settings.language)) {
      preferredLocale = settings.language;
    }

    const destination = localizedPath(
      getHomePathForRealm(realm),
      preferredLocale ?? undefined,
    );
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (pathname.startsWith("/api/user")) {
    response.headers.set(
      "Cache-Control",
      "private, max-age=300, stale-while-revalidate=60",
    );
  }

  if (pathname.startsWith("/api/products")) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=900, stale-while-revalidate=300",
    );
  }

  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/account/password") ||
    request.method !== "GET"
  ) {
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate",
    );
  }

  if (pathname.startsWith("/api/")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: [
    // Skip API, static assets, metadata routes, and files with extensions
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|icon|apple-icon|opengraph-image|twitter-image|manifest|sitemap|robots|icons|.*\\..*).*)",
  ],
};
