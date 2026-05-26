import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { checkAdminAccess } from "@/lib/admin-auth";
import {
  ADMIN_HOME_PATH,
  MERCHANT_HOME_PATH,
  resolveRealmForUser,
  type UserRealm,
} from "@/lib/auth/user-realm";

export type VerifiedSession = {
  user: User;
  realm: UserRealm;
};

/**
 * Next.js DAL: verify authentication + platform realm (admin vs merchant).
 * @see https://nextjs.org/docs/app/guides/authentication
 */
export async function verifySession(): Promise<VerifiedSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const realm = await resolveRealmForUser(supabase, user);
  return { user, realm };
}

/** Staff-only routes (`/admin/*`). Redirects merchants; sends anonymous users to login. */
export async function requireAdminSession() {
  const access = await checkAdminAccess();

  if (!access.user) {
    redirect(`/login?redirect=${encodeURIComponent(ADMIN_HOME_PATH)}`);
  }

  if (!access.isAdmin) {
    redirect(`${MERCHANT_HOME_PATH}?error=admin_required`);
  }

  return {
    user: access.user,
    realm: "admin" as const,
    role: access.role,
    isSuperAdmin: access.isSuperAdmin,
    permissions: access.permissions,
  };
}

/** Merchant-only routes (`/account/*`, merchant server actions). Staff → admin home. */
export async function requireMerchantSession(): Promise<VerifiedSession> {
  const session = await verifySession();

  if (!session) {
    redirect(`/login?redirect=${encodeURIComponent(MERCHANT_HOME_PATH)}`);
  }

  if (session.realm === "admin") {
    redirect(ADMIN_HOME_PATH);
  }

  return session;
}
