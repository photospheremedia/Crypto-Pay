/** Platform staff tenant — not merchant org tenants. */
export const PLATFORM_ADMIN_TENANT_SLUG = "crypto-pay-admin";

/** Roles on `crypto-pay-admin` that grant /admin access. */
export const PLATFORM_STAFF_ROLES = [
  "cp_admin",
  "rhs_admin",
  "admin",
  "manager",
  "staff",
] as const;

export type PlatformStaffRole = (typeof PLATFORM_STAFF_ROLES)[number];

const PLATFORM_STAFF_ROLE_SET = new Set<string>(PLATFORM_STAFF_ROLES);

export function isPlatformStaffRole(role: string | null | undefined): boolean {
  return !!role && PLATFORM_STAFF_ROLE_SET.has(role);
}
