import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withAdminAuth } from "@/lib/admin-auth";

export const GET = withAdminAuth(async (req) => {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d";

    const now = new Date();
    let startDate = new Date();
    let previousStartDate = new Date();

    switch (range) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        previousStartDate.setDate(now.getDate() - 14);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        previousStartDate.setDate(now.getDate() - 180);
        break;
      case "365d":
        startDate.setDate(now.getDate() - 365);
        previousStartDate.setDate(now.getDate() - 730);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
        previousStartDate.setDate(now.getDate() - 60);
    }

    const startDateStr = startDate.toISOString();
    const previousStartDateStr = previousStartDate.toISOString();

    const { count: currentSignups } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDateStr);

    const { count: previousSignups } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", previousStartDateStr)
      .lt("created_at", startDateStr);

    const { count: currentWallets } = await supabase
      .from("user_wallet_profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDateStr);

    const { count: previousWallets } = await supabase
      .from("user_wallet_profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", previousStartDateStr)
      .lt("created_at", startDateStr);

    const { count: currentLeads } = await supabase
      .from("chat_conversations")
      .select("*", { count: "exact", head: true })
      .eq("contact_captured", true)
      .gte("started_at", startDateStr);

    const { count: previousLeads } = await supabase
      .from("chat_conversations")
      .select("*", { count: "exact", head: true })
      .eq("contact_captured", true)
      .gte("started_at", previousStartDateStr)
      .lt("started_at", startDateStr);

    const pct = (current: number, previous: number) =>
      previous > 0 ? ((current - previous) / previous) * 100 : 0;

    const signups = currentSignups || 0;
    const prevSignups = previousSignups || 0;
    const wallets = currentWallets || 0;
    const prevWallets = previousWallets || 0;
    const leads = currentLeads || 0;
    const prevLeads = previousLeads || 0;

    const { data: recentMerchants } = await supabase
      .from("user_profiles")
      .select("id, email, full_name, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    const { data: recentWallets } = await supabase
      .from("user_wallet_profiles")
      .select("user_id, wallet_network, wallet_address, wallet_verified, updated_at")
      .order("updated_at", { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      range,
      analytics: {
        signups: {
          total: signups,
          change: pct(signups, prevSignups),
          trend: signups >= prevSignups ? "up" : "down",
        },
        walletsLinked: {
          total: wallets,
          change: pct(wallets, prevWallets),
          trend: wallets >= prevWallets ? "up" : "down",
        },
        leads: {
          total: leads,
          change: pct(leads, prevLeads),
          trend: leads >= prevLeads ? "up" : "down",
        },
        recentMerchants: recentMerchants || [],
        recentWallets: recentWallets || [],
      },
    });
  } catch (error) {
    console.error("[Admin Analytics] Error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
});
