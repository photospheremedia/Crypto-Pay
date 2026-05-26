import { test, expect } from "@playwright/test";
import {
  PROD_ADMIN_EMAIL,
  PROD_BASE_URL,
  PROD_MERCHANT_EMAIL,
  loginWithSupabaseSession,
  prodPasswordFor,
} from "./helpers";
import { SupabaseMonitor } from "./supabase-monitor";

test.describe.configure({ mode: "serial" });

test.describe("Production connectivity @prod", () => {
  test.skip(
    !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "Requires apps/portal/.env.local with Supabase keys",
  );

  test("admin (PhotoSphere) reaches /admin/dashboard", async ({ page }, testInfo) => {
    const monitor = new SupabaseMonitor();
    monitor.attach(page);

    await loginWithSupabaseSession(page, {
      email: PROD_ADMIN_EMAIL,
      password: prodPasswordFor(PROD_ADMIN_EMAIL),
      redirectPath: "/admin/dashboard",
      baseURL: PROD_BASE_URL,
    });

    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15_000 });
    await expect(
      page.getByRole("heading", { name: /operations overview/i }),
    ).toBeVisible({ timeout: 15_000 });

    monitor.assertClean("Admin session");
    await monitor.attachReport(testInfo);
  });

  test("merchant (demo merchant) reaches account area", async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    const monitor = new SupabaseMonitor();
    monitor.attach(page);

    await loginWithSupabaseSession(page, {
      email: PROD_MERCHANT_EMAIL,
      password: prodPasswordFor(PROD_MERCHANT_EMAIL),
      redirectPath: "/account?tab=overview",
      baseURL: PROD_BASE_URL,
    });

    await expect(page).toHaveURL(/\/(account|admin)/, { timeout: 15_000 });
    await expect(page).not.toHaveURL(/\/login/);

    const onAdmin = /\/admin/.test(page.url());
    if (onAdmin) {
      await expect(page.getByText(/operations overview|dashboard/i).first()).toBeVisible({
        timeout: 15_000,
      });
    } else {
      await expect(page.locator("body")).toContainText(/account|wallet|dashboard/i, {
        timeout: 15_000,
      });
    }

    monitor.assertClean("Merchant session");
    await monitor.attachReport(testInfo);
  });
});
