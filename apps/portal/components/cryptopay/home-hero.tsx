"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { CRYPTO_OPTIONS } from "@/lib/cryptopay/constants";
import { CtaButton } from "./cta-button";

export function HomeHero() {
  const t = useTranslations("HomePage");
  const tCommon = useTranslations("Common");

  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-medium text-emerald-600">{tCommon("tagline")}</p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
        {t("heroTitle")}
      </h1>
      <p className="mt-6 text-xl font-medium text-slate-700 dark:text-slate-300">
        {t("heroSubtitle")}
      </p>
      <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
        {t("heroBody")}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <CtaButton href="/signup">{tCommon("getStartedFree")}</CtaButton>
        <CtaButton href="/contact" variant="outline">
          {tCommon("talkToSales")}
        </CtaButton>
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {tCommon("supportedAssets")}
        </span>
        {CRYPTO_OPTIONS.map((c) => (
          <Badge key={c.id} variant="outline" className="font-mono">
            {c.symbol}
          </Badge>
        ))}
      </div>
    </div>
  );
}
