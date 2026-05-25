import type { FaqItem } from "@/components/marketing/faq-accordion";
import { PRICING } from "@/lib/cryptopay/constants";

export const CRYPTO_FAQS: FaqItem[] = [
  {
    category: "Getting Started",
    question: "What is Crypto Pay?",
    answer:
      "Crypto Pay helps you track and accept crypto payments. Payments go directly to your wallet — we are non-custodial and privacy oriented.",
  },
  {
    category: "Getting Started",
    question: "How fast can I set up?",
    answer:
      "Most merchants connect a wallet and create a first payment link in minutes. API integrations typically take a few hours depending on your stack.",
  },
  {
    category: "Getting Started",
    question: "What do I need to get started?",
    answer:
      "A wallet address you control and an account on Crypto Pay. For custom sites, you will also want a callback URL or webhook endpoint for payment status updates.",
  },
  {
    category: "Payments",
    question: "What coins do you support?",
    answer:
      "We support BTC, ETH, LTC, USDT, and USDC. Additional assets may be added over time.",
  },
  {
    category: "Payments",
    question: "Where do payments go?",
    answer:
      "Directly to your wallet. With Crypto Pay, funds are not held in a pooled merchant balance — settlement is wallet to wallet.",
  },
  {
    category: "Payments",
    question: "How do you track payment status?",
    answer:
      "We watch the blockchain for transactions that match your payment request. Status moves from unpaid → in process → paid, similar to standard crypto checkout flows.",
  },
  {
    category: "Security",
    question: "What are your KYC requirements?",
    answer:
      "Because we do not process or store payments, KYC is limited and based on risk assessment — not on holding your funds.",
  },
  {
    category: "Security",
    question: "Do you need my private keys?",
    answer:
      "No. You only provide a public wallet address. Crypto Pay never asks for private keys.",
  },
  {
    category: "Developers",
    question: "Is there an API?",
    answer:
      "Yes. One unified API for creating charges, checking status, and receiving webhook callbacks when payments confirm.",
  },
  {
    category: "Developers",
    question: "How do I integrate on my website?",
    answer:
      "Use payment links for no-code flows, or the REST API and webhooks for custom checkout. See the Developers page for a quick start.",
  },
  {
    category: "Pricing",
    question: "How do fees work?",
    answer: `Standard pricing is a ${PRICING.standard.baseFeePercent}% base fee per successful transaction, billed monthly — not deducted at checkout. Contact us for Business Scale volume pricing.`,
  },
  {
    category: "Pricing",
    question: "Are there setup or monthly platform fees?",
    answer:
      "No hidden platform charges on the standard plan. You pay when you successfully receive a payment, per our published pricing.",
  },
  {
    category: "Support",
    question: "What support is included?",
    answer:
      "Email onboarding support on Standard. Business Scale includes priority support and optional SLA coverage.",
  },
];

export const FAQ_CATEGORIES = [
  "Getting Started",
  "Payments",
  "Security",
  "Developers",
  "Pricing",
  "Support",
] as const;
