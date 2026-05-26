import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ACCOUNT_WALLET_SETUP_PATH } from "@/lib/account/paths";
import { isPlatformStaffRole } from "@/lib/admin/platform-tenant";
import { isAdminEmail } from "@/lib/admin-email";
import {
  PLATFORM_ADMIN_TENANT_SLUG,
  PLATFORM_STAFF_ROLES,
} from "@/lib/admin/platform-tenant";

/**
 * Platform realms (UI + routing). Enforced in proxy, layouts, and server actions.
 * Database access must still rely on RLS (`is_cp_admin()`, row ownership) — never UI alone.
 *
 * @see Supabase custom claims: `custom_access_token_hook` → JWT `user_role`, `platform_realm`
 * @see Next.js auth DAL: `lib/auth/session.ts`
 */

/** Staff/platform admin surface — separate from merchant account area */
export type UserRealm = "admin" | "merchant";

export const ADMIN_HOME_PATH = "/admin/dashboard";
export const MERCHANT_HOME_PATH = "/account";

export function getHomePathForRealm(realm: UserRealm): string {
  return realm === "admin" ? ADMIN_HOME_PATH : MERCHANT_HOME_PATH;
}

export function pathBase(path: string): string {
  return path.split("?")[0] || path;
}

export function isAdminPath(pathname: string): boolean {
  const base = pathBase(pathname);
  return base === "/admin" || base.startsWith("/admin/");
}

export function isMerchantAccountPath(pathname: string): boolean {
  const base = pathBase(pathname);
  return base === "/account" || base.startsWith("/account/");
}

export function isMerchantAppPath(pathname: string): boolean {
  const base = pathBase(pathname);
  return base === "/app" || base.startsWith("/app/");
}

/**
 * Whether a post-login redirect target is allowed for this realm.
 * Rejects open redirects and cross-realm paths.
 */
export function isPathAllowedForRealm(pathname: string, realm: UserRealm): boolean {
  const base = pathBase(pathname);

  if (!base.startsWith("/") || base.startsWith("//")) {
    return false;
  }

  if (realm === "admin") {
    return isAdminPath(pathname);
  }

  if (isAdminPath(pathname)) {
    return false;
  }

  if (isMerchantAccountPath(pathname)) {
    return true;
  }

  if (isMerchantAppPath(pathname)) {
    return true;
  }

  return false;
}

export function sanitizePostAuthRedirect(
  requested: string | null | undefined,
  realm: UserRealm,
): string {
  if (!requested || typeof requested !== "string") {
    return getHomePathForRealm(realm);
  }

  const trimmed = requested.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("://") ||
    trimmed.includes("\\")
  ) {
    return getHomePathForRealm(realm);
  }

  if (!isPathAllowedForRealm(trimmed, realm)) {
    return getHomePathForRealm(realm);
  }

  return trimmed;
}

export function merchantOnboardingPath(): string {
  return ACCOUNT_WALLET_SETUP_PATH;
}

function realmFromJwtClaims(claims: Record<string, unknown> | undefined): UserRealm | null {
  if (!claims) return null;

  const platformRealm = claims.platform_realm;
  if (platformRealm === "admin" || platformRealm === "merchant") {
    return platformRealm;
  }

  const jwtRole = claims.user_role;
  if (typeof jwtRole === "string" && jwtRole !== "null" && isPlatformStaffRole(jwtRole)) {
    return "admin";
  }

  if (jwtRole === null || jwtRole === "null") {
    return "merchant";
  }

  return null;
}

/** Resolve realm: allowlisted email → active staff membership → JWT claims (server). */
export async function resolveRealmForUser(
  supabase: SupabaseClient,
  user: Pick<User, "id" | "email">,
): Promise<UserRealm> {
  if (isAdminEmail(user.email)) {
    return "admin";
  }

  try {
    const { data: claimsData } = await supabase.auth.getClaims();
    const fromJwt = realmFromJwtClaims(
      claimsData?.claims as Record<string, unknown> | undefined,
    );
    if (fromJwt) {
      return fromJwt;
    }
  } catch {
    // JWT claims unavailable — fall back to membership lookup
  }

  try {
    const { data: membership } = await supabase
      .from("memberships")
      .select("role, tenants!inner(slug)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .eq("tenants.slug", PLATFORM_ADMIN_TENANT_SLUG)
      .in("role", [...PLATFORM_STAFF_ROLES])
      .order("role", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (membership && isPlatformStaffRole(membership.role)) {
      return "admin";
    }
  } catch (error) {
    console.error("[resolveRealmForUser] membership lookup failed:", error);
  }

  return "merchant";
}

/** True when staff must not use merchant /account or /app routes */
export function isStaffOnlyPath(pathname: string): boolean {
  return isMerchantAccountPath(pathname) || isMerchantAppPath(pathname);
}
