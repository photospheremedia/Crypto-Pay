import { test, expect } from "@playwright/test";
import {
  resolveLocaleForAuthenticatedRedirect,
  shouldRedirectToAccountLocale,
} from "@/lib/i18n/account-locale-policy";

test.describe("Account locale helpers", () => {
  test("shouldRedirectToAccountLocale detects English URL vs Spanish preference", () => {
    expect(shouldRedirectToAccountLocale("/account", "es")).toBe(true);
    expect(shouldRedirectToAccountLocale("/es/account", "es")).toBe(false);
    expect(shouldRedirectToAccountLocale("/fr/account", "es")).toBe(true);
  });

  test("resolveLocaleForAuthenticatedRedirect prefers explicit URL locale", () => {
    expect(
      resolveLocaleForAuthenticatedRedirect("/es/account", "fr"),
    ).toEqual({ href: "/account", locale: "es" });
  });

  test("resolveLocaleForAuthenticatedRedirect uses account preference when URL is unprefixed", () => {
    expect(resolveLocaleForAuthenticatedRedirect("/account", "es")).toEqual({
      href: "/account",
      locale: "es",
    });
    expect(resolveLocaleForAuthenticatedRedirect("/admin/dashboard", null)).toEqual({
      href: "/admin/dashboard",
      locale: "en",
    });
  });
});
