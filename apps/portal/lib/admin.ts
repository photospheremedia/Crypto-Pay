import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";

export async function isRhsAdmin(userId: string) {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("memberships")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .in("role", ["rhs_admin"])
    .maybeSingle();

  return Boolean(data);
}

export async function requireRhsAdmin() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const isAdmin = await isRhsAdmin(user.id);
  if (!isAdmin) {
    return null;
  }

  return user.id;
}
