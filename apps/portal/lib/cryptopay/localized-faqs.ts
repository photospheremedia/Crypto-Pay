import type { FaqItem } from "@/components/marketing/faq-accordion";
import { PRICING } from "@/lib/cryptopay/constants";

export const FAQ_CATEGORY_IDS = [
  "gettingStarted",
  "payments",
  "security",
  "developers",
  "pricing",
  "support",
] as const;

export const FAQ_ITEM_DEFINITIONS = [
  { id: "whatIsCryptoPay", category: "gettingStarted" },
  { id: "howFastSetup", category: "gettingStarted" },
  { id: "whatDoINeed", category: "gettingStarted" },
  { id: "supportedCoins", category: "payments" },
  { id: "wherePaymentsGo", category: "payments" },
  { id: "paymentStatus", category: "payments" },
  { id: "kycRequirements", category: "security" },
  { id: "privateKeys", category: "security" },
  { id: "hasApi", category: "developers" },
  { id: "websiteIntegration", category: "developers" },
  { id: "fees", category: "pricing" },
  { id: "platformFees", category: "pricing" },
  { id: "supportIncluded", category: "support" },
] as const;

type FaqTranslator = {
  (key: string): string;
  (key: string, values: Record<string, string | number>): string;
};

export function buildLocalizedFaqs(t: FaqTranslator): {
  items: FaqItem[];
  categories: { id: string; label: string }[];
} {
  const categories = FAQ_CATEGORY_IDS.map((id) => ({
    id,
    label: t(`categories.${id}`),
  }));
  const items: FaqItem[] = FAQ_ITEM_DEFINITIONS.map(({ id, category }) => ({
    category: t(`categories.${category}`),
    question: t(`items.${id}.question`),
    answer:
      id === "fees"
        ? t(`items.${id}.answer`, { percent: PRICING.standard.baseFeePercent })
        : t(`items.${id}.answer`),
  }));

  return { items, categories };
}
