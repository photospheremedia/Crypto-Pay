import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ============================================
// ROUTE PROTECTION CONFIGURATION
// ============================================

// Routes that require any authenticated user
const protectedPrefixes = ["/app", "/account"];

// Routes for unauthenticated users only (login, signup)
const authPrefixes = ["/login", "/signup", "/sign-in", "/sign-up"];

// Routes that require ADMIN role (rhs_admin, admin, owner, staff)
const adminPrefixes = ["/admin"];

// Admin roles that can access /admin/* routes
const ADMIN_ROLES = ["rhs_admin", "admin", "owner", "manager", "staff"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip OAuth callback routes - they handle their own auth
  if (pathname.startsWith('/auth/callback') || pathname.startsWith('/auth/confirm')) {
    return NextResponse.next();
  }
  
  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const isAuthRoute = authPrefixes.some((prefix) => pathname.startsWith(prefix));
  const isAdminRoute = adminPrefixes.some((prefix) => pathname.startsWith(prefix));

  let response = NextResponse.next();

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
        cookiesToSet.forEach(({ name, value, options }) => {
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

  // ============================================
  // ADMIN ROUTE PROTECTION
  // ============================================
  // Admin routes require:
  // 1. User must be authenticated
  // 2. User must have an active membership with admin role

  if (isAdminRoute && !user) {
    // Not logged in → redirect to login
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAdminRoute && user) {
    // Check if user has admin role in memberships table
    const { data: membership } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", user.id)
      .eq("status", "active")
      .in("role", ADMIN_ROLES)
      .maybeSingle();

    if (!membership) {
      // User is authenticated but NOT an admin
      // Redirect to regular user account page with message
      const redirectUrl = new URL("/account", request.url);
      redirectUrl.searchParams.set("error", "admin_required");
      return NextResponse.redirect(redirectUrl);
    }
  }

  // ============================================
  // REGULAR USER ROUTE PROTECTION
  // ============================================
  // Protected routes require any authenticated user

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user && pathname !== "/app") {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  // ============================================
  // CACHING HEADERS
  // ============================================
  // Add appropriate cache headers based on route

  // Cache user data for a short time (5 minutes) - private cache
  if (pathname.startsWith('/api/user')) {
    response.headers.set('Cache-Control', 'private, max-age=300, stale-while-revalidate=60');
  }

  // Cache product data (15 minutes) - public cache
  if (pathname.startsWith('/api/products')) {
    response.headers.set('Cache-Control', 'public, max-age=900, stale-while-revalidate=300');
  }

  // No cache for auth, password, and mutations
  if (pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/account/password') ||
    request.method !== 'GET') {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
