import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";

// Must stay dynamic — stale user JSON after logout is a session leak in the UI.
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return Response.json(user ?? null);
}
