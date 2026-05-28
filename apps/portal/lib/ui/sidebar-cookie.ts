import {
  canPersistLocaleCookie,
  localeCookieOptions,
} from "@/lib/i18n/locale-preference";

export const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

/** Persist sidebar open state when functional cookies are allowed. */
export function setSidebarStateCookie(open: boolean): void {
  if (typeof document === "undefined") return;
  if (!canPersistLocaleCookie()) return;

  const { path, maxAge, sameSite, secure } = localeCookieOptions(
    SIDEBAR_COOKIE_MAX_AGE,
  );
  const secureFlag = secure ? "; Secure" : "";

  document.cookie = `${SIDEBAR_COOKIE_NAME}=${open ? "true" : "false"}; Path=${path}; Max-Age=${maxAge}; SameSite=${sameSite}${secureFlag}`;
}
