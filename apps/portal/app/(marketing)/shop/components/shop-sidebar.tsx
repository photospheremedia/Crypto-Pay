"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ChevronDown, 
  ChevronRight,
  X,
  Check,
  Truck,
  Package,
  Leaf
} from "lucide-react";

// Category structure
export const shopCategories: Record<string, { slug: string; subcategories: { name: string; slug: string; count: number }[] }> = {
  "Packaging & Takeout": {
    slug: "packaging-takeout",
    subcategories: [
      { name: "Takeout Containers", slug: "takeout-containers", count: 245 },
      { name: "Paper Bags", slug: "paper-bags", count: 128 },
      { name: "Plastic Bags", slug: "plastic-bags", count: 89 },
      { name: "Food Boxes", slug: "food-boxes", count: 167 },
      { name: "Cup Carriers", slug: "cup-carriers", count: 45 },
      { name: "Pizza Boxes", slug: "pizza-boxes", count: 78 },
    ]
  },
  "Cutlery & Utensils": {
    slug: "cutlery-utensils",
    subcategories: [
      { name: "Plastic Cutlery", slug: "plastic-cutlery", count: 156 },
      { name: "Wooden Utensils", slug: "wooden-utensils", count: 89 },
      { name: "Compostable", slug: "compostable-cutlery", count: 67 },
      { name: "Chopsticks", slug: "chopsticks", count: 45 },
      { name: "Serving Utensils", slug: "serving-utensils", count: 134 },
    ]
  },
  "Beverages & Cups": {
    slug: "beverages-cups",
    subcategories: [
      { name: "Hot Cups", slug: "hot-cups", count: 189 },
      { name: "Cold Cups", slug: "cold-cups", count: 167 },
      { name: "Cup Lids", slug: "cup-lids", count: 145 },
      { name: "Cup Sleeves", slug: "cup-sleeves", count: 56 },
    ]
  },
  "Labels & Stickers": {
    slug: "labels-stickers",
    subcategories: [
      { name: "Food Labels", slug: "food-labels", count: 234 },
      { name: "Date Labels", slug: "date-labels", count: 67 },
      { name: "Tamper Evident", slug: "tamper-evident", count: 89 },
      { name: "Custom Labels", slug: "custom-labels", count: 156 },
    ]
  },
  "Kitchen Equipment": {
    slug: "kitchen-equipment",
    subcategories: [
      { name: "Prep Tables", slug: "prep-tables", count: 89 },
      { name: "Mixers & Blenders", slug: "mixers-blenders", count: 112 },
      { name: "Ovens", slug: "commercial-ovens", count: 78 },
      { name: "Fryers", slug: "fryers", count: 45 },
    ]
  },
  "Cleaning & Safety": {
    slug: "cleaning-safety",
    subcategories: [
      { name: "Sanitizers", slug: "sanitizers", count: 145 },
      { name: "Cleaning Supplies", slug: "cleaning-chemicals", count: 178 },
      { name: "Gloves", slug: "gloves", count: 112 },
      { name: "Aprons", slug: "aprons", count: 67 },
    ]
  },
  "Paper Products": {
    slug: "paper-products",
    subcategories: [
      { name: "Napkins", slug: "napkins", count: 234 },
      { name: "Paper Towels", slug: "paper-towels", count: 156 },
      { name: "Table Covers", slug: "table-covers", count: 67 },
    ]
  },
  "Furniture": {
    slug: "furniture-fixtures",
    subcategories: [
      { name: "Tables", slug: "tables", count: 145 },
      { name: "Chairs", slug: "chairs", count: 189 },
      { name: "Bar Stools", slug: "bar-stools", count: 78 },
    ]
  },
};

// Sort options
export const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top Rated" },
];

export interface FilterState {
  category: string | null;
  subcategory: string | null;
  priceRange: { label: string; min: number; max: number } | null;
  brands: string[];
  inStock: boolean;
  freeShipping: boolean;
  ecoFriendly: boolean;
}

