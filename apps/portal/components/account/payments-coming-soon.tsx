"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Activity, Code2, Link2, Webhook } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const roadmapKeys = ["charges", "webhooks", "history"] as const;
const roadmapIcons = {
  charges: Link2,
  webhooks: Webhook,
  history: Activity,
} as const;

export function PaymentsComingSoon() {
  const t = useTranslations("Account.activity");

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="size-4 text-emerald-600" />
            {t("title")}
          </CardTitle>
          <Badge variant="secondary">{t("badge")}</Badge>
        </div>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">{t("emptyDetail")}</p>
        <ul className="grid gap-3 sm:grid-cols-3">
          {roadmapKeys.map((key) => {
            const Icon = roadmapIcons[key];
            return (
              <li
                key={key}
                className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/50"
              >
                <Icon className="mb-2 size-4 text-emerald-600" aria-hidden />
                <p className="text-sm font-medium text-foreground">
                  {t(`roadmap.${key}.title`)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t(`roadmap.${key}.description`)}
                </p>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/developers">
              <Code2 data-icon="inline-start" />
              {t("developersCta")}
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/how-it-works">{t("howItWorksCta")}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
