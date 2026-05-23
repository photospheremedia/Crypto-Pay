export const TENANT_ROLES = [
  "owner",
  "manager",
  "staff",
  "rhs_admin",
] as const;

export type TenantRole = (typeof TENANT_ROLES)[number];
