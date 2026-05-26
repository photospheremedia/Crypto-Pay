/**
 * App Router metadata files — must bypass i18n/auth proxy (no locale prefix, no HTML).
 */
export const METADATA_ROUTE_PREFIXES = [
  "/icon",
  "/apple-icon",
  "/opengraph-image",
  "/twitter-image",
  "/manifest",
  "/sitemap",
  "/robots",
  "/icons",
] as const;

export function isMetadataRoute(pathname: string): boolean {
  if (pathname === "/favicon.ico" || pathname === "/favicon.svg") {
    return true;
  }
  return METADATA_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
