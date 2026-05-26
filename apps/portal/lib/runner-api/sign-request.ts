import { createHmac } from "crypto";

/**
 * Sign a Runner API request (use from the settlement runner app or tests).
 */
export function signRunnerApiRequest(params: {
  apiSecret: string;
  timestamp: number;
  method: string;
  path: string;
  body?: string;
}): string {
  const payload = `${params.timestamp}.${params.method.toUpperCase()}.${params.path}.${params.body ?? ""}`;
  return createHmac("sha256", params.apiSecret).update(payload).digest("hex");
}

export function runnerApiHeaders(params: {
  apiKey: string;
  apiSecret: string;
  method: string;
  path: string;
  body?: string;
}): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signRunnerApiRequest({
    apiSecret: params.apiSecret,
    timestamp,
    method: params.method,
    path: params.path,
    body: params.body,
  });

  return {
    "Content-Type": "application/json",
    "X-CryptoPay-Key": params.apiKey,
    "X-CryptoPay-Timestamp": String(timestamp),
    "X-CryptoPay-Signature": signature,
  };
}

export function runnerApiBaseUrl(): string {
  const functionsUrl =
    process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL ||
    (process.env.NEXT_PUBLIC_SUPABASE_URL
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "")}/functions/v1`
      : "");
  return `${functionsUrl.replace(/\/$/, "")}/runner-api`;
}
