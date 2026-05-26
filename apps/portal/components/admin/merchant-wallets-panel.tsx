"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MerchantWalletsAccordion } from "@/components/admin/merchant-wallets-accordion";

export function MerchantWalletsPanel({
  merchantUserId,
  merchantEmail,
}: {
  merchantUserId: string;
  merchantEmail: string;
}) {
  const t = useTranslations("Admin.merchants");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("walletsSectionTitle")}</CardTitle>
        <CardDescription>{t("walletsSectionDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <MerchantWalletsAccordion
          merchantUserId={merchantUserId}
          merchantEmail={merchantEmail}
        />
      </CardContent>
    </Card>
  );
}
