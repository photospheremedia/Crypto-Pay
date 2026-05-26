"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, Circle, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type SetupStats = {
  total: number;
  verified: number;
  pending: number;
};

function StepRow({
  done,
  active,
  title,
  description,
  action,
}: {
  done: boolean;
  active?: boolean;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const Icon = done ? CheckCircle2 : active ? Clock : Circle;
  return (
    <li className="flex gap-3">
      <Icon
        className={cn(
          "mt-0.5 size-5 shrink-0",
          done && "text-emerald-600",
          active && !done && "text-amber-500",
          !done && !active && "text-muted-foreground",
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        {action ? <div className="pt-1">{action}</div> : null}
      </div>
    </li>
  );
}

export function AccountSetupChecklist({
  stats,
  onAddWallet,
}: {
  stats: SetupStats;
  onAddWallet?: () => void;
}) {
  const t = useTranslations("Account.setup");

  const hasWallet = stats.total > 0;
  const hasVerified = stats.verified > 0;
  const waitingReview = stats.pending > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col gap-5">
          <StepRow
            done={hasWallet}
            active={!hasWallet}
            title={t("step1Title")}
            description={t("step1Description")}
            action={
              !hasWallet && onAddWallet ? (
                <Button type="button" size="sm" onClick={onAddWallet}>
                  {t("step1Action")}
                </Button>
              ) : null
            }
          />
          <StepRow
            done={hasVerified}
            active={hasWallet && !hasVerified}
            title={t("step2Title")}
            description={
              waitingReview && !hasVerified
                ? t("step2DescriptionPending")
                : t("step2Description")
            }
          />
          <StepRow
            done={false}
            active={hasVerified}
            title={t("step3Title")}
            description={t("step3Description")}
            action={
              <Button variant="outline" size="sm" asChild>
                <Link href="/developers">
                  {t("step3Action")}
                  <ExternalLink data-icon="inline-end" className="size-3.5" />
                </Link>
              </Button>
            }
          />
        </ol>
      </CardContent>
    </Card>
  );
}
