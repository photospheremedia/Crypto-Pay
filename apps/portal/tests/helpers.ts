import type { Page } from "@playwright/test";

/** Dismiss cookie banner when present (blocks clicks on marketing pages). */
export async function dismissCookieConsent(page: Page) {
  const dialog = page.locator('[aria-labelledby="cookie-consent-title"]');
  if (await dialog.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: /accept all/i }).click({ force: true });
    await page.waitForTimeout(300);
  }
}

/** Fill the /signup form (Login component, mode=signup). */
export async function completeSignupForm(
  page: Page,
  email: string,
  password: string,
) {
  await page.getByLabel(/first name/i).fill("QA");
  await page.getByLabel(/last name/i).fill("User");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: /sign up/i }).click();
}
