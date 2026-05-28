import "server-only";

import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";

export async function countRecentSmsEvents(params: {
  userId: string;
  event: string;
  sinceIso: string;
}): Promise<number> {
  const supabase = getSupabaseServiceClient();
  const { count, error } = await supabase
    .from("sms_outbound_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", params.userId)
    .eq("event", params.event)
    .gte("created_at", params.sinceIso);

  if (error) {
    console.warn("[SMS] rate limit count failed:", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function assertSmsRateLimit(params: {
  userId: string;
  event: string;
  max: number;
  windowMinutes: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const since = new Date(Date.now() - params.windowMinutes * 60 * 1000).toISOString();
  const count = await countRecentSmsEvents({
    userId: params.userId,
    event: params.event,
    sinceIso: since,
  });

  if (count >= params.max) {
    return {
      ok: false,
      error: `Too many SMS requests. Try again in ${params.windowMinutes} minutes.`,
    };
  }

  return { ok: true };
}
