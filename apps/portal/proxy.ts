import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { isAdminEmail } from "@/lib/admin-email";
import { stripLocale } from "@/lib/i18n/strip-locale";

const handleIntl = createIntlMiddleware(routing);

// ============================================
// ROUTE PROTECTION CONFIGURATION
// ============================================

const protectedPrefixes = ["/app", "/account"];
const authPrefixes = ["/login", "/signup", "/sign-in", "/sign-up"];
const adminPrefixes = ["/admin"];
const ADMIN_ROLES = ["cp_admin", "rhs_admin", "admin", "owner", "manager", "staff"];

export async function proxy(request: NextRequest) {
  const intlResponse = handleIntl(request);

  const { pathname: rawPathname } = request.nextUrl;

  if (
    rawPathname.startsWith("/auth/callback") ||
    rawPathname.startsWith("/auth/confirm")
  ) {
    return intlResponse;
  }

  const pathname = stripLocale(rawPathname);

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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
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

  const localizedPath = (path: string) => {
    const locale = request.headers.get("x-next-intl-locale") ?? routing.defaultLocale;
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
      .in("role", ADMIN_ROLES)
      .maybeSingle();

    if (!membership && !hasAdminEmail) {
      const redirectUrl = new URL(localizedPath("/account"), request.url);
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
    const { data: membership } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("status", "active")
      .in("role", ADMIN_ROLES)
      .maybeSingle();

    const destination =
      membership || hasAdminEmail
        ? localizedPath("/admin/dashboard")
        : localizedPath("/account");
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

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
