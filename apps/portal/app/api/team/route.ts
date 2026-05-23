import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";

// Cache team/tenant data for 24 hours - stable during session, revalidates on logout
export const revalidate = 86400;

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("memberships")
    .select("id, role, status, tenant_id, tenants ( id, name, slug, status )")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  return Response.json(data ?? null);
}
