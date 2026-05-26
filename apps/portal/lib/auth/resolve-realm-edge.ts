import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin-email";
import { isPlatformStaffRole } from "@/lib/admin/platform-tenant";
import type { UserRealm } from "@/lib/auth/user-realm";

/**
 * Edge-safe realm resolution for proxy/middleware only.
 * No imports from admin-auth or @/lib/supabase/server (those break Netlify edge).
 *
 * Order: allowlisted email → JWT custom claims → default merchant.
 * Skips DB membership lookups so middleware stays within Netlify edge limits.
 */
function realmFromJwtClaims(
  claims: Record<string, unknown> | undefined,
): UserRealm | null {
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

export async function resolveRealmForUserEdge(
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
    // Fall through — layouts/API re-check with full server resolver if needed.
  }

  return "merchant";
}
