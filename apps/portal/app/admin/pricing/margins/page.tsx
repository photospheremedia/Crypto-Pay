"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Percent,
  DollarSign,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Plus,
  Upload,
  Download,
  RefreshCw,
} from "lucide-react";

// Product and pricing data from database
interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit_cost: number;
  retail_price: number;
}

interface PricingRule {
  id: string;
  name: string;
  rule_type: string;
  adjustment_type: string;
  adjustment_value: number;
  active: boolean;
}

export default function MarginsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [globalMargin, setGlobalMargin] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(["All Categories"]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [productsRes, rulesRes] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/admin/pricing/rules')
        ]);
        
        if (productsRes.ok) {
          const data = await productsRes.json();
          const productsData = data.products || [];
          setProducts(productsData);
          
          // Extract unique categories
          const uniqueCategories = Array.from(new Set(productsData.map((p: Product) => p.category).filter(Boolean))) as string[];
          setCategories(['All Categories', ...uniqueCategories.sort()]);
        }
        
        if (rulesRes.ok) {
          const data = await rulesRes.json();
          setRules(data.rules || []);
        }
      } catch (error) {
        console.error('Failed to fetch pricing data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" ||
      product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate margin for display
  const calculateMargin = (costPrice: number, sellingPrice: number) => {
    if (sellingPrice === 0) return "0";
    return (((sellingPrice - costPrice) / sellingPrice) * 100).toFixed(1);
  };

  const handleMarginChange = (productId: string, newMargin: number) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          const newSellingPrice =
            product.unit_cost / (1 - newMargin / 100);
          return {
            ...product,
            retail_price: Math.round(newSellingPrice * 100) / 100,
          };
        }
        return product;
      })
    );
  };

  const handlePriceChange = (productId: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            retail_price: newPrice,
          };
        }
        return product;
      })
    );
  };

  const applyGlobalMargin = () => {
    const margin = parseFloat(globalMargin);
    if (isNaN(margin) || margin < 0 || margin > 100) return;

    const productsToUpdate =
      selectedProducts.length > 0
        ? selectedProducts
        : products.map((p) => p.id);

    setProducts((prev) =>
      prev.map((product) => {
        if (productsToUpdate.includes(product.id)) {
          const newSellingPrice =
            product.unit_cost / (1 - margin / 100);
          return {
            ...product,
            retail_price: Math.round(newSellingPrice * 100) / 100,
          };
        }
        return product;
      })
    );

    setGlobalMargin("");
    setSelectedProducts([]);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-orange-500" />
          <p className="mt-2 text-sm text-slate-500">Loading pricing data...</p>
        </div>
      </div>
    );
  }

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/pricing"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Profit Margins</h1>
            <p className="text-sm text-slate-500">
              Set pricing and margins for your products
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Upload className="h-4 w-4" />
            Import
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600">
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-slate-900">
          Bulk Margin Update
        </h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Set margin percentage
            </label>
            <div className="relative">
              <input
                type="number"
                value={globalMargin}
                onChange={(e) => setGlobalMargin(e.target.value)}
                placeholder="e.g., 40"
                min="0"
                max="100"
                className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Apply to
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2 px-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              aria-label="Select product category"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={applyGlobalMargin}
            className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Apply to{" "}
            {selectedProducts.length > 0
              ? `${selectedProducts.length} selected`
              : "all products"}
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        {/* Table Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-slate-200 py-2 px-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              aria-label="Filter by category"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-sm text-slate-500">
                <th className="px-4 py-3 font-medium">
                  <input
                    type="checkbox"
                    checked={
                      selectedProducts.length === filteredProducts.length &&
                      filteredProducts.length > 0
                    }
                    onChange={toggleSelectAll}                    aria-label="Select all products"                    className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                  />
                </th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-right">Cost Price</th>
                <th className="px-4 py-3 font-medium text-right">
                  Selling Price
                </th>
                <th className="px-4 py-3 font-medium text-right">Margin</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className={`${
                    selectedProducts.includes(product.id)
                      ? "bg-orange-50/50"
                      : "hover:bg-slate-50/50"
                  }`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleSelectProduct(product.id)}
                      aria-label={`Select ${product.name}`}
                      className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-900">{product.name}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-500">{product.sku}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-medium text-slate-500">
                    ${(product.unit_cost || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {editingProduct === product.id ? (
                      <input
                        type="number"
                        defaultValue={product.retail_price}
                        onBlur={(e) => {
                          handlePriceChange(
                            product.id,
                            parseFloat(e.target.value) || (product.retail_price || 0)
                          );
                          setEditingProduct(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handlePriceChange(
                              product.id,
                              parseFloat((e.target as HTMLInputElement).value) ||
                                (product.retail_price || 0)
                            );
                            setEditingProduct(null);
                          }
                        }}
                        step="0.01"
                        className="w-24 rounded border border-orange-500 px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                        autoFocus
                        aria-label={`Edit price for ${product.name}`}
                      />
                    ) : (
                      <button
                        onClick={() => setEditingProduct(product.id)}
                        className="font-semibold text-slate-900 hover:text-orange-500"
                      >
                        ${(product.retail_price || 0).toFixed(2)}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {(() => {
                      const margin = product.retail_price > 0 
                        ? (((product.retail_price - product.unit_cost) / product.retail_price) * 100)
                        : 0;
                      return (
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            margin >= 50
                              ? "bg-orange-100 text-orange-600"
                              : margin >= 40
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {margin.toFixed(1)}%
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingProduct(product.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Edit product margins"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <p className="text-sm text-slate-500">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          <div className="flex gap-2">
            <button
              disabled
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-400"
            >
              Previous
            </button>
            <button
              disabled
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-400"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
