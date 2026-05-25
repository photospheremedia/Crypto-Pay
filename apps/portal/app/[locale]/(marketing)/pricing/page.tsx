import type { Metadata } from "next";
import Link from "next/link";
import { Check, Receipt, Building2 } from "lucide-react";
import { Section, SectionHeading } from "@/components/cryptopay/marketing-section";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PRICING } from "@/lib/cryptopay/constants";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Pricing | Crypto Pay",
  description: "Straightforward pricing for businesses accepting crypto payments.",
  path: "/pricing",
  openGraphTitle: "Simple, Transparent Pricing",
  openGraphDescription:
    "Straightforward pricing for businesses accepting crypto payments. Direct wallet settlement included.",
});

const planCards = [
  {
    name: PRICING.standard.planName,
    icon: Receipt,
    price: `${PRICING.standard.baseFeePercent}%`,
    subtitle: "base fee per successful transaction",
    note: "No hidden platform charges",
    cta: "Get started",
    href: "/signup",
    highlight: true,
    features: [
      "Direct wallet settlement",
      "Crypto checkout links and invoices",
      "Real-time status tracking",
      "Core reporting and exports",
      "Email onboarding support",
    ],
  },
  {
    name: "Business Scale",
    icon: Building2,
    price: "Custom",
    subtitle: "volume-based pricing",
    note: "For multi-location operations",
    cta: "Talk to sales",
    href: "/contact",
    highlight: false,
    features: [
      "Everything in Standard",
      "Custom settlement and reporting",
      "Priority support and SLA options",
      "Dedicated integration support",
      "Enterprise security review",
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      <Section belowHeader>
        <SectionHeading
          eyebrow="Pricing"
          title="Simple pricing for serious teams"
          description="Start quickly with transparent transaction pricing, then move to custom commercial terms as your volume scales."
        />
        <div className="grid gap-6 md:grid-cols-2">
          {planCards.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={
                  plan.highlight
                    ? "border-emerald-300 bg-emerald-50/60 shadow-lg shadow-emerald-100/60 dark:border-emerald-800 dark:bg-emerald-950/20"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                }
              >
                <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-slate-800">
                  <Icon className="size-5 text-emerald-600" />
                </div>
                <CardTitle>{plan.name}</CardTitle>
              </div>
                  <CardDescription className="pt-2">
                    <span className="block text-4xl font-bold text-slate-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="mt-1 block text-sm">{plan.subtitle}</span>
                    <span className="mt-1 block text-xs uppercase tracking-wide">{plan.note}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Separator className="mb-6" />
                  <ul className="flex flex-col gap-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className={
                      plan.highlight
                        ? "w-full rounded-full bg-linear-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500"
                        : "w-full rounded-full"
                    }
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section>
        <Card className="mx-auto max-w-xl border-slate-200/80 text-center dark:border-slate-800">
          <CardHeader>
            <CardTitle>Multi-location setup?</CardTitle>
            <CardDescription>
              Contact us for volume pricing and rollout planning.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap justify-center gap-3 pb-8">
            <Button asChild className="rounded-full">
              <Link href="/contact">Contact sales</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/signup">Create account</Link>
            </Button>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
