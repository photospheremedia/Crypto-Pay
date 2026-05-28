import "server-only";

import { createHash } from "node:crypto";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";
import { getSmsFromNumber, getSmsProvider, type SmsProviderName } from "./config";
import { maskE164 } from "./e164";

export interface SendSmsOptions {
  toE164: string;
  body: string;
  userId?: string;
  event: string;
  idempotencyKey?: string;
}

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
  deduplicated?: boolean;
  provider?: SmsProviderName;
}

const BODY_PREVIEW_MAX = 120;

function bodyPreview(body: string): string {
  const trimmed = body.replace(/\s+/g, " ").trim();
  return trimmed.length <= BODY_PREVIEW_MAX
    ? trimmed
    : `${trimmed.slice(0, BODY_PREVIEW_MAX - 1)}…`;
}

async function findExistingOutbound(
  idempotencyKey: string,
): Promise<{ status: string; provider_message_id: string | null; error: string | null } | null> {
  const supabase = getSupabaseServiceClient();
  const { data } = await supabase
    .from("sms_outbound_log")
    .select("status, provider_message_id, error")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();

  return data ?? null;
}

async function upsertOutboundLog(params: {
  userId?: string;
  toE164: string;
  event: string;
  body: string;
  idempotencyKey?: string;
  provider?: string;
  providerMessageId?: string;
  status: "sent" | "failed" | "skipped";
  error?: string;
}): Promise<void> {
  const supabase = getSupabaseServiceClient();
  const row = {
    user_id: params.userId ?? null,
    to_phone_e164: params.toE164,
    event: params.event,
    body_preview: bodyPreview(params.body),
    idempotency_key: params.idempotencyKey ?? null,
    provider: params.provider ?? null,
    provider_message_id: params.providerMessageId ?? null,
    status: params.status,
    error: params.error ?? null,
  };

  if (params.idempotencyKey) {
    await supabase.from("sms_outbound_log").upsert(row, {
      onConflict: "idempotency_key",
    });
    return;
  }

  await supabase.from("sms_outbound_log").insert(row);
}

async function sendViaTwilio(
  toE164: string,
  body: string,
): Promise<{ messageId?: string; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = getSmsFromNumber();

  if (!accountSid || !authToken || !from) {
    return { error: "SMS provider is not configured" };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const form = new URLSearchParams({ To: toE164, From: from, Body: body });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    sid?: string;
    message?: string;
    error_message?: string;
  };

  if (!response.ok) {
    return {
      error: payload.message || payload.error_message || `Twilio HTTP ${response.status}`,
    };
  }

  return { messageId: payload.sid };
}

async function deliverSms(
  toE164: string,
  body: string,
): Promise<{ messageId?: string; error?: string; provider: SmsProviderName }> {
  const provider = getSmsProvider();

  if (provider === "twilio") {
    const result = await sendViaTwilio(toE164, body);
    return { ...result, provider };
  }

  console.info(
    `[SMS mock] to=${maskE164(toE164)} body=${bodyPreview(body)}`,
  );
  return {
    messageId: `mock_${createHash("sha256").update(`${toE164}:${body}`).digest("hex").slice(0, 16)}`,
    provider,
  };
}

/**
 * Send transactional SMS server-side. Never call from client components.
 */
export async function sendSms(options: SendSmsOptions): Promise<SendSmsResult> {
  const { toE164, body, userId, event, idempotencyKey } = options;

  if (idempotencyKey) {
    const existing = await findExistingOutbound(idempotencyKey);
    if (existing) {
      if (existing.status === "sent") {
        return {
          success: true,
          messageId: existing.provider_message_id ?? undefined,
          deduplicated: true,
        };
      }
      if (existing.status === "skipped") {
        return { success: true, deduplicated: true };
      }
      if (existing.status === "failed") {
        return { success: false, error: existing.error ?? "Previously failed" };
      }
    }
  }

  const delivered = await deliverSms(toE164, body);

  if (delivered.error) {
    await upsertOutboundLog({
      userId,
      toE164,
      event,
      body,
      idempotencyKey,
      provider: delivered.provider,
      status: "failed",
      error: delivered.error,
    });
    return { success: false, error: delivered.error, provider: delivered.provider };
  }

  await upsertOutboundLog({
    userId,
    toE164,
    event,
    body,
    idempotencyKey,
    provider: delivered.provider,
    providerMessageId: delivered.messageId,
    status: "sent",
  });

  return {
    success: true,
    messageId: delivered.messageId,
    provider: delivered.provider,
  };
}

export function hashVerificationCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export function generateVerificationCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
