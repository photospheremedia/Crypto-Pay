/**
 * Smoke test Runner API (attach wallet)
 *
 * RUNNER_API_KEY=... RUNNER_API_SECRET=... pnpm --filter @crypto-pay/portal exec tsx scripts/test-runner-api.ts photospheremedia00@gmail.com
 */
import { config } from "dotenv";
import { resolve } from "path";
import { runnerApiBaseUrl, runnerApiHeaders } from "../lib/runner-api/sign-request";

config({ path: resolve(process.cwd(), ".env.local") });

async function main() {
  const apiKey = process.env.RUNNER_API_KEY;
  const apiSecret = process.env.RUNNER_API_SECRET;
  const email = process.argv[2] || process.env.LOCAL_DEV_EMAIL;

  if (!apiKey || !apiSecret || !email) {
    console.error("Need RUNNER_API_KEY, RUNNER_API_SECRET, and email argument");
    process.exit(1);
  }

  const base = runnerApiBaseUrl();
  const path = "/v1/wallets";
  const body = JSON.stringify({
    email,
    external_id: `runner-test-${Date.now()}`,
    label: "Runner test wallet",
    wallet_network: "btc",
    wallet_address: "bc1qexample000000000000000000000000000",
    is_primary: false,
  });

  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: runnerApiHeaders({
      apiKey,
      apiSecret,
      method: "POST",
      path,
      body,
    }),
    body,
  });

  const json = await res.json();
  console.log(res.status, JSON.stringify(json, null, 2));
}

main().catch(console.error);
