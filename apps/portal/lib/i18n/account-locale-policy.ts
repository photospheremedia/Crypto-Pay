import { routing, type Locale } from "@/i18n/routing";
import { getLocaleFromPathname, stripLocale } from "@/lib/i18n/strip-locale";

/** Whether the request URL locale differs from the saved account language. */
export function shouldRedirectToAccountLocale(
  pathname: string,
  preferredLocale: Locale,
): boolean {
  const pathLocale = getLocaleFromPathname(pathname) ?? routing.defaultLocale;
  return pathLocale !== preferredLocale;
}

/**
 * Pick locale for next-intl `redirect({ href, locale })`.
 * Explicit locale in the redirect URL wins; otherwise use the account preference.
 */
export function resolveLocaleForAuthenticatedRedirect(
  targetPath: string,
  preferredLocale: Locale | null,
): { href: string; locale: Locale } {
  const explicitLocale = getLocaleFromPathname(targetPath);
  const href = stripLocale(targetPath);
  const locale = explicitLocale ?? preferredLocale ?? routing.defaultLocale;
  return { href, locale };
}
