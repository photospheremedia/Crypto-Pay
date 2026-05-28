import "server-only";

import { timingSafeEqual } from "node:crypto";
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";
import { revalidateMerchantProfile } from "@/lib/account/merchant-data";
import { normalizeToE164 } from "./e164";
import { assertSmsRateLimit } from "./rate-limit";
import { sendSms, generateVerificationCode, hashVerificationCode } from "./sender";
import { SMS_WORKFLOW_EVENTS, smsWorkflowIdempotencyKey } from "./workflow-keys";

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;

export async function sendPhoneVerificationOtp(params: {
  userId: string;
  phone: string;
  optIn: boolean;
}): Promise<{ success: boolean; error?: string; e164?: string }> {
  if (!params.optIn) {
    return { success: false, error: "SMS opt-in is required before verification" };
  }

  const normalized = normalizeToE164(params.phone);
  if ("error" in normalized) {
    return { success: false, error: normalized.error };
  }

  const rate = await assertSmsRateLimit({
    userId: params.userId,
    event: SMS_WORKFLOW_EVENTS.phoneVerification,
    max: 3,
    windowMinutes: 60,
  });
  if (!rate.ok) {
    return { success: false, error: rate.error };
  }

  const code = generateVerificationCode();
  const codeHash = hashVerificationCode(code);
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000).toISOString();

  const supabase = getSupabaseServiceClient();
  const { data: challengeRow, error: insertError } = await supabase
    .from("sms_phone_verification_challenges")
    .insert({
      user_id: params.userId,
      phone_e164: normalized.e164,
      code_hash: codeHash,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (insertError || !challengeRow) {
    console.error("[SMS] challenge insert failed:", insertError);
    return { success: false, error: "Could not start phone verification" };
  }

  const idempotencyKey = smsWorkflowIdempotencyKey(
    SMS_WORKFLOW_EVENTS.phoneVerification,
    challengeRow.id,
    normalized.e164,
  );

  const smsResult = await sendSms({
    toE164: normalized.e164,
    body: `Crypto Pay verification code: ${code}. Expires in ${CODE_TTL_MINUTES} minutes.`,
    userId: params.userId,
    event: SMS_WORKFLOW_EVENTS.phoneVerification,
    idempotencyKey,
  });

  if (!smsResult.success) {
    return { success: false, error: smsResult.error ?? "Could not send verification SMS" };
  }

  const now = new Date().toISOString();
  await supabase.from("user_settings").upsert(
    {
      user_id: params.userId,
      sms_phone_e164: normalized.e164,
      sms_opt_in_at: now,
      sms_verified_at: null,
      sms_notifications: true,
      sms_disabled_at: null,
      updated_at: now,
    },
    { onConflict: "user_id" },
  );

  revalidateMerchantProfile(params.userId);

  return { success: true, e164: normalized.e164 };
}

export async function confirmPhoneVerificationOtp(params: {
  userId: string;
  phone: string;
  code: string;
}): Promise<{ success: boolean; error?: string }> {
  const normalized = normalizeToE164(params.phone);
  if ("error" in normalized) {
    return { success: false, error: normalized.error };
  }

  const code = params.code.trim();
  if (!/^\d{6}$/.test(code)) {
    return { success: false, error: "Enter the 6-digit code from your SMS" };
  }

  const supabase = getSupabaseServiceClient();
  const { data: challenge, error } = await supabase
    .from("sms_phone_verification_challenges")
    .select("id, code_hash, attempts, expires_at, consumed_at")
    .eq("user_id", params.userId)
    .eq("phone_e164", normalized.e164)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !challenge) {
    return { success: false, error: "No active verification. Request a new code." };
  }

  if (challenge.consumed_at) {
    return { success: false, error: "This code was already used" };
  }

  if (new Date(challenge.expires_at).getTime() < Date.now()) {
    return { success: false, error: "Code expired. Request a new one." };
  }

  if ((challenge.attempts ?? 0) >= MAX_ATTEMPTS) {
    return { success: false, error: "Too many attempts. Request a new code." };
  }

  const expected = challenge.code_hash;
  const actual = hashVerificationCode(code);
  const a = Buffer.from(expected);
  const b = Buffer.from(actual);
  const matches = a.length === b.length && timingSafeEqual(a, b);

  if (!matches) {
    await supabase
      .from("sms_phone_verification_challenges")
      .update({ attempts: (challenge.attempts ?? 0) + 1 })
      .eq("id", challenge.id);
    return { success: false, error: "Incorrect code" };
  }

  const now = new Date().toISOString();
  await Promise.all([
    supabase
      .from("sms_phone_verification_challenges")
      .update({ consumed_at: now })
      .eq("id", challenge.id),
    supabase.from("user_settings").upsert(
      {
        user_id: params.userId,
        sms_phone_e164: normalized.e164,
        sms_verified_at: now,
        sms_opt_in_at: now,
        sms_notifications: true,
        sms_disabled_at: null,
        updated_at: now,
      },
      { onConflict: "user_id" },
    ),
  ]);

  revalidateMerchantProfile(params.userId);
  return { success: true };
}
