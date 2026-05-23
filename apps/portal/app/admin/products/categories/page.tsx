"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreVertical,
  FolderOpen,
  ChevronRight,
  Image as ImageIcon,
  Package,
  ArrowUpDown,
  GripVertical,
  RefreshCw,
} from "lucide-react";

// Mock categories - would come from Supabase
const categories = [
  {
    id: "1",
    name: "Packaging & Takeout",
    slug: "packaging-takeout",
    description: "Containers, bags, and boxes for food delivery",
    image: "https://images.unsplash.com/photo-1604756930505-1b1a0c1ed4a3?w=100&h=100&fit=crop&q=80",
    productCount: 456,
    subcategories: [
      { id: "1a", name: "Takeout Containers", productCount: 145 },
      { id: "1b", name: "Paper Bags", productCount: 89 },
      { id: "1c", name: "Pizza Boxes", productCount: 67 },
      { id: "1d", name: "Foam Containers", productCount: 45 },
    ],
    status: "active",
  },
  {
    id: "2",
    name: "Cutlery & Utensils",
    slug: "cutlery-utensils",
    description: "Forks, knives, spoons, and chopsticks",
    image: "https://images.unsplash.com/photo-1595436932898-5d3b6a3c0a3e?w=100&h=100&fit=crop&q=80",
    productCount: 234,
    subcategories: [
      { id: "2a", name: "Plastic Cutlery", productCount: 89 },
      { id: "2b", name: "Wooden Utensils", productCount: 56 },
      { id: "2c", name: "Chopsticks", productCount: 34 },
    ],
    status: "active",
  },
  {
    id: "3",
    name: "Beverages & Cups",
    slug: "beverages-cups",
    description: "Hot and cold drink containers",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=100&h=100&fit=crop&q=80",
    productCount: 189,
    subcategories: [
      { id: "3a", name: "Hot Cups", productCount: 78 },
      { id: "3b", name: "Cold Cups", productCount: 67 },
      { id: "3c", name: "Cup Lids", productCount: 44 },
    ],
    status: "active",
  },
  {
    id: "4",
    name: "Labels & Packaging",
    slug: "labels-packaging",
    description: "Food labels, stickers, and tags",
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=100&h=100&fit=crop&q=80",
    productCount: 312,
    subcategories: [
      { id: "4a", name: "Food Labels", productCount: 156 },
      { id: "4b", name: "Stickers", productCount: 89 },
      { id: "4c", name: "Tamper Evident", productCount: 67 },
    ],
    status: "active",
  },
  {
    id: "5",
    name: "Kitchen Equipment",
    slug: "kitchen-equipment",
    description: "Commercial kitchen tools and machines",
    image: "https://images.unsplash.com/photo-1588644525273-f37b60d78512?w=100&h=100&fit=crop&q=80",
    productCount: 567,
    subcategories: [
      { id: "5a", name: "Prep Tables", productCount: 78 },
      { id: "5b", name: "Ovens", productCount: 56 },
      { id: "5c", name: "Fryers", productCount: 45 },
      { id: "5d", name: "Grills", productCount: 67 },
    ],
    status: "active",
  },
  {
    id: "6",
    name: "Cleaning & Safety",
    slug: "cleaning-safety",
    description: "Sanitizers, chemicals, and safety equipment",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=100&h=100&fit=crop&q=80",
    productCount: 198,
    subcategories: [
      { id: "6a", name: "Sanitizers", productCount: 67 },
      { id: "6b", name: "Cleaning Chemicals", productCount: 78 },
      { id: "6c", name: "Gloves", productCount: 53 },
    ],
    status: "active",
  },
];

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/products/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500">
            Organize your products into categories and subcategories
          </p>
        </div>
        <Link
          href="/admin/products/categories/new"
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Total Categories</p>
          <p className="text-2xl font-bold text-slate-900">{categories.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Subcategories</p>
          <p className="text-2xl font-bold text-slate-900">
            {categories.reduce((acc, cat) => acc + cat.subcategories.length, 0)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Total Products</p>
          <p className="text-2xl font-bold text-slate-900">
            {categories.reduce((acc, cat) => acc + cat.productCount, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Categories List */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        {/* Search */}
        <div className="border-b border-slate-100 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="divide-y divide-slate-100">
          {filteredCategories.map((category) => (
            <div key={category.id}>
              {/* Main Category */}
              <div className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50">
                <button className="cursor-grab text-slate-400 hover:text-slate-600">
                  <GripVertical className="h-5 w-5" />
                </button>
                <button
                  onClick={() => toggleExpand(category.id)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <ChevronRight
                    className={`h-5 w-5 transition-transform ${
                      expandedCategories.includes(category.id) ? "rotate-90" : ""
                    }`}
                  />
                </button>
                <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-100">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{category.name}</h3>
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                      {category.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{category.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">
                    {category.productCount} products
                  </p>
                  <p className="text-sm text-slate-500">
                    {category.subcategories.length} subcategories
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/products/categories/${category.id}/edit`}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Link>
                  <button className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Subcategories */}
              {expandedCategories.includes(category.id) && (
                <div className="border-t border-slate-100 bg-slate-50/50">
                  {category.subcategories.map((sub: any) => (
                    <div
                      key={sub.id}
                      className="flex items-center gap-4 py-3 pl-24 pr-6 hover:bg-slate-100/50"
                    >
                      <FolderOpen className="h-4 w-4 text-slate-400" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-700">{sub.name}</p>
                      </div>
                      <p className="text-sm text-slate-500">
                        {sub.productCount} products
                      </p>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/categories/${category.id}/sub/${sub.id}/edit`}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Link>
                        <button className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-red-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <Link
                    href={`/admin/products/categories/${category.id}/sub/new`}
                    className="flex items-center gap-2 py-3 pl-24 pr-6 text-sm font-medium text-orange-500 hover:text-orange-600"
                  >
                    <Plus className="h-4 w-4" />
                    Add subcategory
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
