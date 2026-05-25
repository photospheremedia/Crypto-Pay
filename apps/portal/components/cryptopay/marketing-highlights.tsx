"use client";

import { useTranslations } from "next-intl";
import { Shield, Wallet, Zap } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const icons = [Wallet, Shield, Zap] as const;

export function MarketingHighlights() {
  const t = useTranslations("HomePage.highlights");

  const items = [
    { key: "nonCustodial" as const, icon: icons[0] },
    { key: "privacyFriendly" as const, icon: icons[1] },
    { key: "quickSetup" as const, icon: icons[2] },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map(({ key, icon: Icon }) => (
        <Card
          key={key}
          className="border-slate-200/80 bg-white text-center dark:border-slate-800 dark:bg-slate-900"
        >
          <CardHeader className="items-center">
            <div className="mb-2 flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50">
              <Icon className="size-6" />
            </div>
            <CardTitle className="text-base">{t(`${key}.title`)}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {t(`${key}.description`)}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
