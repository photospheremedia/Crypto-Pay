"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Check, Mail, User, X } from "lucide-react";
import { MerchantEmailDialog } from "@/components/admin/merchant-email-dialog";
import { WalletRejectionDialog } from "@/components/admin/wallet-rejection-dialog";
import { walletNetworkLabel, walletStatusLabel } from "@/lib/wallets/constants";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { parseAdminApiResponse } from "@/lib/admin/parse-admin-api-response";

type AdminWalletRow = {
  id: string;
  user_id: string;
  label: string;
  wallet_network: string;
  wallet_address: string;
  status: string;
  verification_requested_at: string;
  merchant: { email: string; full_name: string | null } | null;
};

export default function AdminWalletsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const highlightWalletId = searchParams.get("wallet");
  const filterUserId = searchParams.get("user");

  const [filter, setFilter] = useState(
    highlightWalletId ? "pending" : "pending",
  );
  const [wallets, setWallets] = useState<AdminWalletRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [rejectingWallet, setRejectingWallet] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const highlightedRowRef = useRef<HTMLTableRowElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ status: filter });
      if (filterUserId) qs.set("user", filterUserId);
      const res = await fetch(`/api/admin/wallets?${qs.toString()}`);
      const parsed = await parseAdminApiResponse<{
        success: boolean;
        wallets?: AdminWalletRow[];
      }>(
        res,
        "Failed to load wallets",
      );
      if (!parsed.ok) {
        toast({
          title: "Could not load wallets",
          description: parsed.error,
          variant: "destructive",
        });
        setWallets([]);
        return;
      }
      setWallets(parsed.data.wallets ?? []);
    } finally {
      setLoading(false);
    }
  }, [filter, filterUserId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (highlightWalletId) {
      setFilter("pending");
    }
  }, [highlightWalletId]);

  useEffect(() => {
    if (!highlightWalletId || loading) return;
    highlightedRowRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [highlightWalletId, loading, wallets]);

  async function resendWalletVerification(walletId: string, userId: string) {
    setActing(walletId);
    setBanner(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resend_wallet_verification",
          walletId,
        }),
      });
      const parsed = await parseAdminApiResponse<{ success: boolean; message?: string }>(
        res,
        "Could not resend verification",
      );
      if (!parsed.ok) {
        toast({
          title: "Resend failed",
          description: parsed.error,
          variant: "destructive",
        });
        setBanner({ type: "error", message: parsed.error });
        return;
      }
      toast({
        title: "Verification emails sent",
        description: parsed.data.message ?? "Sent via Resend.",
      });
      setBanner({
        type: "success",
        message: parsed.data.message ?? "Verification reminder emails sent.",
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
        merchantNotification?: { sent: boolean; skipped?: string; error?: string };
      }>(res, "Could not update wallet status");

      if (!parsed.ok) {
        toast({
          title: "Wallet update failed",
          description: parsed.error,
          variant: "destructive",
        });
        setBanner({ type: "error", message: parsed.error });
        return;
      }

      const merchant = parsed.data.merchantNotification;
      if (merchant?.error) {
        setBanner({
          type: "error",
          message: `Wallet marked ${status}, but merchant email failed: ${merchant.error}`,
        });
      } else if (status === "verified") {
        setBanner({
          type: "success",
          message: merchant?.skipped
            ? "Wallet verified (merchant was already notified)."
            : "Wallet verified — merchant notified by email.",
        });
      } else {
        setBanner({
          type: "success",
          message: merchant?.skipped
            ? "Wallet rejected."
            : "Wallet rejected — merchant notified by email.",
        });
      }

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

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Wallet verification</h1>
        <p className="text-sm text-muted-foreground">
          Review merchant payout addresses. New submissions email all addresses in{" "}
          <code className="text-xs">ADMIN_REVIEW_EMAIL</code> /{" "}
          <code className="text-xs">ADMIN_ALLOWED_EMAILS</code>.
        </p>
      </div>

      {banner ? (
        <Alert variant={banner.type === "error" ? "destructive" : "default"}>
          <AlertDescription>{banner.message}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Merchant wallets</CardTitle>
          <CardDescription>
            Approve or reject addresses. Merchants receive email when status
            changes from pending.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : wallets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No wallets in this view.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Review</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallets.map((w) => {
                  const highlighted = w.id === highlightWalletId;
                  return (
                    <TableRow
                      key={w.id}
                      ref={highlighted ? highlightedRowRef : undefined}
                      className={
                        highlighted
                          ? "bg-emerald-50/80 ring-2 ring-emerald-500/40 ring-inset"
                          : undefined
                      }
                    >
                      <TableCell className="text-sm">
                        <div>{w.merchant?.full_name ?? "—"}</div>
                        <div className="text-muted-foreground">
                          {w.merchant?.email ?? "—"}
                        </div>
                        {w.merchant?.email ? (
                          <div className="mt-2 flex flex-wrap gap-1">
                            <Button size="sm" variant="ghost" className="h-7 px-2" asChild>
                              <Link href={`/admin/users/${w.user_id}`}>
                                <User className="size-3" data-icon="inline-start" />
                                Merchant
                              </Link>
                            </Button>
                            <MerchantEmailDialog
                              merchantUserId={w.user_id}
                              merchantEmail={w.merchant.email}
                              walletId={w.id}
                              defaultSubject={`Payout wallet “${w.label}”`}
                              triggerLabel="Email"
                            />
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell>{w.label}</TableCell>
                      <TableCell>{walletNetworkLabel(w.wallet_network)}</TableCell>
                      <TableCell className="max-w-[180px] truncate font-mono text-xs">
                        {w.wallet_address}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {walletStatusLabel(w.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {w.status === "pending" ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              disabled={acting === w.id}
                              onClick={() => review(w.id, "verified")}
                            >
                              <Check data-icon="inline-start" />
                              Approve
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
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={acting === w.id}
                              onClick={() =>
                                void resendWalletVerification(w.id, w.user_id)
                              }
                            >
                              <Mail data-icon="inline-start" />
                              Resend
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {new Date(w.verification_requested_at).toLocaleString()}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
