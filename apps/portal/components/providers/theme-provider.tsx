"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";
import { ThemeCookieSync } from "@/lib/theme/theme-cookie-sync";
import type { ResolvedTheme } from "@/lib/theme/theme-preference";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme: ResolvedTheme;
};

export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      disableTransitionOnChange
    >
      <ThemeCookieSync />
      {children}
    </NextThemesProvider>
  );
}
