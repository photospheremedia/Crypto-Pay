/**
 * Playwright helper: configure hosted Supabase Auth after you sign in manually.
 *
 * Usage:
 *   1. Sign in at https://supabase.com/dashboard (GitHub or email).
 *   2. Run: SUPABASE_PROJECT_REF=usbxwewohpsbjwiuazpf pnpm playwright:configure-supabase-auth
 *
 * Optional: PLAYWRIGHT_CDP_URL=http://127.0.0.1:9222 to attach to an existing Chrome.
 */
import { chromium, type Browser, type Page } from "@playwright/test";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../../..");
const templatesDir = resolve(repoRoot, "supabase/templates");

const projectRef =
  process.env.SUPABASE_PROJECT_REF?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
    /https:\/\/([a-z0-9]+)\.supabase\.co/i,
  )?.[1];

if (!projectRef) {
  console.error("Set SUPABASE_PROJECT_REF or NEXT_PUBLIC_SUPABASE_URL");
  process.exit(1);
}

const base = `https://supabase.com/dashboard/project/${projectRef}`;

async function connectBrowser(): Promise<{ browser: Browser; page: Page }> {
  const cdp = process.env.PLAYWRIGHT_CDP_URL?.trim();
  if (cdp) {
    const browser = await chromium.connectOverCDP(cdp);
    const page = browser.contexts()[0]?.pages()[0] ?? (await browser.newPage());
    return { browser, page };
  }

  console.log("Launching Chromium — sign in to Supabase when prompted…");
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  return { browser, page };
}

async function waitForDashboard(page: Page) {
  await page.goto("https://supabase.com/dashboard/organizations", {
    waitUntil: "domcontentloaded",
  });
  if (page.url().includes("/sign-in")) {
    console.log(
      "\nSign in to Supabase in the browser window, then press Enter here…",
    );
    await new Promise<void>((resolve) => {
      process.stdin.once("data", () => resolve());
    });
    await page.goto("https://supabase.com/dashboard/organizations", {
      waitUntil: "networkidle",
    });
  }
}

async function setToggle(page: Page, label: string, desiredOn: boolean) {
  const row = page.getByRole("switch", { name: new RegExp(label, "i") });
  const count = await row.count();
  if (count === 0) {
    console.warn(`  ⚠ Switch not found: ${label}`);
    return;
  }
  const checked = (await row.first().getAttribute("aria-checked")) === "true";
  if (checked !== desiredOn) {
    await row.first().click();
    await page.waitForTimeout(500);
  }
  console.log(`  ✓ ${label}: ${desiredOn ? "on" : "off"}`);
}

async function configureProviders(page: Page) {
  await page.goto(`${base}/auth/providers`, { waitUntil: "networkidle" });
  console.log("\nAuth → Providers");
  await setToggle(page, "Confirm email", true);
}

async function configureSmtp(page: Page) {
  await page.goto(`${base}/settings/auth`, { waitUntil: "networkidle" });
  console.log("\nProject Settings → Auth → SMTP");

  await setToggle(page, "Enable custom SMTP", true);

  const host = page.getByLabel(/host/i);
  if ((await host.count()) > 0) await host.fill("smtp.resend.com");

  const port = page.getByLabel(/port/i);
  if ((await port.count()) > 0) await port.fill("587");

  const user = page.getByLabel(/username|user/i);
  if ((await user.count()) > 0) await user.fill("resend");

  const pass = page.getByLabel(/password/i);
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if ((await pass.count()) > 0 && resendKey) {
    await pass.fill(resendKey);
  } else if (!resendKey) {
    console.warn("  ⚠ Set RESEND_API_KEY to auto-fill SMTP password");
  }

  const fromEmail = page.getByLabel(/sender email|from email/i);
  if ((await fromEmail.count()) > 0) {
    await fromEmail.fill(
      process.env.SMTP_ADMIN_EMAIL?.trim() || "noreply@cryptopay.sale",
    );
  }

  const save = page.getByRole("button", { name: /save/i });
  if ((await save.count()) > 0) {
    await save.first().click();
    await page.waitForTimeout(1000);
    console.log("  ✓ Saved SMTP settings");
  }
}

async function pasteTemplate(
  page: Page,
  templateName: RegExp,
  file: string,
  subject: string,
) {
  const tab = page.getByRole("tab", { name: templateName });
  if ((await tab.count()) === 0) {
    const link = page.getByRole("link", { name: templateName });
    if ((await link.count()) > 0) await link.first().click();
  } else {
    await tab.first().click();
  }

  const subjectInput = page.getByLabel(/subject/i);
  if ((await subjectInput.count()) > 0) await subjectInput.fill(subject);

  const html = readFileSync(resolve(templatesDir, file), "utf8");
  const editor = page.locator('textarea, [contenteditable="true"]').first();
  if ((await editor.count()) > 0) {
    await editor.click();
    await page.keyboard.press("Meta+A");
    await page.keyboard.insertText(html);
  }

  const save = page.getByRole("button", { name: /save/i });
  if ((await save.count()) > 0) {
    await save.first().click();
    await page.waitForTimeout(800);
  }
  console.log(`  ✓ ${file}`);
}

async function configureTemplates(page: Page) {
  await page.goto(`${base}/auth/templates`, { waitUntil: "networkidle" });
  console.log("\nAuth → Email Templates");

  await pasteTemplate(
    page,
    /confirm signup|confirmation/i,
    "confirm.html",
    "Confirm your Crypto Pay account",
  );
  await pasteTemplate(
    page,
    /reset password|recovery/i,
    "recovery.html",
    "Reset your Crypto Pay password",
  );
  await pasteTemplate(
    page,
    /magic link/i,
    "magic_link.html",
    "Your Crypto Pay sign-in link",
  );
  await pasteTemplate(
    page,
    /change email/i,
    "email_change.html",
    "Confirm your new email — Crypto Pay",
  );
}

async function main() {
  const { browser, page } = await connectBrowser();
  try {
    await waitForDashboard(page);
    await configureProviders(page);
    await configureSmtp(page);
    await configureTemplates(page);
    console.log("\nDone. Verify in dashboard, then test signup on staging.");
  } finally {
    if (!process.env.PLAYWRIGHT_CDP_URL) {
      console.log("\nBrowser left open for review. Close it or Ctrl+C.");
      await page.waitForTimeout(60_000);
      await browser.close();
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
