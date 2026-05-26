"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChevronRight, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MerchantAvatar } from "@/components/admin/merchant-avatar";
import {
  MerchantWalletCounts,
  type MerchantWalletCounts as Counts,
} from "@/components/admin/merchant-wallet-counts";
import { Badge } from "@/components/ui/badge";

export type MerchantDirectoryRow = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  company_name: string | null;
  created_at: string;
  wallet_counts: Counts;
  pending_wallets: number;
  has_wallet: boolean;
};

type MerchantDirectoryTableProps = {
  rows: MerchantDirectoryRow[];
  loading: boolean;
};

export function MerchantDirectoryTable({
  rows,
  loading,
}: MerchantDirectoryTableProps) {
  const t = useTranslations("Admin.merchants");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        {t("loading")}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">{t("empty")}</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[min(280px,40%)]">{t("merchant")}</TableHead>
          <TableHead>{t("wallets")}</TableHead>
          <TableHead className="hidden md:table-cell">{t("company")}</TableHead>
          <TableHead className="hidden sm:table-cell">{t("joined")}</TableHead>
          <TableHead className="w-[100px] text-right">{t("actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((u) => (
          <TableRow key={u.id} className="group">
            <TableCell>
              <Link
                href={`/admin/users/${u.id}`}
                className="flex items-center gap-3 rounded-lg outline-none ring-offset-background transition hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <MerchantAvatar name={u.full_name} email={u.email} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    {u.full_name || t("unnamed")}
                  </div>
                  <div className="truncate text-sm text-muted-foreground">
                    {u.email}
                  </div>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
              </Link>
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-2">
                <MerchantWalletCounts counts={u.wallet_counts} />
                {u.pending_wallets > 0 ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-fit border-amber-200 text-amber-800 hover:bg-amber-50"
                    asChild
                  >
                    <Link href={`/admin/users/${u.id}?tab=wallets`}>
                      <Badge className="mr-1.5 bg-amber-500 text-white hover:bg-amber-500">
                        {u.pending_wallets}
                      </Badge>
                      {t("reviewWallets")}
                    </Link>
                  </Button>
                ) : null}
              </div>
            </TableCell>
            <TableCell className="hidden max-w-[140px] truncate text-muted-foreground md:table-cell">
              {u.company_name || "—"}
            </TableCell>
            <TableCell className="hidden text-muted-foreground sm:table-cell">
              {new Date(u.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/admin/users/${u.id}`}>
                  <User data-icon="inline-start" />
                  {t("manage")}
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
