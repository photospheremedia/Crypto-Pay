/**
 * Write branded Supabase Auth HTML to supabase/templates/ and optionally push to remote.
 *
 * Usage:
 *   npx tsx scripts/sync-supabase-auth-templates.ts
 *   SUPABASE_ACCESS_TOKEN=... npx tsx scripts/sync-supabase-auth-templates.ts --push
 *   SUPABASE_ACCESS_TOKEN=... RESEND_API_KEY=... npx tsx scripts/sync-supabase-auth-templates.ts --push --push-auth
 */
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import {
  generateSupabaseAuthEmailHtml,
  SUPABASE_AUTH_TEMPLATE_FILES,
} from "../lib/email/supabase-auth-template";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../../.."); // apps/portal/scripts → repo root
const templatesDir = resolve(repoRoot, "supabase/templates");

const subjects: Record<keyof typeof SUPABASE_AUTH_TEMPLATE_FILES, string> = {
  confirmation: "Confirm your Crypto Pay account",
  recovery: "Reset your Crypto Pay password",
  magic_link: "Your Crypto Pay sign-in link",
  invite: "You're invited to Crypto Pay",
  email_change: "Confirm your new email — Crypto Pay",
};

mkdirSync(templatesDir, { recursive: true });

for (const [variant, filename] of Object.entries(SUPABASE_AUTH_TEMPLATE_FILES)) {
  const html = generateSupabaseAuthEmailHtml(
    variant as keyof typeof SUPABASE_AUTH_TEMPLATE_FILES,
  );
  const path = resolve(templatesDir, `${filename}.html`);
  writeFileSync(path, `${html}\n`, "utf8");
  console.log("Wrote", path);
}

function buildAuthConfigPayload(
  templatesOnly: boolean,
): Record<string, string | boolean | number> {
  const payload: Record<string, string | boolean | number> = {
    mailer_subjects_confirmation: subjects.confirmation,
    mailer_subjects_recovery: subjects.recovery,
    mailer_subjects_invite: subjects.invite,
    mailer_subjects_magic_link: subjects.magic_link,
    mailer_subjects_email_change: subjects.email_change,
    mailer_templates_confirmation_content: generateSupabaseAuthEmailHtml(
      "confirmation",
    ),
    mailer_templates_recovery_content:
      generateSupabaseAuthEmailHtml("recovery"),
    mailer_templates_invite_content: generateSupabaseAuthEmailHtml("invite"),
    mailer_templates_magic_link_content:
      generateSupabaseAuthEmailHtml("magic_link"),
    mailer_templates_email_change_content:
      generateSupabaseAuthEmailHtml("email_change"),
  };

  if (!templatesOnly) {
    const resendKey = process.env.RESEND_API_KEY?.trim();
    if (!resendKey) {
      console.error("Set RESEND_API_KEY for --push-auth");
      process.exit(1);
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      "https://cryptopay.sale";

    Object.assign(payload, {
      site_url: appUrl,
      uri_allow_list: [
        `${appUrl}/**`,
        "https://www.cryptopay.sale/**",
        "http://localhost:3000/**",
        "http://localhost:3001/**",
      ].join(","),
      external_email_enabled: true,
      mailer_autoconfirm: false,
      mailer_secure_email_change_enabled: true,
      mailer_otp_exp: 3600,
      smtp_admin_email:
        process.env.SMTP_ADMIN_EMAIL?.trim() || "noreply@cryptopay.sale",
      smtp_sender_name: process.env.SMTP_SENDER_NAME?.trim() || "Crypto Pay",
      smtp_host: "smtp.resend.com",
      smtp_port: "587",
      smtp_user: "resend",
      smtp_pass: resendKey,
    });
  }

  return payload;
}

async function pushRemote() {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  const projectRef =
    process.env.SUPABASE_PROJECT_REF?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
      /https:\/\/([a-z0-9]+)\.supabase\.co/i,
    )?.[1];

  if (!token || !projectRef) {
    console.error(
      "Set SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF (or NEXT_PUBLIC_SUPABASE_URL) for --push",
    );
    process.exit(1);
  }

  const templatesOnly = !process.argv.includes("--push-auth");
  const payload = buildAuthConfigPayload(templatesOnly);

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/config/auth`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    console.error("Supabase API error:", res.status, await res.text());
    process.exit(1);
  }

  const scope = templatesOnly ? "email templates" : "auth config (SMTP + confirmations + templates)";
  console.log(`✓ Pushed ${scope} to project ${projectRef}`);
}

if (process.argv.includes("--push")) {
  void pushRemote();
} else {
  console.log(
    "\nRun with --push and SUPABASE_ACCESS_TOKEN to update remote Auth templates.",
  );
  console.log("Add --push-auth and RESEND_API_KEY to enable confirmations + Resend SMTP.");
}
