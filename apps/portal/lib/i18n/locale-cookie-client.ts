import { routing, type Locale } from "@/i18n/routing";
import {
  canPersistLocaleCookie,
  localeCookieOptions,
} from "@/lib/i18n/locale-preference";

/** next-intl default cookie name (see `localeCookie` in routing). */
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

/** Persist locale only when functional cookies are allowed (GDPR / cookie banner). */
export function setLocaleCookieClient(locale: Locale): void {
  if (typeof document === "undefined") return;
  if (!routing.locales.includes(locale)) return;
  if (!canPersistLocaleCookie()) return;

  const { path, maxAge, sameSite, secure } = localeCookieOptions();
  const secureFlag = secure ? "; Secure" : "";

  document.cookie = `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)}; Path=${path}; Max-Age=${maxAge}; SameSite=${sameSite}${secureFlag}`;
}
