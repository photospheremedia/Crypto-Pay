import { getErrorMessage, isJsonSyntaxError } from "./get-error-message";

export type ErrorContext = Record<
  string,
  string | number | boolean | undefined
>;

/**
 * Central error reporter — extend with Sentry/Datadog when wired.
 * @see https://nextjs.org/docs/app/getting-started/error-handling
 */
export function reportError(error: unknown, context?: ErrorContext): void {
  const message = getErrorMessage(error);

  if (process.env.NODE_ENV === "development") {
    console.error("[Crypto Pay]", message, { context, error });
    return;
  }

  console.error("[Crypto Pay]", message, context?.source ? { source: context.source } : undefined);

  if (isJsonSyntaxError(error) && context?.source === "loadMessages") {
    console.error(
      "[Crypto Pay] Locale messages failed to load. Run: pnpm dev:portal:clean",
    );
  }
}
