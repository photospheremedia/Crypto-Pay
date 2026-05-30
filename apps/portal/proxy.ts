import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  getSupabaseServerApiKey,
  getSupabaseUrl,
} from "@crypto-pay/db/supabaseEnv";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { resolveRealmForUserEdge } from "@/lib/auth/resolve-realm-edge";
import {
  getHomePathForRealm,
  isAdminPath,
  isStaffOnlyPath,
  type UserRealm,
} from "@/lib/auth/user-realm";
import { hasSupabaseSessionCookie } from "@/lib/auth/has-supabase-session-cookie";
import {
  stripLocaleCookieFromRequest,
  stripLocaleCookieFromResponse,
} from "@/lib/i18n/functional-consent-cookie";
import { mergeIntlMiddlewareResponse } from "@/lib/i18n/merge-intl-middleware-response";
import {
  readLocaleCookie,
  syncLocaleCookieWithResolvedLocale,
} from "@/lib/i18n/sync-locale-cookie";
import { localizeAppPath } from "@/lib/i18n/locale-preference";
import { shouldRedirectToAccountLocale } from "@/lib/i18n/account-locale-policy";
import { redirectWithProxyCookies } from "@/lib/proxy/finalize-proxy-response";
import { getLocaleFromPathname, stripLocale } from "@/lib/i18n/strip-locale";
import { isMetadataRoute } from "@/lib/routing/metadata-routes";

const handleIntl = createIntlMiddleware(routing);

const protectedPrefixes = ["/app", "/account"];
const authPrefixes = ["/login", "/signup", "/sign-in", "/sign-up"];
const adminPrefixes = ["/admin"];

export async function proxy(request: NextRequest) {
  try {
    return await handleProxy(request);
  } catch (error) {
    console.error("[proxy] middleware error:", error);
    return handleIntl(request);
  }
}

async function handleProxy(request: NextRequest) {
  const { pathname: rawPathname } = request.nextUrl;
  const pathname = stripLocale(rawPathname);

  if (isMetadataRoute(pathname) || isMetadataRoute(rawPathname)) {
    return NextResponse.next();
  }

  stripLocaleCookieFromRequest(request);

  const intlResponse = handleIntl(request);
  stripLocaleCookieFromResponse(request, intlResponse);
  syncLocaleCookieWithResolvedLocale(request, intlResponse);

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
        mergeIntlMiddlewareResponse(intlResponse, response);
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        stripLocaleCookieFromResponse(request, response);
      },
    },
  });

  const shouldResolveUser =
    isProtectedRoute ||
    isAdminRoute ||
    isAuthRoute ||
    hasSupabaseSessionCookie(request);

  let user: Awaited<
    ReturnType<typeof supabase.auth.getUser>
  >["data"]["user"] = null;

  if (shouldResolveUser) {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  const localizedPath = (path: string) => {
    const locale =
      request.headers.get("x-next-intl-locale") ?? routing.defaultLocale;
    if (locale === routing.defaultLocale) return path;
    return `/${locale}${path}`;
  };

  if (isAdminRoute && !user) {
    const redirectUrl = new URL(localizedPath("/login"), request.url);
    redirectUrl.searchParams.set("redirect", rawPathname);
    return redirectWithProxyCookies(request, redirectUrl, response, intlResponse);
  }

  const needsRealm =
    !!user &&
    (isAdminRoute ||
      isAdminPath(pathname) ||
      isStaffOnlyPath(pathname) ||
      (isAuthRoute && pathname !== "/app"));

  let realm: UserRealm | null = null;
  if (needsRealm && user) {
    realm = await resolveRealmForUserEdge(supabase, user);
  }

  if (isAdminRoute && user && realm !== "admin") {
    const redirectUrl = new URL(localizedPath("/account"), request.url);
    redirectUrl.searchParams.set("error", "admin_required");
    return redirectWithProxyCookies(request, redirectUrl, response, intlResponse);
  }

  if (user && isStaffOnlyPath(pathname) && realm === "admin") {
    const redirectUrl = new URL(
      localizedPath(getHomePathForRealm("admin")),
      request.url,
    );
    return redirectWithProxyCookies(request, redirectUrl, response, intlResponse);
  }

  if (user && isAdminPath(pathname) && realm === "merchant") {
    const redirectUrl = new URL(
      localizedPath(getHomePathForRealm("merchant")),
      request.url,
    );
    redirectUrl.searchParams.set("error", "admin_required");
    return redirectWithProxyCookies(request, redirectUrl, response, intlResponse);
  }

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL(localizedPath("/login"), request.url);
    redirectUrl.searchParams.set("redirect", rawPathname);
    return redirectWithProxyCookies(request, redirectUrl, response, intlResponse);
  }

  const justSignedOut = request.nextUrl.searchParams.get("signedOut") === "1";
  const urlLocale = getLocaleFromPathname(rawPathname);

  // Logged-in user on an auth route → send to their dashboard in the saved locale.
  if (isAuthRoute && user && pathname !== "/app" && realm && !justSignedOut) {
    const preferredLocale = readLocaleCookie(request);
    const home = getHomePathForRealm(realm);
    const destination = preferredLocale
      ? localizeAppPath(preferredLocale, home)
      : localizedPath(home);
    return redirectWithProxyCookies(
      request,
      new URL(destination, request.url),
      response,
      intlResponse,
    );
  }

  // Unprefixed account/admin deep link (manual URL, bookmark, email) → redirect once
  // to the saved locale from the NEXT_LOCALE cookie. Prefixed URLs are explicit and
  // never overridden, so the common case is cookie-free and there is no redirect loop.
  if (user && urlLocale === null && (isProtectedRoute || isAdminRoute)) {
    const preferredLocale = readLocaleCookie(request);
    if (
      preferredLocale &&
      shouldRedirectToAccountLocale(rawPathname, preferredLocale)
    ) {
      const redirectUrl = new URL(
        localizeAppPath(preferredLocale, pathname),
        request.url,
      );
      redirectUrl.search = request.nextUrl.search;
      return redirectWithProxyCookies(
        request,
        redirectUrl,
        response,
        intlResponse,
      );
    }
  }

  stripLocaleCookieFromResponse(request, response);
  syncLocaleCookieWithResolvedLocale(request, response);
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.svg|icon|apple-icon|opengraph-image|twitter-image|manifest|sitemap|robots|icons|.*\\..*).*)",
  ],
};
