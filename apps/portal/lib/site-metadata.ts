import type { Metadata } from "next";
import { BRAND, BRAND_COLORS } from "@/lib/cryptopay/constants";
import {
  buildLanguageAlternates,
  buildOpenGraphLocale,
  localePath,
} from "@/lib/i18n/locale-config";
import { routing } from "@/i18n/routing";

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

/** Shared OG fields — spread into page metadata so child routes do not wipe parent values. */
export const sharedOpenGraph = {
  type: "website" as const,
  siteName: BRAND.name,
  description: SITE_METADATA.ogDescription,
};

export {
  buildLanguageAlternates,
  buildOpenGraphLocale,
  localePath,
} from "@/lib/i18n/locale-config";

type PageMetadataInput = {
  locale?: string;
  title: string;
  description: string;
  path: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
};

function buildLocalizedPageMetadata({
  locale,
  title,
  description,
  path,
  openGraphTitle,
  openGraphDescription,
}: Required<Pick<PageMetadataInput, "locale">> & PageMetadataInput): Metadata {
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

export function createPageMetadata(input: PageMetadataInput): Metadata {
  return buildLocalizedPageMetadata({
    locale: input.locale ?? routing.defaultLocale,
    ...input,
  });
}

export function createLocalizedMetadata(input: PageMetadataInput & { locale: string }): Metadata {
  return buildLocalizedPageMetadata(input);
}
