import type { Metadata } from "next";
import { BRAND, BRAND_COLORS } from "@/lib/cryptopay/constants";
import { locales, routing } from "@/i18n/routing";

export const SITE_URL = BRAND.siteUrl;

export const SITE_METADATA = {
  applicationName: BRAND.name,
  title: `${BRAND.name} — Accept Crypto Payments Instantly`,
  description:
    "Accept crypto payments instantly, securely, and globally. Direct wallet settlement for modern merchants.",
  ogDescription:
    "Accept crypto payments instantly with direct wallet checkout, settlement tracking, and merchant-ready APIs.",
  twitterDescription:
    "Merchant crypto checkout for fast, secure wallet-to-wallet payments.",
  shareHeadline: "Accept crypto payments to your wallet",
  shareAlt: `${BRAND.name} — Accept crypto payments to your wallet`,
  domain: new URL(SITE_URL).hostname,
  themeColor: BRAND_COLORS.primary,
  twitterCreator: "@resthubsolution",
} as const;

const OPEN_GRAPH_LOCALE: Record<(typeof locales)[number], string> = {
  en: "en_US",
  ar: "ar_SA",
  es: "es_ES",
  fr: "fr_FR",
  de: "de_DE",
};

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
  return Object.fromEntries(
    locales.map((locale) => [locale, localePath(locale, path)]),
  );
}

export function buildOpenGraphLocale(locale: string) {
  const current =
    OPEN_GRAPH_LOCALE[locale as (typeof locales)[number]] ?? OPEN_GRAPH_LOCALE.en;

  return {
    locale: current,
    alternateLocale: locales
      .filter((entry) => entry !== locale)
      .map((entry) => OPEN_GRAPH_LOCALE[entry]),
  };
}

/** Shared OG fields — spread into page metadata so child routes do not wipe parent values. */
export const sharedOpenGraph = {
  type: "website" as const,
  siteName: BRAND.name,
  description: SITE_METADATA.ogDescription,
};

export function createPageMetadata({
  title,
  description,
  path,
  openGraphTitle,
  openGraphDescription,
}: {
  title: string;
  description: string;
  path: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: localePath(routing.defaultLocale, path),
      languages: buildLanguageAlternates(path),
    },
    openGraph: {
      ...sharedOpenGraph,
      title: openGraphTitle ?? title,
      description: openGraphDescription ?? description,
      url: localePath(routing.defaultLocale, path),
    },
    twitter: {
      title: openGraphTitle ?? title,
      description: openGraphDescription ?? description,
    },
  };
}

export function createLocalizedMetadata({
  locale,
  title,
  description,
  path,
  openGraphTitle,
  openGraphDescription,
}: {
  locale: string;
  title: string;
  description: string;
  path: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
}): Metadata {
  const ogLocale = buildOpenGraphLocale(locale);

  return {
    title,
    description,
    alternates: {
      canonical: localePath(locale, path),
      languages: buildLanguageAlternates(path),
    },
    openGraph: {
      ...sharedOpenGraph,
      title: openGraphTitle ?? title,
      description: openGraphDescription ?? description,
      url: localePath(locale, path),
      ...ogLocale,
    },
    twitter: {
      title: openGraphTitle ?? title,
      description: openGraphDescription ?? description,
    },
  };
}
