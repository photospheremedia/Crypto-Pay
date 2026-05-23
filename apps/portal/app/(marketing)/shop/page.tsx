"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Grid3X3, 
  LayoutGrid,
  List, 
  SlidersHorizontal, 
  ArrowUpDown,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  Loader2,
  Truck,
  Shield,
  Clock,
  Star,
  Flame,
  Sparkles,
  TrendingUp,
  Percent,
  Box,
  UtensilsCrossed,
  Coffee,
  Tag,
  ChefHat,
  ShoppingBag,
  Armchair,
  ArrowRight,
  BadgeCheck,
  Zap
} from "lucide-react";
import { ShopSidebar, sortOptions, shopCategories, FilterState } from "./components/shop-sidebar";
import { ProductCard, ProductCardSkeleton, Product } from "./components/product-card";

// Category data with images
const categoryShowcase = [
  { 
    name: "Packaging", 
    slug: "packaging-takeout", 
    icon: Box, 
    image: "https://images.unsplash.com/photo-1604908177453-7462950a6a3b?w=400&h=300&fit=crop&q=80",
    count: 1245,
    color: "from-amber-500 to-orange-600"
  },
  { 
    name: "Cutlery", 
    slug: "cutlery-utensils", 
    icon: UtensilsCrossed, 
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&q=80",
    count: 589,
    color: "from-slate-500 to-zinc-600"
  },
  { 
    name: "Beverages", 
    slug: "beverages-cups", 
    icon: Coffee, 
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=300&fit=crop&q=80",
    count: 678,
    color: "from-cyan-500 to-blue-600"
  },
  { 
    name: "Labels", 
    slug: "labels-stickers", 
    icon: Tag, 
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&q=80",
    count: 456,
    color: "from-violet-500 to-purple-600"
  },
  { 
    name: "Equipment", 
    slug: "kitchen-equipment", 
    icon: ChefHat, 
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&q=80",
    count: 892,
    color: "from-rose-500 to-red-600"
  },
  { 
    name: "Cleaning", 
    slug: "cleaning-safety", 
    icon: Shield, 
    image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=300&fit=crop&q=80",
    count: 567,
    color: "from-orange-500 to-teal-600"
  },
  { 
    name: "Paper", 
    slug: "paper-products", 
    icon: ShoppingBag, 
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&q=80",
    count: 723,
    color: "from-yellow-500 to-amber-600"
  },
  { 
    name: "Furniture", 
    slug: "furniture-fixtures", 
    icon: Armchair, 
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop&q=80",
    count: 345,
    color: "from-indigo-500 to-violet-600"
  },
];

