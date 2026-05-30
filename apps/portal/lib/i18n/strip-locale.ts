import { hasLocale } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";

/** Locale encoded in the URL prefix, if any. */
export function getLocaleFromPathname(pathname: string): Locale | null {
  const sortedLocales = [...routing.locales].sort((a, b) => b.length - a.length);

  for (const locale of sortedLocales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return hasLocale(routing.locales, locale) ? locale : null;
    }
  }

  return null;
}

/** Path without locale prefix — for auth/route matching in proxy.ts */
export function stripLocale(pathname: string): string {
  const sortedLocales = [...routing.locales].sort((a, b) => b.length - a.length);

  for (const locale of sortedLocales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1) || "/";
    }
  }
  return pathname;
}
