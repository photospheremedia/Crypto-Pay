import { z } from "zod";
import {
  btcProviderWatcherDelete,
  btcProviderWatcherList,
  btcProviderWatcherUpsert,
} from "@/lib/btc-provider/client";

export const runtime = "edge";

const networkSchema = z.enum(["btc", "bch"]).default("btc");

function requireInternalKey(req: Request): string | null {
  const configured = process.env.INTERNAL_API_KEY?.trim();
  if (!configured) return "INTERNAL_API_KEY not configured";
  const provided = req.headers.get("x-internal-key")?.trim();
  if (!provided || provided !== configured) return "Unauthorized";
  return null;
}

export async function GET(req: Request) {
  const authError = requireInternalKey(req);
  if (authError) {
    return new Response(JSON.stringify({ error: authError }), {
      status: authError === "Unauthorized" ? 401 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.BTC_PROVIDER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "BTC_PROVIDER_API_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const parsed = networkSchema.safeParse(url.searchParams.get("network") ?? "btc");
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid network" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const items = await btcProviderWatcherList({ apiKey, network: parsed.data });
  return new Response(JSON.stringify({ items }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

const upsertSchema = z.object({
  network: networkSchema.optional(),
  addr: z.string().min(10),
  tag: z.string().optional(),
});

export async function POST(req: Request) {
  const authError = requireInternalKey(req);
  if (authError) {
    return new Response(JSON.stringify({ error: authError }), {
      status: authError === "Unauthorized" ? 401 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.BTC_PROVIDER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "BTC_PROVIDER_API_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid body", details: parsed.error.flatten() }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = await btcProviderWatcherUpsert({
    apiKey,
    network: parsed.data.network,
    addr: parsed.data.addr,
    tag: parsed.data.tag,
  });

  return new Response(JSON.stringify({ success: true, result }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

const deleteSchema = z.object({
  network: networkSchema.optional(),
  addr: z.string().min(10),
});

export async function DELETE(req: Request) {
  const authError = requireInternalKey(req);
  if (authError) {
    return new Response(JSON.stringify({ error: authError }), {
      status: authError === "Unauthorized" ? 401 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.BTC_PROVIDER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "BTC_PROVIDER_API_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid body", details: parsed.error.flatten() }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = await btcProviderWatcherDelete({
    apiKey,
    network: parsed.data.network,
    addr: parsed.data.addr,
  });

  return new Response(JSON.stringify({ success: true, result }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

