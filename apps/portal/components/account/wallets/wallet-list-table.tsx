"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Copy, RefreshCw, Trash2 } from "lucide-react";
import type { MerchantWalletPublic } from "@/lib/wallets/merchant-wallet-public";
import { WALLET_NETWORKS } from "@/lib/wallets/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function statusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "verified") return "default";
  if (status === "rejected") return "destructive";
  return "secondary";
}

function CopyAddressButton({ address }: { address: string }) {
  const t = useTranslations("Account.wallets");
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 px-2"
      onClick={() => {
        void navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? (
        <CheckCircle2 className="text-emerald-600" />
      ) : (
        <Copy />
      )}
      <span className="sr-only">{t("copyAddress")}</span>
    </Button>
  );
}

export function WalletListTable({
  wallets,
  pending,
  onEdit,
  onResend,
  onDelete,
}: {
  wallets: MerchantWalletPublic[];
  pending?: boolean;
  onEdit: (wallet: MerchantWalletPublic) => void;
  onResend: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const t = useTranslations("Account.wallets");

  function walletStatusLabel(status: string): string {
    if (status === "verified" || status === "rejected" || status === "pending") {
      return t(`status.${status}`);
    }
    return status;
  }

  function walletNetworkLabel(network: string): string {
    return WALLET_NETWORKS.find((n) => n.value === network)?.label ?? network.toUpperCase();
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("table.name")}</TableHead>
          <TableHead>{t("table.network")}</TableHead>
          <TableHead>{t("table.address")}</TableHead>
          <TableHead>{t("table.status")}</TableHead>
          <TableHead className="text-right">{t("table.actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {wallets.map((wallet) => (
          <TableRow key={wallet.id}>
            <TableCell className="font-medium">
              {wallet.label}
              {wallet.is_primary ? (
                <Badge variant="outline" className="ml-2">
                  {t("table.primary")}
                </Badge>
              ) : null}
            </TableCell>
            <TableCell>{walletNetworkLabel(wallet.wallet_network)}</TableCell>
            <TableCell>
              <div className="flex max-w-[200px] items-center gap-1">
                <span className="truncate font-mono text-xs">
                  {wallet.wallet_address}
                </span>
                <CopyAddressButton address={wallet.wallet_address} />
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant(wallet.status)}>
                {walletStatusLabel(wallet.status)}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex flex-wrap justify-end gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(wallet)}
                >
                  {t("edit")}
                </Button>
                {wallet.status === "pending" ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      onClick={() => onResend(wallet.id)}
                    >
                      <RefreshCw data-icon="inline-start" />
                      {t("resend")}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={pending}
                      onClick={() => onDelete(wallet.id)}
                    >
                      <Trash2 />
                    </Button>
                  </>
                ) : null}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
