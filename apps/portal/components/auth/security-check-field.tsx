"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { TurnstileField } from "@/components/auth/turnstile";
import {
  useAuthSecurityCheck,
  type SecurityCheckStatus,
} from "@/hooks/use-auth-security-check";
import { cn } from "@/lib/utils";

type SecurityCheckFieldProps = {
  /** When this value changes (e.g. form error), the widget resets for another attempt. */
  resetTrigger?: unknown;
  /** Notifies parent whether submit is allowed (always true when Turnstile is off). */
  onCanSubmitChange?: (canSubmit: boolean) => void;
  /** For non-FormData submits (e.g. fetch handlers). */
  onTokenChange?: (token: string) => void;
  className?: string;
};

function StatusBadge({ status }: { status: SecurityCheckStatus }) {
  const t = useTranslations("Auth");

  if (status === "verified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
        {t("securityCheckVerified")}
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
        <AlertCircle className="h-3.5 w-3.5" aria-hidden />
        {t("securityCheckFailed")}
      </span>
    );
  }

  return null;
}

/**
 * Honeypot + Turnstile block for auth forms.
 * Place immediately above the primary submit button.
 */
export function SecurityCheckField({
  resetTrigger,
  onCanSubmitChange,
  onTokenChange,
  className,
}: SecurityCheckFieldProps) {
  const t = useTranslations("Auth");
  const {
    captchaEnabled,
    turnstileRef,
    token,
    status,
    canSubmit,
    onVerify,
    onError,
    onExpire,
  } = useAuthSecurityCheck(resetTrigger);

  useEffect(() => {
    onCanSubmitChange?.(canSubmit);
  }, [canSubmit, onCanSubmitChange]);

  useEffect(() => {
    onTokenChange?.(token);
  }, [token, onTokenChange]);

  return (
    <>
      {/* Honeypot — off-screen, not display:none (some bots skip those) */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-px w-px overflow-hidden opacity-0"
        aria-hidden
      >
        <label htmlFor="website-field">Leave blank</label>
        <input
          id="website-field"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      {captchaEnabled && (
        <section
          className={cn(
            "rounded-xl border border-slate-200/80 bg-slate-50/90 px-4 py-3.5",
            status === "verified" && "border-emerald-200/80 bg-emerald-50/40",
            status === "error" && "border-red-200/80 bg-red-50/30",
            className,
          )}
          aria-labelledby="security-check-heading"
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200/80">
                <ShieldCheck
                  className="h-4 w-4 text-emerald-600"
                  aria-hidden
                />
              </span>
              <div className="min-w-0">
                <p
                  id="security-check-heading"
                  className="text-sm font-medium text-slate-800"
                >
                  {t("securityCheckTitle")}
                </p>
                <p className="text-xs text-slate-500">{t("securityCheckHint")}</p>
              </div>
            </div>
            <StatusBadge status={status} />
          </div>

          <div
            className={cn(
              "flex min-h-[68px] w-full items-center justify-center overflow-hidden rounded-lg border border-slate-200/60 bg-white px-2 py-2",
              "shadow-inner shadow-slate-100/50",
            )}
          >
            <TurnstileField
              turnstileRef={turnstileRef}
              onVerify={onVerify}
              onError={onError}
              onExpire={onExpire}
              className="w-full max-w-none"
            />
          </div>

          {status === "error" && (
            <p className="mt-2 text-xs text-red-600" role="alert">
              {t("securityCheckRetry")}
            </p>
          )}
        </section>
      )}

      <input type="hidden" name="turnstile_token" value={token} readOnly />
    </>
  );
}
