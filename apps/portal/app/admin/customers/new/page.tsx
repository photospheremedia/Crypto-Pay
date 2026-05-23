"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ChevronLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewCustomerPage() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      company: formData.get("company"),
      business_type: formData.get("business_type"),
      address: {
        line1: formData.get("line1"),
        line2: formData.get("line2"),
        city: formData.get("city"),
        state: formData.get("state"),
        postal_code: formData.get("postal_code"),
        country: formData.get("country"),
      },
    };

    try {
      const response = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to create customer");
      setSuccess("Customer created successfully.");
      (event.currentTarget as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create customer");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to customers
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Add Customer</h1>
        <p className="text-sm text-slate-500">Create a new customer profile in your CRM.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business_type">Business type</Label>
            <Input id="business_type" name="business_type" placeholder="Restaurant, Cafe, Retail..." />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="line1">Address line 1</Label>
            <Input id="line1" name="line1" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="line2">Address line 2</Label>
            <Input id="line2" name="line2" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State / Region</Label>
            <Input id="state" name="state" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postal_code">Postal code</Label>
            <Input id="postal_code" name="postal_code" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" />
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
        <Button type="submit" disabled={saving} className="w-full">
          <UserPlus className="mr-2 h-4 w-4" />
          {saving ? "Creating customer..." : "Create customer"}
        </Button>
      </form>
    </div>
  );
}
