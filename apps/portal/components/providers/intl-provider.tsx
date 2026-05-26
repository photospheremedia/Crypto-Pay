"use client";

import {
  NextIntlClientProvider,
  type AbstractIntlMessages,
} from "next-intl";
import type { ReactNode } from "react";
import { getIntlMessageFallback, onIntlError } from "@/lib/i18n/intl-error-handlers";

const defaultTimeZone =
  process.env.NEXT_PUBLIC_TIMEZONE ?? "UTC";

type IntlProviderProps = {
  children: ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
  timeZone?: string;
};

/**
 * Single client intl boundary — handlers live here only.
 * Do NOT put onError/getMessageFallback in i18n/request.ts (next-intl 4 inherits
 * them into NextIntlClientProvider and breaks RSC serialization).
 */
export function IntlProvider({
  children,
  locale,
  messages,
  timeZone = defaultTimeZone,
}: IntlProviderProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={timeZone}
      onError={onIntlError}
      getMessageFallback={getIntlMessageFallback}
    >
      {children}
    </NextIntlClientProvider>
  );
}
