"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MerchantDirectoryTable,
  type MerchantDirectoryRow,
} from "@/components/admin/merchant-directory-table";
import { useToast } from "@/hooks/use-toast";
import { parseAdminApiResponse } from "@/lib/admin/parse-admin-api-response";

type ApiResponse = {
  success: boolean;
  users: MerchantDirectoryRow[];
  summary?: {
    totalMerchants: number;
    withWallets: number;
    pendingWalletRequests: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type MerchantFilter = "all" | "pending" | "with_wallets" | "no_wallets";

export default function AdminUsersPage() {
  const t = useTranslations("Admin.merchants");
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MerchantFilter>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<MerchantDirectoryRow[]>([]);
  const [summary, setSummary] = useState<ApiResponse["summary"]>();
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("limit", "20");
    if (query.trim()) p.set("search", query.trim());
    if (filter !== "all") p.set("filter", filter);
    return p.toString();
  }, [query, page, filter]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/users?${params}`);
        const parsed = await parseAdminApiResponse<ApiResponse>(
          res,
          "Failed to load merchants",
        );
        if (!cancelled) {
          if (!parsed.ok) {
            toast({
              title: parsed.status === 403 ? "Access denied" : "Could not load merchants",
              description: parsed.error,
              variant: "destructive",
            });
            setUsers([]);
            setSummary(undefined);
            return;
          }
          const data = parsed.data;
          setUsers(data.users || []);
          setSummary(data.summary);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotal(data.pagination?.total || 0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [params, toast]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      {summary ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t("totalAccounts")}</CardDescription>
              <CardTitle className="text-2xl">{summary.totalMerchants}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t("withWallets")}</CardDescription>
              <CardTitle className="text-2xl">{summary.withWallets}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t("pendingRequests")}</CardDescription>
              <CardTitle className="text-2xl text-amber-600">
                {summary.pendingWalletRequests}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {summary.pendingWalletRequests > 0 ? (
                <Button size="sm" variant="outline" asChild>
                  <Link href="/admin/wallets?status=pending">{t("reviewNow")}</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setPage(1);
                setQuery(e.target.value);
              }}
              placeholder={t("searchPlaceholder")}
              className="pl-10"
            />
          </div>

          <Tabs
            value={filter}
            onValueChange={(v) => {
              setPage(1);
              setFilter(v as MerchantFilter);
            }}
          >
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
              <TabsTrigger value="all">{t("filterAll")}</TabsTrigger>
              <TabsTrigger value="pending">{t("filterPending")}</TabsTrigger>
              <TabsTrigger value="with_wallets">{t("filterWithWallets")}</TabsTrigger>
              <TabsTrigger value="no_wallets">{t("filterNoWallets")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <MerchantDirectoryTable rows={users} loading={loading} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{t("paginationTotal", { count: total })}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t("previous")}
          </Button>
          <span>{t("pageOf", { page, total: totalPages })}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
