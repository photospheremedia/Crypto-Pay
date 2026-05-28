import { z } from "zod";

/** Values stored in `user_settings.theme`. */
export const userThemeSchema = z.enum(["light", "dark", "auto"]);
export type UserThemeSetting = z.infer<typeof userThemeSchema>;

/** Values passed to `next-themes` (`auto` → `system`). */
export type ResolvedTheme = "light" | "dark" | "system";

export const THEME_COOKIE_NAME = "cryptopay-theme";

export function toResolvedTheme(
  setting: UserThemeSetting | string | null | undefined,
): ResolvedTheme {
  if (setting === "dark") return "dark";
  if (setting === "auto") return "system";
  return "light";
}

export function toUserThemeSetting(
  resolved: ResolvedTheme | string | null | undefined,
): UserThemeSetting {
  if (resolved === "dark") return "dark";
  if (resolved === "system") return "auto";
  return "light";
}

/** `class` on `<html>` for SSR first paint (system resolved on client). */
export function serverHtmlThemeClass(theme: ResolvedTheme): string {
  if (theme === "dark") return "dark";
  return "";
}

export function parseThemeCookie(
  value: string | null | undefined,
): ResolvedTheme | null {
  if (!value) return null;
  const decoded = decodeURIComponent(value);
  if (decoded === "light" || decoded === "dark" || decoded === "system") {
    return decoded;
  }
  const parsed = userThemeSchema.safeParse(decoded);
  if (parsed.success) return toResolvedTheme(parsed.data);
  return null;
}
