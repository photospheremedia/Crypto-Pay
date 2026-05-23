import type { TenantRole } from "../constants/roles";

export type TenantStatus = "active" | "suspended" | "deleted";
export type MembershipStatus = "active" | "inactive";

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  created_at: string;
};

export type Membership = {
  id: string;
  tenant_id: string;
  user_id: string;
  role: TenantRole;
  status: MembershipStatus;
  created_at: string;
  tenants?: Tenant;
};

export type AuditLog = {
  id: string;
  tenant_id: string | null;
  actor_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  diff_json: Record<string, unknown> | null;
  created_at: string;
};
