import { NextRequest, NextResponse } from "next/server";
import { checkAdminAccess } from "@/lib/admin-auth";
import {
  filterMerchantProfiles,
  getStaffUserIds,
} from "@/lib/admin/merchant-directory";
import { getMerchantWalletCountsByUser } from "@/lib/admin/merchant-wallets";
import { merchantWallets } from "@/lib/wallets/db";
import { routeUnauthorized } from "@/lib/api/route-error";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const { user, isAdmin, permissions } = await checkAdminAccess();
    if (!user || !isAdmin || !permissions?.canViewMerchants) {
      return routeUnauthorized();
    }

    const supabase = getSupabaseServiceClient();
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const filter = searchParams.get("filter") || "all";
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(5, Number(searchParams.get("limit") || "20")));

    const [staffUserIds, profilesResult, walletRowsResult] = await Promise.all([
      getStaffUserIds(supabase),
      supabase
        .from("user_profiles")
        .select(
          "id, email, full_name, phone, company_name, created_at, updated_at",
        )
        .order("created_at", { ascending: false }),
      merchantWallets(supabase).select("user_id, status"),
    ]);

    const { data: profiles, error: profilesError } = profilesResult;

    if (profilesError) {
      console.error("[Admin Merchants] profiles error:", profilesError);
      return NextResponse.json({ error: "Failed to load merchants" }, { status: 500 });
    }

    const merchantsOnly = filterMerchantProfiles(profiles ?? [], staffUserIds);
    const allUserIds = merchantsOnly.map((p) => p.id);
    const walletCounts = await getMerchantWalletCountsByUser(
      supabase,
      allUserIds,
      (walletRowsResult.data ?? undefined) as
        | { user_id: string; status: string }[]
        | undefined,
    );

    const merged = merchantsOnly.map((profile) => {
      const counts = walletCounts.get(profile.id);
      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        company_name: profile.company_name,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        wallet_counts: counts ?? {
          total: 0,
          pending: 0,
          verified: 0,
          rejected: 0,
        },
        has_wallet: (counts?.total ?? 0) > 0,
        pending_wallets: counts?.pending ?? 0,
        wallet_verified: (counts?.verified ?? 0) > 0,
      };
    });

    let filtered = search
      ? merged.filter((u) =>
          [u.email, u.full_name || "", u.phone || "", u.company_name || ""]
            .join(" ")
            .toLowerCase()
            .includes(search),
        )
      : merged;

    if (filter === "pending") {
      filtered = filtered.filter((u) => u.pending_wallets > 0);
    } else if (filter === "with_wallets") {
      filtered = filtered.filter((u) => u.has_wallet);
    } else if (filter === "no_wallets") {
      filtered = filtered.filter((u) => !u.has_wallet);
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const users = filtered.slice(start, start + limit);

    const summary = {
      totalMerchants: merged.length,
      withWallets: merged.filter((u) => u.has_wallet).length,
      pendingWalletRequests: merged.reduce((n, u) => n + u.pending_wallets, 0),
    };

    return NextResponse.json({
      success: true,
      users,
      summary,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("[Admin Merchants] fatal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
