import { defineConfig, devices } from "@playwright/test";

const prodBaseURL =
  process.env.PLAYWRIGHT_PROD_BASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  "https://cryptopay.sale";

/**
 * Production smoke tests — no local webServer.
 *
 *   PLAYWRIGHT_PROD_PASSWORD='…' pnpm test:prod
 *   PLAYWRIGHT_ADMIN_PASSWORD / PLAYWRIGHT_MERCHANT_PASSWORD for per-account passwords
 *   PLAYWRIGHT_MERCHANT_EMAIL for the merchant smoke test
 */
export default defineConfig({
  testDir: "./tests",
  testMatch: ["**/prod-connectivity.spec.ts"],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  forbidOnly: !!process.env.CI,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report-prod" }],
    ["json", { outputFile: "playwright-report-prod/results.json" }],
  ],
  use: {
    baseURL: prodBaseURL,
    trace: "on",
    screenshot: "on",
    video: "retain-on-failure",
    ...devices["Desktop Chrome"],
  },
});
