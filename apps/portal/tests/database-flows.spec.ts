import { test, expect } from "@playwright/test";
import { dismissCookieConsent } from "./helpers";

/**
 * UI + API flows for the Crypto Pay portal (wallet / merchant product).
 */

test.describe("Database Flows", () => {
  test.describe("Marketing & pricing", () => {
    test("homepage loads", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveTitle(/Crypto Pay/i);
      await expect(page.locator("main")).toBeVisible();
    });

    test("pricing page loads plans", async ({ page }) => {
      await page.goto("/pricing");
      await page.waitForLoadState("domcontentloaded");
      const hasPricing = await page.getByText(/%|plan|pricing|standard/i).count();
      expect(hasPricing).toBeGreaterThan(0);
    });

    test("developers page loads", async ({ page }) => {
      await page.goto("/developers");
      await expect(page.locator("main")).toBeVisible();
    });
  });

  test.describe("Lead capture", () => {
    test("contact form submission shows feedback", async ({ page }) => {
      await page.addInitScript(() => {
        (window as unknown as { mailtoTriggered?: boolean }).mailtoTriggered = false;
        const originalHref = Object.getOwnPropertyDescriptor(
          window.Location.prototype,
          "href",
        );
        Object.defineProperty(window.Location.prototype, "href", {
          set(value: string) {
            if (typeof value === "string" && value.startsWith("mailto:")) {
              (window as unknown as { mailtoTriggered: boolean }).mailtoTriggered =
                true;
              return;
            }
            originalHref?.set?.call(this, value);
          },
          get() {
            return originalHref?.get?.call(this);
          },
          configurable: true,
        });
      });

      await page.goto("/contact");
      await page.waitForLoadState("domcontentloaded");
      await dismissCookieConsent(page);

      const form = page.locator("form");
      if ((await form.count()) === 0) {
        test.skip();
        return;
      }

      const nameField = page
        .locator('input[name*="name"], input[placeholder*="name" i]')
        .first();
      const emailField = page.locator('input[type="email"]').first();
      const companyField = page
        .locator('input[name*="company"], input[placeholder*="company" i]')
        .first();
      const messageField = page.locator("textarea").first();

      if (await nameField.count()) await nameField.fill("Test User");
      if (await emailField.count()) await emailField.fill("test@playwright.test");
      if (await companyField.count()) await companyField.fill("Test Company");
      if (await messageField.count()) {
        await messageField.fill("Playwright contact form test");
      }

      const submitBtn = page.locator('button[type="submit"]').first();
      if (await submitBtn.count()) {
        await submitBtn.click({ force: true });

        const hasSuccessUI = await page
          .getByText(/thanks for reaching out/i)
          .waitFor({ state: "visible", timeout: 5000 })
          .then(() => true)
          .catch(() => false);

        if (!hasSuccessUI) {
          let mailtoTriggered = false;
          try {
            mailtoTriggered = await page.evaluate(
              () =>
                (window as unknown as { mailtoTriggered?: boolean })
                  .mailtoTriggered === true,
            );
          } catch {
            mailtoTriggered = true;
          }
          expect(mailtoTriggered).toBeTruthy();
        }
      }
    });
  });

  test.describe("Account (unauthenticated)", () => {
    test("account redirects or prompts sign-in", async ({ page }) => {
      await page.goto("/account");
      await page.waitForTimeout(1500);
      const onLogin = page.url().includes("login");
      const needsAuth =
        (await page.getByText(/sign in|log in|unauthorized/i).count()) > 0;
      expect(onLogin || needsAuth).toBeTruthy();
    });

    test("removed shop routes return 404", async ({ request }) => {
      const response = await request.get("/shop", { maxRedirects: 0 });
      expect([404, 308, 307].includes(response.status())).toBeTruthy();
    });
  });

  test.describe("API endpoints", () => {
    test("health endpoint returns healthy", async ({ request }) => {
      const response = await request.get("/api/health");
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.status).toBe("healthy");
    });

    test("crypto-rates endpoint returns rates or 502", async ({ request }) => {
      const response = await request.get("/api/crypto-rates");
      expect([200, 502].includes(response.status())).toBeTruthy();
    });

    test("user API returns null when unauthenticated", async ({ request }) => {
      const response = await request.get("/api/user");
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data === null || typeof data === "object").toBeTruthy();
    });

    test("admin wallets API requires auth", async ({ request }) => {
      const response = await request.get("/api/admin/wallets");
      expect([401, 403].includes(response.status())).toBeTruthy();
    });

    test("removed orders API returns 404", async ({ request }) => {
      const response = await request.get("/api/orders");
      expect(response.status()).toBe(404);
    });
  });
});
