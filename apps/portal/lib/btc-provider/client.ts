import { z } from "zod";

const DEFAULT_BTC_API_BASE = "https://www.blockonomics.co/api";

const newAddressResponseSchema = z.object({
  address: z.string().min(10),
  crypto: z.string().optional(),
  reset: z.number().optional(),
  account: z.string().optional(),
});

export type NewAddressResponse = z.infer<typeof newAddressResponseSchema>;

const priceResponseSchema = z.object({
  price: z.number().positive(),
});

export type ProviderCrypto = "BTC" | "USDT";
export type ProviderNetwork = "btc" | "bch";

function baseUrlForNetwork(network: ProviderNetwork): string {
  const envBtc = process.env.BTC_PROVIDER_BASE_URL?.trim() || DEFAULT_BTC_API_BASE;
  const envBch = process.env.BCH_PROVIDER_BASE_URL?.trim();
  if (network === "bch") {
    if (!envBch) throw new Error("BCH_PROVIDER_BASE_URL not configured");
    return envBch.replace(/\/$/, "");
  }
  return envBtc.replace(/\/$/, "");
}

function apiUrl(network: ProviderNetwork, path: string): string {
  const base = baseUrlForNetwork(network);
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/** Partial callback URL segment for Blockonomics `match_callback` (wallet routing). */
export function btcProviderMatchCallback(): string {
  const configured = process.env.BTC_PROVIDER_MATCH_CALLBACK?.trim();
  if (configured) return configured;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) {
    try {
      const host = new URL(appUrl).host;
      return `${host}/api/payments/btc/callback`;
    } catch {
      // fall through
    }
  }
  return "api/payments/btc/callback";
}

/** WebSocket URL for in-browser payment detection (not fulfillment). */
export function blockonomicsPaymentWebSocketUrl(address: string): string {
  const origin =
    process.env.NEXT_PUBLIC_BTC_PROVIDER_WS_ORIGIN?.trim() ||
    "wss://www.blockonomics.co";
  const base = origin.replace(/\/$/, "");
  return `${base}/payment/${encodeURIComponent(address)}`;
}

async function providerFetch(params: {
  apiKey: string;
  network: ProviderNetwork;
  path: string;
  method: "GET" | "POST";
  searchParams?: Record<string, string | undefined>;
  body?: unknown;
}) {
  const url = new URL(apiUrl(params.network, params.path));
  if (params.searchParams) {
    for (const [key, value] of Object.entries(params.searchParams)) {
      if (value != null && value !== "") url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url.toString(), {
    method: params.method,
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      ...(params.body != null ? { "Content-Type": "application/json" } : {}),
    },
    body: params.body != null ? JSON.stringify(params.body) : undefined,
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const msg = typeof text === "string" ? text.slice(0, 200) : "";
    throw new Error(`BTC provider error (${res.status}): ${msg}`);
  }

  return json;
}

export async function btcProviderPrice(params: {
  apiKey?: string;
  network?: ProviderNetwork;
  crypto?: ProviderCrypto;
  currency: string;
}): Promise<{ price: number }> {
  const json = await providerFetch({
    apiKey: params.apiKey ?? process.env.BTC_PROVIDER_API_KEY ?? "",
    network: params.network ?? "btc",
    path: "/price",
    method: "GET",
    searchParams: {
      crypto: params.crypto ?? "BTC",
      currency: params.currency.toUpperCase(),
    },
  });
  return priceResponseSchema.parse(json);
}

export async function btcProviderNewAddress(params: {
  apiKey: string;
  network?: ProviderNetwork;
  crypto?: ProviderCrypto;
  reset?: boolean;
  matchCallback?: string;
}): Promise<NewAddressResponse> {
  const json = await providerFetch({
    apiKey: params.apiKey,
    network: params.network ?? "btc",
    path: "/new_address",
    method: "POST",
    searchParams: {
      match_callback: params.matchCallback ?? btcProviderMatchCallback(),
      crypto: params.crypto ?? "BTC",
      reset: params.reset ? "1" : "0",
    },
  });

  return newAddressResponseSchema.parse(json);
}

const watcherItemSchema = z.object({
  createdon: z.number(),
  balance: z.number(),
  tag: z.string().optional().nullable(),
  address: z.string(),
});

export type WatcherItem = z.infer<typeof watcherItemSchema>;

export async function btcProviderWatcherList(params: {
  apiKey: string;
  network?: ProviderNetwork;
}): Promise<WatcherItem[]> {
  const json = await providerFetch({
    apiKey: params.apiKey,
    network: params.network ?? "btc",
    path: "/address",
    method: "GET",
  });

  return z.array(watcherItemSchema).parse(json);
}

export async function btcProviderWatcherUpsert(params: {
  apiKey: string;
  network?: ProviderNetwork;
  addr: string;
  tag?: string;
}): Promise<unknown> {
  return await providerFetch({
    apiKey: params.apiKey,
    network: params.network ?? "btc",
    path: "/address",
    method: "POST",
    body: { addr: params.addr, tag: params.tag ?? "" },
  });
}

export async function btcProviderWatcherDelete(params: {
  apiKey: string;
  network?: ProviderNetwork;
  addr: string;
}): Promise<unknown> {
  return await providerFetch({
    apiKey: params.apiKey,
    network: params.network ?? "btc",
    path: "/delete_address",
    method: "POST",
    body: { addr: params.addr },
  });
}

export const blockonomicsPaymentEventSchema = z.object({
  status: z.number(),
  timestamp: z.number().optional(),
  value: z.number(),
  txid: z.string(),
});

export type BlockonomicsPaymentEvent = z.infer<typeof blockonomicsPaymentEventSchema>;

/** Map Blockonomics callback/WebSocket status to internal charge status. */
export function mapProviderStatusToChargeStatus(
  providerStatus: number,
): "pending" | "detected" | "confirming" | "confirmed" | "failed" {
  if (providerStatus < 0) return "failed";
  if (providerStatus === 0) return "detected";
  if (providerStatus === 1) return "confirming";
  return "confirmed";
}
