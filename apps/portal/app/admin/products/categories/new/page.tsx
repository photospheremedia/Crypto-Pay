"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Category = {
  id: string;
  name: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewProductCategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadCategories() {
      const res = await fetch("/api/admin/products/categories");
      const data = await res.json();
      setCategories(data.categories ?? []);
    }
    loadCategories();
  }, []);

  const computedSlug = useMemo(() => (slug.trim() ? slug : slugify(name)), [name, slug]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      slug: computedSlug,
      description: formData.get("description"),
      parent_id: formData.get("parent_id") || null,
      display_order: Number(formData.get("display_order")) || 0,
    };

    try {
      const response = await fetch("/api/admin/products/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to create category");
      setSuccess("Category created successfully.");
      setName("");
      setSlug("");
      (event.currentTarget as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <Link
          href="/admin/products/categories"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to categories
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Create Product Category</h1>
        <p className="text-sm text-slate-500">Organize products into structured, reusable groups.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={computedSlug || "auto-generated-from-name"}
          />
          <p className="text-xs text-slate-500">Will save as: {computedSlug || "-"}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="Optional category details" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="parent_id">Parent category</Label>
            <select id="parent_id" name="parent_id" className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
              <option value="">None (top level)</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="display_order">Display order</Label>
            <Input id="display_order" name="display_order" type="number" min="0" defaultValue="0" />
          </div>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
        <Button type="submit" disabled={saving} className="w-full">
          <FolderPlus className="mr-2 h-4 w-4" />
          {saving ? "Creating category..." : "Create category"}
        </Button>
      </form>
    </div>
  );
}
