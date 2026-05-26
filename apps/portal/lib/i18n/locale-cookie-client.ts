import { routing, type Locale } from "@/i18n/routing";

/** next-intl default cookie name (see `localeCookie` in routing). */
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Immediate client-side locale persistence while navigation is in flight. */
export function setLocaleCookieClient(locale: Locale): void {
  if (typeof document === "undefined") return;
  if (!routing.locales.includes(locale)) return;

  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax${secure}`;
}
