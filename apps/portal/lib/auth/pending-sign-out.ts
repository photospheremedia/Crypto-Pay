"use client";

/** Set immediately before submitting a server sign-out form. */
export const PENDING_SIGN_OUT_STORAGE_KEY = "crypto-pay:pending-sign-out";

export function markPendingSignOut(): void {
  try {
    sessionStorage.setItem(PENDING_SIGN_OUT_STORAGE_KEY, "1");
  } catch {
    // sessionStorage unavailable (private mode, blocked, etc.)
  }
}

/** Returns true once per intentional sign-out, then clears the flag. */
export function consumePendingSignOut(): boolean {
  try {
    if (sessionStorage.getItem(PENDING_SIGN_OUT_STORAGE_KEY) === "1") {
      sessionStorage.removeItem(PENDING_SIGN_OUT_STORAGE_KEY);
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}