// Sample products data
const sampleProducts: Product[] = [
  {
    id: "takeout-containers-001",
    name: "Premium Takeout Containers with Lids (200 ct)",
    description: "Microwavable, stackable containers with secure lids. Perfect for hot and cold foods.",
    category: "packaging-takeout",
    subcategory: "takeout-containers",
    priceCents: 11800,
    originalPriceCents: 14900,
    image: "",
    badge: "Best Seller",
    rating: 4.8,
    reviewCount: 234,
    inStock: true,
    freeShipping: true,
    ecoFriendly: false,
    brand: "EcoPack",
    sku: "TC-001",
    minOrder: 1,
    unitType: "case"
  },
  {
    id: "thermal-bags-001",
    name: "Insulated Thermal Delivery Bags (Set of 10)",
    description: "Keep orders hot and brand-ready with professional insulated carriers.",
    category: "packaging-takeout",
    subcategory: "takeout-containers",
    priceCents: 12900,
    image: "",
    badge: "New",
    rating: 4.9,
    reviewCount: 89,
    inStock: true,
    freeShipping: true,
    brand: "Restaurant Hub",
    sku: "TB-001"
  },
  {
    id: "paper-bags-001",
    name: "Handled Paper Bags (250 ct)",
    description: "Durable kraft paper bags for pickup and delivery orders. Customizable.",
    category: "packaging-takeout",
    subcategory: "paper-bags",
    priceCents: 10200,
    image: "",
    rating: 4.6,
    reviewCount: 156,
    inStock: true,
    ecoFriendly: true,
    brand: "GreenChoice",
    sku: "PB-001"
  },
  {
    id: "compostable-cutlery-001",
    name: "Compostable Cutlery Kits (500 ct)",
    description: "Fork, knife, napkin bundles for eco-conscious takeout orders.",
    category: "cutlery-utensils",
    subcategory: "compostable-cutlery",
    priceCents: 5400,
    image: "",
    badge: "Eco",
    rating: 4.7,
    reviewCount: 312,
    inStock: true,
    ecoFriendly: true,
    brand: "GreenChoice",
    sku: "CC-001"
  },
  {
    id: "hot-cups-001",
    name: "Double-Wall Hot Cups (500 ct)",
    description: "Premium insulated cups for coffee and hot beverages. No sleeve needed.",
    category: "beverages-cups",
    subcategory: "hot-cups",
    priceCents: 8900,
    originalPriceCents: 10900,
    image: "",
    badge: "Sale",
    rating: 4.5,
    reviewCount: 178,
    inStock: true,
    freeShipping: true,
    brand: "ChefMaster",
    sku: "HC-001"
  },
  {
    id: "food-labels-001",
    name: "Day-Dot Label Rolls (6 Pack)",
    description: "Kitchen prep labels for compliance and inventory rotation.",
    category: "labels-stickers",
    subcategory: "date-labels",
    priceCents: 4200,
    image: "",
    rating: 4.4,
    reviewCount: 89,
    inStock: true,
    brand: "SafeServe",
    sku: "FL-001"
  },
  {
    id: "gloves-vinyl-001",
    name: "Vinyl Gloves (1,000 ct)",
    description: "Food-safe gloves for daily prep and cleaning workflows.",
    category: "cleaning-safety",
    subcategory: "gloves",
    priceCents: 8900,
    image: "",
    rating: 4.6,
    reviewCount: 234,
    inStock: true,
    freeShipping: true,
    brand: "SafeServe",
    sku: "GL-001"
  },
  {
    id: "sanitizer-bulk-001",
    name: "Hand Sanitizer (Gallon Refill)",
    description: "FDA-approved formula for front and back of house use.",
    category: "cleaning-safety",
    subcategory: "sanitizers",
    priceCents: 2800,
    image: "",
    rating: 4.3,
    reviewCount: 145,
    inStock: true,
    brand: "SafeServe",
    sku: "SN-001"
  },
  {
    id: "napkins-001",
    name: "Premium Dinner Napkins (2000 ct)",
    description: "Soft, absorbent napkins for fine dining and casual service.",
    category: "paper-products",
    subcategory: "napkins",
    priceCents: 5600,
    image: "",
    rating: 4.5,
    reviewCount: 198,
    inStock: true,
    brand: "ProKitchen",
    sku: "NP-001"
  },
  {
    id: "receipt-rolls-001",
    name: "Thermal Receipt Rolls (Case of 50)",
    description: "POS-ready rolls for printers and kitchen tickets.",
    category: "paper-products",
    subcategory: "receipt-paper",
    priceCents: 7600,
    image: "",
    rating: 4.7,
    reviewCount: 167,
    inStock: true,
    brand: "ProKitchen",
    sku: "RR-001"
  },
  {
    id: "tamper-seals-001",
    name: "Tamper-Evident Seals (1,000 ct)",
    description: "Secure delivery bags with branded safety seals.",
    category: "labels-stickers",
    subcategory: "tamper-evident",
    priceCents: 3400,
    image: "",
    badge: "Best Value",
    rating: 4.8,
    reviewCount: 289,
    inStock: true,
    brand: "SafeServe",
    sku: "TS-001"
  },
  {
    id: "cold-cups-001",
    name: "Clear Cold Cups (1000 ct)",
    description: "Crystal clear cups for iced beverages and smoothies.",
    category: "beverages-cups",
    subcategory: "cold-cups",
    priceCents: 6700,
    image: "",
    rating: 4.4,
    reviewCount: 123,
    inStock: true,
    ecoFriendly: false,
    brand: "ChefMaster",
    sku: "CC-002"
  },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [gridCols, setGridCols] = useState<3 | 4 | 5>(4);
  const [sortBy, setSortBy] = useState("relevance");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get("category"),
    subcategory: searchParams.get("subcategory"),
    priceRange: null,
    brands: [],
    inStock: false,
    freeShipping: false,
    ecoFriendly: false,
  });

  // Simulate loading products
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      let filtered = [...sampleProducts];
      
      if (filters.category) {
        filtered = filtered.filter(p => p.category === filters.category);
      }
      if (filters.subcategory) {
        filtered = filtered.filter(p => p.subcategory === filters.subcategory);
      }
      if (filters.inStock) {
        filtered = filtered.filter(p => p.inStock);
      }
      if (filters.freeShipping) {
        filtered = filtered.filter(p => p.freeShipping);
      }
      if (filters.ecoFriendly) {
        filtered = filtered.filter(p => p.ecoFriendly);
      }
      
      switch (sortBy) {
        case "price-low":
          filtered.sort((a, b) => a.priceCents - b.priceCents);
          break;
        case "price-high":
          filtered.sort((a, b) => b.priceCents - a.priceCents);
          break;
        case "rating":
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
      }
      
      setProducts(filtered);
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [filters, sortBy]);

  const isFiltered = filters.category || filters.subcategory || filters.inStock || filters.freeShipping || filters.ecoFriendly;

  return (
    <main className="min-h-screen bg-slate-50/50">
      
      {/* ═══════════════════════════════════════════════════════════════════════════
          TOP VALUE PROPOSITION BAR
      ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-6 md:gap-12 py-2.5 text-xs md:text-sm overflow-x-auto">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Truck className="h-4 w-4 text-orange-400" />
              <span><strong className="text-orange-400">Free Shipping</strong> on $500+</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 whitespace-nowrap">
              <Clock className="h-4 w-4 text-amber-400" />
              <span><strong className="text-amber-400">Same-Day</strong> Processing</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <BadgeCheck className="h-4 w-4 text-blue-400" />
              <span><strong className="text-blue-400">Verified</strong> Suppliers</span>
            </div>
            <div className="hidden md:flex items-center gap-2 whitespace-nowrap">
              <Shield className="h-4 w-4 text-violet-400" />
              <span><strong className="text-violet-400">30-Day</strong> Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          HERO SECTION - Only when not filtered
      ═══════════════════════════════════════════════════════════════════════════ */}
      {!isFiltered && (
        <>
          {/* Category Quick-Browse - Text Links */}
          <section className="bg-white border-b border-slate-200">
            <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
                <span className="text-sm font-medium text-slate-500 shrink-0">Browse:</span>
                {categoryShowcase.map((cat, i) => (
                  <Link
                    key={cat.slug}
                    href={`/shop/category/${cat.slug}`}
                    className="text-sm font-medium text-slate-700 hover:text-orange-500 whitespace-nowrap transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Deals Banner */}
          <section className="bg-orange-500">
            <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-orange-200" />
                  <span className="text-white font-medium text-sm">
                    <strong>Flash Sale:</strong> Up to 30% off bulk orders + Free shipping over $500
                  </span>
                </div>
                <Link
                  href="/shop?promo=bulk30"
                  className="shrink-0 px-4 py-1.5 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors text-sm"
                >
                  Shop Deals
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          MAIN SHOP CONTENT
      ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          
          {/* ─────────────────────────────────────────────────────────────────────────
              SIDEBAR
          ───────────────────────────────────────────────────────────────────────── */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <ShopSidebar onFilterChange={setFilters} />
              </div>
              
              {/* Ad Slot */}
              <div className="mt-4 bg-linear-to-br from-slate-900 to-slate-800 rounded-xl p-4 text-white">
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Special Offer</div>
                <div className="text-sm font-bold mb-2">New Customers Get 15% Off</div>
                <Link href="/signup" className="text-xs text-orange-400 hover:text-orange-300 font-medium">
                  Sign up now →
                </Link>
              </div>
            </div>
          </aside>

          {/* ─────────────────────────────────────────────────────────────────────────
              PRODUCT AREA
          ───────────────────────────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            
            {/* Toolbar */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4">
              <div className="flex items-center justify-between p-3">
                {/* Left: Results Info */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileSidebarOpen(true)}
                    className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium hover:bg-slate-100"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </button>
                  
                  <div className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{products.length.toLocaleString()}</span> products
                    {isFiltered && (
                      <button 
                        onClick={() => {
                          setFilters({
                            category: null, subcategory: null, priceRange: null,
                            brands: [], inStock: false, freeShipping: false, ecoFriendly: false,
                          });
                          router.push("/shop");
                        }}
                        className="ml-2 text-orange-500 hover:text-orange-600 font-medium"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: Sort & View Controls */}
                <div className="flex items-center gap-2">
                  {/* Sort */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      aria-label="Sort products by"
                      title="Sort products"
                      className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent cursor-pointer"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Grid Size - Desktop Only */}
                  <div className="hidden xl:flex items-center gap-1 px-1 py-0.5 rounded-lg border border-slate-200 bg-slate-50">
                    {[3, 4, 5].map((cols) => (
                      <button
                        key={cols}
                        onClick={() => setGridCols(cols as 3 | 4 | 5)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          gridCols === cols 
                            ? "bg-white text-orange-600 shadow-sm" 
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {cols}
                      </button>
                    ))}
                  </div>

                  {/* View Mode */}
                  <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-slate-200 bg-slate-50">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded transition-colors ${
                        viewMode === "grid" 
                          ? "bg-white text-orange-600 shadow-sm" 
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                      title="Grid view"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded transition-colors ${
                        viewMode === "list" 
                          ? "bg-white text-orange-600 shadow-sm" 
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                      title="List view"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters Pills */}
              {isFiltered && (
                <div className="px-3 pb-3 flex items-center gap-2 flex-wrap">
                  {filters.category && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded-full">
                      {Object.entries(shopCategories).find(([_, d]) => d.slug === filters.category)?.[0]}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-orange-900" 
                        onClick={() => setFilters(f => ({ ...f, category: null, subcategory: null }))}
                      />
                    </span>
                  )}
                  {filters.inStock && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded-full">
                      In Stock
                      <X className="h-3 w-3 cursor-pointer hover:text-orange-900" onClick={() => setFilters(f => ({ ...f, inStock: false }))} />
                    </span>
                  )}
                  {filters.freeShipping && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded-full">
                      Free Shipping
                      <X className="h-3 w-3 cursor-pointer hover:text-orange-900" onClick={() => setFilters(f => ({ ...f, freeShipping: false }))} />
                    </span>
                  )}
                  {filters.ecoFriendly && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 text-xs font-medium rounded-full">
                      Eco-Friendly
                      <X className="h-3 w-3 cursor-pointer hover:text-orange-900" onClick={() => setFilters(f => ({ ...f, ecoFriendly: false }))} />
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
                  <ProductCardSkeleton key={i} viewMode={viewMode} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={`grid gap-4 ${
                  viewMode === "list" ? "grid-cols-1" : 
                  gridCols === 3 ? "grid-cols-2 sm:grid-cols-3" :
                  gridCols === 4 ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" :
                  "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                }`}>
                  {products.map((product, index) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      viewMode={viewMode}
                      index={index}
                      trackingSource={filters.category ? "category" : "homepage"}
                      trackingList={filters.category ? `category_${filters.category}` : "shop_all_products"}
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
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
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
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No products found</h3>
                <p className="text-sm text-slate-500 mb-4">Try adjusting your filters or browse our categories.</p>
                <button
                  onClick={() => {
                    setFilters({
                      category: null, subcategory: null, priceRange: null,
                      brands: [], inStock: false, freeShipping: false, ecoFriendly: false,
                    });
                    router.push("/shop");
                  }}
                  className="px-6 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          BOTTOM CTA SECTION
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-slate-900 mt-8">
        <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-xl bg-orange-500/20 flex items-center justify-center mb-4">
                <Truck className="h-7 w-7 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Fast Shipping</h3>
              <p className="text-sm text-slate-400">Same-day processing on orders placed by 2PM EST</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
                <Star className="h-7 w-7 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Wholesale Pricing</h3>
              <p className="text-sm text-slate-400">Volume discounts on bulk orders over $1,000</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <Shield className="h-7 w-7 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Quality Guaranteed</h3>
              <p className="text-sm text-slate-400">30-day returns on all products, no questions asked</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right">
            <ShopSidebar 
              onFilterChange={(f) => {
                setFilters(f);
                setMobileSidebarOpen(false);
              }}
              isMobile
              onClose={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
