"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewAutomationPage() {
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
      description: formData.get("description"),
      trigger_type: formData.get("trigger_type"),
      subject: formData.get("subject"),
      from_email: formData.get("from_email"),
      from_name: formData.get("from_name") || "Crypto Pay",
      delay_minutes: Number(formData.get("delay_minutes")) || 0,
      content_html: formData.get("content_html"),
      is_active: true,
    };

    try {
      const response = await fetch("/api/admin/marketing/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to create automation");
      setSuccess(`Automation "${data.automation?.name ?? payload.name}" created.`);
      (event.currentTarget as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create automation");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <Link
          href="/admin/marketing"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to marketing
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">New Automation</h1>
        <p className="text-sm text-slate-500">Set up automated lifecycle emails from common trigger events.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Automation name</Label>
          <Input id="name" name="name" required placeholder="Welcome sequence" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" placeholder="Sent after user signs up" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="trigger_type">Trigger</Label>
            <select id="trigger_type" name="trigger_type" className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" defaultValue="signup">
              <option value="signup">User Signup</option>
              <option value="order_created">Order Created</option>
              <option value="cart_abandoned">Cart Abandoned</option>
              <option value="trial_expiring">Trial Expiring</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="delay_minutes">Delay (minutes)</Label>
            <Input id="delay_minutes" name="delay_minutes" type="number" min="0" defaultValue="0" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="from_name">From name</Label>
            <Input id="from_name" name="from_name" defaultValue="Crypto Pay" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="from_email">From email</Label>
            <Input id="from_email" name="from_email" type="email" required placeholder="support@company.com" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Email subject</Label>
          <Input id="subject" name="subject" required placeholder="Welcome to Crypto Pay" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content_html">Email content</Label>
          <Textarea
            id="content_html"
            name="content_html"
            required
            rows={8}
            placeholder="<p>Hi there, thanks for joining...</p>"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
        <Button type="submit" disabled={saving} className="w-full">
          <Zap className="mr-2 h-4 w-4" />
          {saving ? "Creating automation..." : "Create automation"}
        </Button>
      </form>
    </div>
  );
}
