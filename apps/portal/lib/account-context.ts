import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";

type TenantRow = {
  id: string;
  name: string;
  slug: string;
};

export async function getAccountContext() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: memberships } = await supabase
    .from("memberships")
    .select("tenant_id, role, tenants ( id, name, slug )")
    .eq("status", "active");

  const membership = memberships?.[0];
  const tenant =
    membership && Array.isArray(membership.tenants)
      ? membership.tenants[0]
      : membership?.tenants;

  return { supabase, user, tenant: (tenant as TenantRow | null) ?? null, membership };
}
