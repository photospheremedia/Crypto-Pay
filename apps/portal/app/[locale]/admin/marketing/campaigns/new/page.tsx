"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewCampaignPage() {
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
      subject: formData.get("subject"),
      from_email: formData.get("from_email"),
      from_name: formData.get("from_name") || "Crypto Pay",
      scheduled_for: formData.get("scheduled_for") || null,
    };

    try {
      const response = await fetch("/api/admin/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to create campaign");
      setSuccess(`Campaign "${data.campaign?.name ?? payload.name}" created.`);
      (event.currentTarget as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create campaign");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <Link
          href="/admin/marketing"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to marketing
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">New Campaign</h1>
        <p className="text-sm text-slate-500">Create a one-time campaign to send to your audience.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Campaign name</Label>
          <Input id="name" name="name" required placeholder="June product launch" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Subject line</Label>
          <Input id="subject" name="subject" required placeholder="New crypto payment features are live" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="from_name">From name</Label>
            <Input id="from_name" name="from_name" defaultValue="Crypto Pay" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="from_email">From email</Label>
            <Input id="from_email" name="from_email" type="email" required placeholder="marketing@company.com" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduled_for">Schedule (optional)</Label>
          <Input id="scheduled_for" name="scheduled_for" type="datetime-local" />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
        <Button type="submit" disabled={saving} className="w-full">
          <Send className="mr-2 h-4 w-4" />
          {saving ? "Creating campaign..." : "Create campaign"}
        </Button>
      </form>
    </div>
  );
}
