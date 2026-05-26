"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  Plus,
  RefreshCw,
  Trash2,
  Wallet,
} from "lucide-react";
import { AccountSetupChecklist } from "@/components/account/account-setup-checklist";
import { PaymentsComingSoon } from "@/components/account/payments-coming-soon";
import type { MerchantWallet } from "@/types/crypto-pay-db";
import { WALLET_NETWORKS } from "@/lib/wallets/constants";
import {
  deleteMerchantWallet,
  resendWalletVerification,
  saveMerchantWallet,
  type WalletFormState,
} from "@/app/[locale]/account/wallets/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const initialFormState: WalletFormState = {};

function statusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "verified") return "default";
  if (status === "rejected") return "destructive";
  return "secondary";
}

function WalletFormDialog({
  open,
  onOpenChange,
  editing,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: MerchantWallet | null;
  onSaved?: () => void;
}) {
  const t = useTranslations("Account.wallets");
  const [state, formAction, pending] = useActionState(
    saveMerchantWallet,
    initialFormState,
  );

  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
      onSaved?.();
    }
  }, [state.success, onOpenChange, onSaved]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? t("dialog.editTitle") : t("dialog.addTitle")}
          </DialogTitle>
          <DialogDescription>{t("dialog.description")}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          {editing ? (
            <input type="hidden" name="id" value={editing.id} />
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="label">{t("dialog.walletName")}</Label>
            <Input
              id="label"
              name="label"
              required
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
          {state.error ? (
            <Alert variant="destructive">
              <AlertTitle>{t("error")}</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          {state.success ? (
            <Alert>
              <AlertTitle>{t("saved")}</AlertTitle>
              <AlertDescription>{state.success}</AlertDescription>
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

const VALID_TABS = ["overview", "wallets", "activity"] as const;
type AccountTab = (typeof VALID_TABS)[number];

function parseTab(value: string | null | undefined): AccountTab {
  if (value && VALID_TABS.includes(value as AccountTab)) {
    return value as AccountTab;
  }
  return "overview";
}

export function MerchantWalletDashboard({
  wallets,
  onRefresh,
  initialTab = "overview",
  showHeader = true,
  autoOpenAddWallet = false,
}: {
  wallets: MerchantWallet[];
  onRefresh?: () => void;
  initialTab?: string;
  showHeader?: boolean;
  /** Opens the add-wallet dialog once when landing from signup / setup. */
  autoOpenAddWallet?: boolean;
}) {
  const t = useTranslations("Account.wallets");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<AccountTab>(() => parseTab(initialTab));

  function selectTab(tab: AccountTab) {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MerchantWallet | null>(null);
  const [message, setMessage] = useState<WalletFormState>({});
  const [pending, startTransition] = useTransition();
  const autoOpenedRef = useRef(false);

  useEffect(() => {
    setActiveTab(parseTab(initialTab));
  }, [initialTab]);

  useEffect(() => {
    if (
      autoOpenAddWallet &&
      !autoOpenedRef.current &&
      wallets.length === 0
    ) {
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

  function walletStatusLabel(status: string): string {
    if (status === "verified" || status === "rejected" || status === "pending") {
      return t(`status.${status}`);
    }
    return status;
  }

  function walletNetworkLabel(network: string): string {
    return WALLET_NETWORKS.find((n) => n.value === network)?.label ?? network.toUpperCase();
  }

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(wallet: MerchantWallet) {
    setEditing(wallet);
    setDialogOpen(true);
  }

  function handleResend(id: string) {
    startTransition(async () => {
      const result = await resendWalletVerification(id);
      setMessage(result);
      if (result.success) onRefresh?.();
    });
  }

  function handleDelete(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    startTransition(async () => {
      const result = await deleteMerchantWallet(id);
      setMessage(result);
      if (result.success) onRefresh?.();
    });
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

      {message.error || message.success ? (
        <Alert variant={message.error ? "destructive" : "default"}>
          <AlertTitle>{message.error ? t("notice") : t("success")}</AlertTitle>
          <AlertDescription>{message.error ?? message.success}</AlertDescription>
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
            <Button type="button" onClick={openAdd}>
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
                      <TableCell>
                        {walletNetworkLabel(wallet.wallet_network)}
                      </TableCell>
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
                            onClick={() => openEdit(wallet)}
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
                                onClick={() => handleResend(wallet.id)}
                              >
                                <RefreshCw data-icon="inline-start" />
                                {t("resend")}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={pending}
                                onClick={() => handleDelete(wallet.id)}
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
        onSaved={onRefresh}
      />
    </div>
  );
}
