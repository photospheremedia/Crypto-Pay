import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing, type Locale } from "./routing";
import { loadMessages } from "@/lib/i18n/load-messages";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: Locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages = await loadMessages(locale);

  // onError / getMessageFallback belong in IntlProvider (client) only.
  // next-intl 4 auto-inherits getRequestConfig into NextIntlClientProvider;
  // functions there cause "Event handlers cannot be passed to Client Component props".
  return {
    locale,
    messages,
    timeZone: process.env.NEXT_PUBLIC_TIMEZONE ?? "UTC",
  };
});
