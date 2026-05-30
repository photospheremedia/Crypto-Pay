import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import {
  DEV_USER_EMAIL,
  DEV_USER_PASSWORD,
  dismissCookieConsent,
  loginAsDevUser,
} from "./helpers";
import { FUNCTIONAL_CONSENT_COOKIE } from "@/lib/i18n/functional-consent-cookie";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/locale-cookie-client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

async function setDevUserLanguage(language: string | null) {
  if (!supabaseUrl || !serviceKey) {
    test.skip();
    return null;
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: list, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listError) {
    throw new Error(`listUsers failed: ${listError.message}`);
  }

  const user = list.users.find(
    (entry) => entry.email?.toLowerCase() === DEV_USER_EMAIL,
  );
  if (!user) {
    test.skip(true, `Dev user ${DEV_USER_EMAIL} not found — run pnpm dev:setup`);
    return null;
  }

  const { error } = await admin.from("user_settings").upsert(
    { user_id: user.id, language },
    { onConflict: "user_id" },
  );
  if (error) {
    throw new Error(`user_settings upsert failed: ${error.message}`);
  }

  return user.id;
}

test.describe("Logged-in account locale", () => {
  test.beforeAll(async () => {
    if (!supabaseUrl || !serviceKey) {
      test.skip();
    }
  });

  test.afterEach(async () => {
    await setDevUserLanguage("en");
  });

  test("redirects unprefixed admin dashboard to saved Spanish preference", async ({
    page,
    context,
  }) => {
    await setDevUserLanguage("es");

    await loginAsDevUser(page, { redirectPath: "/admin/dashboard" });
    await dismissCookieConsent(page);

    // Post-login state: auth flow persists NEXT_LOCALE from user_settings.language.
    // The session is injected directly here, so seed the cookie to mirror that.
    await context.addCookies([
      {
        name: FUNCTIONAL_CONSENT_COOKIE,
        value: "1",
        domain: "localhost",
        path: "/",
      },
      {
        name: LOCALE_COOKIE_NAME,
        value: "es",
        domain: "localhost",
        path: "/",
      },
    ]);

    const response = await page.goto("/admin/dashboard", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBeLessThan(500);

    await expect(page).toHaveURL(/\/es\/admin\/dashboard/);
    await expect(page.getByText(/crypto pay/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("password sign-in lands on preferred locale dashboard", async ({
    page,
    context,
  }) => {
    test.skip(
      process.env.PLAYWRIGHT_LOGIN_UI !== "1",
      "Set PLAYWRIGHT_LOGIN_UI=1 to exercise the login form redirect",
    );

    await setDevUserLanguage("es");

    await context.addCookies([
      {
        name: FUNCTIONAL_CONSENT_COOKIE,
        value: "1",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/login");
    await dismissCookieConsent(page);

    await page.locator("#email").fill(DEV_USER_EMAIL);
    await page.locator("#password").fill(DEV_USER_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/es\/admin\/dashboard/, { timeout: 30_000 });
  });
});
