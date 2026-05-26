/**
 * Verify Resend + email env for Crypto Pay.
 * Usage: npx tsx scripts/verify-resend-config.ts [--send-test admin@example.com]
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { config } from "dotenv";
import { resolve } from "path";
import {
  EMAIL_LOGO_STATIC_PATH,
  getEmailAssetOrigin,
  getEmailLogoImageUrl,
} from "../lib/email/brand-assets";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env.development.local") });

const REQUIRED = ["RESEND_API_KEY"] as const;
const RECOMMENDED = [
  "EMAIL_FROM",
  "EMAIL_REPLY_TO",
  "NEXT_PUBLIC_APP_URL",
] as const;

function maskKey(key: string): string {
  if (key.length < 12) return "***";
  return `${key.slice(0, 6)}…${key.slice(-4)}`;
}

async function main() {
  console.log("Crypto Pay — Resend configuration check\n");

  let ok = true;
  for (const name of REQUIRED) {
    const val = process.env[name]?.trim();
    if (!val) {
      console.error(`✗ Missing required: ${name}`);
      ok = false;
    } else {
      console.log(`✓ ${name}=${maskKey(val)}`);
    }
  }

  for (const name of RECOMMENDED) {
    const val = process.env[name]?.trim();
    if (!val) {
      console.warn(`⚠ Missing recommended: ${name}`);
    } else {
      console.log(`✓ ${name}=${val}`);
    }
  }

  const from = process.env.EMAIL_FROM || "Crypto Pay <noreply@cryptopay.sale>";
  if (!from.includes("cryptopay.sale")) {
    console.warn("⚠ EMAIL_FROM should use verified domain @cryptopay.sale");
  }

  const replyTo =
    process.env.EMAIL_REPLY_TO?.trim() || "photospheremedia00@gmail.com";
  if (
    replyTo.endsWith("@cryptopay.sale") &&
    replyTo !== "noreply@cryptopay.sale"
  ) {
    console.warn(
      `⚠ EMAIL_REPLY_TO=${replyTo} — ensure this inbox is monitored (or forward to photospheremedia00@gmail.com).`,
    );
  }

  const logoPath = join(process.cwd(), "public", EMAIL_LOGO_STATIC_PATH);
  if (!existsSync(logoPath)) {
    console.error(`✗ Missing ${logoPath} — run: pnpm email:logo`);
    ok = false;
  } else {
    console.log(`✓ Email logo file: public${EMAIL_LOGO_STATIC_PATH}`);
  }

  const logoUrl = getEmailLogoImageUrl();
  const origin = getEmailAssetOrigin();
  console.log(`  Asset origin: ${origin}`);
  console.log(`  Logo URL: ${logoUrl}`);

  try {
    const head = await fetch(logoUrl, { method: "HEAD", redirect: "follow" });
    if (head.ok) {
      console.log(`✓ Logo reachable at ${logoUrl} (${head.headers.get("content-type") ?? "unknown type"})`);
    } else {
      console.warn(
        `⚠ Logo URL returned HTTP ${head.status} — deploy public/email/*.png or set EMAIL_LOGO_URL`,
      );
    }
  } catch (err) {
    console.warn(`⚠ Could not HEAD logo URL: ${err instanceof Error ? err.message : err}`);
  }

  if (!ok) {
    console.error("\nFix .env.local then re-run.");
    process.exit(1);
  }

  const apiKey = process.env.RESEND_API_KEY!;
  const res = await fetch("https://api.resend.com/domains", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`\n✗ Resend API error (${res.status}):`, body.slice(0, 200));
    process.exit(1);
  }

  const data = (await res.json()) as { data?: Array<{ name: string; status: string }> };
  const domains = data.data ?? [];
  console.log(`\n✓ Resend API key valid — ${domains.length} domain(s)`);
  for (const d of domains) {
    const mark = d.status === "verified" ? "✓" : "○";
    console.log(`  ${mark} ${d.name} (${d.status})`);
  }

  const cryptopay = domains.find((d) => d.name === "cryptopay.sale");
  if (!cryptopay) {
    console.warn("\n⚠ cryptopay.sale not found in Resend — add and verify the domain in Resend dashboard.");
  } else if (cryptopay.status !== "verified") {
    console.warn(`\n⚠ cryptopay.sale status is "${cryptopay.status}" — complete DNS before production sends.`);
  }

  const sendTest = process.argv.includes("--send-test");
  const testTo = process.argv[process.argv.indexOf("--send-test") + 1];
  if (sendTest && testTo) {
    const { sendEmail } = await import("../lib/email/sender");
    const result = await sendEmail({
      to: { email: testTo },
      template: "wallet_submitted_merchant",
      templateData: {
        walletLabel: "Test Wallet",
        walletNetwork: "btc",
      },
      tags: ["verify", "resend-config"],
      workflow: { event: "verify.resend_config", entityId: "test" },
    });
    if (result.success) {
      console.log(`\n✓ Test email sent to ${testTo} (id: ${result.messageId})`);
    } else {
      console.error("\n✗ Test send failed:", result.error);
      process.exit(1);
    }
  } else {
    console.log("\nOptional: npx tsx scripts/verify-resend-config.ts --send-test you@example.com");
    console.log("Preview templates: npx tsx scripts/preview-email-templates.ts");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
