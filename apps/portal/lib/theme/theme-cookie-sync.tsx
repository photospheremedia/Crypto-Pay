"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import {
  clearThemeLocalStorage,
  readThemeCookieClient,
  setThemeCookieClient,
} from "@/lib/theme/theme-cookie-client";
import type { ResolvedTheme } from "@/lib/theme/theme-preference";

/** Keep next-themes in sync with the HTTP preference cookie (not localStorage). */
export function ThemeCookieSync() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    clearThemeLocalStorage();
    const fromCookie = readThemeCookieClient();
    if (fromCookie && fromCookie !== theme) {
      setTheme(fromCookie);
    }
  }, [setTheme, theme]);

  useEffect(() => {
    if (!resolvedTheme) return;
    const value = resolvedTheme as ResolvedTheme;
    if (value !== "light" && value !== "dark" && value !== "system") return;
    setThemeCookieClient(value);
  }, [resolvedTheme]);

  return null;
}
