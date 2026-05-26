"use client";

import { useTranslations } from "next-intl";
import { Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type MerchantWalletCounts = {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
};

type MerchantWalletCountsProps = {
  counts: MerchantWalletCounts;
  className?: string;
};

export function MerchantWalletCounts({
  counts,
  className,
}: MerchantWalletCountsProps) {
  const t = useTranslations("Admin.merchants");

  if (counts.total === 0) {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>
        {t("none")}
      </span>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <Badge variant="secondary" className="font-normal">
        <Wallet className="mr-1 size-3" />
        {counts.total}
      </Badge>
      {counts.verified > 0 ? (
        <Badge
          variant="outline"
          className="border-emerald-200 bg-emerald-50 font-normal text-emerald-800"
        >
          {counts.verified} {t("verified")}
        </Badge>
      ) : null}
      {counts.pending > 0 ? (
        <Badge className="bg-amber-500 font-normal text-white hover:bg-amber-600">
          {counts.pending} {t("pending")}
        </Badge>
      ) : null}
      {counts.rejected > 0 ? (
        <Badge variant="outline" className="font-normal text-muted-foreground">
          {counts.rejected} {t("rejected")}
        </Badge>
      ) : null}
    </div>
  );
}
