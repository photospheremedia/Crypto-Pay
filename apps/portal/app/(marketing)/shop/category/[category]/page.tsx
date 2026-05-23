"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { 
  ChevronRight, 
  ChevronDown,
  Grid3X3, 
  List, 
  SlidersHorizontal,
  Star,
  X,
  Box,
  UtensilsCrossed,
  Coffee,
  Tag,
  Shield,
  ShoppingBag,
  ChefHat,
  Armchair,
  Truck,
  Percent,
  Clock,
  BadgeCheck,
  Loader2,
  Filter
} from "lucide-react";
import { ProductCard, Product } from "../../components/product-card";

// Category definitions with metadata
const categoryData: Record<string, {
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  heroImage: string;
  subcategories: { name: string; slug: string; count: number }[];
}> = {
  "packaging-takeout": {
    name: "Packaging & Takeout",
    description: "Premium takeout containers, bags, and packaging supplies for delivery and carryout operations.",
    icon: Box,
    color: "amber",
    gradient: "from-amber-600 to-orange-700",
    heroImage: "https://images.unsplash.com/photo-1604908177453-7462950a6a3b?w=1600&h=500&fit=crop&q=80",
    subcategories: [
      { name: "Takeout Containers", slug: "takeout-containers", count: 245 },
      { name: "Paper Bags", slug: "paper-bags", count: 128 },
      { name: "Plastic Bags", slug: "plastic-bags", count: 89 },
      { name: "Food Boxes", slug: "food-boxes", count: 167 },
      { name: "Cup Carriers", slug: "cup-carriers", count: 45 },
      { name: "Pizza Boxes", slug: "pizza-boxes", count: 78 },
      { name: "Deli Containers", slug: "deli-containers", count: 112 },
      { name: "Foam Containers", slug: "foam-containers", count: 65 },
    ]
  },
  "cutlery-utensils": {
    name: "Cutlery & Utensils",
    description: "Disposable and reusable cutlery, serving utensils, and tableware for every service style.",
    icon: UtensilsCrossed,
    color: "slate",
    gradient: "from-slate-600 to-zinc-700",
    heroImage: "https://images.unsplash.com/photo-1595436932898-5d3b6a3c0a3e?w=1600&h=500&fit=crop&q=80",
    subcategories: [
      { name: "Plastic Cutlery", slug: "plastic-cutlery", count: 156 },
      { name: "Wooden Utensils", slug: "wooden-utensils", count: 89 },
      { name: "Compostable Cutlery", slug: "compostable-cutlery", count: 67 },
      { name: "Chopsticks", slug: "chopsticks", count: 45 },
      { name: "Serving Utensils", slug: "serving-utensils", count: 134 },
      { name: "Stirrers & Straws", slug: "stirrers-straws", count: 98 },
    ]
  },
  "beverages-cups": {
    name: "Beverages & Cups",
    description: "Hot and cold cups, lids, sleeves, and beverage service supplies.",
    icon: Coffee,
    color: "cyan",
    gradient: "from-cyan-600 to-blue-700",
    heroImage: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=1600&h=500&fit=crop&q=80",
    subcategories: [
      { name: "Hot Cups", slug: "hot-cups", count: 189 },
      { name: "Cold Cups", slug: "cold-cups", count: 167 },
      { name: "Cup Lids", slug: "cup-lids", count: 145 },
      { name: "Cup Sleeves", slug: "cup-sleeves", count: 56 },
      { name: "Drink Dispensers", slug: "drink-dispensers", count: 34 },
      { name: "Beverage Napkins", slug: "beverage-napkins", count: 78 },
    ]
  },
  "labels-stickers": {
    name: "Labels & Stickers",
    description: "Food labels, date dots, tamper-evident seals, and custom stickers for compliance and branding.",
    icon: Tag,
    color: "violet",
    gradient: "from-violet-600 to-purple-700",
    heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=500&fit=crop&q=80",
    subcategories: [
      { name: "Food Labels", slug: "food-labels", count: 234 },
      { name: "Stickers", slug: "stickers", count: 156 },
      { name: "Tamper Evident", slug: "tamper-evident", count: 89 },
      { name: "Date Labels", slug: "date-labels", count: 67 },
      { name: "Price Tags", slug: "price-tags", count: 45 },
      { name: "Label Printers", slug: "label-printers", count: 23 },
    ]
  },
  "cleaning-safety": {
    name: "Cleaning & Safety",
    description: "Sanitizers, cleaning chemicals, gloves, and safety equipment for a compliant kitchen.",
    icon: Shield,
    color: "orange",
    gradient: "from-orange-500 to-teal-700",
    heroImage: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=1600&h=500&fit=crop&q=80",
    subcategories: [
      { name: "Sanitizers", slug: "sanitizers", count: 145 },
      { name: "Cleaning Chemicals", slug: "cleaning-chemicals", count: 178 },
      { name: "Brushes & Scrubbers", slug: "brushes-scrubbers", count: 89 },
      { name: "Gloves", slug: "gloves", count: 112 },
      { name: "Aprons", slug: "aprons", count: 67 },
      { name: "First Aid", slug: "first-aid", count: 45 },
    ]
  },
  "paper-products": {
    name: "Paper Products",
    description: "Napkins, paper towels, table covers, and disposable paper goods for every occasion.",
    icon: ShoppingBag,
    color: "yellow",
    gradient: "from-yellow-500 to-amber-600",
    heroImage: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&h=500&fit=crop&q=80",
    subcategories: [
      { name: "Napkins", slug: "napkins", count: 234 },
      { name: "Paper Towels", slug: "paper-towels", count: 156 },
      { name: "Toilet Paper", slug: "toilet-paper", count: 89 },
      { name: "Table Covers", slug: "table-covers", count: 67 },
      { name: "Placemats", slug: "placemats", count: 78 },
      { name: "Guest Checks", slug: "guest-checks", count: 45 },
    ]
  },
  "kitchen-equipment": {
    name: "Kitchen Equipment",
    description: "Commercial kitchen equipment from prep tables to ovens, fryers, and more.",
    icon: ChefHat,
    color: "rose",
    gradient: "from-rose-600 to-red-700",
    heroImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&h=500&fit=crop&q=80",
    subcategories: [
      { name: "Prep Tables", slug: "prep-tables", count: 89 },
      { name: "Food Processors", slug: "food-processors", count: 67 },
      { name: "Mixers", slug: "mixers", count: 45 },
      { name: "Blenders", slug: "blenders", count: 56 },
      { name: "Slicers", slug: "slicers", count: 34 },
      { name: "Ovens", slug: "ovens", count: 78 },
      { name: "Fryers", slug: "fryers", count: 45 },
      { name: "Grills", slug: "grills", count: 67 },
    ]
  },
  "furniture-fixtures": {
    name: "Furniture & Fixtures",
    description: "Business furniture including tables, chairs, bar stools, and outdoor seating.",
    icon: Armchair,
    color: "indigo",
    gradient: "from-indigo-600 to-violet-700",
    heroImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&h=500&fit=crop&q=80",
    subcategories: [
      { name: "Tables", slug: "tables", count: 145 },
      { name: "Chairs", slug: "chairs", count: 189 },
      { name: "Bar Stools", slug: "bar-stools", count: 78 },
      { name: "Booths", slug: "booths", count: 45 },
      { name: "Host Stands", slug: "host-stands", count: 23 },
      { name: "Outdoor Furniture", slug: "outdoor-furniture", count: 67 },
    ]
  },
};

