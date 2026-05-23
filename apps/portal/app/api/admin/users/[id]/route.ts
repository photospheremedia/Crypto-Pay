import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canManageRole, checkAdminAccess, type AdminRole } from "@/lib/admin-auth";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";

type Params = {
  params: Promise<{ id: string }>;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { user, isAdmin, permissions } = await checkAdminAccess();
    if (!user || !isAdmin || !permissions?.canManageStaff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const supabase = await createClient();
    const service = getSupabaseServiceClient();

    const [
      profileRes,
      membershipsRes,
      walletRes,
      ordersCountRes,
      leadsRes,
      authUserRes,
    ] = await Promise.all([
      supabase
        .from("user_profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("memberships")
        .select("id, tenant_id, role, status, created_at, tenants(id, name, slug, status)")
        .eq("user_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("user_wallet_profiles")
        .select("wallet_network, wallet_address, wallet_verified, created_at, updated_at")
        .eq("user_id", id)
        .maybeSingle(),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("user_id", id),
      supabase
        .from("chat_conversations")
        .select("id, lead_status, started_at, guest_email")
        .eq("user_id", id)
        .order("started_at", { ascending: false })
        .limit(10),
      service.auth.admin.getUserById(id),
    ]);

    if (profileRes.error) {
      console.error("[Admin User Detail] profile error:", profileRes.error);
    }
    if (membershipsRes.error) {
      console.error("[Admin User Detail] memberships error:", membershipsRes.error);
    }
    if (walletRes.error) {
      console.error("[Admin User Detail] wallet error:", walletRes.error);
    }
    if (ordersCountRes.error) {
      console.error("[Admin User Detail] orders count error:", ordersCountRes.error);
    }
    if (leadsRes.error) {
      console.error("[Admin User Detail] leads error:", leadsRes.error);
    }
    if (authUserRes.error) {
      console.error("[Admin User Detail] auth user error:", authUserRes.error);
    }

    const profile = profileRes.data;
    if (!profile && !authUserRes.data?.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const authUser = authUserRes.data?.user;
    const safeAuth = authUser
      ? {
          id: authUser.id,
          email: authUser.email,
          email_confirmed_at: authUser.email_confirmed_at,
          last_sign_in_at: authUser.last_sign_in_at,
          created_at: authUser.created_at,
          updated_at: authUser.updated_at,
          phone: authUser.phone,
          app_metadata: authUser.app_metadata,
          user_metadata: authUser.user_metadata,
          factors_count: authUser.factors?.length ?? 0,
          banned_until: authUser.banned_until,
        }
      : null;

    return NextResponse.json({
      success: true,
      user: {
        id,
        profile: profile ?? null,
        auth: safeAuth,
        memberships: membershipsRes.data ?? [],
        wallet: walletRes.data ?? null,
        stats: {
          orders_count: ordersCountRes.count ?? 0,
          leads_count: leadsRes.data?.length ?? 0,
        },
        recent_leads: leadsRes.data ?? [],
      },
    });
  } catch (error) {
    console.error("[Admin User Detail] fatal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { user, isAdmin, role, permissions } = await checkAdminAccess();
    if (!user || !isAdmin || !role || !permissions?.canManageStaff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const body = await req.json();
    const {
      full_name,
      phone,
      company_name,
      membership_role,
      membership_status,
    }: {
      full_name?: string;
      phone?: string | null;
      company_name?: string | null;
      membership_role?: AdminRole;
      membership_status?: "active" | "inactive" | "suspended";
    } = body || {};

    const supabase = await createClient();
    const profileUpdates: Record<string, string | null> = {};

    if (typeof full_name === "string") profileUpdates.full_name = full_name.trim();
    if (typeof phone === "string" || phone === null) profileUpdates.phone = phone;
    if (typeof company_name === "string" || company_name === null) {
      profileUpdates.company_name = company_name;
    }

    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update(profileUpdates)
        .eq("id", id);
      if (profileError) {
        console.error("[Admin User Detail] update profile error:", profileError);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
      }
    }

    if (membership_role || membership_status) {
      const { data: membership, error: membershipError } = await supabase
        .from("memberships")
        .select("id, role")
        .eq("user_id", id)
        .eq("status", "active")
        .maybeSingle();

      if (membershipError) {
        console.error("[Admin User Detail] membership lookup error:", membershipError);
        return NextResponse.json({ error: "Failed to load membership" }, { status: 500 });
      }

      if (membership) {
        const currentRole = membership.role as AdminRole;
        if (!canManageRole(role, currentRole)) {
          return NextResponse.json(
            { error: "You cannot manage this user's role" },
            { status: 403 },
          );
        }
        if (membership_role && !canManageRole(role, membership_role)) {
          return NextResponse.json(
            { error: "You cannot assign a role equal to or higher than yours" },
            { status: 403 },
          );
        }

        const updates: Record<string, string> = {};
        if (membership_role) updates.role = membership_role;
        if (membership_status) updates.status = membership_status;

        if (Object.keys(updates).length > 0) {
          const { error: updateMembershipError } = await supabase
            .from("memberships")
            .update(updates)
            .eq("id", membership.id);
          if (updateMembershipError) {
            console.error("[Admin User Detail] update membership error:", updateMembershipError);
            return NextResponse.json({ error: "Failed to update membership" }, { status: 500 });
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin User Detail] patch fatal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { user, isAdmin, role, permissions } = await checkAdminAccess();
    if (!user || !isAdmin || !role || !permissions?.canManageStaff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }
    if (id === user.id) {
      return NextResponse.json({ error: "You cannot delete yourself" }, { status: 400 });
    }

    const supabase = await createClient();
    const service = getSupabaseServiceClient();

    const { data: targetMembership } = await supabase
      .from("memberships")
      .select("role")
      .eq("user_id", id)
      .eq("status", "active")
      .maybeSingle();

    if (targetMembership) {
      const targetRole = targetMembership.role as AdminRole;
      if (!canManageRole(role, targetRole)) {
        return NextResponse.json(
          { error: "You cannot delete a user with equal or higher role" },
          { status: 403 },
        );
      }
    }

    const { error: deleteError } = await service.auth.admin.deleteUser(id);
    if (deleteError) {
      console.error("[Admin User Detail] delete user error:", deleteError);
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin User Detail] delete fatal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
