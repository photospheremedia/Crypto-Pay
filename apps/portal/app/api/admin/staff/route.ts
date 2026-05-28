import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";
import { checkAdminAccess, canManageRole, ADMIN_ROLES, type AdminRole } from "@/lib/admin-auth";

// GET - List all users (staff, admins, and regular users)
export async function GET(req: NextRequest) {
  try {
    const { user, role, permissions } = await checkAdminAccess();
    
    if (!user || !role || !permissions) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!permissions.canManageStaff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const typeFilter = searchParams.get("type"); // 'all', 'admins', 'staff', 'customers'

    // Get all user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("id, email, full_name, avatar_url, role, created_at")
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("[Staff API] Profiles error:", profilesError);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    // Get memberships (all statuses) so UI can show active/inactive/suspended correctly.
    const { data: memberships, error: membershipsError } = await supabase
      .from("memberships")
      .select("id, user_id, tenant_id, role, status, created_at, tenants(name, slug)")
      .order("created_at", { ascending: false });

    if (membershipsError) {
      console.error("[Staff API] Memberships error:", membershipsError);
    }

    // Combine data and categorize users
    const users = profiles?.map(profile => {
      const userMemberships = (memberships ?? []).filter(
        (m) => m.user_id === profile.id,
      );
      const membership =
        userMemberships.find((m) => m.status === "active") ?? userMemberships[0];
      
      // Determine user type based on membership role
      let user_type = 'customer';
      let membership_role = null;
      let membership_status: string | null = null;
      let membership_id = null;
      
      if (membership) {
        membership_role = membership.role;
        membership_status = membership.status;
        membership_id = membership.id;
        
        if (membership.role === 'cp_admin' || membership.role === 'rhs_admin') {
          user_type = 'super_admin';
        } else if (membership.role === 'admin') {
          user_type = 'admin';
        } else if (membership.role === 'owner') {
          user_type = 'owner';
        } else if (membership.role === 'manager') {
          user_type = 'staff_member';
        } else if (membership.role === 'staff') {
          user_type = 'staff_member';
        }
      }

      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        profile_role: profile.role,
        user_type,
        membership_id,
        membership_role,
        membership_status,
        tenant: membership?.tenants,
        created_at: profile.created_at,
      };
    }) || [];

    // Apply type filter
    let filteredUsers = users;
    if (typeFilter === 'admins') {
      filteredUsers = users.filter(u => ['super_admin', 'admin', 'owner'].includes(u.user_type));
    } else if (typeFilter === 'staff') {
      filteredUsers = users.filter(u => u.user_type === 'staff_member');
    } else if (typeFilter === 'customers') {
      filteredUsers = users.filter(u => u.user_type === 'customer');
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(u =>
        u.email?.toLowerCase().includes(searchLower) ||
        u.full_name?.toLowerCase().includes(searchLower) ||
        u.user_type.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({ 
      success: true, 
      users: filteredUsers,
      total: filteredUsers.length,
      currentUserRole: role,
      stats: {
        total: users.length,
        super_admins: users.filter(u => u.user_type === 'super_admin').length,
        admins: users.filter(u => u.user_type === 'admin').length,
        owners: users.filter(u => u.user_type === 'owner').length,
        staff: users.filter(u => u.user_type === 'staff_member').length,
        customers: users.filter(u => u.user_type === 'customer').length,
      },
    });
  } catch (error) {
    console.error("[Staff API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Invite new staff member
export async function POST(req: NextRequest) {
  try {
    const { user, role, isSuperAdmin, permissions } = await checkAdminAccess();
    
    if (!user || !role || !permissions) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!permissions.canManageStaff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { email, newRole, tenantId } = body;

    if (!email || !newRole) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
    }

    // Check if current user can assign this role
    if (!canManageRole(role, newRole as AdminRole)) {
      return NextResponse.json({ 
        error: "You cannot assign a role equal to or higher than your own" 
      }, { status: 403 });
    }

    const supabase = await createClient();

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      // Check if they already have a membership
      const { data: existingMembership } = await supabase
        .from("memberships")
        .select("id, role")
        .eq("user_id", existingProfile.id)
        .eq("status", "active")
        .maybeSingle();

      if (existingMembership) {
        return NextResponse.json({ 
          error: `User already has ${existingMembership.role} access` 
        }, { status: 400 });
      }
    }

    // For now, we'll create a placeholder that will be linked when user signs up
    // In production, you'd send an invite email here
    
    // Log the action
    try {
      await getSupabaseServiceClient().rpc("log_audit_event", {
        p_action: "invite_staff",
        p_resource_type: "staff",
        p_description: `Invited ${email} as ${newRole}`,
        p_new_values: { email, role: newRole, tenant_id: tenantId },
      });
    } catch {
      // Audit log might not exist yet
    }

    return NextResponse.json({ 
      success: true, 
      message: `Invitation would be sent to ${email} (feature coming soon)`,
      // In production: send email via Resend
    });
  } catch (error) {
    console.error("[Staff API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update staff role or status
export async function PATCH(req: NextRequest) {
  try {
    const { user, role, permissions } = await checkAdminAccess();
    
    if (!user || !role || !permissions) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!permissions.canManageStaff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { membershipId, newRole, status } = body;

    if (!membershipId) {
      return NextResponse.json({ error: "Membership ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Get the target membership
    const { data: targetMembership } = await supabase
      .from("memberships")
      .select("user_id, role")
      .eq("id", membershipId)
      .single();

    if (!targetMembership) {
      return NextResponse.json({ error: "Membership not found" }, { status: 404 });
    }

    // Check if current user can manage this role
    if (!canManageRole(role, targetMembership.role as AdminRole)) {
      return NextResponse.json({ 
        error: "You cannot manage a user with equal or higher role" 
      }, { status: 403 });
    }

    // If changing role, verify the new role is allowed
    if (newRole && !canManageRole(role, newRole as AdminRole)) {
      return NextResponse.json({ 
        error: "You cannot assign a role equal to or higher than your own" 
      }, { status: 403 });
    }

    // Build update
    const updates: Record<string, any> = {};
    if (newRole) updates.role = newRole;
    if (status) updates.status = status;

    const { data, error } = await supabase
      .from("memberships")
      .update(updates)
      .eq("id", membershipId)
      .select()
      .single();

    if (error) {
      console.error("[Staff API] Update error:", error);
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    // Log the action
    try {
      await getSupabaseServiceClient().rpc("log_audit_event", {
        p_action: "update_staff",
        p_resource_type: "staff",
        p_resource_id: membershipId,
        p_description: `Updated staff member`,
        p_old_values: { role: targetMembership.role },
        p_new_values: updates,
      });
    } catch {
      // Audit log might not exist yet
    }

    return NextResponse.json({ success: true, membership: data });
  } catch (error) {
    console.error("[Staff API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Remove staff access
export async function DELETE(req: NextRequest) {
  try {
    const { user, role, permissions } = await checkAdminAccess();
    
    if (!user || !role || !permissions) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!permissions.canManageStaff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const membershipId = searchParams.get("id");

    if (!membershipId) {
      return NextResponse.json({ error: "Membership ID is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Get the target membership
    const { data: targetMembership } = await supabase
      .from("memberships")
      .select("user_id, role")
      .eq("id", membershipId)
      .single();

    if (!targetMembership) {
      return NextResponse.json({ error: "Membership not found" }, { status: 404 });
    }

    // Check if current user can manage this role
    if (!canManageRole(role, targetMembership.role as AdminRole)) {
      return NextResponse.json({ 
        error: "You cannot remove a user with equal or higher role" 
      }, { status: 403 });
    }

    // Soft delete - set status to inactive
    const { error } = await supabase
      .from("memberships")
      .update({ status: "inactive" })
      .eq("id", membershipId);

    if (error) {
      console.error("[Staff API] Delete error:", error);
      return NextResponse.json({ error: "Failed to remove" }, { status: 500 });
    }

    // Log the action
    try {
      await getSupabaseServiceClient().rpc("log_audit_event", {
        p_action: "remove_staff",
        p_resource_type: "staff",
        p_resource_id: membershipId,
        p_description: `Removed staff access`,
      });
    } catch {
      // Audit log might not exist yet
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Staff API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
