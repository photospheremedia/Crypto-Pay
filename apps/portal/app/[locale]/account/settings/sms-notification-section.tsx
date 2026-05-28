"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

type SmsNotificationSectionProps = {
  phoneE164: string;
  smsOptIn: boolean;
  smsVerified: boolean;
  smsNotificationsEnabled: boolean;
  onPhoneChange: (phone: string) => void;
  onOptInChange: (optIn: boolean) => void;
};

export function SmsNotificationSection({
  phoneE164,
  smsOptIn,
  smsVerified,
  smsNotificationsEnabled,
  onPhoneChange,
  onOptInChange,
}: SmsNotificationSectionProps) {
  const t = useTranslations("Account.settings");
  const router = useRouter();
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  async function sendVerification() {
    setSending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/account/sms/verify/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneE164, optIn: smsOptIn }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string; phoneE164?: string };
      if (!res.ok || !data.success) {
        setMessage({ type: "error", text: data.error ?? t("smsVerifySendFailed") });
        return;
      }
      if (data.phoneE164) {
        onPhoneChange(data.phoneE164);
      }
      setMessage({ type: "success", text: t("smsVerifySent") });
    } catch {
      setMessage({ type: "error", text: t("smsVerifySendFailed") });
    } finally {
      setSending(false);
    }
  }

  async function confirmVerification() {
    setConfirming(true);
    setMessage(null);
    try {
      const res = await fetch("/api/account/sms/verify/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneE164, code }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setMessage({ type: "error", text: data.error ?? t("smsVerifyConfirmFailed") });
        return;
      }
      setMessage({ type: "success", text: t("smsVerifiedSuccess") });
      setCode("");
      router.refresh();
    } catch {
      setMessage({ type: "error", text: t("smsVerifyConfirmFailed") });
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="mt-4 space-y-4 rounded-md border border-slate-100 bg-slate-50 p-4">
      <div>
        <label htmlFor="sms_phone_e164" className="block text-sm font-medium text-slate-700">
          {t("smsPhoneE164")}
        </label>
        <p className="mt-1 text-sm text-slate-600">{t("smsPhoneE164Hint")}</p>
        <input
          type="tel"
          id="sms_phone_e164"
          value={phoneE164}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder={t("smsPhonePlaceholder")}
          className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
          autoComplete="tel"
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="sms_opt_in"
          checked={smsOptIn}
          onChange={(e) => onOptInChange(e.target.checked)}
          className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
        />
        <label htmlFor="sms_opt_in" className="text-sm text-slate-700">
          {t("smsOptInConsent")}
        </label>
      </div>

      {smsVerified ? (
        <p className="text-sm font-medium text-emerald-700">{t("smsPhoneVerified")}</p>
      ) : (
        <p className="text-sm text-amber-700">{t("smsPhoneNotVerified")}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={sending || !phoneE164.trim() || !smsOptIn}
          onClick={() => void sendVerification()}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? t("smsSendingCode") : t("smsSendVerificationCode")}
        </button>
      </div>

      {!smsVerified && smsNotificationsEnabled ? (
        <div className="space-y-2">
          <label htmlFor="sms_verify_code" className="block text-sm font-medium text-slate-700">
            {t("smsVerificationCode")}
          </label>
          <input
            type="text"
            id="sms_verify_code"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="block w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
          />
          <button
            type="button"
            disabled={confirming || code.length !== 6}
            onClick={() => void confirmVerification()}
            className="rounded-md border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {confirming ? t("smsConfirmingCode") : t("smsConfirmCode")}
          </button>
        </div>
      ) : null}

      {message ? (
        <p
          className={
            message.type === "success"
              ? "text-sm text-emerald-700"
              : "text-sm text-red-700"
          }
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
