/**
 * Link a Supabase Auth user to Crypto Pay (tenant + membership + profile).
 *
 * Usage:
 *   npx tsx scripts/connect-supabase-user.ts photospheremedia00@gmail.com
 *   npx tsx scripts/connect-supabase-user.ts photospheremedia00@gmail.com --wallet=bc1qexample...
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

async function main() {
  const email = process.argv[2]?.toLowerCase();
  const walletArg = process.argv.find((a) => a.startsWith("--wallet="));
  const walletAddress = walletArg?.split("=")[1]?.trim();

  if (!email) {
    console.error("Usage: npx tsx scripts/connect-supabase-user.ts <email> [--wallet=ADDRESS]");
    process.exit(1);
  }
  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const user = list?.users?.find((u) => u.email?.toLowerCase() === email);
  if (!user) {
    console.error(`No auth user for ${email}`);
    process.exit(1);
  }

  const displayName =
    (user.user_metadata?.full_name as string) ||
    email.split("@")[0];
  const orgName =
    (user.user_metadata?.org_name as string) || `${displayName} Merchant`;
  const tenantSlug = slugify(orgName) || slugify(email.split("@")[0]);

  console.log("User:", user.id, email);

  let tenantId: string;
  const { data: existingTenant } = await supabase
    .from("tenants")
    .select("id, name, slug")
    .eq("slug", tenantSlug)
    .maybeSingle();

  if (existingTenant) {
    tenantId = existingTenant.id;
    console.log("Tenant (existing):", existingTenant.name, tenantSlug);
  } else {
    const { data: tenant, error: tenantErr } = await supabase
      .from("tenants")
      .insert({ name: orgName, slug: tenantSlug, status: "active" })
      .select("id, name, slug")
      .single();
    if (tenantErr) {
      console.error("Tenant create failed:", tenantErr.message);
      process.exit(1);
    }
    tenantId = tenant.id;
    console.log("Tenant (created):", tenant.name, tenant.slug);
  }

  const { data: existingMembership } = await supabase
    .from("memberships")
    .select("id, role, status")
    .eq("user_id", user.id)
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (existingMembership) {
    console.log("Membership (existing):", existingMembership.role, existingMembership.status);
  } else {
    const { error: memberErr } = await supabase.from("memberships").insert({
      tenant_id: tenantId,
      user_id: user.id,
      role: "owner",
      status: "active",
    });
    if (memberErr) {
      console.error("Membership create failed:", memberErr.message);
      process.exit(1);
    }
    console.log("Membership (created): owner / active");
  }

  const { error: profileErr } = await supabase
    .from("user_profiles")
    .update({
      full_name: displayName,
      org_name: orgName,
      company_name: orgName,
      role: "owner",
      onboarding_completed: true,
      onboarding_step: 99,
      email,
    })
    .eq("id", user.id);

  if (profileErr) {
    console.error("Profile update failed:", profileErr.message);
    process.exit(1);
  }
  console.log("Profile updated: onboarding_completed=true, role=owner");

  if (walletAddress) {
    const { error: walletErr } = await supabase.from("user_wallet_profiles").upsert(
      {
        user_id: user.id,
        wallet_network: "btc",
        wallet_address: walletAddress,
        wallet_verified: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (walletErr) {
      console.error("Wallet profile failed:", walletErr.message);
      process.exit(1);
    }
    console.log("Wallet profile saved (btc)");
  }

  await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      full_name: displayName,
      org_name: orgName,
      role: "owner",
    },
  });

  const { data: verify } = await supabase
    .from("memberships")
    .select("role, status, tenants(name, slug)")
    .eq("user_id", user.id);

  console.log("\nConnected. Summary:");
  console.log(JSON.stringify({ user_id: user.id, email, memberships: verify }, null, 2));
  console.log("\nSign in at:", process.env.NEXT_PUBLIC_APP_URL || "https://cryptopay.sale", "/login");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
