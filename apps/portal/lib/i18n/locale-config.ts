import { routing, type Locale } from "@/i18n/routing";

/** Supported UI locales — always derived from next-intl routing. */
export const localeCodes = routing.locales as readonly Locale[];

export type { Locale };

/** Maps each site locale to regional BCP 47 / Open Graph / HTML language codes. */
export const LOCALE_REGIONS = {
  en: {
    hreflang: "en-US",
    openGraphLocale: "en_US",
    htmlLang: "en",
  },
  ar: {
    hreflang: "ar-SA",
    openGraphLocale: "ar_SA",
    htmlLang: "ar",
  },
  es: {
    hreflang: "es-ES",
    openGraphLocale: "es_ES",
    htmlLang: "es",
  },
  fr: {
    hreflang: "fr-FR",
    openGraphLocale: "fr_FR",
    htmlLang: "fr",
  },
  de: {
    hreflang: "de-DE",
    openGraphLocale: "de_DE",
    htmlLang: "de",
  },
  "de-AT": {
    hreflang: "de-AT",
    openGraphLocale: "de_AT",
    htmlLang: "de-AT",
  },
} as const satisfies Record<
  Locale,
  { hreflang: string; openGraphLocale: string; htmlLang: string }
>;

export function isLocale(value: string): value is Locale {
  return localeCodes.includes(value as Locale);
}

export function getLocaleRegion(locale: string) {
  return isLocale(locale) ? LOCALE_REGIONS[locale] : LOCALE_REGIONS.en;
}

export function getHreflang(locale: string) {
  return getLocaleRegion(locale).hreflang;
}

export function getOpenGraphLocale(locale: string) {
  return getLocaleRegion(locale).openGraphLocale;
}

export function getHtmlLang(locale: string) {
  return getLocaleRegion(locale).htmlLang;
}

/** Relative path for a locale-aware URL (works with metadataBase). */
export function localePath(locale: string, path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const suffix = normalizedPath === "/" ? "" : normalizedPath;

  if (locale === routing.defaultLocale) {
    return suffix || "/";
  }

  return `/${locale}${suffix}`;
}

export function buildLanguageAlternates(path = "/") {
  const languages = Object.fromEntries(
    localeCodes.map((locale) => [getHreflang(locale), localePath(locale, path)]),
  ) as Record<string, string>;

  languages["x-default"] = localePath(routing.defaultLocale, path);

  return languages;
}

export function buildOpenGraphLocale(locale: string) {
  const current = getOpenGraphLocale(locale);

  return {
    locale: current,
    alternateLocale: localeCodes
      .filter((entry) => entry !== locale)
      .map((entry) => getOpenGraphLocale(entry)),
  };
}
