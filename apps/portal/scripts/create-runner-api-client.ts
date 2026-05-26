/**
 * Create a runner API client (settlement runner, etc.)
 *
 * Usage:
 *   pnpm --filter @crypto-pay/portal exec tsx scripts/create-runner-api-client.ts settlement-runner "Settlement Runner"
 */
import { config } from "dotenv";
import { randomBytes } from "crypto";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

function token(prefix: string) {
  return `${prefix}${randomBytes(24).toString("hex")}`;
}

async function main() {
  const slug = process.argv[2] || "settlement-runner";
  const name = process.argv[3] || "Settlement Runner";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const apiKey = token("cpk_");
  const apiSecret = token("cps_");

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let data: { id: string; slug: string; name: string } | null = null;

  const { data: row, error } = await supabase
    .from("runner_api_clients")
    .upsert(
      { slug, name, api_key: apiKey, api_secret: apiSecret, is_active: true },
      { onConflict: "slug" },
    )
    .select("id, slug, name")
    .single();

  if (error) {
    console.warn("REST insert failed (schema cache):", error.message);
    console.warn("Inserting via SQL…");
    const { execSync } = await import("child_process");
    const repoRoot = resolve(process.cwd(), "../..");
    const sql = `
      insert into public.runner_api_clients (slug, name, api_key, api_secret, is_active)
      values (
        '${slug.replace(/'/g, "''")}',
        '${name.replace(/'/g, "''")}',
        '${apiKey}',
        '${apiSecret}',
        true
      )
      on conflict (slug) do update set
        name = excluded.name,
        api_key = excluded.api_key,
        api_secret = excluded.api_secret,
        is_active = true,
        updated_at = now()
      returning id::text, slug, name;
    `;
    const out = execSync(`supabase db query --linked ${JSON.stringify(sql)}`, {
      cwd: repoRoot,
      encoding: "utf8",
    });
    const match = out.match(/"id":\s*"([^"]+)"/);
    data = {
      id: match?.[1] ?? "unknown",
      slug,
      name,
    };
  } else {
    data = row;
  }

  const base = `${url.replace(/\/$/, "")}/functions/v1/runner-api`;

  console.log("\nRunner API client created\n");
  console.log("ID:     ", data.id);
  console.log("Slug:   ", data.slug);
  console.log("Name:   ", data.name);
  console.log("\nStore these in the runner app (show once):\n");
  console.log("RUNNER_API_KEY=", apiKey);
  console.log("RUNNER_API_SECRET=", apiSecret);
  console.log("RUNNER_API_BASE_URL=", base);
  console.log("\nExample: GET /v1/wallets?email=merchant@example.com");
}

main().catch(console.error);
