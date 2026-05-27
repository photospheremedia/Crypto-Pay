"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { resendSignupConfirmation } from "@/app/[locale]/(login)/actions";

export function ResendConfirmationButton({ email }: { email: string }) {
  const t = useTranslations("Auth");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<"success" | "error" | null>(null);

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={pending || !email}
        onClick={() => {
          setFeedback(null);
          startTransition(async () => {
            const result = await resendSignupConfirmation(email);
            setFeedback(result.error ? "error" : "success");
          });
        }}
        className="text-sm font-semibold text-emerald-700 underline hover:text-emerald-800 disabled:opacity-50"
      >
        {pending ? (
          <span className="inline-flex items-center gap-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {t("resendingConfirmation")}
          </span>
        ) : (
          t("resendConfirmation")
        )}
      </button>
      {feedback === "success" && (
        <p className="mt-2 text-xs text-emerald-700">{t("resendConfirmationSent")}</p>
      )}
      {feedback === "error" && (
        <p className="mt-2 text-xs text-red-600">{t("resendConfirmationFailed")}</p>
      )}
    </div>
  );
}
