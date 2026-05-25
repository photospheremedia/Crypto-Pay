/**
 * Write HTML previews of branded emails to /tmp for browser inspection.
 * Usage: npx tsx scripts/preview-email-templates.ts
 */
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { emailTemplates } from "../lib/email/templates";

const outDir = resolve(process.cwd(), ".email-previews");
mkdirSync(outDir, { recursive: true });

const samples: Record<string, Record<string, unknown>> = {
  welcome: { firstName: "Alex", dashboardUrl: "https://cryptopay.sale/account" },
  email_verification: {
    firstName: "Alex",
    verificationUrl: "https://cryptopay.sale/auth/confirm?token=example",
  },
  password_reset: {
    resetUrl: "https://cryptopay.sale/reset-password?token=example",
    requestTime: new Date().toLocaleString(),
  },
};

for (const [name, data] of Object.entries(samples)) {
  const tpl = emailTemplates[name as keyof typeof emailTemplates];
  if (!tpl) continue;
  const file = resolve(outDir, `${name}.html`);
  writeFileSync(file, tpl.generateHtml(data));
  console.log("Wrote", file);
}
