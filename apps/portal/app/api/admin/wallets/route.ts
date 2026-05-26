import { NextRequest, NextResponse } from "next/server";
import { checkAdminAccess } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";
import { notifyMerchantWalletStatus } from "@/lib/wallets/notify-admin";
import { merchantWallets } from "@/lib/wallets/db";
import type { MerchantWallet } from "@/types/crypto-pay-db";

export async function GET(req: NextRequest) {
  try {
    const { user, isAdmin } = await checkAdminAccess();
    if (!user || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = req.nextUrl.searchParams.get("status") ?? "pending";
    const supabase = await createClient();

    let query = merchantWallets(supabase)
      .select("*")
      .order("verification_requested_at", { ascending: false })
      .limit(100);

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[Admin Wallets] list error:", error);
      return NextResponse.json({ error: "Failed to load wallets" }, { status: 500 });
    }

    const rows = (data ?? []) as MerchantWallet[];
    const userIds = [...new Set(rows.map((w) => w.user_id))];
    const profiles = new Map<string, { email: string; full_name: string | null }>();

    if (userIds.length > 0) {
      const { data: profileRows } = await supabase
        .from("user_profiles")
        .select("id, email, full_name")
        .in("id", userIds);
      for (const p of profileRows ?? []) {
        profiles.set(p.id, { email: p.email, full_name: p.full_name });
      }
    }

    const wallets = rows.map((w) => ({
      ...w,
      merchant: profiles.get(w.user_id) ?? null,
    }));

    return NextResponse.json({ success: true, wallets });
  } catch (error) {
    console.error("[Admin Wallets] GET fatal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user, isAdmin } = await checkAdminAccess();
    if (!user || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      status,
      rejection_reason,
    }: {
      id?: string;
      status?: "verified" | "rejected";
      rejection_reason?: string;
    } = body;

    if (!id || !status || !["verified", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();

    const { data: existing, error: loadError } = await merchantWallets(supabase)
      .select("id, user_id, label, status")
      .eq("id", id)
      .maybeSingle();

    if (loadError || !existing) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const updates = {
      status,
      verified_at: new Date().toISOString(),
      verified_by: user.id,
      rejection_reason: status === "rejected" ? rejection_reason ?? null : null,
    };

    const { error: updateError } = await merchantWallets(supabase)
      .update(updates)
      .eq("id", id);

    if (updateError) {
      console.error("[Admin Wallets] patch error:", updateError);
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    if (status === "verified") {
      const { data: row } = await merchantWallets(supabase)
        .select("wallet_network, wallet_address, is_primary, user_id")
        .eq("id", id)
        .single();

      if (row?.is_primary) {
        await supabase.from("user_wallet_profiles").upsert(
          {
            user_id: row.user_id,
            wallet_network: row.wallet_network,
            wallet_address: row.wallet_address,
            wallet_verified: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
      }
    }

    const service = getSupabaseServiceClient();
    const { data: authUser } = await service.auth.admin.getUserById(existing.user_id);
    const merchantEmail = authUser?.user?.email;

    if (merchantEmail) {
      const { data: walletRow } = await merchantWallets(supabase)
        .select("wallet_network, wallet_address")
        .eq("id", id)
        .single();

      await notifyMerchantWalletStatus({
        merchantEmail,
        label: existing.label,
        status,
        rejectionReason: rejection_reason,
        walletNetwork: walletRow?.wallet_network,
        walletAddress: walletRow?.wallet_address,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Wallets] PATCH fatal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
