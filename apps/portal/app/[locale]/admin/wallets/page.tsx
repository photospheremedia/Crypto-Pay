"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
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

type AdminWalletRow = {
  id: string;
  label: string;
  wallet_network: string;
  wallet_address: string;
  status: string;
  verification_requested_at: string;
  merchant: { email: string; full_name: string | null } | null;
};

export default function AdminWalletsPage() {
  const [filter, setFilter] = useState("pending");
  const [wallets, setWallets] = useState<AdminWalletRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/wallets?status=${filter}`);
      const json = await res.json();
      setWallets(json.wallets ?? []);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function review(id: string, status: "verified" | "rejected") {
    const rejection_reason =
      status === "rejected"
        ? window.prompt("Rejection reason (optional):") ?? undefined
        : undefined;

    setActing(id);
    try {
      const res = await fetch("/api/admin/wallets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, rejection_reason }),
      });
      if (res.ok) await load();
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Wallet verification</h1>
        <p className="text-sm text-muted-foreground">
          Review merchant payout addresses submitted from account dashboards.
        </p>
      </div>

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
            changes.
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
                {wallets.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="text-sm">
                      <div>{w.merchant?.full_name ?? "—"}</div>
                      <div className="text-muted-foreground">
                        {w.merchant?.email ?? w.id}
                      </div>
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
                            onClick={() => review(w.id, "rejected")}
                          >
                            <X data-icon="inline-start" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {new Date(w.verification_requested_at).toLocaleString()}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
