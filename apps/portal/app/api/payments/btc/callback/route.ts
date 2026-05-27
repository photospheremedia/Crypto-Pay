import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { applyProviderCallbackToCharge } from "@/lib/payments/btc-charges";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const callbackQuerySchema = z.object({
  secret: z.string().optional(),
  status: z.coerce.number(),
  addr: z.string().min(10),
  value: z.coerce.number(),
  txid: z.string().min(10),
  rbf: z.coerce.number().optional(),
});

/**
 * Blockonomics HTTP callback (source of truth for fulfillment).
 * @see https://developers.blockonomics.co/reference/callback-notification
 */
export async function GET(req: NextRequest) {
  const configuredSecret = process.env.BTC_PROVIDER_CALLBACK_SECRET?.trim();
  if (!configuredSecret) {
    return new Response("Callback secret not configured", { status: 500 });
  }

  const url = new URL(req.url);
  const parsed = callbackQuerySchema.safeParse({
    secret: url.searchParams.get("secret") ?? undefined,
    status: url.searchParams.get("status"),
    addr: url.searchParams.get("addr"),
    value: url.searchParams.get("value"),
    txid: url.searchParams.get("txid"),
    rbf: url.searchParams.get("rbf") ?? undefined,
  });

  if (!parsed.success) {
    return new Response("Bad request", { status: 400 });
  }

  if (parsed.data.secret !== configuredSecret) {
    return new Response("Forbidden", { status: 403 });
  }

  if (parsed.data.value <= 0) {
    return new Response("OK", { status: 200 });
  }

  try {
    const supabase = createServiceClient();
    await applyProviderCallbackToCharge({
      client: supabase,
      addr: parsed.data.addr,
      providerStatus: parsed.data.status,
      txid: parsed.data.txid,
      valueSatoshi: parsed.data.value,
      rbf: parsed.data.rbf ?? null,
    });
  } catch (error) {
    console.error("[payments/btc/callback]", error);
    return new Response("Internal error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
