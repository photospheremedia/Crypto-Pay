"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Ban,
  CheckCircle2,
  Database,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MerchantEmailDialog } from "@/components/admin/merchant-email-dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "@/i18n/navigation";
import { parseAdminApiResponse } from "@/lib/admin/parse-admin-api-response";
import type { MerchantAuthSnapshot } from "@/lib/admin/merchant-supabase-admin";

type MerchantSupabaseToolsProps = {
  merchantUserId: string;
  merchantEmail: string;
  emailConfirmed: boolean;
  isBanned?: boolean;
  canDelete?: boolean;
  onAuthChange?: () => void;
};

export function MerchantSupabaseTools({
  merchantUserId,
  merchantEmail,
  emailConfirmed,
  isBanned = false,
  canDelete = false,
  onAuthChange,
}: MerchantSupabaseToolsProps) {
  const t = useTranslations("Admin.merchants");
  const { toast } = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [auth, setAuth] = useState<MerchantAuthSnapshot | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const refreshAuth = useCallback(async () => {
    setLoadingAuth(true);
    try {
      const res = await fetch(`/api/admin/users/${merchantUserId}/auth`);
      const parsed = await parseAdminApiResponse<{
        success: boolean;
        auth: MerchantAuthSnapshot;
      }>(res, "Failed to load Supabase auth state");
      if (parsed.ok) {
        setAuth(parsed.data.auth);
      }
    } finally {
      setLoadingAuth(false);
    }
  }, [merchantUserId]);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  const runAction = async (
    action: string,
    body?: Record<string, unknown>,
    options?: { successTitle?: string; onSuccess?: () => void },
  ) => {
    setBusy(action);
    try {
      const res = await fetch(`/api/admin/users/${merchantUserId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...body }),
      });
      const parsed = await parseAdminApiResponse<{
        success: boolean;
        message?: string;
        auth?: MerchantAuthSnapshot;
      }>(res, "Action failed");

      if (!parsed.ok) {
        toast({
          title: "Supabase action failed",
          description: parsed.error,
          variant: "destructive",
        });
        return;
      }

      if (parsed.data.auth) {
        setAuth(parsed.data.auth);
      } else {
        await refreshAuth();
      }

      toast({
        title: options?.successTitle ?? "Done",
        description: parsed.data.message ?? "Completed successfully.",
      });
      options?.onSuccess?.();
      onAuthChange?.();
    } finally {
      setBusy(null);
    }
  };

  const confirm = (message: string) => window.confirm(message);

  const deleteAccount = async () => {
    if (
      !confirm(
        `Permanently delete ${merchantEmail} from Supabase Auth? A notification email is sent first. This cannot be undone.`,
      )
    ) {
      return;
    }
    await runAction("delete_account", undefined, {
      successTitle: "Account deleted",
      onSuccess: () => router.replace("/admin/users"),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="size-5 text-emerald-600" />
            {t("supabaseToolsTitle")}
          </CardTitle>
          <CardDescription>{t("supabaseToolsDescription")}</CardDescription>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={loadingAuth || !!busy}
          onClick={() => void refreshAuth()}
        >
          <RefreshCw
            className={loadingAuth ? "animate-spin" : ""}
            data-icon="inline-start"
          />
          Refresh
        </Button>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="rounded-lg border bg-muted/30 p-4 text-sm">
          <p className="mb-2 font-medium text-foreground">{t("supabaseSnapshot")}</p>
          {loadingAuth ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading…
            </div>
          ) : auth ? (
            <dl className="grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">{t("emailConfirmed")}</dt>
                <dd className="font-medium">
                  {auth.emailConfirmed ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="size-4" />
                      Yes
                    </span>
                  ) : (
                    <Badge variant="outline" className="text-amber-700">
                      Pending
                    </Badge>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Account status</dt>
                <dd className="font-medium">
                  {auth.isBanned ? (
                    <Badge variant="destructive">Banned</Badge>
                  ) : (
                    <Badge variant="secondary">Active</Badge>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Providers</dt>
                <dd>{auth.providers.join(", ") || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Last sign-in</dt>
                <dd>
                  {auth.lastSignInAt
                    ? new Date(auth.lastSignInAt).toLocaleString()
                    : "Never"}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-muted-foreground">Could not load auth state.</p>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Email (Resend + Supabase links)</p>
          <div className="flex flex-wrap gap-2">
            <MerchantEmailDialog
              merchantUserId={merchantUserId}
              merchantEmail={merchantEmail}
              triggerLabel="Custom email"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!!busy}
              onClick={() =>
                void runAction("send_email_verification", undefined, {
                  successTitle: emailConfirmed
                    ? "Verification resent"
                    : "Verification sent",
                })
              }
            >
              <ShieldCheck data-icon="inline-start" />
              {emailConfirmed
                ? t("resendEmailVerification")
                : t("sendEmailVerification")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!!busy}
              onClick={() =>
                void runAction("send_password_reset", undefined, {
                  successTitle: "Password reset sent",
                })
              }
            >
              <KeyRound data-icon="inline-start" />
              {t("sendPasswordReset")}
            </Button>
            <Button type="button" variant="ghost" size="sm" asChild>
              <a href={`mailto:${merchantEmail}`}>
                <Mail data-icon="inline-start" />
                Mail app
              </a>
            </Button>
          </div>
        </div>

        <Separator />

        <div>
          <p className="mb-2 text-sm font-medium">Supabase Auth controls</p>
          <div className="flex flex-wrap gap-2">
            {!emailConfirmed ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!!busy}
                onClick={() => {
                  if (
                    !confirm(
                      "Mark this email as confirmed directly in Supabase Auth? Use only when you have verified ownership out of band.",
                    )
                  ) {
                    return;
                  }
                  void runAction("confirm_email", undefined, {
                    successTitle: "Email confirmed in Supabase",
                  });
                }}
              >
                <CheckCircle2 data-icon="inline-start" />
                {t("confirmEmailSupabase")}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!!busy}
              onClick={() =>
                void runAction("sync_auth_metadata", undefined, {
                  successTitle: "Metadata synced",
                })
              }
            >
              <UserCog data-icon="inline-start" />
              {t("syncAuthMetadata")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!!busy}
              onClick={() => {
                if (
                  !confirm(
                    `Sign ${merchantEmail} out of every device via Supabase? They will get an email notification.`,
                  )
                ) {
                  return;
                }
                void runAction(
                  "revoke_sessions",
                  { notifyMerchant: true },
                  { successTitle: "Sessions revoked" },
                );
              }}
            >
              <LogOut data-icon="inline-start" />
              {t("revokeSessions")}
            </Button>
            {isBanned || auth?.isBanned ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!!busy}
                onClick={() =>
                  void runAction("unban_user", undefined, {
                    successTitle: "User unbanned",
                  })
                }
              >
                <Ban data-icon="inline-start" />
                {t("unbanInSupabase")}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!!busy}
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  if (
                    !confirm(
                      `Ban ${merchantEmail} in Supabase Auth? They will be signed out and cannot sign in.`,
                    )
                  ) {
                    return;
                  }
                  void runAction("ban_user", undefined, {
                    successTitle: "User banned",
                  });
                }}
              >
                <Ban data-icon="inline-start" />
                {t("banInSupabase")}
              </Button>
            )}
          </div>
        </div>

        {canDelete ? (
          <>
            <Separator />
            <div>
              <p className="mb-2 text-sm font-medium text-destructive">Danger zone</p>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={!!busy}
                onClick={() => void deleteAccount()}
              >
                {busy === "delete_account" ? (
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                ) : (
                  <Trash2 data-icon="inline-start" />
                )}
                {t("deleteAccount")}
              </Button>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
