import { routing } from "@/i18n/routing";

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