interface ShopSidebarProps {
  onFilterChange?: (filters: FilterState) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export function ShopSidebar({ onFilterChange, isMobile, onClose }: ShopSidebarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Packaging & Takeout");
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get("category"),
    subcategory: searchParams.get("subcategory"),
    priceRange: null,
    brands: [],
    inStock: false,
    freeShipping: false,
    ecoFriendly: false,
  });

  const toggleCategory = (category: string) => {
    setExpandedCategory(prev => prev === category ? null : category);
  };

  const handleCategoryClick = (categorySlug: string, subcategorySlug?: string) => {
    const newFilters = {
      ...filters,
      category: categorySlug,
      subcategory: subcategorySlug || null,
    };
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    if (categorySlug) params.set("category", categorySlug);
    if (subcategorySlug) params.set("subcategory", subcategorySlug);
    router.push(`/shop?${params.toString()}`);
    
    onFilterChange?.(newFilters);
    if (isMobile) onClose?.();
  };

  const handleFilterToggle = (key: 'inStock' | 'freeShipping' | 'ecoFriendly') => {
    const newFilters = { ...filters, [key]: !filters[key] };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      category: null,
      subcategory: null,
      priceRange: null,
      brands: [],
      inStock: false,
      freeShipping: false,
      ecoFriendly: false,
    };
    setFilters(clearedFilters);
    router.push("/shop");
    onFilterChange?.(clearedFilters);
  };

  const hasActiveFilters = filters.category || filters.inStock || filters.freeShipping || filters.ecoFriendly;

  return (
    <div className={isMobile ? "p-4" : "p-4"}>
      {/* Header */}
      {isMobile && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-slate-100 rounded-lg"
            aria-label="Close filters"
            title="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Quick Filters */}
      <div className="mb-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Quick Filters
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => handleFilterToggle('inStock')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              filters.inStock 
                ? "bg-orange-50 text-orange-600 border border-orange-200" 
                : "bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100"
            }`}
          >
            <Package className="h-4 w-4" />
            <span>In Stock</span>
            {filters.inStock && <Check className="h-4 w-4 ml-auto" />}
          </button>
          
          <button
            onClick={() => handleFilterToggle('freeShipping')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              filters.freeShipping 
                ? "bg-orange-50 text-orange-600 border border-orange-200" 
                : "bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100"
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Free Shipping</span>
            {filters.freeShipping && <Check className="h-4 w-4 ml-auto" />}
          </button>
          
          <button
            onClick={() => handleFilterToggle('ecoFriendly')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              filters.ecoFriendly 
                ? "bg-orange-50 text-orange-600 border border-orange-200" 
                : "bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100"
            }`}
          >
            <Leaf className="h-4 w-4" />
            <span>Eco-Friendly</span>
            {filters.ecoFriendly && <Check className="h-4 w-4 ml-auto" />}
          </button>
        </div>
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Categories
          </h3>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-orange-500 hover:text-orange-600 font-medium"
            >
              Clear
            </button>
          )}
        </div>
        
        <div className="space-y-1">
          {Object.entries(shopCategories).map(([categoryName, { slug, subcategories }]) => {
            const isExpanded = expandedCategory === categoryName;
            const isActive = filters.category === slug;
            
            return (
              <div key={categoryName}>
                <button
                  onClick={() => toggleCategory(categoryName)}
                  className={`w-full flex items-center justify-between px-2 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="font-medium truncate">{categoryName}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>
                
                {isExpanded && (
                  <div className="mt-1 ml-2 space-y-0.5 border-l-2 border-slate-100 pl-3">
                    <button
                      onClick={() => handleCategoryClick(slug)}
                      className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                        filters.category === slug && !filters.subcategory
                          ? "text-orange-600 font-medium"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      All {categoryName.split(" ")[0]}
                    </button>
                    {subcategories.map((sub) => (
                      <button
                        key={sub.slug}
                        onClick={() => handleCategoryClick(slug, sub.slug)}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${
                          filters.subcategory === sub.slug
                            ? "text-orange-600 font-medium bg-orange-50"
                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">{sub.name}</span>
                        <span className="text-xs text-slate-400 shrink-0 ml-2">{sub.count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Browse All Link */}
      <div className="mt-5 pt-4 border-t border-slate-200">
        <Link
          href="/shop"
          className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-600 font-medium"
        >
          <span>View All Products</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
