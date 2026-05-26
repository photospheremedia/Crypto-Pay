import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/admin-auth";
import {
  filterMerchantProfiles,
  getStaffUserIds,
} from "@/lib/admin/merchant-directory";
import { merchantWallets } from "@/lib/wallets/db";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";

interface SearchResult {
  id: string;
  type: "merchant" | "wallet" | "lead";
  title: string;
  subtitle: string;
  href: string;
}

export const GET = withAdminAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (query.trim().length < 2) {
      return NextResponse.json({ success: true, results: [] });
    }

    const supabase = getSupabaseServiceClient();
    const results: SearchResult[] = [];
    const searchTerm = `%${query.trim()}%`;
    const staffUserIds = await getStaffUserIds(supabase);

    const { data: merchantRows } = await supabase
      .from("user_profiles")
      .select("id, email, full_name, company_name")
      .or(
        `email.ilike.${searchTerm},full_name.ilike.${searchTerm},company_name.ilike.${searchTerm}`,
      )
      .limit(10);

    const merchants = filterMerchantProfiles(merchantRows ?? [], staffUserIds).slice(
      0,
      5,
    );

    if (merchants.length > 0) {
      results.push(
        ...merchants.map((m) => ({
          id: m.id,
          type: "merchant" as const,
          title: m.full_name || m.company_name || m.email || "Merchant",
          subtitle: m.email || "Merchant account",
          href: `/admin/users/${m.id}`,
        })),
      );
    }

    const { data: payoutWallets } = await merchantWallets(supabase)
      .select("id, user_id, label, wallet_network, wallet_address, status")
      .or(`wallet_address.ilike.${searchTerm},label.ilike.${searchTerm}`)
      .limit(5);

    if (payoutWallets) {
      results.push(
        ...payoutWallets.map((w) => ({
          id: w.id,
          type: "wallet" as const,
          title: w.label || `${String(w.wallet_network).toUpperCase()} wallet`,
          subtitle: `${w.status} · ${w.wallet_address.slice(0, 10)}…`,
          href: `/admin/wallets`,
        })),
      );
    }

    const { data: leads } = await supabase
      .from("chat_conversations")
      .select("id, guest_name, guest_email, lead_status")
      .eq("contact_captured", true)
      .or(`guest_name.ilike.${searchTerm},guest_email.ilike.${searchTerm}`)
      .limit(5);

    if (leads) {
      results.push(
        ...leads.map((l) => ({
          id: l.id,
          type: "lead" as const,
          title: l.guest_name || l.guest_email || "Lead",
          subtitle: l.lead_status || "new",
          href: `/admin/leads?id=${l.id}`,
        })),
      );
    }

    return NextResponse.json({
      success: true,
      results: results.slice(0, 12),
    });
  } catch (error) {
    console.error("Search failed:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
});
