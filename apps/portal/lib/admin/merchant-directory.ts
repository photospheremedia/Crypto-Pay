import type { SupabaseClient } from "@supabase/supabase-js";
import { ADMIN_ROLES } from "@/lib/admin-auth";
import { isAdminEmail } from "@/lib/admin-email";

export type MerchantProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  created_at: string;
  updated_at: string | null;
};

/** Active staff membership user ids (platform admin roles). */
export async function getStaffUserIds(
  supabase: SupabaseClient,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("memberships")
    .select("user_id")
    .eq("status", "active")
    .in("role", [...ADMIN_ROLES]);

  if (error) {
    console.error("[merchant-directory] staff lookup error:", error);
    return new Set();
  }

  return new Set((data ?? []).map((row) => row.user_id));
}

export function isStaffAccount(
  profile: { id: string; email?: string | null },
  staffUserIds: Set<string>,
): boolean {
  if (staffUserIds.has(profile.id)) return true;
  if (isAdminEmail(profile.email)) return true;
  return false;
}

/** Merchant accounts only — excludes staff memberships and admin allowlist emails. */
export function filterMerchantProfiles<T extends { id: string; email?: string | null }>(
  profiles: T[],
  staffUserIds: Set<string>,
): T[] {
  return profiles.filter((p) => !isStaffAccount(p, staffUserIds));
}

export async function assertMerchantAccount(
  supabase: SupabaseClient,
  targetUserId: string,
  profileEmail?: string | null,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const staffUserIds = await getStaffUserIds(supabase);

  if (isStaffAccount({ id: targetUserId, email: profileEmail }, staffUserIds)) {
    return {
      ok: false,
      status: 403,
      error: "This account is a staff user, not a merchant. Manage staff under Admin → Staff.",
    };
  }

  return { ok: true };
}
