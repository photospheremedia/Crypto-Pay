import { test, expect } from "@playwright/test";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/locale-cookie-client";
import { FUNCTIONAL_CONSENT_COOKIE } from "@/lib/i18n/functional-consent-cookie";
import { THEME_COOKIE_NAME } from "@/lib/theme/theme-preference";
import { dismissCookieConsent } from "./helpers";

test.describe("Cookie proxy & consent", () => {
  test("strips NEXT_LOCALE without functional consent cookie", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: LOCALE_COOKIE_NAME,
        value: "es",
        domain: "localhost",
        path: "/",
      },
    ]);

    const response = await page.goto("/");
    expect(response?.status()).toBeLessThan(500);

    const cookies = await context.cookies();
    const locale = cookies.find((c) => c.name === LOCALE_COOKIE_NAME);
    const functional = cookies.find((c) => c.name === FUNCTIONAL_CONSENT_COOKIE);

    expect(functional?.value).not.toBe("1");
    if (locale) {
      expect(locale.value).not.toBe("es");
    }
  });

  test("allows preference cookies after functional consent", async ({
    page,
    context,
  }) => {
    await context.addCookies([
      {
        name: FUNCTIONAL_CONSENT_COOKIE,
        value: "1",
        domain: "localhost",
        path: "/",
      },
      {
        name: LOCALE_COOKIE_NAME,
        value: "fr",
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/fr", { waitUntil: "domcontentloaded" });

    const cookies = await context.cookies();
    const locale = cookies.find((c) => c.name === LOCALE_COOKIE_NAME);
    expect(locale?.value).toBe("fr");
  });

  test("account redirect preserves response without 500", async ({ page }) => {
    const response = await page.goto("/account");
    expect(response?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/login/);
  });

  test("theme cookie not set before functional consent", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    await dismissCookieConsent(page);

    const cookies = await context.cookies();
    const theme = cookies.find((c) => c.name === THEME_COOKIE_NAME);
    expect(theme?.value).toBeFalsy();
  });
});
