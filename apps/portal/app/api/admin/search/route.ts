import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase/server";

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

    const supabase = await createClient();
    const results: SearchResult[] = [];
    const searchTerm = `%${query}%`;

    const { data: merchants } = await supabase
      .from("user_profiles")
      .select("id, email, full_name")
      .or(`email.ilike.${searchTerm},full_name.ilike.${searchTerm}`)
      .limit(5);

    if (merchants) {
      results.push(
        ...merchants.map((m) => ({
          id: m.id,
          type: "merchant" as const,
          title: m.full_name || m.email || "Merchant",
          subtitle: m.email || "Account",
          href: `/admin/users/${m.id}`,
        })),
      );
    }

    const { data: wallets } = await supabase
      .from("user_wallet_profiles")
      .select("user_id, wallet_network, wallet_address, wallet_verified")
      .ilike("wallet_address", searchTerm)
      .limit(5);

    if (wallets) {
      results.push(
        ...wallets.map((w) => ({
          id: w.user_id,
          type: "wallet" as const,
          title: `${w.wallet_network.toUpperCase()} wallet`,
          subtitle: w.wallet_verified ? "Verified" : "Pending verification",
          href: `/admin/users/${w.user_id}`,
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
      results: results.slice(0, 10),
    });
  } catch (error) {
    console.error("Search failed:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
});
