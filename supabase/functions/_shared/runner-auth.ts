/**
 * Runner API handshake — HMAC-SHA256 (timestamp + method + path + body).
 * Similar to webhook signing patterns used by payment processors.
 */

import { createSupabaseClient } from "./db.ts";

const MAX_SKEW_SECONDS = 300;

/** Path segment used in HMAC (must match runner sign-request `path` arg). */
export function getRunnerApiPath(url: URL): string {
  const p = url.pathname;
  const v1 = p.indexOf("/v1/");
  if (v1 >= 0) return p.slice(v1);
  const stripped = p.replace(/^\/functions\/v1\/runner-api/, "");
  return stripped || "/";
}

export type RunnerClient = {
  id: string;
  slug: string;
  name: string;
  api_key: string;
  api_secret: string;
};

export async function verifyRunnerRequest(
  req: Request,
  rawBody: string,
): Promise<{ ok: true; client: RunnerClient } | { ok: false; status: number; error: string }> {
  const apiKey = req.headers.get("x-cryptopay-key")?.trim();
  const timestamp = req.headers.get("x-cryptopay-timestamp")?.trim();
  const signature = req.headers.get("x-cryptopay-signature")?.trim();

  if (!apiKey || !timestamp || !signature) {
    return {
      ok: false,
      status: 401,
      error: "Missing X-CryptoPay-Key, X-CryptoPay-Timestamp, or X-CryptoPay-Signature",
    };
  }

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) {
    return { ok: false, status: 401, error: "Invalid timestamp" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > MAX_SKEW_SECONDS) {
    return { ok: false, status: 401, error: "Timestamp outside allowed window" };
  }

  const path = getRunnerApiPath(new URL(req.url));
  const payload = `${timestamp}.${req.method.toUpperCase()}.${path}.${rawBody}`;

  const supabase = createSupabaseClient();
  const { data: client, error } = await supabase
    .from("runner_api_clients")
    .select("id, slug, name, api_key, api_secret, is_active")
    .eq("api_key", apiKey)
    .maybeSingle();

  if (error || !client) {
    return { ok: false, status: 401, error: "Unknown API key" };
  }

  if (!client.is_active) {
    return { ok: false, status: 403, error: "API client disabled" };
  }

  const expected = await hmacSha256Hex(client.api_secret, payload);
  if (!timingSafeEqual(signature.toLowerCase(), expected.toLowerCase())) {
    return { ok: false, status: 401, error: "Invalid signature" };
  }

  return {
    ok: true,
    client: {
      id: client.id,
      slug: client.slug,
      name: client.name,
      api_key: client.api_key,
      api_secret: client.api_secret,
    },
  };
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}
