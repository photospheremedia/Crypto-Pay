/**
 * Benchmark admin API latency on production.
 * Usage: pnpm exec tsx scripts/bench-prod-apis.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createServerClient } from "@supabase/ssr";

config({ path: resolve(process.cwd(), ".env.local") });

const BASE =
  process.env.PLAYWRIGHT_PROD_BASE_URL?.trim() || "https://cryptopay.sale";
const email =
  process.env.PLAYWRIGHT_ADMIN_EMAIL?.trim() || "photospheremedia00@gmail.com";
const password =
  process.env.PLAYWRIGHT_PROD_PASSWORD?.trim() ||
  process.env.LOCAL_DEV_PASSWORD?.trim() ||
  "CryptoPayDev!2026";

type CookieRow = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

async function main() {
  const jar: CookieRow[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => jar.map(({ name, value }) => ({ name, value })),
        setAll: (cookies) => {
          for (const c of cookies) {
            const i = jar.findIndex((x) => x.name === c.name);
            if (i >= 0) jar[i] = c;
            else jar.push(c);
          }
        },
      },
    },
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(`Sign-in failed: ${error.message}`);
  }

  const cookieHeader = jar.map((c) => `${c.name}=${c.value}`).join("; ");

  const fetchTimeoutMs = 30_000;

  async function timeFetch(path: string) {
    const url = `${BASE}${path}`;
    const t0 = performance.now();
    const res = await fetch(url, {
      headers: { Cookie: cookieHeader, Accept: "application/json" },
      signal: AbortSignal.timeout(fetchTimeoutMs),
    });
    const ms = Math.round(performance.now() - t0);
    const ok = res.ok;
    const size = Number(res.headers.get("content-length") ?? 0);
    return { path, status: res.status, ms, ok, size };
  }

  async function timePage(path: string) {
    const url = `${BASE}${path}`;
    const t0 = performance.now();
    const res = await fetch(url, {
      headers: { Cookie: cookieHeader },
      redirect: "manual",
      signal: AbortSignal.timeout(fetchTimeoutMs),
    });
    const ms = Math.round(performance.now() - t0);
    return {
      path,
      status: res.status,
      ms,
      location: res.headers.get("location"),
    };
  }

  const endpoints = [
    "/api/admin/nav-counts",
    "/api/admin/stats",
    "/api/admin/wallets?status=pending",
    "/api/admin/notifications",
    "/api/admin/users?limit=20",
  ];

  console.log(`\nProd benchmark — ${BASE} (admin: ${email})\n`);

  for (const path of ["/login", "/admin/dashboard"]) {
    const r = await timePage(path);
    console.log(`PAGE ${r.path.padEnd(22)} ${r.ms}ms  HTTP ${r.status}`);
  }

  console.log("\nAPI (cold):");
  for (const path of endpoints) {
    const r = await timeFetch(path);
    const flag = r.ok ? "ok" : "FAIL";
    console.log(
      `  ${path.padEnd(36)} ${String(r.ms).padStart(5)}ms  ${r.status}  ${flag}`,
    );
  }

  console.log("\nAPI (warm):");
  const warm = await Promise.all(endpoints.map((p) => timeFetch(p)));
  for (const r of warm) {
    const flag = r.ok ? "ok" : "FAIL";
    console.log(
      `  ${r.path.padEnd(36)} ${String(r.ms).padStart(5)}ms  ${r.status}  ${flag}`,
    );
  }

  const totalWarm = warm.reduce((n, r) => n + r.ms, 0);
  console.log(`\nWarm total (5 APIs): ${totalWarm}ms\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
