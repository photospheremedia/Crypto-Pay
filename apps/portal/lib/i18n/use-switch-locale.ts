"use client";

import { useCallback, useState } from "react";
import { useLocale } from "next-intl";
import { getPathname, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/lib/i18n/locale-config";
import { setLocaleCookieClient } from "@/lib/i18n/locale-cookie-client";
import {
  canPersistLocaleCookie,
  clearLocaleCookieClient,
} from "@/lib/i18n/locale-preference";
import { persistUserLocale } from "@/lib/i18n/locale-actions";

/**
 * Explicit user locale change: cookie (if allowed) + DB + full navigation.
 * Browser Accept-Language is not used after this — cookie/DB take over on return visits.
 */
export function useSwitchLocale() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [isPending, setIsPending] = useState(false);

  const switchLocale = useCallback(
    (next: Locale) => {
      if (next === locale || isPending) return;

      if (canPersistLocaleCookie()) {
        setLocaleCookieClient(next);
      } else {
        clearLocaleCookieClient();
      }
      setIsPending(true);
      void persistUserLocale(next);

      const href = getPathname({ href: pathname, locale: next });
      window.location.assign(href);
    },
    [isPending, locale, pathname],
  );

  return { switchLocale, isPending, locale };
}
