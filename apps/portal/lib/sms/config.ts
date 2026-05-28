import "server-only";

export type SmsProviderName = "twilio" | "mock";

export function getSmsProvider(): SmsProviderName {
  const explicit = process.env.SMS_PROVIDER?.trim().toLowerCase();
  if (explicit === "mock") return "mock";
  if (explicit === "twilio") return "twilio";

  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    (process.env.SMS_FROM || process.env.TWILIO_PHONE_NUMBER)
  ) {
    return "twilio";
  }

  if (process.env.NODE_ENV === "production") {
    return "mock";
  }

  return "mock";
}

export function getSmsFromNumber(): string | undefined {
  return (
    process.env.SMS_FROM?.trim() ||
    process.env.TWILIO_PHONE_NUMBER?.trim() ||
    undefined
  );
}

export function isSmsConfigured(): boolean {
  return getSmsProvider() === "twilio";
}
