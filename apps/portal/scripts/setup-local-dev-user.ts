/**
 * Prepare a confirmed Supabase user for local login at http://localhost:3001
 *
 * Usage:
 *   pnpm dev:setup
 *   LOCAL_DEV_EMAIL=you@example.com LOCAL_DEV_PASSWORD='YourPass123!' pnpm dev:setup
 */
import { config } from "dotenv";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const portalRoot = resolve(__dirname, "..");
config({ path: resolve(portalRoot, ".env.local") });
config({ path: resolve(portalRoot, ".env.development.local"), override: true });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.env.LOCAL_DEV_EMAIL || "merchant@example.com").toLowerCase();
const password = process.env.LOCAL_DEV_PASSWORD || "CryptoPayDev!2026";
const localAppUrl = "http://localhost:3001";

function ensureDevelopmentEnvFile() {
  const devEnvPath = resolve(portalRoot, ".env.development.local");
  const examplePath = resolve(portalRoot, ".env.development.local.example");

  if (existsSync(devEnvPath)) {
    const content = readFileSync(devEnvPath, "utf8");
    if (content.includes("NEXT_PUBLIC_APP_URL=http://localhost:3001")) {
      return;
    }
    writeFileSync(
      devEnvPath,
      `${content.trim()}\n\nNEXT_PUBLIC_APP_URL=http://localhost:3001\n`,
    );
    console.log("Updated", devEnvPath);
    return;
  }

  const template = existsSync(examplePath)
    ? readFileSync(examplePath, "utf8")
    : `NEXT_PUBLIC_APP_URL=http://localhost:3001\n`;
  writeFileSync(devEnvPath, template);
  console.log("Created", devEnvPath);
}

async function main() {
  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in apps/portal/.env.local",
    );
    process.exit(1);
  }

  ensureDevelopmentEnvFile();

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  let user = list?.users?.find((u) => u.email?.toLowerCase() === email);

  if (user) {
    const { data: updated, error } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        email_confirm: true,
        password,
        user_metadata: {
          ...user.user_metadata,
          full_name: user.user_metadata?.full_name || "Local Dev User",
        },
      },
    );
    if (error) {
      console.error("Update user failed:", error.message);
      process.exit(1);
    }
    user = updated.user;
    console.log("Updated existing user:", user?.id);
  } else {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Local Dev User", role: "owner" },
    });
    if (error) {
      console.error("Create user failed:", error.message);
      process.exit(1);
    }
    user = created.user;
    console.log("Created user:", user?.id);
  }

  if (!user?.id) {
    console.error("No user id");
    process.exit(1);
  }

  const { error: signInError } = await createClient(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  ).auth.signInWithPassword({ email, password });

  if (signInError) {
    console.warn("Anon sign-in check failed:", signInError.message);
    console.warn("Ensure NEXT_PUBLIC_SUPABASE_ANON_KEY is set in .env.local");
  } else {
    console.log("Anon sign-in check: OK");
  }

  console.log("\n--- Local dev login ---");
  console.log("1. Start app:  pnpm dev:portal");
  console.log("2. Open:       http://localhost:3001/login");
  console.log("3. Email:      ", email);
  console.log("4. Password:   ", password);
  console.log("\nAfter login you may land on /admin/dashboard (owner role) or /account.");
  console.log(
    "\nSupabase Auth → URL config: add redirect",
    `${localAppUrl}/auth/callback`,
    "if you use magic links or OAuth.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
