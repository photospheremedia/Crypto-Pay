import { readFile } from "fs/promises";
import path from "path";
import { reportError } from "@/lib/errors";
import { routing, type Locale } from "@/i18n/routing";
import { deepMergeMessages } from "@/lib/i18n/deep-merge-messages";

const MESSAGES_DIR = path.join(process.cwd(), "messages");

/** Minimal messages so the shell renders if all locale files fail. */
const EMERGENCY_MESSAGES = {
  Common: {
    brandName: "Crypto Pay",
    loading: "Loading…",
  },
  Errors: {
    title: "Something went wrong",
    description: "Please try again or return home.",
    tryAgain: "Try again",
    goHome: "Go home",
  },
} as const;

function isValidMessages(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

async function readMessagesFile(locale: string): Promise<Record<string, unknown>> {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  const raw = await readFile(filePath, "utf8");
  const parsed: unknown = JSON.parse(raw);
  if (!isValidMessages(parsed)) {
    throw new Error(`Locale file "${locale}.json" is not a JSON object`);
  }
  return parsed;
}

/**
 * Load translation messages with validation and English fallback (next-intl best practice).
 * @see https://github.com/amannn/next-intl/blob/main/docs/src/pages/docs/usage/configuration.mdx
 */
export async function loadMessages(locale: Locale): Promise<Record<string, unknown>> {
  try {
    const localeMessages = await readMessagesFile(locale);
    if (locale === routing.defaultLocale) {
      return localeMessages;
    }

    const english = await readMessagesFile(routing.defaultLocale);
    return deepMergeMessages(english, localeMessages);
  } catch (error) {
    reportError(error, { source: "loadMessages", locale });

    if (locale !== routing.defaultLocale) {
      try {
        return await readMessagesFile(routing.defaultLocale);
      } catch (fallbackError) {
        reportError(fallbackError, {
          source: "loadMessages",
          locale: routing.defaultLocale,
        });
      }
    }

    return { ...EMERGENCY_MESSAGES };
  }
}
