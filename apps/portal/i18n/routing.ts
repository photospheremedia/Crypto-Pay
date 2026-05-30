import { defineRouting } from "next-intl/routing";

export const locales = ["en", "ar", "es", "fr", "de", "de-AT"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale: "en",
  localePrefix: "as-needed",
  // Only the URL prefix chooses the locale (/, /login = en; /es, /es/login = es).
  // Prevents a stale NEXT_LOCALE cookie from hijacking unprefixed links after testing languages.
  // Users change language via LocaleSwitcher (explicit navigation + optional cookie sync in proxy).
  localeDetection: false,
  localeCookie: {
    maxAge: 60 * 60 * 24 * 365,
  },
});

export const rtlLocales: Locale[] = ["ar"];

export function isRtlLocale(locale: string): boolean {
  return rtlLocales.includes(locale as Locale);
}
