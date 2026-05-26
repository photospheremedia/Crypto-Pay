import { IntlErrorCode, type IntlError } from "next-intl";
import { reportError } from "@/lib/errors";

/**
 * next-intl server/client error handler.
 * @see https://next-intl.dev/docs/usage/configuration#error-handling
 */
export function onIntlError(error: IntlError): void {
  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[next-intl] Missing message:", error.message);
    }
    return;
  }

  reportError(error, { source: "next-intl", code: error.code });
}

export function getIntlMessageFallback({
  namespace,
  key,
  error,
}: {
  namespace?: string;
  key: string;
  error: IntlError;
}): string {
  const path = [namespace, key].filter(Boolean).join(".");

  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    if (process.env.NODE_ENV === "development") {
      return `[${path}]`;
    }
    return path;
  }

  return process.env.NODE_ENV === "development"
    ? `Fix translation: ${path}`
    : path;
}
