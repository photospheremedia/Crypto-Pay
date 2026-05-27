"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Wallet } from "lucide-react";
import { AccountSetupChecklist } from "@/components/account/account-setup-checklist";
import { PaymentsComingSoon } from "@/components/account/payments-coming-soon";
import { WalletFormDialog } from "@/components/account/wallets/wallet-form-dialog";
import { WalletListTable } from "@/components/account/wallets/wallet-list-table";
import {
  deleteMerchantWallet,
  resendMerchantWalletVerification,
} from "@/lib/api/account-wallets-client";
import { useMerchantWallets } from "@/lib/hooks/use-merchant-wallets";
import type { MerchantWalletPublic } from "@/lib/wallets/merchant-wallet-public";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const VALID_TABS = ["overview", "wallets", "activity"] as const;
type AccountTab = (typeof VALID_TABS)[number];

function parseTab(value: string | null | undefined): AccountTab {
  if (value && VALID_TABS.includes(value as AccountTab)) {
    return value as AccountTab;
  }
  return "overview";
}

export function MerchantWalletsPanel({
  initialWallets,
  initialTab = "overview",
  showHeader = true,
  autoOpenAddWallet = false,
  onTabChange,
}: {
  initialWallets: MerchantWalletPublic[];
  initialTab?: string;
  showHeader?: boolean;
  autoOpenAddWallet?: boolean;
  onTabChange?: (tab: AccountTab) => void;
}) {
  const t = useTranslations("Account.wallets");
  const tMessages = useTranslations("Account.wallets.messages");
  const {
    wallets,
    isRefreshing,
    error: loadError,
    refresh,
  } = useMerchantWallets(initialWallets);

  const [activeTab, setActiveTab] = useState<AccountTab>(() => parseTab(initialTab));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MerchantWalletPublic | null>(null);
  const [banner, setBanner] = useState<{ error?: string; success?: string }>({});
  const [acting, setActing] = useState(false);
  const autoOpenedRef = useRef(false);

  useEffect(() => {
    setActiveTab(parseTab(initialTab));
  }, [initialTab]);

  useEffect(() => {
    if (autoOpenAddWallet && !autoOpenedRef.current && wallets.length === 0) {
      autoOpenedRef.current = true;
      setEditing(null);
      setDialogOpen(true);
    }
  }, [autoOpenAddWallet, wallets.length]);

  const stats = useMemo(() => {
    const verified = wallets.filter((w) => w.status === "verified").length;
    const pendingCount = wallets.filter((w) => w.status === "pending").length;
    const rejected = wallets.filter((w) => w.status === "rejected").length;
    return { verified, pending: pendingCount, rejected, total: wallets.length };
  }, [wallets]);

  function selectTab(tab: AccountTab) {
    setActiveTab(tab);
    onTabChange?.(tab);
  }

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(wallet: MerchantWalletPublic) {
    setEditing(wallet);
    setDialogOpen(true);
  }

  async function handleSaved() {
    setBanner({ success: tMessages("savedPending") });
    await refresh();
  }

  async function handleResend(id: string) {
    setActing(true);
    setBanner({});
    try {
      await resendMerchantWalletVerification(id);
      setBanner({ success: tMessages("reminderSent") });
      await refresh();
    } catch (err) {
      setBanner({
        error: err instanceof Error ? err.message : t("error"),
      });
    } finally {
      setActing(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    setActing(true);
    setBanner({});
    try {
      await deleteMerchantWallet(id);
      setBanner({ success: tMessages("deleted") });
      await refresh();
    } catch (err) {
      setBanner({
        error: err instanceof Error ? err.message : t("error"),
      });
    } finally {
      setActing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6" id="wallets">
      {showHeader ? (
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-600">
            {t("eyebrow")}
          </p>
          <h2 className="text-xl font-semibold text-foreground">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
      ) : null}

      {loadError ? (
        <Alert variant="destructive">
          <AlertTitle>{t("error")}</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      ) : null}

      {banner.error || banner.success ? (
        <Alert variant={banner.error ? "destructive" : "default"}>
          <AlertTitle>{banner.error ? t("notice") : t("success")}</AlertTitle>
          <AlertDescription>{banner.error ?? banner.success}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs
        value={activeTab}
        onValueChange={(v) => selectTab(parseTab(v))}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="wallets">{t("tabs.wallets")}</TabsTrigger>
          <TabsTrigger value="activity">{t("tabs.activity")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t("stats.verified")}</CardDescription>
                <CardTitle className="text-2xl">{stats.verified}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                {t("stats.verifiedHint")}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t("stats.pendingReview")}</CardDescription>
                <CardTitle className="text-2xl">{stats.pending}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                {t("stats.pendingHint")}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t("stats.totalWallets")}</CardDescription>
                <CardTitle className="text-2xl">{stats.total}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                {t("stats.totalHint")}
              </CardContent>
            </Card>
          </div>
          <AccountSetupChecklist stats={stats} onAddWallet={openAdd} />
        </TabsContent>

        <TabsContent value="wallets" className="mt-4 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">{t("listHint")}</p>
            <Button type="button" onClick={openAdd} disabled={isRefreshing}>
              <Plus data-icon="inline-start" />
              {t("addWallet")}
            </Button>
          </div>

          {wallets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <Wallet className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t("emptyState")}</p>
                <Button type="button" onClick={openAdd}>
                  {t("addWallet")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <WalletListTable
                wallets={wallets}
                pending={acting || isRefreshing}
                onEdit={openEdit}
                onResend={handleResend}
                onDelete={handleDelete}
              />
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <PaymentsComingSoon />
        </TabsContent>
      </Tabs>

      <WalletFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSaved={handleSaved}
      />
    </div>
  );
}
