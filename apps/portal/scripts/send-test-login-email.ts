/**
 * Send production test login details via Resend.
 * Usage: npx tsx scripts/send-test-login-email.ts [email] [password]
 */
import { config } from "dotenv";
import { resolve } from "path";
import { sendEmail } from "../lib/email/sender";
import { generateBaseTemplate, components, brandColors } from "../lib/email/base-template";

config({ path: resolve(process.cwd(), ".env.local") });

const email = process.argv[2] || "merchant@example.com";
const password = process.argv[3];
const loginUrl = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/login`
  : "https://cryptopay.sale/login";

async function main() {
  if (!password) {
    console.error("Usage: npx tsx scripts/send-test-login-email.ts <email> <password>");
    process.exit(1);
  }

  const html = generateBaseTemplate(
    `
    ${components.iconHero("🔐", "Your test account", "Production credentials for Crypto Pay.")}
    ${components.contentOpen()}
      ${components.paragraph(`<strong>Email:</strong> ${email}`)}
      ${components.card(
        `<p style="margin:0 0 8px;font-size:13px;font-weight:600;color:${brandColors.secondary};">Temporary password</p>
         <p style="margin:0;font-size:18px;font-weight:700;font-family:ui-monospace,monospace;letter-spacing:0.05em;color:${brandColors.primary};">${password}</p>`,
        { highlight: true },
      )}
      ${components.button("Sign in", loginUrl)}
      ${components.paragraph("Change your password after first login under Account → Security.", { small: true, muted: true, center: true })}
    ${components.contentClose()}
    `,
    { preheader: "Your Crypto Pay test login details" },
  );

  const result = await sendEmail({
    to: { email },
    subject: "Your Crypto Pay test account",
    html,
    tags: ["test", "credentials"],
  });

  if (!result.success) {
    console.error("Send failed:", result.error);
    process.exit(1);
  }
  console.log("Branded email sent:", result.messageId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
