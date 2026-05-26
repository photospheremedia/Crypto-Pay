"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MerchantAvatar } from "@/components/admin/merchant-avatar";
import { MerchantWalletCounts } from "@/components/admin/merchant-wallet-counts";
import { MerchantWalletsPanel } from "@/components/admin/merchant-wallets-panel";
import { MerchantSupabaseTools } from "@/components/admin/merchant-supabase-tools";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "@/i18n/navigation";
import { useAdminStats } from "@/components/admin/admin-stats-provider";
import { parseAdminApiResponse } from "@/lib/admin/parse-admin-api-response";

type UserDetail = {
  id: string;
  profile: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    company_name: string | null;
  } | null;
  auth: {
    email_confirmed_at: string | null;
    last_sign_in_at: string | null;
    banned_until: string | null;
  } | null;
  wallet_counts: {
    total: number;
    pending: number;
    verified: number;
    rejected: number;
  };
  stats: {
    wallet_linked: boolean;
    wallet_verified: boolean;
    leads_count: number;
    pending_wallets: number;
  };
};

export default function AdminUserDetailPage() {
  const t = useTranslations("Admin.merchants");
  const tCommon = useTranslations("Common");
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const userId = String(params.id || "");

  const initialTab = searchParams.get("tab") === "wallets" ? "wallets" : "overview";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [canDeleteMerchant, setCanDeleteMerchant] = useState(false);

  const merchantEmail = useMemo(
    () => user?.profile?.email ?? "",
    [user?.profile?.email],
  );

  const isBanned = useMemo(() => {
    const until = user?.auth?.banned_until;
    if (!until) return false;
    return new Date(until).getTime() > Date.now();
  }, [user?.auth?.banned_until]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const parsed = await parseAdminApiResponse<{ success: boolean; user: UserDetail }>(
        res,
        "Failed to load merchant",
      );
      if (!parsed.ok) {
        toast({
          title: parsed.status === 403 ? "Not a merchant account" : "Could not load merchant",
          description: parsed.error,
          variant: "destructive",
        });
        if (parsed.status === 403) {
          router.replace("/admin/users");
        }
        throw new Error(parsed.error);
      }
      const detail = parsed.data.user;
      setUser(detail);
      setFullName(detail.profile?.full_name || "");
      setPhone(detail.profile?.phone || "");
      setCompanyName(detail.profile?.company_name || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load merchant");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) void load();
  }, [userId]);

  useEffect(() => {
    if (searchParams.get("tab") === "wallets") {
      setActiveTab("wallets");
    }
  }, [searchParams]);

  const { isSuperAdmin, permissions } = useAdminStats();

  useEffect(() => {
    setCanDeleteMerchant(Boolean(isSuperAdmin || permissions?.canManageStaff));
  }, [isSuperAdmin, permissions]);

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          phone: phone || null,
          company_name: companyName || null,
        }),
      });
      const parsed = await parseAdminApiResponse<{ success: boolean }>(
        res,
        "Failed to update merchant",
      );
      if (!parsed.ok) {
        toast({
          title: "Update failed",
          description: parsed.error,
          variant: "destructive",
        });
        throw new Error(parsed.error);
      }
      toast({ title: t("profileUpdated") });
      setSuccess(t("profileUpdated"));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update merchant");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        {tCommon("loading")}
      </div>
    );
  }

  if (!user) {
    return <p className="text-muted-foreground">{t("notFound")}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/users"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 size-4" />
        {t("backToList")}
      </Link>

      <div className="flex flex-wrap items-start gap-4">
        <MerchantAvatar
          name={user.profile?.full_name}
          email={merchantEmail}
          className="size-12"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {user.profile?.full_name || t("unnamed")}
          </h1>
          <p className="text-sm text-muted-foreground">{merchantEmail}</p>
          {user.profile?.company_name ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {user.profile.company_name}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <MerchantWalletCounts counts={user.wallet_counts} />
          {user.stats.pending_wallets > 0 ? (
            <Badge className="bg-amber-500 text-white">
              {t("pendingBadge", { count: user.stats.pending_wallets })}
            </Badge>
          ) : null}
          {isBanned ? (
            <Badge variant="destructive">{t("accountBanned")}</Badge>
          ) : null}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="overview">{t("tabOverview")}</TabsTrigger>
          <TabsTrigger value="wallets">
            {t("tabWallets")}
            {user.wallet_counts.total > 0 ? (
              <Badge variant="secondary" className="ml-2">
                {user.wallet_counts.total}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="account">{t("tabAccount")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("profileSection")}</CardTitle>
                <CardDescription>{t("profileSectionHint")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSave} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="full_name">{t("fullName")}</Label>
                    <Input
                      id="full_name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="phone">{t("phone")}</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="company_name">{t("company")}</Label>
                    <Input
                      id="company_name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="animate-spin" data-icon="inline-start" />
                        {tCommon("saving")}
                      </>
                    ) : (
                      tCommon("saveChanges")
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("accountSection")}</CardTitle>
                <CardDescription>{t("accountSectionHint")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <p>
                  <span className="text-muted-foreground">{t("leads")}: </span>
                  {user.stats.leads_count}
                </p>
                <p>
                  <span className="text-muted-foreground">{t("emailConfirmed")}: </span>
                  {user.auth?.email_confirmed_at
                    ? new Date(user.auth.email_confirmed_at).toLocaleString()
                    : t("no")}
                </p>
                <p>
                  <span className="text-muted-foreground">{t("lastSignIn")}: </span>
                  {user.auth?.last_sign_in_at
                    ? new Date(user.auth.last_sign_in_at).toLocaleString()
                    : t("unknown")}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wallets" className="mt-6">
          {merchantEmail ? (
            <MerchantWalletsPanel
              merchantUserId={userId}
              merchantEmail={merchantEmail}
            />
          ) : null}
        </TabsContent>

        <TabsContent value="account" className="mt-6">
          {merchantEmail ? (
            <MerchantSupabaseTools
              merchantUserId={userId}
              merchantEmail={merchantEmail}
              emailConfirmed={Boolean(user.auth?.email_confirmed_at)}
              isBanned={isBanned}
              canDelete={canDeleteMerchant}
              onAuthChange={() => void load()}
            />
          ) : null}
        </TabsContent>
      </Tabs>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {success ? (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
