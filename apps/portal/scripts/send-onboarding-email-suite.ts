/**
 * Send all onboarding / wallet transactional templates to a test inbox.
 *
 * Usage:
 *   npx tsx scripts/send-onboarding-email-suite.ts merchant@example.com
 */
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env.development.local") });

const TEST_EMAIL = process.argv[2]?.trim() || "merchant@example.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://cryptopay.sale";

async function delay(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const { sendEmail } = await import("../lib/email/sender");
  const { emailTemplates } = await import("../lib/email/templates");

  const sends: Array<{
    label: string;
    template: keyof typeof emailTemplates;
    data: Record<string, unknown>;
    subject?: string;
  }> = [
    {
      label: "Welcome",
      template: "welcome",
      data: {
        firstName: "Wael",
        dashboardUrl: `${APP_URL}/account?tab=wallets`,
      },
    },
    {
      label: "Wallet submitted (merchant)",
      template: "wallet_submitted_merchant",
      data: { walletLabel: "Main BTC", walletNetwork: "btc" },
    },
    {
      label: "Wallet pending (admin)",
      template: "wallet_pending_admin",
      data: {
        kind: "submitted",
        merchantEmail: TEST_EMAIL,
        walletLabel: "Main BTC",
        walletNetwork: "btc",
        walletAddress: "bc1qexample000000000000000000000000000",
        walletId: "00000000-0000-4000-8000-000000000099",
        source: "portal",
      },
    },
    {
      label: "Wallet verified (merchant)",
      template: "wallet_status_merchant",
      data: {
        status: "verified",
        walletLabel: "Main BTC",
        walletNetwork: "btc",
        walletAddress: "bc1qexample000000000000000000000000000",
        subjectLine: "Wallet verified: Main BTC",
      },
    },
    {
      label: "Wallet rejected (merchant)",
      template: "wallet_status_merchant",
      data: {
        status: "rejected",
        walletLabel: "USDC Treasury",
        walletNetwork: "usdc",
        walletAddress: "0xExample000000000000000000000000000000",
        rejectionReason: "Address format could not be validated.",
        subjectLine: "Wallet not approved: USDC Treasury",
      },
    },
    {
      label: "Admin resend reminder",
      template: "wallet_pending_admin",
      data: {
        kind: "resend",
        merchantEmail: TEST_EMAIL,
        walletLabel: "Main BTC",
        walletNetwork: "btc",
        walletAddress: "bc1qexample000000000000000000000000000",
        walletId: "00000000-0000-4000-8000-000000000099",
        source: "portal",
      },
    },
  ];

  console.log(`Sending ${sends.length} test emails to ${TEST_EMAIL}…\n`);

  for (const item of sends) {
    const result = await sendEmail({
      to: { email: TEST_EMAIL, name: "Wael" },
      template: item.template,
      templateData: item.data,
      subject: item.subject,
      tags: ["test", "onboarding_suite", item.template.replace(/_/g, "-")],
      workflow: {
        event: `test.${item.template}`,
        entityId: item.label,
      },
    });

    if (result.success) {
      console.log(`✓ ${item.label} → ${result.messageId}`);
    } else {
      console.error(`✗ ${item.label}:`, result.error);
    }
    await delay(800);
  }

  console.log("\nDone. Check inbox (and spam) for Crypto Pay messages.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
