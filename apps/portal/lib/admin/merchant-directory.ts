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

/** Playwright / QA signups that create real auth users but are not real merchants. */
export function isTestMerchantEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (
    /@playwright\.test$/i.test(normalized) ||
    /^qa-signup-\d+@/i.test(normalized) ||
    /^lead-\d+@playwright\.test$/i.test(normalized)
  );
}

function shouldHideTestMerchants(): boolean {
  return process.env.ADMIN_SHOW_TEST_MERCHANTS !== "1";
}

/** Merchant accounts only — excludes staff, admin allowlist, and (by default) QA test signups. */
export function filterMerchantProfiles<T extends { id: string; email?: string | null }>(
  profiles: T[],
  staffUserIds: Set<string>,
): T[] {
  return profiles.filter((p) => {
    if (isStaffAccount(p, staffUserIds)) return false;
    if (shouldHideTestMerchants() && isTestMerchantEmail(p.email)) return false;
    return true;
  });
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
