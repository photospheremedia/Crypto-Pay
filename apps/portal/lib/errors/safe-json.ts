import { reportError } from "./report";

/**
 * Parse JSON from localStorage, cookies, or API bodies without throwing.
 */
export function safeJsonParse<T>(
  raw: string | null | undefined,
  fallback: T,
  options?: { context?: string; clearKey?: () => void },
): T {
  if (raw == null || raw === "") {
    return fallback;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed as T;
  } catch (error) {
    reportError(error, {
      source: "safeJsonParse",
      context: options?.context ?? "unknown",
    });
    options?.clearKey?.();
    return fallback;
  }
}

export function safeJsonParseObject<T>(
  raw: string | null | undefined,
  fallback: T,
  options?: { context?: string; clearKey?: () => void },
): T {
  const parsed = safeJsonParse<unknown>(raw, null, options);
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    return parsed as T;
  }
  options?.clearKey?.();
  return fallback;
}
