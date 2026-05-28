import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";
import {
  MERCHANT_WALLETS_CACHE_TAG,
  merchantWalletsCacheTag,
} from "@/lib/account/merchant-data";
import {
  ADMIN_HOME_PATH,
  MERCHANT_HOME_PATH,
  resolveRealmForUser,
  type UserRealm,
} from "@/lib/auth/user-realm";
import { createClient } from "@/lib/supabase/server";

function loginPath(homePath: string): string {
  const params = new URLSearchParams({
    signedOut: "1",
    redirect: homePath,
  });
  return `/login?${params.toString()}`;
}

function invalidateAuthCaches(userId?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/api/user");
  if (userId) {
    revalidateTag(MERCHANT_WALLETS_CACHE_TAG, { expire: 0 });
    revalidateTag(merchantWalletsCacheTag(userId), { expire: 0 });
  }
}

async function recordAdminLogout(user: {
  id: string;
  email?: string | null;
}) {
  try {
    const service = getSupabaseServiceClient();
    await service.from("audit_logs").insert({
      user_id: user.id,
      user_email: user.email ?? null,
      action: "logout",
      resource_type: "session",
      resource_id: user.id,
      description: "Staff signed out from admin console",
      metadata: { realm: "admin" },
    });
  } catch (error) {
    console.error("[signOut] admin audit log failed:", error);
  }
}

/**
 * Signs out the current browser session and redirects to login for the given realm.
 * Rejects cross-realm sign-out attempts (same Supabase session, different UI surfaces).
 */
export async function signOutForRealm(expectedRealm: UserRealm): Promise<never> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const homePath =
    expectedRealm === "admin" ? ADMIN_HOME_PATH : MERCHANT_HOME_PATH;

  if (!user) {
    redirect(loginPath(homePath));
  }

  const realm = await resolveRealmForUser(supabase, user);

  if (realm !== expectedRealm) {
    redirect(realm === "admin" ? ADMIN_HOME_PATH : MERCHANT_HOME_PATH);
  }

  // Admin: revoke all sessions. Merchant: this browser only (Supabase sign-out scopes).
  const scope = expectedRealm === "admin" ? "global" : "local";
  const { error } = await supabase.auth.signOut({ scope });
  if (error) {
    console.error(`[signOut:${expectedRealm}]`, error.message);
  }

  if (expectedRealm === "admin") {
    await recordAdminLogout(user);
  }

  invalidateAuthCaches(user.id);
  redirect(loginPath(homePath));
}
