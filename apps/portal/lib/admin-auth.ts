import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";
import { isAdminEmail } from "@/lib/admin-email";
import {
  isPlatformStaffRole,
  PLATFORM_ADMIN_TENANT_SLUG,
  PLATFORM_STAFF_ROLES,
} from "@/lib/admin/platform-tenant";

/** Crypto Pay platform super-admin (legacy DB value: rhs_admin) */
export const SUPER_ADMIN_ROLES = ["cp_admin", "rhs_admin"] as const;

export const ROLE_HIERARCHY = {
  cp_admin: 5,
  rhs_admin: 5,
  admin: 4,
  owner: 3,
  manager: 2,
  staff: 1,
} as const;

export const ADMIN_ROLES = [
  "cp_admin",
  "rhs_admin",
  "admin",
  "owner",
  "manager",
  "staff",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

const ADMIN_ROLE_SET = new Set<string>(ADMIN_ROLES);

/** True for platform staff roles on `crypto-pay-admin` (not merchant tenant `owner`). */
export function isStaffRole(role: string | null | undefined): boolean {
  return isPlatformStaffRole(role);
}

const superAdminPermissions = {
  canManageAllTenants: true,
  canManageStaff: true,
  canViewAllLeads: true,
  canViewMerchants: true,
  canViewAnalytics: true,
  canViewAuditLogs: true,
  canManageSettings: true,
  canImpersonate: true,
} as const;

export const ROLE_PERMISSIONS = {
  cp_admin: superAdminPermissions,
  rhs_admin: superAdminPermissions,
  admin: {
    canManageAllTenants: false,
    canManageStaff: true,
    canViewAllLeads: true,
    canViewMerchants: true,
    canViewAnalytics: true,
    canViewAuditLogs: true,
    canManageSettings: true,
    canImpersonate: false,
  },
  owner: {
    canManageAllTenants: false,
    canManageStaff: true,
    canViewAllLeads: true,
    canViewMerchants: true,
    canViewAnalytics: true,
    canViewAuditLogs: false,
    canManageSettings: true,
    canImpersonate: false,
  },
  manager: {
    canManageAllTenants: false,
    canManageStaff: false,
    canViewAllLeads: true,
    canViewMerchants: true,
    canViewAnalytics: true,
    canViewAuditLogs: false,
    canManageSettings: false,
    canImpersonate: false,
  },
  staff: {
    canManageAllTenants: false,
    canManageStaff: false,
    canViewAllLeads: true,
    canViewMerchants: false,
    canViewAnalytics: false,
    canViewAuditLogs: false,
    canManageSettings: false,
    canImpersonate: false,
  },
} as const;

export type Permission = keyof typeof superAdminPermissions;

export function isSuperAdminRole(role: string | null | undefined): boolean {
  return role === "cp_admin" || role === "rhs_admin";
}

function staffAccessFromJwtRole(jwtRole: string) {
  if (!ADMIN_ROLE_SET.has(jwtRole)) return null;
  const role = jwtRole as AdminRole;
  return {
    role,
    tenantId: null as string | null,
    isAdmin: true as const,
    isSuperAdmin: isSuperAdminRole(role),
    permissions: ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.staff,
    roleLevel: ROLE_HIERARCHY[role] ?? 0,
  };
}

async function resolveAdminRoleFromDb(userId: string) {
  const supabase = getSupabaseServiceClient();
  const { data: membership } = await supabase
    .from("memberships")
    .select("role, tenant_id, tenants!inner(slug)")
    .eq("user_id", userId)
    .eq("status", "active")
    .eq("tenants.slug", PLATFORM_ADMIN_TENANT_SLUG)
    .in("role", [...PLATFORM_STAFF_ROLES])
    .order("role", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return {
      role: null,
      tenantId: null,
      isAdmin: false,
      isSuperAdmin: false,
      permissions: null,
      roleLevel: 0,
    };
  }

  const role = membership.role as AdminRole;
  const permissions = ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.staff;

  return {
    role,
    tenantId: membership.tenant_id,
    isAdmin: true as const,
    isSuperAdmin: isSuperAdminRole(role),
    permissions,
    roleLevel: ROLE_HIERARCHY[role] ?? 0,
  };
}

function getCachedAdminRoleFromDb(userId: string) {
  return unstable_cache(
    () => resolveAdminRoleFromDb(userId),
    ["admin-role-db", userId],
    { revalidate: 60, tags: [`admin-role-${userId}`] },
  )();
}

export const checkAdminAccess = cache(async () => {
  const supabase = await createClient();

  const [userResult, claimsResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getClaims().catch(() => ({ data: null as { claims?: Record<string, unknown> } | null })),
  ]);

  const user = userResult.data.user;

  if (!user) {
    return { user: null, role: null, isAdmin: false, isSuperAdmin: false, permissions: null };
  }

  if (isAdminEmail(user.email)) {
    return {
      user,
      role: "cp_admin" as const,
      tenantId: null,
      isAdmin: true,
      isSuperAdmin: true,
      permissions: ROLE_PERMISSIONS.cp_admin,
      roleLevel: ROLE_HIERARCHY.cp_admin,
    };
  }

  const jwtRole = claimsResult.data?.claims?.user_role;
  if (typeof jwtRole === "string" && isPlatformStaffRole(jwtRole)) {
    const fromJwt = staffAccessFromJwtRole(jwtRole);
    if (fromJwt) {
      return { user, ...fromJwt };
    }
  }

  const fromDb = await getCachedAdminRoleFromDb(user.id);
  return { user, ...fromDb };
});

export async function hasPermission(permission: Permission): Promise<boolean> {
  const { permissions } = await checkAdminAccess();
  return permissions?.[permission] ?? false;
}

export function canManageRole(managerRole: AdminRole, targetRole: AdminRole): boolean {
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
}

export function withAdminAuth(
  handler: (
    req: Request,
    context: {
      user: NonNullable<Awaited<ReturnType<typeof checkAdminAccess>>["user"]>;
      role: AdminRole;
      isSuperAdmin: boolean;
      permissions: (typeof ROLE_PERMISSIONS)[AdminRole];
    },
  ) => Response | Promise<Response>,
) {
  return async (req: Request): Promise<Response> => {
    const { user, role, isAdmin, isSuperAdmin, permissions } = await checkAdminAccess();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdmin || !role || !permissions) {
      return Response.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    return handler(req, { user, role, isSuperAdmin, permissions });
  };
}

export function withSuperAdminAuth(
  handler: (
    req: Request,
    context: {
      user: NonNullable<Awaited<ReturnType<typeof checkAdminAccess>>["user"]>;
    },
  ) => Response | Promise<Response>,
) {
  return async (req: Request): Promise<Response> => {
    const { user, isSuperAdmin } = await checkAdminAccess();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isSuperAdmin) {
      return Response.json({ error: "Forbidden - Super Admin access required" }, { status: 403 });
    }

    return handler(req, { user });
  };
}
