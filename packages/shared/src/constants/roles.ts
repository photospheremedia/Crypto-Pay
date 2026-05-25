/** Crypto Pay platform + merchant roles */
export const PLATFORM_SUPER_ADMIN_ROLES = ["cp_admin", "rhs_admin"] as const;

export const TENANT_ROLES = [
  "owner",
  "manager",
  "staff",
  "admin",
  "cp_admin",
  /** @deprecated legacy Restaurant Hub name — migrated to cp_admin in DB */
  "rhs_admin",
] as const;

export type TenantRole = (typeof TENANT_ROLES)[number];
