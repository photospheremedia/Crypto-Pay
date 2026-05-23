import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";

// Cache user data for 24 hours - stable during session, revalidates on logout
export const revalidate = 86400;

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return Response.json(user ?? null);
}
