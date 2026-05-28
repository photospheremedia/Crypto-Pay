import {
  canPersistLocaleCookie,
  localeCookieOptions,
} from "@/lib/i18n/locale-preference";
import {
  parseThemeCookie,
  THEME_COOKIE_NAME,
  type ResolvedTheme,
} from "@/lib/theme/theme-preference";

/** Read theme from the HTTP cookie (client). */
export function readThemeCookieClient(): ResolvedTheme | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${THEME_COOKIE_NAME}=([^;]*)`),
  );
  if (!match?.[1]) return null;
  return parseThemeCookie(decodeURIComponent(match[1]));
}

/** Persist theme only when functional cookies are allowed (same as locale). */
export function setThemeCookieClient(theme: ResolvedTheme): void {
  if (typeof document === "undefined") return;
  if (!canPersistLocaleCookie()) return;

  const { path, maxAge, sameSite, secure } = localeCookieOptions();
  const secureFlag = secure ? "; Secure" : "";

  document.cookie = `${THEME_COOKIE_NAME}=${encodeURIComponent(theme)}; Path=${path}; Max-Age=${maxAge}; SameSite=${sameSite}${secureFlag}`;
}

/** Drop theme preference cookie when functional consent is revoked. */
export function clearThemeCookieClient(): void {
  if (typeof document === "undefined") return;

  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  document.cookie = `${THEME_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

/** Remove stale next-themes localStorage keys so the HTTP cookie stays authoritative. */
export function clearThemeLocalStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(THEME_COOKIE_NAME);
    localStorage.removeItem("theme");
  } catch {
    // ignore
  }
}
