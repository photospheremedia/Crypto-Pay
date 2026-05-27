import { hasLocale } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/locale-cookie-client";
import { localePath } from "@/lib/i18n/locale-config";

/**
 * Locale resolution priority (extends next-intl middleware defaults):
 *
 * 1. Locale prefix in URL — explicit navigation / shared links
 * 2. Logged-in `user_settings.language` — account preference (applied on auth redirect)
 * 3. `NEXT_LOCALE` cookie — only when functional cookies are allowed
 * 4. `Accept-Language` header — browser language on first visit (next-intl "best fit")
 * 5. `routing.defaultLocale` (`en`)
 *
 * @see https://next-intl.dev/docs/routing/middleware#locale-detection
 */

/** ISO 3166-1 alpha-2 codes mapped to `@sankyu/react-circle-flags` named components in `LocaleFlag`. */
export const LOCALE_FLAG_COUNTRIES = {
  en: "us",
  ar: "sa",
  es: "es",
  fr: "fr",
  de: "de",
  "de-AT": "at",
} as const satisfies Record<Locale, string>;

export function getLocaleFlagCountry(locale: string): string {
  return hasLocale(routing.locales, locale)
    ? LOCALE_FLAG_COUNTRIES[locale]
    : LOCALE_FLAG_COUNTRIES.en;
}

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Whether the visitor allowed functional / preference cookies (client-only). */
export function canPersistLocaleCookie(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const raw = localStorage.getItem("cryptopay-cookie-preferences");
    if (!raw) return false;
    const prefs = JSON.parse(raw) as { functional?: boolean };
    return prefs.functional === true;
  } catch {
    return false;
  }
}

/** Remove persisted locale when functional cookies are revoked. */
export function clearLocaleCookieClient(): void {
  if (typeof document === "undefined") return;

  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  document.cookie = `${LOCALE_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

/** Map a path like `/account` to a locale-aware path (`/es/account`, `/` stays unprefixed for `en`). */
export function localizeAppPath(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return localePath(locale, normalized);
}

/**
 * Negotiate the best supported locale from an Accept-Language value.
 * Mirrors next-intl middleware "best fit" for edge/auth redirects without running middleware.
 */
export function negotiateLocaleFromAcceptLanguage(
  acceptLanguage: string | null,
): Locale {
  if (!acceptLanguage) return routing.defaultLocale;

  const tags = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.split("=")[1] ?? "1") : 1;
      return { tag: tag.toLowerCase(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((entry) => entry.tag)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of tags) {
    if (hasLocale(routing.locales, tag)) {
      return tag;
    }

    const base = tag.split("-")[0];
    const regionalMatch = routing.locales.find(
      (locale) => locale.toLowerCase() === tag || locale.split("-")[0] === base,
    );
    if (regionalMatch && hasLocale(routing.locales, regionalMatch)) {
      return regionalMatch;
    }
  }

  return routing.defaultLocale;
}

export function localeCookieOptions(maxAge = ONE_YEAR_SECONDS) {
  return {
    path: "/",
    maxAge,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}
