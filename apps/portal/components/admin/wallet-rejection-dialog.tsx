"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MAX_REASON_LENGTH = 1000;

export function WalletRejectionDialog({
  open,
  onOpenChange,
  walletLabel,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletLabel: string;
  pending?: boolean;
  onConfirm: (reason: string | undefined) => void | Promise<void>;
}) {
  const t = useTranslations("Admin.merchants");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) setReason("");
  }, [open]);

  async function handleConfirm() {
    const trimmed = reason.trim();
    await onConfirm(trimmed.length > 0 ? trimmed.slice(0, MAX_REASON_LENGTH) : undefined);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("rejectDialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("rejectDialogDescription", { label: walletLabel })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="wallet-rejection-reason">{t("rejectReasonLabel")}</Label>
          <Textarea
            id="wallet-rejection-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, MAX_REASON_LENGTH))}
            placeholder={t("rejectReasonPlaceholder")}
            rows={4}
            disabled={pending}
          />
          <p className="text-xs text-muted-foreground">{t("rejectReasonHint")}</p>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {t("rejectCancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={() => void handleConfirm()}
          >
            {pending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : null}
            {t("rejectConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
