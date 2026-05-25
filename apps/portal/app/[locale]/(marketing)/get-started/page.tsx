import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Section, SectionHeading } from "@/components/cryptopay/marketing-section";

export const metadata: Metadata = {
  title: "Get Started",
  description: "Start accepting crypto payments with a simple rollout plan.",
};

const checklist = [
  "Create your account and verify your business details",
  "Connect your payout wallet",
  "Generate your first payment link",
  "Test the flow with a small transaction",
  "Go live and monitor confirmations in dashboard",
];

export default function GetStartedPage() {
  return (
    <>
      <Section belowHeader>
        <SectionHeading
          eyebrow="Get Started"
          title="Launch your crypto checkout in one short sprint"
          description="Follow this rollout path to move from setup to first live payment quickly."
        />
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8">
          <ol className="space-y-4">
            {checklist.map((item, idx) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 rounded-full bg-emerald-50 p-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Step {idx + 1}</p>
                  <p className="text-sm text-slate-700">{item}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Create your account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Talk to onboarding
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
