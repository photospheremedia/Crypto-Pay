"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { MerchantWalletPublic } from "@/lib/wallets/merchant-wallet-public";
import { WALLET_NETWORKS } from "@/lib/wallets/constants";
import {
  createMerchantWallet,
  updateMerchantWallet,
} from "@/lib/api/account-wallets-client";
import { merchantWalletSchema } from "@/lib/wallets/validation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WalletFormDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: MerchantWalletPublic | null;
  onSaved?: () => void | Promise<void>;
}) {
  const t = useTranslations("Account.wallets");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) {
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setPending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const parsed = merchantWalletSchema
      .omit({ id: true })
      .safeParse({
        label: String(formData.get("label") || "").trim(),
        walletNetwork: String(formData.get("wallet_network") || ""),
        walletAddress: String(formData.get("wallet_address") || "").trim(),
        isPrimary: formData.get("is_primary") === "on",
      });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? t("error"));
      setPending(false);
      return;
    }

    try {
      if (editing) {
        await updateMerchantWallet(editing.id, parsed.data);
      } else {
        await createMerchantWallet(parsed.data);
      }
      setSuccess(t("saved"));
      await onSaved?.();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"));
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? t("dialog.editTitle") : t("dialog.addTitle")}
          </DialogTitle>
          <DialogDescription>{t("dialog.description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="label">{t("dialog.walletName")}</Label>
            <Input
              id="label"
              name="label"
              required
              key={editing?.id ?? "new-label"}
              defaultValue={editing?.label ?? ""}
              placeholder={t("dialog.walletNamePlaceholder")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="wallet_network">{t("dialog.network")}</Label>
            <select
              id="wallet_network"
              name="wallet_network"
              required
              key={editing?.id ?? "new-network"}
              defaultValue={editing?.wallet_network ?? "btc"}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {WALLET_NETWORKS.map((n) => (
                <option key={n.value} value={n.value}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="wallet_address">{t("dialog.walletAddress")}</Label>
            <Input
              id="wallet_address"
              name="wallet_address"
              required
              key={editing?.id ?? "new-address"}
              defaultValue={editing?.wallet_address ?? ""}
              placeholder={t("dialog.addressPlaceholder")}
              className="font-mono text-xs"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              name="is_primary"
              defaultChecked={editing?.is_primary ?? !editing}
              className="size-4 rounded border-input"
            />
            {t("dialog.primaryCheckbox")}
          </label>
          {error ? (
            <Alert variant="destructive">
              <AlertTitle>{t("error")}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          {success ? (
            <Alert>
              <AlertTitle>{t("saved")}</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? t("saving") : t("saveForVerification")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
