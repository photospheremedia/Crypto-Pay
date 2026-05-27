/**
 * Opens a visible Chromium window, signs in on /login, saves session, keeps browser open.
 *
 * Usage:
 *   pnpm playwright:connect:login          # login → /account
 *   pnpm playwright:connect:login -- --admin # login → /admin/dashboard
 *
 * Requires portal on http://localhost:3001 and `pnpm dev:setup` user.
 */
import { chromium } from "@playwright/test";
import {
  AUTH_STORAGE_PATH,
  DEV_USER_EMAIL,
  loginAsDevUser,
} from "../tests/helpers";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001";

async function main() {
  const afterLogin =
    process.argv.includes("--admin") || process.argv.includes("--stay-admin")
      ? "/admin/dashboard"
      : process.env.PLAYWRIGHT_AFTER_LOGIN ?? "/account";

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  console.log(`Signing in as ${DEV_USER_EMAIL} …`);
  await loginAsDevUser(page, { redirectPath: afterLogin });

  await context.storageState({ path: AUTH_STORAGE_PATH });

  console.log(`\nReady — ${page.url()}`);
  console.log("Session saved to", AUTH_STORAGE_PATH);
  console.log("Close the browser window or press Ctrl+C here to exit.\n");

  await new Promise<void>((resolve) => {
    browser.on("disconnected", () => resolve());
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
