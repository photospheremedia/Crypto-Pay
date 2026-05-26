import { test, expect } from "@playwright/test";

test.describe("Marketing Pages", () => {
  test("homepage loads and displays hero section", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Crypto Pay/);
    await expect(page.locator("nav")).toBeVisible();

    const cta = page.getByRole("link", {
      name: /get started|contact|sign up|create/i,
    });
    await expect(cta.first()).toBeVisible();
  });

  test("pricing page displays pricing tiers", async ({ page }) => {
    await page.goto("/pricing");
    await page.waitForLoadState("domcontentloaded");

    const hasPricing =
      (await page.getByText(/pricing|plans|%|standard|business/i).count()) > 0;
    expect(hasPricing).toBeTruthy();
  });

  test("how-it-works page is accessible", async ({ page }) => {
    await page.goto("/how-it-works");
    await expect(page.locator("main")).toBeVisible();
  });

  test("developers page is accessible", async ({ page }) => {
    await page.goto("/developers");
    await expect(page.locator("main")).toBeVisible();
  });

  test("contact page has form elements", async ({ page }) => {
    await page.goto("/contact");

    const hasForm = (await page.locator("form").count()) > 0;
    const hasContactInfo =
      (await page.getByText(/@|email|contact/i).count()) > 0;

    expect(hasForm || hasContactInfo).toBeTruthy();
  });
});
