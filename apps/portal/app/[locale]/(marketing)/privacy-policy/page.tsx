import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalDocument } from "@/components/marketing/legal-document";
import { LegalPageShell } from "@/components/marketing/legal-page-shell";
import { PRIVACY_POLICY_SECTIONS } from "@/lib/legal/privacy-policy";
import { LEGAL_LAST_UPDATED } from "@/lib/legal/types";
import { createPageMetadata } from "@/lib/site-metadata";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Legal.privacy" });

  return createPageMetadata({
    locale,
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/privacy-policy",
    openGraphTitle: t("openGraphTitle"),
    openGraphDescription: t("openGraphDescription"),
  });
}

export default async function PrivacyPolicyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Legal.privacy" });

  return (
    <LegalPageShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      lastUpdatedLabel={t("lastUpdated", { date: LEGAL_LAST_UPDATED })}
      footerNote={t("footerNote")}
    >
      <LegalDocument sections={PRIVACY_POLICY_SECTIONS} />
    </LegalPageShell>
  );
}
