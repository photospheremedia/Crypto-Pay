"use client";

import { useTheme } from "next-themes";
import { useCallback } from "react";
import { setThemeCookieClient } from "@/lib/theme/theme-cookie-client";
import {
  toResolvedTheme,
  type UserThemeSetting,
} from "@/lib/theme/theme-preference";

/** Sync account theme setting to next-themes and the preference cookie. */
export function useApplyUserTheme() {
  const { setTheme } = useTheme();

  return useCallback(
    (setting: UserThemeSetting) => {
      const resolved = toResolvedTheme(setting);
      setTheme(resolved);
      setThemeCookieClient(resolved);
    },
    [setTheme],
  );
}
