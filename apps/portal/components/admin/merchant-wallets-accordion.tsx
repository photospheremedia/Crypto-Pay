"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Mail, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { walletNetworkLabel, walletStatusLabel } from "@/lib/wallets/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MerchantEmailDialog } from "@/components/admin/merchant-email-dialog";
import { WalletRejectionDialog } from "@/components/admin/wallet-rejection-dialog";
import { useToast } from "@/hooks/use-toast";
import { parseAdminApiResponse } from "@/lib/admin/parse-admin-api-response";
import { cn } from "@/lib/utils";

export type MerchantWalletRow = {
  id: string;
  label: string;
  wallet_network: string;
  wallet_address: string;
  status: string;
  verification_requested_at: string;
  is_primary: boolean;
  rejection_reason: string | null;
};

function statusBadgeClass(status: string): string {
  switch (status) {
    case "verified":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "rejected":
      return "border-red-200 bg-red-50 text-red-800";
    default:
      return "border-amber-200 bg-amber-50 text-amber-800";
  }
}

export function MerchantWalletsAccordion({
  merchantUserId,
  merchantEmail,
  defaultOpenPending = true,
}: {
  merchantUserId: string;
  merchantEmail: string;
  defaultOpenPending?: boolean;
}) {
  const t = useTranslations("Admin.merchants");
  const { toast } = useToast();
  const [wallets, setWallets] = useState<MerchantWalletRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [rejectingWallet, setRejectingWallet] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [openItems, setOpenItems] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/wallets?status=all&user=${encodeURIComponent(merchantUserId)}`,
      );
      const parsed = await parseAdminApiResponse<{
        success: boolean;
        wallets?: MerchantWalletRow[];
      }>(res, "Failed to load wallets");
      if (!parsed.ok) {
        toast({
          title: t("walletsLoadFailed"),
          description: parsed.error,
          variant: "destructive",
        });
        setWallets([]);
        return;
      }
      const rows = parsed.data.wallets ?? [];
      setWallets(rows);
      if (defaultOpenPending) {
        const pendingIds = rows
          .filter((w) => w.status === "pending")
          .map((w) => w.id);
        setOpenItems(pendingIds);
      }
    } finally {
      setLoading(false);
    }
  }, [defaultOpenPending, merchantUserId, t, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  async function resendVerification(walletId: string) {
    setActing(walletId);
    setBanner(null);
    try {
      const res = await fetch(`/api/admin/users/${merchantUserId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resend_wallet_verification",
          walletId,
        }),
      });
      const parsed = await parseAdminApiResponse<{
        success: boolean;
        message?: string;
        merchantNotified?: boolean;
        adminNotified?: boolean;
      }>(res, "Could not resend verification email");

      if (!parsed.ok) {
        toast({
          title: t("resendFailed"),
          description: parsed.error,
          variant: "destructive",
        });
        setBanner({ type: "error", text: parsed.error });
        return;
      }

      toast({
        title: t("verificationSent"),
        description: parsed.data.message ?? t("verificationSentHint"),
      });
      setBanner({
        type: "success",
        text: parsed.data.message ?? t("verificationSentHint"),
      });
      await load();
    } finally {
      setActing(null);
    }
  }

  async function review(
    id: string,
    status: "verified" | "rejected",
    rejection_reason?: string,
  ) {
    setActing(id);
    setBanner(null);
    try {
      const res = await fetch("/api/admin/wallets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, rejection_reason }),
      });
      const parsed = await parseAdminApiResponse<{
        success: boolean;
        merchantNotification?: { sent?: boolean };
      }>(res, "Could not update wallet");
      if (!parsed.ok) {
        toast({
          title: t("walletUpdateFailed"),
          description: parsed.error,
          variant: "destructive",
        });
        setBanner({ type: "error", text: parsed.error });
        return;
      }
      const note = parsed.data.merchantNotification?.sent
        ? ` ${t("merchantNotified")}`
        : "";
      const statusLabel = walletStatusLabel(status);
      toast({
        title: t("walletStatusUpdated", { status: statusLabel }),
        description: note.trim() || undefined,
      });
      setBanner({
        type: "success",
        text: `${t("walletStatusUpdated", { status: statusLabel })}.${note}`,
      });
      await load();
    } finally {
      setActing(null);
    }
  }

  async function confirmRejection(rejection_reason: string | undefined) {
    if (!rejectingWallet) return;
    await review(rejectingWallet.id, "rejected", rejection_reason);
    setRejectingWallet(null);
  }

  function copyAddress(address: string) {
    void navigator.clipboard.writeText(address);
    toast({ title: t("addressCopied") });
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
        {t("noWalletsYet")}
      </p>
    );
  }

  const pendingCount = wallets.filter((w) => w.status === "pending").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {t("walletsAccordionHint", { count: wallets.length, pending: pendingCount })}
        </p>
        <div className="flex flex-wrap gap-2">
          <MerchantEmailDialog
            merchantUserId={merchantUserId}
            merchantEmail={merchantEmail}
          />
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href={`/admin/wallets?user=${merchantUserId}`}>
              {t("openReviewQueue")}
            </Link>
          </Button>
        </div>
      </div>

      {banner ? (
        <Alert variant={banner.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{banner.text}</AlertDescription>
        </Alert>
      ) : null}

      <ScrollArea className="max-h-[min(70vh,640px)] pr-3">
        <Accordion
          type="multiple"
          value={openItems}
          onValueChange={setOpenItems}
          className="flex flex-col gap-2"
        >
          {wallets.map((w) => (
            <AccordionItem
              key={w.id}
              value={w.id}
              className="rounded-lg border px-4 last:border-b"
            >
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex flex-1 flex-wrap items-center gap-2 text-left">
                  <span className="font-medium">{w.label}</span>
                  {w.is_primary ? (
                    <Badge variant="outline" className="text-xs">
                      {t("primaryWallet")}
                    </Badge>
                  ) : null}
                  <Badge variant="outline" className="font-normal">
                    {walletNetworkLabel(w.wallet_network)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn("font-normal", statusBadgeClass(w.status))}
                  >
                    {walletStatusLabel(w.status)}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-3 pb-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {t("walletAddress")}
                    </p>
                    <div className="mt-1 flex items-start gap-2">
                      <code className="flex-1 break-all rounded-md bg-muted px-2 py-1.5 font-mono text-xs">
                        {w.wallet_address}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                        onClick={() => copyAddress(w.wallet_address)}
                        aria-label={t("copyAddress")}
                      >
                        <Copy className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("requestedAt")}:{" "}
                    {new Date(w.verification_requested_at).toLocaleString()}
                  </p>
                  {w.status === "rejected" ? (
                    <p className="rounded-md border border-dashed bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {t("rejectionNoteLabel")}:{" "}
                      </span>
                      {w.rejection_reason?.trim()
                        ? w.rejection_reason.trim()
                        : t("rejectionNoteEmpty")}
                    </p>
                  ) : null}
                  {w.status === "pending" ? (
                    <>
                      <Separator />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          disabled={acting === w.id}
                          onClick={() => void review(w.id, "verified")}
                        >
                          <Check data-icon="inline-start" />
                          {t("approveWallet")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={acting === w.id}
                          onClick={() =>
                            setRejectingWallet({ id: w.id, label: w.label })
                          }
                        >
                          <X data-icon="inline-start" />
                          {t("rejectWallet")}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={acting === w.id}
                          onClick={() => void resendVerification(w.id)}
                        >
                          <Mail data-icon="inline-start" />
                          {t("resendVerification")}
                        </Button>
                        <MerchantEmailDialog
                          merchantUserId={merchantUserId}
                          merchantEmail={merchantEmail}
                          walletId={w.id}
                          defaultSubject={t("walletEmailSubject", { label: w.label })}
                          triggerLabel={t("askMerchant")}
                        />
                      </div>
                    </>
                  ) : null}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>

      <WalletRejectionDialog
        open={rejectingWallet !== null}
        onOpenChange={(open) => {
          if (!open) setRejectingWallet(null);
        }}
        walletLabel={rejectingWallet?.label ?? ""}
        pending={acting !== null}
        onConfirm={confirmRejection}
      />
    </div>
  );
}
