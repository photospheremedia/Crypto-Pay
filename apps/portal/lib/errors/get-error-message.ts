/**
 * Normalize unknown thrown values to a safe user-facing string.
 */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof Error) {
    return error.message || fallback;
  }
  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return fallback;
}

export function isJsonSyntaxError(error: unknown): boolean {
  return error instanceof SyntaxError && /JSON/i.test(error.message);
}
