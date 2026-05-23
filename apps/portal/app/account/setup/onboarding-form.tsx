"use client";

import { useActionState, useMemo, useState } from "react";
import { submitOnboardingLead, type OnboardingState } from "./actions";

const plans = [
  {
    id: "starter",
    name: "Starter",
    description: "Best for teams exploring crypto acceptance.",
    price: "Free",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing operators scaling crypto checkout.",
    price: "Growth",
  },
  {
    id: "business",
    name: "Business",
    description: "Advanced operations and onboarding support.",
    price: "Enterprise",
  },
] as const;

export function OnboardingForm({ defaultEmail }: { defaultEmail: string }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [state, formAction, pending] = useActionState<OnboardingState, FormData>(
    submitOnboardingLead,
    {},
  );

  const selectedPlanName = useMemo(
    () => plans.find((plan) => plan.id === selectedPlan)?.name ?? "",
    [selectedPlan],
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-600">Onboarding</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          Let&apos;s get your account ready.
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Two quick steps, then our team takes it from there.
        </p>

        <div className="mt-6 flex items-center gap-2">
          <div className={`h-2 flex-1 rounded-full ${step >= 1 ? "bg-orange-500" : "bg-slate-200"}`} />
          <div className={`h-2 flex-1 rounded-full ${step >= 2 ? "bg-orange-500" : "bg-slate-200"}`} />
        </div>

        {step === 1 ? (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900">Step 1: Choose a Plan</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {plans.map((plan) => {
                const selected = selectedPlan === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-orange-400 bg-orange-50 shadow-sm"
                        : "border-slate-200 hover:border-orange-300 hover:bg-orange-50/40"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">{plan.name}</p>
                    <p className="mt-1 text-xs font-medium text-orange-600">{plan.price}</p>
                    <p className="mt-2 text-xs text-slate-600">{plan.description}</p>
                    <span className="mt-3 inline-block rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700">
                      Select Plan
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!selectedPlan}
              className="mt-6 w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200/60 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        ) : (
          <form className="mt-8 space-y-4" action={formAction}>
            <h2 className="text-lg font-semibold text-slate-900">Step 2: Simple Contact Form</h2>
            <p className="text-sm text-slate-600">
              Selected plan: <span className="font-semibold text-slate-900">{selectedPlanName}</span>
            </p>
            <input type="hidden" name="selected_plan" value={selectedPlan} />

            <div>
              <label className="text-sm font-medium text-slate-700">Website URL</label>
              <input
                name="website_url"
                type="url"
                required
                placeholder="https://your-website.com"
                className="mt-1 w-full rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Email address</label>
              <input
                name="email"
                type="email"
                defaultValue={defaultEmail}
                required
                className="mt-1 w-full rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>

            {state.error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {state.error}
              </div>
            ) : null}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200/60 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? "Submitting..." : "Submit & Get Started"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
