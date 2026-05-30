import type { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redirect as localeRedirect } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { getUserPreferredLocale } from "@/lib/i18n/locale-actions";
import {
  localizeAppPath,
  localeCookieOptions,
} from "@/lib/i18n/locale-preference";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/locale-cookie-client";
import { getUserPreferredTheme } from "@/lib/theme/theme-actions";
import { THEME_COOKIE_NAME } from "@/lib/theme/theme-preference";
export {
  resolveLocaleForAuthenticatedRedirect,
  shouldRedirectToAccountLocale,
} from "@/lib/i18n/account-locale-policy";

export type AccountPreferenceCookies = {
  localeCookie?: string;
  themeCookie?: string;
};

export type AccountLocaleRedirect = AccountPreferenceCookies & {
  /** Absolute app path, locale-prefixed when a preference exists. */
  path: string;
  locale: Locale | null;
};

/**
 * Resolve a post-auth path and preference cookies from `user_settings`.
 * Used by OAuth callback, email confirm, and password sign-in.
 */
export async function resolveAccountLocaleRedirect(
  userId: string,
  targetPath: string,
): Promise<AccountLocaleRedirect> {
  const [preferredLocale, preferredTheme] = await Promise.all([
    getUserPreferredLocale(userId),
    getUserPreferredTheme(userId),
  ]);

  const path = preferredLocale
    ? localizeAppPath(preferredLocale, targetPath)
    : targetPath;

  return {
    path,
    locale: preferredLocale,
    localeCookie: preferredLocale ?? undefined,
    themeCookie: preferredTheme ?? undefined,
  };
}

export function applyAccountPreferenceCookies(
  response: NextResponse,
  prefs: AccountPreferenceCookies,
): void {
  const cookieOpts = localeCookieOptions();
  if (prefs.localeCookie) {
    response.cookies.set(LOCALE_COOKIE_NAME, prefs.localeCookie, cookieOpts);
  }
  if (prefs.themeCookie) {
    response.cookies.set(THEME_COOKIE_NAME, prefs.themeCookie, cookieOpts);
  }
}

/**
 * Persist the routing locale cookie from a server action (cookies() is valid here).
 * Keeps NEXT_LOCALE in sync with the account language so the proxy can route
 * unprefixed deep links without a DB read. Mirrors OAuth callback / email confirm.
 */
export async function persistLocaleCookie(locale: Locale): Promise<void> {
  const store = await cookies();
  store.set(LOCALE_COOKIE_NAME, locale, localeCookieOptions());
}

/** Locale-aware redirect for server actions (typed as `never` for ActionState flows). */
export function redirectAuthenticatedUser(href: string, locale: Locale): never {
  localeRedirect({ href, locale });
  throw new Error("Unreachable redirect");
}
