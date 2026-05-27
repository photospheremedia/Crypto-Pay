import { z } from "zod";
import { btcProviderNewAddress } from "@/lib/btc-provider/client";

export const runtime = "edge";

const requestSchema = z.object({
  reset: z.boolean().optional(),
  matchAccount: z.string().min(1).optional(),
});

export async function POST(req: Request) {
  const apiKey = process.env.BTC_PROVIDER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "BTC_PROVIDER_API_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown = {};
  try {
    body = await req.json().catch(() => ({}));
  } catch {
    // ignore
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Invalid body", details: parsed.error.flatten() }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const data = await btcProviderNewAddress({
      apiKey,
      network: "btc",
      reset: parsed.data.reset,
      matchAccount: parsed.data.matchAccount,
    });

    return new Response(
      JSON.stringify({ address: data.address, reset: data.reset, account: data.account }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
}

