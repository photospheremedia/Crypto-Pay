import { test as setup } from "@playwright/test";
import { AUTH_STORAGE_PATH, loginAsDevUser } from "./helpers";

/**
 * Saves authenticated storage state for `pnpm playwright:connect` / `playwright:open`.
 * Requires: portal on :3001, `pnpm dev:setup` user.
 */
setup("authenticate dev user", async ({ page }) => {
  await loginAsDevUser(page);
  await page.context().storageState({ path: AUTH_STORAGE_PATH });
});
