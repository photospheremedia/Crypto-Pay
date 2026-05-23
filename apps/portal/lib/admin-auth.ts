import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin-email";

// ============================================
// ROLE HIERARCHY (highest to lowest)
// ============================================
// rhs_admin (Super Admin) - Full control, can see everything
// admin     - Tenant admin, full control within tenant
// owner     - Business owner, can manage their business
// staff     - Limited access, can handle leads/orders

export const ROLE_HIERARCHY = {
  rhs_admin: 5,  // Highest - Super admin
  admin: 4,
  owner: 3,
  manager: 2,
  staff: 1,
} as const;

export const ADMIN_ROLES = ["rhs_admin", "admin", "owner", "manager", "staff"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

// Permissions by role
export const ROLE_PERMISSIONS = {
  rhs_admin: {
    canManageAllTenants: true,
    canManageStaff: true,
    canViewAllLeads: true,
    canViewAllOrders: true,
    canViewAnalytics: true,
    canViewAuditLogs: true,
    canManageSettings: true,
    canImpersonate: true,
  },
  admin: {
    canManageAllTenants: false,
    canManageStaff: true,
    canViewAllLeads: true,
    canViewAllOrders: true,
    canViewAnalytics: true,
    canViewAuditLogs: true,
    canManageSettings: true,
    canImpersonate: false,
  },
  owner: {
    canManageAllTenants: false,
    canManageStaff: true,
    canViewAllLeads: true,
    canViewAllOrders: true,
    canViewAnalytics: true,
    canViewAuditLogs: false,
    canManageSettings: true,
    canImpersonate: false,
  },
  manager: {
    canManageAllTenants: false,
    canManageStaff: false,
    canViewAllLeads: true,
    canViewAllOrders: true,
    canViewAnalytics: true,
    canViewAuditLogs: false,
    canManageSettings: false,
    canImpersonate: false,
  },
  staff: {
    canManageAllTenants: false,
    canManageStaff: false,
    canViewAllLeads: true,
    canViewAllOrders: true,
    canViewAnalytics: false,
    canViewAuditLogs: false,
    canManageSettings: false,
    canImpersonate: false,
  },
} as const;

export type Permission = keyof typeof ROLE_PERMISSIONS.rhs_admin;

// Check if user has admin access
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
      role: "rhs_admin" as const,
      tenantId: null,
      isAdmin: true,
      isSuperAdmin: true,
      permissions: ROLE_PERMISSIONS.rhs_admin,
      roleLevel: ROLE_HIERARCHY.rhs_admin,
    };
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("role, tenant_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .in("role", ADMIN_ROLES)
    .maybeSingle();

  if (!membership) {
    return { user, role: null, isAdmin: false, isSuperAdmin: false, permissions: null };
  }

  const role = membership.role as AdminRole;
  const isSuperAdmin = role === "rhs_admin";

  return {
    user,
    role,
    tenantId: membership.tenant_id,
    isAdmin: true,
    isSuperAdmin,
    permissions: ROLE_PERMISSIONS[role],
    roleLevel: ROLE_HIERARCHY[role],
  };
}

// Check if user has specific permission
export async function hasPermission(permission: Permission): Promise<boolean> {
  const { permissions } = await checkAdminAccess();
  return permissions?.[permission] ?? false;
}

// Check if user can manage another user's role
export function canManageRole(managerRole: AdminRole, targetRole: AdminRole): boolean {
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
}

// Higher-order function for admin API routes
export function withAdminAuth(
  handler: (
    req: Request,
    context: { 
      user: NonNullable<Awaited<ReturnType<typeof checkAdminAccess>>["user"]>; 
      role: AdminRole;
      isSuperAdmin: boolean;
      permissions: (typeof ROLE_PERMISSIONS)[AdminRole];
    }
  ) => Response | Promise<Response>
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

// Super admin only wrapper
export function withSuperAdminAuth(
  handler: (
    req: Request,
    context: { 
      user: NonNullable<Awaited<ReturnType<typeof checkAdminAccess>>["user"]>; 
    }
  ) => Response | Promise<Response>
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
