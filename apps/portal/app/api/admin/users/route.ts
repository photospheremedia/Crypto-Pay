import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkAdminAccess } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const { user, isAdmin, permissions } = await checkAdminAccess();
    if (!user || !isAdmin || !permissions?.canManageStaff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(5, Number(searchParams.get("limit") || "20")));

    const { data: profiles, error: profilesError } = await supabase
      .from("user_profiles")
      .select("id, email, full_name, phone, company_name, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("[Admin Users] profiles error:", profilesError);
      return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
    }

    const userIds = (profiles || []).map((p) => p.id);
    let membershipsByUser = new Map<string, { role: string; status: string; tenant_id: string }>();
    let walletByUser = new Map<string, { wallet_network: string; wallet_verified: boolean }>();

    if (userIds.length > 0) {
      const [membershipsRes, walletsRes] = await Promise.all([
        supabase
          .from("memberships")
          .select("user_id, role, status, tenant_id, created_at")
          .in("user_id", userIds)
          .order("created_at", { ascending: false }),
        supabase
          .from("user_wallet_profiles")
          .select("user_id, wallet_network, wallet_verified")
          .in("user_id", userIds),
      ]);

      if (membershipsRes.data) {
        for (const membership of membershipsRes.data) {
          if (!membershipsByUser.has(membership.user_id)) {
            membershipsByUser.set(membership.user_id, {
              role: membership.role,
              status: membership.status,
              tenant_id: membership.tenant_id,
            });
          }
        }
      }
      if (walletsRes.data) {
        for (const wallet of walletsRes.data) {
          walletByUser.set(wallet.user_id, {
            wallet_network: wallet.wallet_network,
            wallet_verified: wallet.wallet_verified,
          });
        }
      }
    }

    const merged = (profiles || []).map((profile) => {
      const membership = membershipsByUser.get(profile.id);
      const wallet = walletByUser.get(profile.id);
      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        company_name: profile.company_name,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        role: membership?.role || "customer",
        membership_status: membership?.status || "none",
        tenant_id: membership?.tenant_id || null,
        has_wallet: Boolean(wallet),
        wallet_network: wallet?.wallet_network || null,
        wallet_verified: wallet?.wallet_verified ?? false,
      };
    });

    const filtered = search
      ? merged.filter((u) =>
          [u.email, u.full_name || "", u.phone || "", u.company_name || "", u.role]
            .join(" ")
            .toLowerCase()
            .includes(search),
        )
      : merged;

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const users = filtered.slice(start, start + limit);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("[Admin Users] fatal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
