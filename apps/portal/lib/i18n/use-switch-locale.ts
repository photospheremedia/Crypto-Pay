"use client";

import { useCallback, useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/lib/i18n/locale-config";
import { setLocaleCookieClient } from "@/lib/i18n/locale-cookie-client";
import { persistUserLocale } from "@/lib/i18n/locale-actions";

/**
 * Switches locale: cookie + navigation first (instant), DB preference in background.
 */
export function useSwitchLocale() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;

      setLocaleCookieClient(next);

      startTransition(() => {
        router.replace(pathname, { locale: next });
        router.refresh();
      });

      void persistUserLocale(next);
    },
    [locale, pathname, router],
  );

  return { switchLocale, isPending, locale };
}
