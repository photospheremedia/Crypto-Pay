import { readFileSync } from "fs";
import path from "path";
import { hasLocale } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { deepMergeMessages } from "@/lib/i18n/deep-merge-messages";

export type EmailMessagePack = typeof import("@/messages/email/en.json");

const EMAIL_MESSAGES_DIR = path.join(process.cwd(), "messages/email");

let enPack: EmailMessagePack | null = null;

function loadPack(locale: string): Partial<EmailMessagePack> {
  try {
    const raw = readFileSync(path.join(EMAIL_MESSAGES_DIR, `${locale}.json`), "utf8");
    return JSON.parse(raw) as Partial<EmailMessagePack>;
  } catch {
    return {};
  }
}

function getEnglishPack(): EmailMessagePack {
  if (!enPack) {
    enPack = loadPack("en") as EmailMessagePack;
  }
  return enPack;
}

/** Merchant-facing transactional email copy for the given locale (falls back to English). */
export function getEmailMessages(locale: string): EmailMessagePack {
  const resolved: Locale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;

  const english = getEnglishPack();
  if (resolved === routing.defaultLocale) {
    return english;
  }

  let override = loadPack(resolved);
  if (Object.keys(override).length === 0 && resolved.includes("-")) {
    override = loadPack(resolved.split("-")[0]!);
  }
  return deepMergeMessages(
    english as Record<string, unknown>,
    override as Record<string, unknown>,
  ) as EmailMessagePack;
}

/** Replace `{key}` placeholders in email copy strings. */
export function formatEmailString(
  template: string,
  vars: Record<string, string | undefined>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}
