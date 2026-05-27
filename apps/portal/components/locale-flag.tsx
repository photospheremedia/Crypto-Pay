"use client";

import type { ComponentType, SVGProps } from "react";
import {
  FlagAt,
  FlagDe,
  FlagEs,
  FlagFr,
  FlagSa,
  FlagUs,
} from "@sankyu/react-circle-flags";
import { hasLocale } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const FLAG_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
} as const;

type FlagIconProps = SVGProps<SVGSVGElement> & {
  width?: number;
  height?: number;
};

/** Static flag components — tree-shaken (~1 KB each), SSR-safe in Next.js App Router. */
const LOCALE_FLAG_COMPONENTS: Record<Locale, ComponentType<FlagIconProps>> = {
  en: FlagUs,
  ar: FlagSa,
  es: FlagEs,
  fr: FlagFr,
  de: FlagDe,
  "de-AT": FlagAt,
};

type LocaleFlagProps = {
  locale: Locale | string;
  size?: keyof typeof FLAG_SIZES;
  className?: string;
  ring?: boolean;
};

function resolveLocale(locale: string): Locale {
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
}

/** Circular SVG flag for a site locale (shadcn country-dropdown pattern). */
export function LocaleFlag({
  locale,
  size = "sm",
  className,
  ring = true,
}: LocaleFlagProps) {
  const resolved = resolveLocale(locale);
  const Flag = LOCALE_FLAG_COMPONENTS[resolved];
  const px = FLAG_SIZES[size];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 overflow-hidden rounded-full",
        ring && "ring-1 ring-border/70 bg-muted/40",
        className,
      )}
      aria-hidden
    >
      <Flag width={px} height={px} />
    </span>
  );
}
