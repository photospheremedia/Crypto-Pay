import { defineRouting } from "next-intl/routing";

export const locales = ["en", "ar", "es", "fr", "de", "de-AT"] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale: "en",
  localePrefix: "as-needed",
  // Browser Accept-Language on first visit; NEXT_LOCALE only when functional consent
  // cookie is set (see functional-consent-cookie.ts + proxy.ts).
  localeCookie: {
    maxAge: 60 * 60 * 24 * 365,
  },
});

export const rtlLocales: Locale[] = ["ar"];

export function isRtlLocale(locale: string): boolean {
  return rtlLocales.includes(locale as Locale);
}