// Sort options
const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

// Generate sample products for category
function generateCategoryProducts(category: string, subcategory?: string): Product[] {
  const cat = categoryData[category];
  if (!cat) return [];
  
  const products: Product[] = [];
  const subcats = subcategory 
    ? cat.subcategories.filter(s => s.slug === subcategory)
    : cat.subcategories;
    
  subcats.forEach((subcat) => {
    for (let i = 0; i < 6; i++) {
      products.push({
        id: `${category}-${subcat.slug}-${i}`,
        name: `${subcat.name} Item ${i + 1}`,
        description: `High-quality ${subcat.name.toLowerCase()} for commercial foodservice operations.`,
        category: category,
        subcategory: subcat.slug,
        priceCents: Math.floor(Math.random() * 10000) + 1000,
        originalPriceCents: Math.random() > 0.7 ? Math.floor(Math.random() * 15000) + 2000 : undefined,
        image: "",
        badge: Math.random() > 0.8 ? ["Best Seller", "New", "Sale", "Eco"][Math.floor(Math.random() * 4)] : undefined,
        rating: Number((4 + Math.random()).toFixed(1)),
        reviewCount: Math.floor(Math.random() * 500),
        inStock: Math.random() > 0.1,
        freeShipping: Math.random() > 0.5,
        ecoFriendly: Math.random() > 0.7,
        brand: ["EcoPack", "ChefMaster", "SafeServe", "ProKitchen", "GreenChoice"][Math.floor(Math.random() * 5)],
        sku: `SKU-${category.substring(0, 2).toUpperCase()}-${Math.floor(Math.random() * 10000)}`,
      });
    }
  });
  
  return products;
}

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categorySlug = params.category as string;
  const subcategorySlug = searchParams.get("sub");
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [gridCols, setGridCols] = useState<3 | 4 | 5>(4);
  const [sortBy, setSortBy] = useState("relevance");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState({
    inStock: false,
    freeShipping: false,
    ecoFriendly: false,
  });
  
  const category = categoryData[categorySlug];
  
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      let prods = generateCategoryProducts(categorySlug, subcategorySlug || undefined);
      
      // Apply filters
      if (filters.inStock) prods = prods.filter(p => p.inStock);
      if (filters.freeShipping) prods = prods.filter(p => p.freeShipping);
      if (filters.ecoFriendly) prods = prods.filter(p => p.ecoFriendly);
      
      // Sort
      switch (sortBy) {
        case "price-low":
          prods.sort((a, b) => a.priceCents - b.priceCents);
          break;
        case "price-high":
          prods.sort((a, b) => b.priceCents - a.priceCents);
          break;
        case "rating":
          prods.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case "newest":
          prods.reverse();
          break;
      }
      
      setProducts(prods);
      setIsLoading(false);
    }, 400);
  }, [categorySlug, subcategorySlug, sortBy, filters]);
  
  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Category Not Found</h1>
          <Link href="/shop" className="text-orange-500 hover:underline">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }
  
  const Icon = category.icon;
  const totalProducts = subcategorySlug
    ? category.subcategories.find(s => s.slug === subcategorySlug)?.count || 0
    : category.subcategories.reduce((sum, s) => sum + s.count, 0);
  const currentSubcategoryName = subcategorySlug 
    ? category.subcategories.find(s => s.slug === subcategorySlug)?.name 
    : null;

  const hasFilters = filters.inStock || filters.freeShipping || filters.ecoFriendly;

  return (
    <main className="min-h-screen bg-slate-50/50">
      
      {/* ═══════════════════════════════════════════════════════════════════════════
          COMPACT HERO WITH IMAGE
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className={`relative h-28 md:h-32 bg-linear-to-r ${category.gradient}`}>
        {/* Content */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-white/70 mb-2">
              <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
              <ChevronRight className="h-3 w-3" />
              {currentSubcategoryName ? (
                <>
                  <Link href={`/shop/category/${categorySlug}`} className="hover:text-white transition-colors">{category.name}</Link>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-white font-medium">{currentSubcategoryName}</span>
                </>
              ) : (
                <span className="text-white font-medium">{category.name}</span>
              )}
            </nav>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              {currentSubcategoryName || category.name}
            </h1>
            <p className="text-sm text-white/80 mt-1 hidden md:block max-w-xl">
              {totalProducts.toLocaleString()} products available
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          SUBCATEGORY PILLS
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            <Link
              href={`/shop/category/${categorySlug}`}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                !subcategorySlug 
                  ? "bg-orange-500 text-white shadow-sm" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All
            </Link>
            {category.subcategories.map((sub) => (
              <Link
                key={sub.slug}
                href={`/shop/category/${categorySlug}?sub=${sub.slug}`}
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  subcategorySlug === sub.slug
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {sub.name}
                <span className="ml-1 text-xs opacity-70">({sub.count})</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          PROMO BANNER
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl px-5 py-4 flex items-center justify-between gap-4 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-lg bg-orange-500/20 items-center justify-center">
              <Percent className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[10px] font-bold uppercase rounded">
                  Category Deal
                </span>
              </div>
              <p className="text-white text-sm font-medium">
                <span className="text-orange-400">Free Shipping</span> on {category.name} orders over $250
              </p>
            </div>
          </div>
          <Link
            href="/quote"
            className="shrink-0 px-4 py-2 bg-white text-slate-900 text-sm font-semibold rounded-lg hover:bg-slate-100 transition"
          >
            Get Quote
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex gap-6">
          
          {/* ─────────────────────────────────────────────────────────────────────────
              SIDEBAR
          ───────────────────────────────────────────────────────────────────────── */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-20">
              {/* Categories */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Categories</h3>
                <ul className="space-y-0.5">
                  {category.subcategories.map((sub) => (
                    <li key={sub.slug}>
                      <Link
                        href={`/shop/category/${categorySlug}?sub=${sub.slug}`}
                        className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-sm transition ${
                          subcategorySlug === sub.slug
                            ? "bg-orange-50 text-orange-600 font-medium"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span className="truncate">{sub.name}</span>
                        <span className="text-xs text-slate-400 shrink-0 ml-2">{sub.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Filters</h3>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={filters.inStock}
                      onChange={(e) => setFilters(f => ({ ...f, inStock: e.target.checked }))}
                      className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 transition" 
                    />
                    <span className="group-hover:text-slate-900">In Stock Only</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={filters.freeShipping}
                      onChange={(e) => setFilters(f => ({ ...f, freeShipping: e.target.checked }))}
                      className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 transition" 
                    />
                    <span className="group-hover:text-slate-900">Free Shipping</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={filters.ecoFriendly}
                      onChange={(e) => setFilters(f => ({ ...f, ecoFriendly: e.target.checked }))}
                      className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 transition" 
                    />
                    <span className="group-hover:text-slate-900">Eco-Friendly</span>
                  </label>
                </div>
                
                {hasFilters && (
                  <button
                    onClick={() => setFilters({ inStock: false, freeShipping: false, ecoFriendly: false })}
                    className="mt-3 text-sm text-orange-500 hover:text-orange-600 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
              
              {/* Trust Badges */}
              <div className="mt-4 space-y-2">
                {[
                  { icon: Truck, text: "Fast shipping", color: "text-orange-500" },
                  { icon: Shield, text: "30-day returns", color: "text-blue-500" },
                  { icon: BadgeCheck, text: "Verified quality", color: "text-amber-500" },
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                    <badge.icon className={`h-3.5 w-3.5 ${badge.color}`} />
                    <span>{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ─────────────────────────────────────────────────────────────────────────
              PRODUCTS
          ───────────────────────────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            
            {/* Toolbar */}
            <div className="bg-white rounded-xl border border-slate-200 mb-4">
              <div className="flex items-center justify-between p-3">
                {/* Left */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </button>
                  <span className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{totalProducts.toLocaleString()}</span> products
                  </span>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2">
                  {/* Sort */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                    >
                      {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Grid Size */}
                  <div className="hidden xl:flex items-center gap-1 px-1 py-0.5 rounded-lg border border-slate-200 bg-slate-50">
                    {[3, 4, 5].map((cols) => (
                      <button
                        key={cols}
                        onClick={() => setGridCols(cols as 3 | 4 | 5)}
                        className={`px-2 py-1 rounded text-xs font-medium transition ${
                          gridCols === cols 
                            ? "bg-white text-orange-600 shadow-sm" 
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {cols}
                      </button>
                    ))}
                  </div>

                  {/* View Toggle */}
                  <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-slate-200 bg-slate-50">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded transition ${
                        viewMode === "grid" 
                          ? "bg-white text-orange-600 shadow-sm" 
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded transition ${
                        viewMode === "list" 
                          ? "bg-white text-orange-600 shadow-sm" 
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              {hasFilters && (
                <div className="px-3 pb-3 flex items-center gap-2 flex-wrap">
                  {filters.inStock && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded-full">
                      In Stock
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(f => ({ ...f, inStock: false }))} />
                    </span>
                  )}
                  {filters.freeShipping && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded-full">
                      Free Shipping
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(f => ({ ...f, freeShipping: false }))} />
                    </span>
                  )}
                  {filters.ecoFriendly && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded-full">
                      Eco-Friendly
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters(f => ({ ...f, ecoFriendly: false }))} />
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <div className={`grid gap-4 ${
                viewMode === "list" ? "grid-cols-1" : 
                gridCols === 3 ? "grid-cols-2 sm:grid-cols-3" :
                gridCols === 4 ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" :
                "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              }`}>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-3 animate-pulse">
                    <div className="aspect-square bg-slate-100 rounded-lg mb-3" />
                    <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className={`grid gap-4 ${
                  viewMode === "list" ? "grid-cols-1" : 
                  gridCols === 3 ? "grid-cols-2 sm:grid-cols-3" :
                  gridCols === 4 ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" :
                  "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                }`}>
                  {products.map((product, idx) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      viewMode={viewMode}
                      index={idx}
                      trackingSource="category"
                      trackingList={`category_${categorySlug}`}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-8 flex items-center justify-center gap-1">
                  <button className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50" disabled>
                    Previous
                  </button>
                  {[1, 2, 3, '...', 8].map((page, idx) => (
                    <button
                      key={idx}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                        page === 1
                          ? "bg-orange-500 text-white"
                          : typeof page === 'number' 
                            ? "border border-slate-200 text-slate-600 hover:bg-slate-50" 
                            : "text-slate-400"
                      }`}
                      disabled={typeof page !== 'number'}
                    >
                      {page}
                    </button>
                  ))}
                  <button className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          BOTTOM CTA
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-slate-900 mt-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Need Bulk Pricing for {category.name}?</h3>
              <p className="text-slate-400 text-sm">Get wholesale rates on orders of $1,000 or more</p>
            </div>
            <Link 
              href="/quote"
              className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-500 transition"
            >
              Request Wholesale Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-1">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Categories */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {category.subcategories.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/shop/category/${categorySlug}?sub=${sub.slug}`}
                      onClick={() => setShowMobileFilters(false)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        subcategorySlug === sub.slug
                          ? "bg-orange-500 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Filters */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Options</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-sm text-slate-600">
                    <input 
                      type="checkbox" 
                      checked={filters.inStock}
                      onChange={(e) => setFilters(f => ({ ...f, inStock: e.target.checked }))}
                      className="rounded border-slate-300 text-orange-500" 
                    />
                    In Stock Only
                  </label>
                  <label className="flex items-center gap-3 text-sm text-slate-600">
                    <input 
                      type="checkbox" 
                      checked={filters.freeShipping}
                      onChange={(e) => setFilters(f => ({ ...f, freeShipping: e.target.checked }))}
                      className="rounded border-slate-300 text-orange-500" 
                    />
                    Free Shipping
                  </label>
                  <label className="flex items-center gap-3 text-sm text-slate-600">
                    <input 
                      type="checkbox" 
                      checked={filters.ecoFriendly}
                      onChange={(e) => setFilters(f => ({ ...f, ecoFriendly: e.target.checked }))}
                      className="rounded border-slate-300 text-orange-500" 
                    />
                    Eco-Friendly
                  </label>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
