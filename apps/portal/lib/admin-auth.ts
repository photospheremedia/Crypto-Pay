import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin-email";

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

export async function checkAdminAccess() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const { data: membership } = await supabase
    .from("memberships")
    .select("role, tenant_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .in("role", [...ADMIN_ROLES])
    .maybeSingle();

  if (!membership) {
    return { user, role: null, isAdmin: false, isSuperAdmin: false, permissions: null };
  }

  const role = membership.role as AdminRole;
  const permissions = ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.staff;

  return {
    user,
    role,
    tenantId: membership.tenant_id,
    isAdmin: true,
    isSuperAdmin: isSuperAdminRole(role),
    permissions,
    roleLevel: ROLE_HIERARCHY[role] ?? 0,
  };
}

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
