/**
 * Delete a Supabase Auth user and recreate as a merchant-only account.
 *
 * Usage:
 *   LOCAL_DEV_EMAIL=merchant@example.com LOCAL_DEV_PASSWORD='CryptoPayDev!2026' \
 *     npx tsx scripts/reset-merchant-user.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { execSync } from "child_process";

const portalRoot = resolve(__dirname, "..");
config({ path: resolve(portalRoot, ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.env.LOCAL_DEV_EMAIL || "photospheremedia00@gmail.com").toLowerCase();
const password = process.env.LOCAL_DEV_PASSWORD || "CryptoPayDev!2026";

async function deleteUserData(
  supabase: SupabaseClient,
  userId: string,
) {
  await supabase.from("merchant_wallets").delete().eq("user_id", userId);
  await supabase.from("user_wallet_profiles").delete().eq("user_id", userId);
  await supabase.from("memberships").delete().eq("user_id", userId);
  await supabase.from("user_profiles").delete().eq("id", userId);

  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) {
    throw new Error(`auth.admin.deleteUser failed: ${error.message}`);
  }
}

async function main() {
  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existing = list?.users?.find((u) => u.email?.toLowerCase() === email);

  if (existing?.id) {
    console.log("Deleting existing user:", existing.id, email);
    await deleteUserData(supabase, existing.id);
    console.log("Deleted.");
  } else {
    console.log("No existing auth user for", email);
  }

  console.log("\nRecreating merchant account…");
  execSync(
    `npx tsx scripts/setup-local-dev-user.ts`,
    {
      cwd: portalRoot,
      stdio: "inherit",
      env: {
        ...process.env,
        LOCAL_DEV_EMAIL: email,
        LOCAL_DEV_PASSWORD: password,
        LOCAL_DEV_ADMIN: "0",
      },
    },
  );

  execSync(`npx tsx scripts/connect-supabase-user.ts "${email}"`, {
    cwd: portalRoot,
    stdio: "inherit",
    env: process.env,
  });

  const { error: signInError } = await createClient(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  ).auth.signInWithPassword({ email, password });

  console.log("\n--- Merchant account ready ---");
  console.log("Email:   ", email);
  console.log("Password:", password);
  console.log("Realm:   merchant → /account (not admin)");
  console.log("Sign-in: ", signInError ? `FAILED (${signInError.message})` : "OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
