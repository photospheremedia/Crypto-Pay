"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Star, Package, Truck, Check, Plus, Eye } from "lucide-react";
import { useCart } from "@/components/store/cart-context";
import { useWishlist } from "@/components/store/wishlist-context";
import { ProductPlaceholder } from "@/components/store/product-placeholder";
import { 
  buildProductUrl, 
  trackAddToCart, 
  trackAddToWishlist,
  type TrackingParams,
  type TrackingSource 
} from "@/lib/analytics";

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  priceCents: number;
  originalPriceCents?: number;
  image: string;
  images?: string[];
  badge?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  freeShipping?: boolean;
  ecoFriendly?: boolean;
  brand?: string;
  sku?: string;
  minOrder?: number;
  unitType?: string;
}

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
  index?: number;
  trackingSource?: TrackingSource;
  trackingList?: string;
}

export function ProductCard({ 
  product, 
  viewMode = "grid", 
  index = 0,
  trackingSource = 'category',
  trackingList = 'product_grid'
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();

  // Build tracking params for this product
  const trackingParams: TrackingParams = {
    src: trackingSource,
    pos: index,
    list: trackingList,
  };

  // Generate product URL with tracking
  const productUrl = buildProductUrl(product.id, trackingParams);

  // Check if product has a valid image URL
  const hasValidImage = product.image && product.image.startsWith("http");

  // Handle image error - show placeholder instead
  const handleImageError = () => {
    setHasImageError(true);
  };

  const isWishlisted = isInWishlist(product.id);

  // Product tracking data
  const productTrackingData = {
    productId: product.id,
    productName: product.name,
    category: product.category,
    price: product.priceCents / 100,
    brand: product.brand,
    position: index,
    list: trackingList,
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Track wishlist action
    if (!isWishlisted) {
      trackAddToWishlist(productTrackingData, trackingParams);
    }
    
    toggleItem({
      id: product.id,
      name: product.name,
      priceCents: product.priceCents,
      image: product.image,
    });
  };

  // Intersection observer for lazy loading animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsLoaded(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);
    
    // Track add to cart
    trackAddToCart(productTrackingData, product.minOrder || 1, trackingParams);
    
    addItem({
      id: product.id,
      name: product.name,
      priceCents: product.priceCents,
      image: product.image,
    }, product.minOrder || 1);

    // Show feedback
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsAddingToCart(false);
  };

  const discount = product.originalPriceCents 
    ? Math.round((1 - product.priceCents / product.originalPriceCents) * 100)
    : 0;

  if (viewMode === "list") {
    return (
      <div
        ref={cardRef}
        className={`group relative bg-white rounded-lg border border-slate-200 overflow-hidden transition-all duration-500 hover:shadow-md hover:border-orange-200 ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ transitionDelay: `${index * 50}ms` }}
      >
        <Link href={productUrl} className="flex gap-4 p-3">
          {/* Image */}
          <div className="relative w-28 h-28 shrink-0 rounded-lg overflow-hidden bg-slate-100">
            {hasValidImage && !hasImageError ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 192px"
                onError={handleImageError}
              />
            ) : (
              <ProductPlaceholder 
                category={product.category} 
                size="xl" 
                name={product.name}
                className="w-full h-full"
              />
            )}
            {product.badge && (
              <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded-full z-10 ${
                product.badge === "Best Seller" ? "bg-orange-100 text-orange-600" :
                product.badge === "New" ? "bg-blue-100 text-blue-700" :
                product.badge === "Sale" ? "bg-red-100 text-red-700" :
                "bg-amber-100 text-amber-700"
              }`}>
                {product.badge}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                {product.brand && (
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {product.brand}
                  </span>
                )}
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-orange-500 transition-colors">
                  {product.name}
                </h3>
              </div>
              
              {/* Price */}
              <div className="text-right">
                <div className="text-xl font-bold text-slate-900">
                  {formatPrice(product.priceCents)}
                </div>
                {product.originalPriceCents && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400 line-through">
                      {formatPrice(product.originalPriceCents)}
                    </span>
                    <span className="text-xs font-semibold text-red-600">
                      -{discount}%
                    </span>
                  </div>
                )}
                {product.unitType && (
                  <span className="text-xs text-slate-500">per {product.unitType}</span>
                )}
              </div>
            </div>

            <p className="mt-2 text-sm text-slate-600 line-clamp-2">
              {product.description}
            </p>

            {/* Meta */}
            <div className="mt-3 flex items-center gap-4 text-xs">
              {product.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-slate-400">({product.reviewCount})</span>
                </div>
              )}
              {product.inStock !== false && (
                <div className="flex items-center gap-1 text-orange-500">
                  <Check className="h-4 w-4" />
                  <span>In Stock</span>
                </div>
              )}
              {product.freeShipping && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Truck className="h-4 w-4" />
                  <span>Free Shipping</span>
                </div>
              )}
              {product.ecoFriendly && (
                <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs">
                  🌱 Eco
                </span>
              )}
            </div>

            {/* Actions - Compact */}
            <div className="mt-auto pt-3 flex items-center gap-2">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className={`p-2 rounded-lg transition active:scale-95 ${
                  isAddingToCart 
                    ? "bg-orange-500 text-white" 
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
                title="Add to Cart"
              >
                {isAddingToCart ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </button>
              <button 
                onClick={handleWishlistToggle}
                className={`p-2 rounded-lg border transition active:scale-95 ${
                  isWishlisted 
                    ? "border-red-300 bg-red-50 text-red-500" 
                    : "border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-500"
                }`}
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-500 hover:shadow-xl hover:border-orange-200 hover:-translate-y-1 ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <Link href={productUrl}>
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          {hasValidImage && !hasImageError ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-700 ${
                isHovered ? "scale-110" : "scale-100"
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              onError={handleImageError}
            />
          ) : (
            <ProductPlaceholder 
              category={product.category} 
              size="xl" 
              name={product.name}
              className="w-full h-full"
            />
          )}
          
          {/* Overlay on hover */}
          <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 pointer-events-none ${
            isHovered ? "opacity-100" : "opacity-0"
          }`} />

          {/* Badge */}
          {product.badge && (
            <span className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm z-10 ${
              product.badge === "Best Seller" ? "bg-orange-500 text-white" :
              product.badge === "New" ? "bg-blue-500 text-white" :
              product.badge === "Sale" ? "bg-red-500 text-white" :
              "bg-amber-500 text-white"
            }`}>
            {product.badge}
          </span>
          )}

          {/* Discount badge */}
          {discount > 0 && (
            <span className="absolute top-3 right-3 px-2 py-1 text-xs font-bold rounded-full bg-red-500 text-white z-10">
              -{discount}%
            </span>
          )}

          {/* Quick actions on hover - Clean minimal style */}
          <div className={`absolute top-2 right-2 flex flex-col gap-1.5 transition-all duration-200 ${
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
          }`}>
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className={`p-1.5 rounded-full shadow-md active:scale-90 transition-all ${
                isAddingToCart 
                  ? "bg-orange-500 text-white" 
                  : "bg-white hover:bg-orange-500 text-slate-600 hover:text-white"
              }`}
              title="Add to Cart"
            >
              {isAddingToCart ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
            <button
              onClick={handleWishlistToggle}
              className={`p-1.5 rounded-full shadow-md active:scale-90 transition-all ${
                isWishlisted 
                  ? "bg-red-500 text-white" 
                  : "bg-white hover:bg-red-50 text-slate-600 hover:text-red-500"
              }`}
              title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowQuickView(true);
              }}
              className="p-1.5 rounded-full bg-white shadow-md hover:bg-slate-50 text-slate-600 active:scale-90 transition-all"
              title="Quick View"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Brand */}
          {product.brand && (
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              {product.brand}
            </span>
          )}
          
          {/* Name */}
          <h3 className="mt-0.5 text-xs font-semibold text-slate-900 line-clamp-2 group-hover:text-orange-500 transition-colors min-h-8">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="mt-1.5 flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(product.rating!)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-slate-200 text-slate-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-slate-500">({product.reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-slate-900">
              {formatPrice(product.priceCents)}
            </span>
            {product.originalPriceCents && (
              <span className="text-[10px] text-slate-400 line-through">
                {formatPrice(product.originalPriceCents)}
              </span>
            )}
          </div>

          {/* Meta tags */}
          <div className="mt-1.5 flex flex-wrap gap-1">
            {product.inStock !== false && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-orange-500">
                <Package className="h-2.5 w-2.5" />
                In Stock
              </span>
            )}
            {product.freeShipping && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600">
                <Truck className="h-2.5 w-2.5" />
                Free
              </span>
            )}
            {product.ecoFriendly && (
              <span className="text-[10px]">🌱</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

// Skeleton loader for products
export function ProductCardSkeleton({ viewMode = "grid" }: { viewMode?: "grid" | "list" }) {
  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-3 animate-pulse">
        <div className="flex gap-4">
          <div className="w-28 h-28 bg-slate-200 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-16 bg-slate-200 rounded" />
            <div className="h-4 w-3/4 bg-slate-200 rounded" />
            <div className="h-3 w-full bg-slate-200 rounded" />
            <div className="flex gap-3 mt-2">
              <div className="h-8 w-24 bg-slate-200 rounded-lg" />
              <div className="h-8 w-8 bg-slate-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-slate-200" />
      <div className="p-3 space-y-2">
        <div className="h-2 w-12 bg-slate-200 rounded" />
        <div className="h-3 w-full bg-slate-200 rounded" />
        <div className="h-3 w-2/3 bg-slate-200 rounded" />
        <div className="flex gap-0.5 mt-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-2.5 w-2.5 bg-slate-200 rounded" />
          ))}
        </div>
        <div className="h-4 w-16 bg-slate-200 rounded" />
      </div>
    </div>
  );
}
