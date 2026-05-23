"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Plan = {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  billing_interval: string;
  currency: string;
  is_active: boolean;
  trial_days: number | null;
  features: string[] | null;
};

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadPlans() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/subscriptions?type=plans");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load plans");
      setPlans(data.plans ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plans");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlans();
  }, []);

  async function handleCreatePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const formData = new FormData(event.currentTarget);
    const features = (formData.get("features")?.toString() ?? "")
      .split("\n")
      .map((feature) => feature.trim())
      .filter(Boolean);

    const payload = {
      name: formData.get("name"),
      description: formData.get("description"),
      amount: Number(formData.get("amount")),
      billing_interval: formData.get("billing_interval"),
      currency: formData.get("currency") || "usd",
      trial_days: Number(formData.get("trial_days")) || null,
      features,
    };

    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create plan");
      setSuccess(`Plan "${data.plan?.name ?? payload.name}" created.`);
      (event.currentTarget as HTMLFormElement).reset();
      await loadPlans();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create plan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href="/admin/subscriptions"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to subscriptions
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Subscription Plans</h1>
        <p className="text-sm text-slate-500">Create and review plans used by customer subscriptions.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleCreatePlan} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Create New Plan</h2>
          <div className="space-y-2">
            <Label htmlFor="name">Plan name</Label>
            <Input id="name" name="name" required placeholder="Professional" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="Who this plan is best for" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" min="0" step="1" required placeholder="49" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" name="currency" defaultValue="usd" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="billing_interval">Billing interval</Label>
              <select
                id="billing_interval"
                name="billing_interval"
                required
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                defaultValue="monthly"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="trial_days">Trial days (optional)</Label>
              <Input id="trial_days" name="trial_days" type="number" min="0" placeholder="14" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea id="features" name="features" placeholder={"Unlimited products\nPriority support"} />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
          <Button type="submit" disabled={saving} className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            {saving ? "Creating..." : "Create plan"}
          </Button>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Current Plans</h2>
          </div>
          {loading ? (
            <p className="px-6 py-8 text-sm text-slate-500">Loading plans...</p>
          ) : plans.length === 0 ? (
            <p className="px-6 py-8 text-sm text-slate-500">No plans found yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {plans.map((plan) => (
                <div key={plan.id} className="space-y-2 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">{plan.name}</p>
                    <span className={`text-xs ${plan.is_active ? "text-emerald-600" : "text-slate-400"}`}>
                      {plan.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{plan.description ?? "No description"}</p>
                  <p className="text-sm font-medium text-orange-500">
                    {plan.amount} {plan.currency.toUpperCase()} / {plan.billing_interval}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
