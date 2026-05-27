"use client";

import { useActionState, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { HoneypotField } from "@/components/auth/honeypot-field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { signUp, type ActionState } from "../(login)/actions";

type StepId = "profile" | "contact" | "security";

type FormState = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
};

function clampStep(index: number, max: number) {
  return Math.min(Math.max(index, 0), max);
}

export function SignupWizard() {
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? searchParams.get("redirectTo") ?? "";
  const priceId = searchParams.get("priceId") ?? "";

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FormState>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [state, formAction, pending] = useActionState<ActionState, FormData>(signUp, { error: "" });

  const steps = useMemo(
    (): Array<{ id: StepId; title: string }> => [
      { id: "profile", title: t("createAccountTitle") },
      { id: "contact", title: t("email") },
      { id: "security", title: t("password") },
    ],
    [t],
  );

  const activeStep = steps[stepIndex]?.id ?? "profile";

  const canContinue = useMemo(() => {
    if (activeStep === "profile") {
      return form.first_name.trim().length >= 2 && form.last_name.trim().length >= 2;
    }
    if (activeStep === "contact") {
      return form.email.trim().length >= 3 && form.email.includes("@");
    }
    if (activeStep === "security") {
      return form.password.length >= 8;
    }
    return false;
  }, [activeStep, form.email, form.first_name, form.last_name, form.password]);

  const progressLabel = `${stepIndex + 1}/${steps.length}`;

  return (
    <div className="flex min-h-[calc(100dvh-5.5rem)] items-center justify-center bg-linear-to-br from-slate-50 via-white to-emerald-50/30 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        <Card className="border-slate-200/80 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-between gap-3">
              <Badge variant="secondary" className="tabular-nums">
                {progressLabel}
              </Badge>
              <div className="flex-1 text-center">
                <CardTitle className="text-2xl tracking-tight sm:text-3xl">
                  {t("createAccountTitle")}
                </CardTitle>
                <CardDescription>
                  {t("alreadyHaveAccount")}{" "}
                  <Link href="/login" className="font-medium text-emerald-700 hover:text-emerald-600">
                    {t("signInLink")}
                  </Link>
                </CardDescription>
              </div>
              <div className="w-[52px]" aria-hidden />
            </div>

            <div className="pt-3">
              <div className="grid grid-cols-3 gap-2">
                {steps.map((step, idx) => {
                  const isDone = idx < stepIndex;
                  const isActive = idx === stepIndex;
                  return (
                    <div
                      key={step.id}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs font-medium",
                        isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                          : isDone
                            ? "border-slate-200 bg-white text-slate-700"
                            : "border-slate-200/70 bg-white/60 text-slate-500",
                      )}
                    >
                      {idx + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {state?.error ? (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertTitle>{tCommon("error")}</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            ) : null}

            {state?.success ? (
              <Alert className="border-emerald-200/70 bg-emerald-50/60 text-emerald-950">
                <CheckCircle2 />
                <AlertTitle>{tCommon("success")}</AlertTitle>
                <AlertDescription>{state.success}</AlertDescription>
              </Alert>
            ) : null}

            <form action={formAction} className="flex flex-col gap-4">
              <HoneypotField />
              <input type="hidden" name="redirect" value={redirect} />
              <input type="hidden" name="priceId" value={priceId} />
              <input type="hidden" name="first_name" value={form.first_name} />
              <input type="hidden" name="last_name" value={form.last_name} />
              <input type="hidden" name="email" value={form.email} />
              <input type="hidden" name="phone" value={form.phone} />
              <input type="hidden" name="password" value={form.password} />

              {activeStep === "profile" ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="first_name">{t("firstName")}</Label>
                    <Input
                      id="first_name"
                      autoComplete="given-name"
                      value={form.first_name}
                      onChange={(e) => setForm((prev) => ({ ...prev, first_name: e.target.value }))}
                      placeholder={t("firstName")}
                      maxLength={80}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="last_name">{t("lastName")}</Label>
                    <Input
                      id="last_name"
                      autoComplete="family-name"
                      value={form.last_name}
                      onChange={(e) => setForm((prev) => ({ ...prev, last_name: e.target.value }))}
                      placeholder={t("lastName")}
                      maxLength={80}
                    />
                  </div>
                </div>
              ) : null}

              {activeStep === "contact" ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder={t("emailPlaceholder")}
                      maxLength={255}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="phone">{t("phoneOptional")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder={t("phonePlaceholder")}
                      maxLength={30}
                    />
                  </div>
                </div>
              ) : null}

              {activeStep === "security" ? (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">{t("password")}</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder={t("passwordPlaceholder")}
                    minLength={8}
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">{t("termsFooter")}</p>
                </div>
              ) : null}

              <Separator />

              <div
                className={cn(
                  "flex flex-col gap-2 sm:flex-row",
                  stepIndex === 0 ? "sm:justify-end" : "sm:justify-between",
                )}
              >
                {stepIndex > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    disabled={pending}
                    onClick={() => setStepIndex((prev) => clampStep(prev - 1, steps.length - 1))}
                  >
                    <ArrowLeft data-icon="inline-start" />
                    {tCommon("back")}
                  </Button>
                ) : null}

                <Button
                  type={activeStep === "security" ? "submit" : "button"}
                  className={cn("rounded-full", stepIndex === 0 && "sm:min-w-[10rem]")}
                  disabled={pending || !canContinue}
                  onClick={
                    activeStep === "security"
                      ? undefined
                      : () => setStepIndex((prev) => clampStep(prev + 1, steps.length - 1))
                  }
                >
                  {pending ? (
                    <>
                      <Loader2 data-icon="inline-start" className="animate-spin" />
                      {tCommon("creatingAccount")}
                    </>
                  ) : activeStep === "security" ? (
                    t("signUp")
                  ) : (
                    <>
                      {tCommon("continue")}
                      <ArrowRight data-icon="inline-end" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col items-center gap-2 border-t text-center">
            <p className="text-xs text-muted-foreground">
              {t("termsFooter")}{" "}
              <Link href="/terms-of-service" className="font-medium text-emerald-700 hover:text-emerald-600">
                {t("termsOfService")}
              </Link>{" "}
              {t("and")}{" "}
              <Link href="/privacy-policy" className="font-medium text-emerald-700 hover:text-emerald-600">
                {t("privacyPolicy")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

