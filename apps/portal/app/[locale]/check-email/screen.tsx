"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, Mail, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ResendConfirmationButton } from "@/components/auth/resend-confirmation-button";

export function CheckEmailScreen() {
  const t = useTranslations("Auth");
  const searchParams = useSearchParams();

  const email = useMemo(() => searchParams.get("email") ?? "", [searchParams]);
  const verificationPending = searchParams.get("verify") === "1";

  return (
    <div className="flex min-h-[calc(100dvh-5.5rem)] items-center justify-center bg-linear-to-br from-slate-50 via-white to-emerald-50/30 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="border-slate-200/80 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Mail className="h-6 w-6 text-emerald-700" />
            </div>
            <CardTitle className="text-2xl tracking-tight sm:text-3xl">
              {t("checkEmailTitle")}
            </CardTitle>
            <CardDescription>{t("checkEmailDescription")}</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <Alert className="border-emerald-200/70 bg-emerald-50/60 text-emerald-950">
              <CheckCircle2 />
              <AlertTitle>{t("accountCreated")}</AlertTitle>
              <AlertDescription className="text-emerald-900/80">
                {email
                  ? t("verifyEmailWith", { email })
                  : t("verifyEmailGeneric")}
              </AlertDescription>
            </Alert>

            {verificationPending && email ? (
              <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4">
                <p className="text-sm font-medium text-slate-900">
                  {t("didntGetEmail")}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {t("resendConfirmationHint")}
                </p>
                <div className="pt-3">
                  <ResendConfirmationButton email={email} />
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild className="rounded-full">
                <Link href="/login">
                  {t("signIn")}
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/">{t("backToHome")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

