/**
 * Normalize user input to E.164 for SMS delivery.
 * Supports North America (+1) and explicit international + prefixes.
 */

const E164_RE = /^\+[1-9]\d{6,14}$/;

export function isValidE164(phone: string): boolean {
  return E164_RE.test(phone.trim());
}

export function normalizeToE164(
  phone: string,
  defaultCountryCallingCode = "1",
): { e164: string } | { error: string } {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { error: "Phone number is required" };
  }

  if (trimmed.startsWith("+")) {
    const digits = `+${trimmed.slice(1).replace(/\D/g, "")}`;
    if (!isValidE164(digits)) {
      return { error: "Enter a valid international number in E.164 format (e.g. +14155552671)" };
    }
    return { e164: digits };
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) {
    const e164 = `+${defaultCountryCallingCode}${digits}`;
    if (!isValidE164(e164)) {
      return { error: "Invalid phone number" };
    }
    return { e164 };
  }

  if (digits.length === 11 && digits.startsWith(defaultCountryCallingCode)) {
    const e164 = `+${digits}`;
    if (!isValidE164(e164)) {
      return { error: "Invalid phone number" };
    }
    return { e164 };
  }

  return {
    error:
      "Use E.164 format with country code (e.g. +14155552671) or a 10-digit US/CA number",
  };
}

export function maskE164(phone: string): string {
  if (phone.length < 6) return "***";
  return `${phone.slice(0, 3)}***${phone.slice(-2)}`;
}
