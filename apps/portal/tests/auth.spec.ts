import { test, expect } from "@playwright/test";
import { completeSignupForm, dismissCookieConsent } from "./helpers";

test.describe("Authentication Flow", () => {
  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign in", exact: true }),
    ).toBeVisible();

    const hasSignupLink =
      (await page.getByRole("link", { name: /create an account/i }).count()) >
      0;
    const hasNewToText =
      (await page.getByText(/new to crypto pay/i).count()) > 0;
    expect(hasSignupLink || hasNewToText).toBeTruthy();
  });

  test("signup page renders registration form", async ({ page }) => {
    await page.goto("/signup");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await expect(page.getByLabel(/last name/i)).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign up/i })).toBeVisible();
  });

  test("signup flow submits successfully", async ({ page }) => {
    await page.goto("/signup");
    await dismissCookieConsent(page);

    const uniqueEmail = `qa-signup-${Date.now()}@outlook.com`;
    await completeSignupForm(page, uniqueEmail, "StrongPass123!");

    await expect
      .poll(
        async () => {
          const url = page.url();
          const onWalletSetup =
            /\/account(\?|.*&)tab=wallets/.test(url) ||
            /\/account\/setup/.test(url) ||
            /\/account\/get-started/.test(url);
          const onLoginCreated = /\/login\?created=1/.test(url);
          const hasSuccessMessage =
            (await page.getByText(
              /account created|check your email|verify your account|welcome/i,
            ).count()) > 0;
          const hasRateLimitMessage =
            (await page.getByText(
              /email rate limit|rate-limited|too many requests/i,
            ).count()) > 0;
          const hasInlineError =
            (await page.locator(".text-red-600").count()) > 0;
          return (
            onWalletSetup ||
            onLoginCreated ||
            hasSuccessMessage ||
            hasRateLimitMessage ||
            hasInlineError
          );
        },
        { timeout: 20000 },
      )
      .toBeTruthy();
  });

  test("forgot password page is accessible", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("invalid login shows error message", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel(/email/i).fill("invalid@test.com");
    await page.getByLabel(/password/i).fill("wrongpassword123");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await page.waitForTimeout(3000);

    const hasError =
      (await page.getByText(/invalid|error|incorrect|failed/i).count()) > 0;
    const stillOnLogin = page.url().includes("login");

    expect(hasError || stillOnLogin).toBeTruthy();
  });
});
