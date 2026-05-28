"use client";

import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function WalletRejectionNotice({ reason }: { reason: string | null }) {
  const t = useTranslations("Account.wallets.rejection");

  const message = reason?.trim() ? reason.trim() : t("defaultMessage");

  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertTitle>{t("title")}</AlertTitle>
      <AlertDescription className="flex flex-col gap-1">
        <span>{t("intro")}</span>
        <span>
          <span className="font-medium">{t("reasonLabel")}: </span>
          {message}
        </span>
        <span className="text-destructive/90">{t("nextSteps")}</span>
      </AlertDescription>
    </Alert>
  );
}
