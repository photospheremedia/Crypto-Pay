import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { getFAQJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "FAQ | Crypto Pay",
  description: "Frequently asked questions about Crypto Pay. Learn about delivery integration, pricing, setup time, and more.",
  keywords: [
    "restaurant hub faq",
    "delivery integration questions",
    "setup time",
    "pricing questions",
  ],
  openGraph: {
    title: "Crypto Pay - Frequently Asked Questions",
    description: "Answers to common questions about our delivery integration, supply marketplace, and brand refresh services.",
    url: "https://cryptopay.sale/faq",
    type: "website",
  },
};

const faqs = [
  {
    category: "Getting Started",
    question: "What is Crypto Pay?",
    answer:
      "Crypto Pay is an all-in-one partner for restaurant groups. We consolidate your delivery platforms into one tablet, refresh your menu and branding, and provide curated supplies at reseller pricing — all managed through a single portal.",
  },
  {
    category: "Getting Started",
    question: "How fast can we go live?",
    answer:
      "Most locations can be onboarded in 2–3 weeks depending on delivery provider approvals and menu readiness. We handle all the technical integration and staff training during this time.",
  },
  {
    category: "Delivery Integration",
    question: "Which delivery platforms do you support?",
    answer:
      "We integrate with all major platforms including DoorDash, UberEats, Grubhub, Postmates, and regional providers. All orders flow into a single tablet with unified kitchen ticketing.",
  },
  {
    category: "Delivery Integration",
    question: "Do you build POS systems?",
    answer:
      "No. We are an integrator and reseller, not a POS provider. We unify delivery tablets, configure POS routing to your existing system, and manage kitchen display workflows.",
  },
  {
    category: "Delivery Integration",
    question: "Can you handle menu updates across platforms?",
    answer:
      "Yes. We sync menu changes, pricing, and availability across all connected delivery platforms from one dashboard. No more logging into 5 different tablets to update a price.",
  },
  {
    category: "Multi-Location",
    question: "Can you manage multiple locations?",
    answer:
      "Absolutely. We support multi-location rollouts with consolidated delivery dashboards, location-specific supply ordering, and centralized reporting for ownership and GMs.",
  },
  {
    category: "Multi-Location",
    question: "Do you offer enterprise pricing?",
    answer:
      "Yes. Restaurant groups with 5+ locations qualify for volume discounts on both services and supply orders. Contact us for a custom quote.",
  },
  {
    category: "Supplies",
    question: "How does supply ordering work?",
    answer:
      "Browse our curated catalog, add items to your cart, and submit for a quote. We confirm pricing within 24 hours and coordinate fulfillment with our supplier network. You can track orders and set up recurring restocks from your portal.",
  },
  {
    category: "Supplies",
    question: "Do you handle fulfillment for supplies?",
    answer:
      "We manage the quote, ordering, and tracking flow. Fulfillment is coordinated with our trusted suppliers and shipped directly to your locations. Most orders arrive within 3-5 business days.",
  },
  {
    category: "Supplies",
    question: "Can I set up automatic reorders?",
    answer:
      "Yes. Once you establish your baseline usage, we can configure recurring supply orders on a weekly, bi-weekly, or monthly cadence — adjusted seasonally as needed.",
  },
  {
    category: "Pricing & Billing",
    question: "How is pricing structured?",
    answer:
      "We offer flexible plans based on your location count and service needs. Delivery integration starts at $199/month per location. Supply orders are quoted separately with reseller pricing built in.",
  },
  {
    category: "Pricing & Billing",
    question: "Are there any long-term contracts?",
    answer:
      "No. We offer month-to-month agreements with no long-term commitments. We believe our value should keep you, not a contract.",
  },
  {
    category: "Support",
    question: "What kind of support do you provide?",
    answer:
      "Every account gets a dedicated success lead, access to our support desk during business hours, and emergency escalation for critical delivery issues. Enterprise accounts receive 24/7 priority support.",
  },
  {
    category: "Support",
    question: "Do you provide staff training?",
    answer:
      "Yes. Our onboarding includes staff training sessions covering delivery workflows, tablet operation, and supply ordering. We also provide recorded training materials and SOPs for new hires.",
  },
];

// Group FAQs by category
const categories = [
  "Getting Started",
  "Delivery Integration",
  "Multi-Location",
  "Supplies",
  "Pricing & Billing",
  "Support",
];

export default function FaqPage() {
  // JSON-LD FAQ structured data for rich search results
  const faqJsonLd = getFAQJsonLd(
    faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    }))
  );

  return (
    <section className="mx-auto w-full max-w-5xl px-6 pt-24 pb-16 lg:pt-28">
      {/* JSON-LD for FAQ rich snippets */}
      <JsonLd data={faqJsonLd} />
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-600">
          FAQ
        </p>
        <h1 className="font-display mt-3 text-4xl font-semibold text-slate-900">
          Answers for operators and owners.
        </h1>
        <p className="mt-4 text-sm text-slate-600">
          If you have a unique workflow, reach out and we&apos;ll design a plan
          for you.
        </p>
      </div>

      {/* Category navigation */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <a
            key={cat}
            href={`#${cat.toLowerCase().replace(/\s+/g, "-")}`}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
          >
            {cat}
          </a>
        ))}
      </div>

      {/* Grouped FAQs */}
      <div className="mt-12 space-y-12">
        {categories.map((category) => {
          const categoryFaqs = faqs.filter((faq) => faq.category === category);
          if (categoryFaqs.length === 0) return null;
          return (
            <div
              key={category}
              id={category.toLowerCase().replace(/\s+/g, "-")}
            >
              <h2 className="mb-6 border-b border-slate-200 pb-3 text-2xl font-semibold text-slate-900">
                {category}
              </h2>
              <div className="space-y-4">
                {categoryFaqs.map((item) => (
                  <div
                    key={item.question}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                  >
                    <h3 className="text-lg font-semibold text-slate-900">
                      {item.question}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA section */}
      <div className="mt-16 rounded-3xl bg-linear-to-r from-orange-500 to-orange-600 p-8 text-center text-white">
        <h3 className="text-2xl font-semibold">Still have questions?</h3>
        <p className="mt-2 text-orange-100">
          Our team is ready to help you get started.
        </p>
        <a
          href="/contact"
          className="mt-6 inline-block rounded-full bg-white px-8 py-3 font-semibold text-orange-600 transition hover:bg-orange-50"
        >
          Contact Us
        </a>
      </div>
    </section>
  );
}
