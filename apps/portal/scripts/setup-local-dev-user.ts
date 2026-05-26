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
const email = (
  process.env.LOCAL_DEV_EMAIL || "photospheremedia00@gmail.com"
).toLowerCase();
const password = process.env.LOCAL_DEV_PASSWORD || "CryptoPayDev!2026";
const grantAdmin = process.env.LOCAL_DEV_ADMIN !== "0";
const localAppUrl = "http://localhost:3001";
const ADMIN_TENANT_SLUG = "crypto-pay-admin";

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

  if (grantAdmin) {
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", ADMIN_TENANT_SLUG)
      .maybeSingle();

    if (tenantError) {
      console.warn("Tenant lookup failed:", tenantError.message);
    } else if (!tenant?.id) {
      console.warn(
        `Tenant "${ADMIN_TENANT_SLUG}" not found — run Supabase migrations. isAdminEmail still grants /admin for allowlisted emails.`,
      );
    } else {
      const { data: existing } = await supabase
        .from("memberships")
        .select("id, role")
        .eq("user_id", user.id)
        .eq("tenant_id", tenant.id)
        .maybeSingle();

      if (existing?.id) {
        const { error: memError } = await supabase
          .from("memberships")
          .update({ role: "cp_admin", status: "active" })
          .eq("id", existing.id);
        if (memError) console.warn("Membership update:", memError.message);
        else console.log("Membership updated to cp_admin");
      } else {
        const { error: memError } = await supabase.from("memberships").insert({
          user_id: user.id,
          tenant_id: tenant.id,
          role: "cp_admin",
          status: "active",
        });
        if (memError) console.warn("Membership insert:", memError.message);
        else console.log("Membership created: cp_admin on", ADMIN_TENANT_SLUG);
      }
    }

    await supabase.from("user_profiles").upsert(
      {
        id: user.id,
        email,
        full_name: user.user_metadata?.full_name || "Crypto Pay Admin",
        role: "cp_admin",
      },
      { onConflict: "id" },
    );
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
  console.log(
    "\nAdmin:",
    grantAdmin
      ? "cp_admin membership + allowlisted email → /admin/dashboard"
      : "disabled (LOCAL_DEV_ADMIN=0)",
  );
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
