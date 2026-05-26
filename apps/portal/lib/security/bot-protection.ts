import { headers } from "next/headers";
import { checkRateLimit, type RateLimitType } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile-verify";
import { isTurnstileEnabled } from "@/lib/security/turnstile-config";
import { getClientIpFromRequest } from "@/lib/security/client-ip";

export type BotProtectionResult =
  | { ok: true }
  | { ok: false; error: string; status: number };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Honeypot field — bots often fill hidden inputs.
 */
export function isHoneypotTriggered(formData: FormData): boolean {
  const trap = String(formData.get("website") ?? "").trim();
  return trap.length > 0;
}

export async function getClientIpFromHeaders(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headerStore.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const netlifyIp = headerStore.get("x-nf-client-connection-ip")?.trim();
  if (netlifyIp) return netlifyIp;
  return "unknown";
}

/**
 * Rate limit + optional Turnstile for server actions and API routes.
 */
export async function assertBotProtection(options: {
  limitType: RateLimitType;
  identifier: string;
  turnstileToken?: string | null;
  requireCaptcha?: boolean;
}): Promise<BotProtectionResult> {
  const { limitType, identifier, turnstileToken, requireCaptcha = true } =
    options;

  const rateLimitResult = await checkRateLimit(limitType, identifier);
  if (!rateLimitResult.success) {
    return {
      ok: false,
      status: 429,
      error:
        "Too many attempts. Please wait a few minutes and try again.",
    };
  }

  if (requireCaptcha && isTurnstileEnabled()) {
    const token = turnstileToken?.trim();
    if (!token) {
      return {
        ok: false,
        status: 400,
        error: "Please complete the security check and try again.",
      };
    }

    const ip = await getClientIpFromHeaders();
    const valid = await verifyTurnstileToken(token, ip);
    if (!valid) {
      return {
        ok: false,
        status: 403,
        error: "Security verification failed. Please refresh and try again.",
      };
    }
  }

  return { ok: true };
}

export async function assertBotProtectionForForm(options: {
  formData: FormData;
  limitType: RateLimitType;
  email?: string;
}): Promise<BotProtectionResult> {
  if (isHoneypotTriggered(options.formData)) {
    // Silent success for bots — do not reveal the trap
    return { ok: false, status: 400, error: "Unable to process request." };
  }

  const ip = await getClientIpFromHeaders();
  const email = options.email
    ? normalizeEmail(options.email)
    : normalizeEmail(String(options.formData.get("email") ?? ""));

  const identifier =
    options.limitType === "login" || options.limitType === "signup"
      ? `${ip}:${email || "unknown"}`
      : ip;

  const turnstileToken = String(
    options.formData.get("turnstile_token") ?? "",
  );

  return assertBotProtection({
    limitType: options.limitType,
    identifier,
    turnstileToken,
  });
}

export async function assertBotProtectionForRequest(
  request: Request,
  options: {
    limitType: RateLimitType;
    turnstileToken?: string | null;
    requireCaptcha?: boolean;
  },
): Promise<BotProtectionResult> {
  const ip = getClientIpFromRequest(request);
  return assertBotProtection({
    limitType: options.limitType,
    identifier: ip,
    turnstileToken: options.turnstileToken,
    requireCaptcha: options.requireCaptcha,
  });
}
