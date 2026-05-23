"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ChevronRight, 
  ChevronLeft,
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  Package,
  RefreshCw,
  Check,
  Minus,
  Plus,
  Info,
  ChevronDown,
  Copy,
  Facebook,
  Twitter,
  Mail,
  Zap,
  Award,
  Clock,
  BadgeCheck,
  ThumbsUp,
  MessageSquare,
  ImageIcon
} from "lucide-react";
import { useCart } from "@/components/store/cart-context";
import { useWishlist } from "@/components/store/wishlist-context";
import { useRecentlyViewed } from "@/components/store/recently-viewed-context";
import { RecentlyViewedSection } from "@/components/store/recently-viewed-section";
import { ProductCard, Product } from "../../components/product-card";
import { 
  trackProductView, 
  trackAddToCart, 
  trackAddToWishlist,
  type TrackingParams 
} from "@/lib/analytics";

// Review interface
interface Review {
  id: string;
  name: string;
  rating: number;
  date: string;
  title: string;
  text: string;
  helpful: number;
  verified: boolean;
  avatar?: string;
}

// Generate sample reviews - in production, fetch from API
const generateSampleReviews = (productId: string, count: number): Review[] => {
  const reviewTemplates = [
    { name: "Sarah M.", title: "Perfect for our restaurant!", text: "These are exactly what we needed. Great quality, secure packaging, and customers love them. Will definitely reorder.", rating: 5 },
    { name: "Michael R.", title: "Best value we've found", text: "After trying several brands, these are by far the best. The quality is outstanding and the price point is excellent for bulk ordering.", rating: 5 },
    { name: "Jennifer L.", title: "Great product, fast shipping", text: "Very happy with the quality. Shipping was faster than expected. Only minor issue is sizing ran slightly smaller than expected.", rating: 4 },
    { name: "David K.", title: "Solid choice for busy kitchens", text: "We go through hundreds of these a week. Consistent quality and our staff finds them easy to use. Highly recommend.", rating: 5 },
    { name: "Amanda T.", title: "Good but could be better", text: "Product quality is fine but the packaging could be improved. Some items arrived slightly damaged but still usable.", rating: 3 },
    { name: "Robert H.", title: "Exceeded expectations", text: "Wasn't sure about ordering online but these are perfect. The quality matches or exceeds what we were getting from our local supplier.", rating: 5 },
    { name: "Lisa P.", title: "Great for takeout orders", text: "Our customers have commented on how nice these look. Professional appearance at a reasonable price.", rating: 4 },
    { name: "James W.", title: "Reliable and consistent", text: "Been ordering for 6 months now. Never had any issues. Great for high-volume operations.", rating: 5 },
    { name: "Karen S.", title: "Would recommend", text: "Good value for the price. We've tried cheaper alternatives but always come back to these.", rating: 4 },
    { name: "Chris M.", title: "Perfect for our needs", text: "Exactly what the description promised. Great communication from seller and fast delivery.", rating: 5 },
  ];
  
  const dates = ["1 day ago", "3 days ago", "1 week ago", "2 weeks ago", "1 month ago", "2 months ago", "3 months ago"];
  
  return Array.from({ length: count }, (_, i) => {
    const template = reviewTemplates[i % reviewTemplates.length];
    return {
      id: `${productId}-review-${i}`,
      ...template,
      date: dates[i % dates.length],
      helpful: Math.floor(Math.random() * 50) + 1,
      verified: Math.random() > 0.2,
    };
  });
};

// Sample product data - in production, fetch from API/database
const productDatabase: Record<string, Product & { 
  longDescription: string;
  specifications: Record<string, string>;
  features: string[];
  relatedProducts: string[];
}> = {
  "takeout-containers-001": {
    id: "takeout-containers-001",
    name: "Premium Takeout Containers with Lids (200 ct)",
    description: "Microwavable, stackable containers with secure lids. Perfect for hot and cold foods.",
    longDescription: `Our Premium Takeout Containers are the gold standard for food service packaging. Designed with your restaurant's efficiency in mind, these containers feature:

• **Secure Snap-Lock Lids** - No more spills during delivery
• **Microwave Safe** - Customers can reheat without transferring food
• **Stackable Design** - Saves storage space in your kitchen
• **Crystal Clear Visibility** - Food presentation matters even for takeout
• **Leak-Resistant Seal** - Perfect for soups, sauces, and liquid-heavy dishes

Made from BPA-free, food-grade polypropylene that's both durable and recyclable. Each container holds 32oz, ideal for entrees and large portion sizes.`,
    category: "packaging-takeout",
    subcategory: "takeout-containers",
    priceCents: 11800,
    originalPriceCents: 14900,
    image: "https://picsum.photos/seed/container1/800/600",
    images: [
      "https://picsum.photos/seed/container1/800/600",
      "https://picsum.photos/seed/container2/800/600",
      "https://picsum.photos/seed/container3/800/600",
    ],
    badge: "Best Seller",
    rating: 4.8,
    reviewCount: 234,
    inStock: true,
    freeShipping: true,
    ecoFriendly: false,
    brand: "EcoPack",
    sku: "TC-001",
    minOrder: 1,
    unitType: "case",
    specifications: {
      "Material": "BPA-Free Polypropylene (PP)",
      "Capacity": "32 oz per container",
      "Quantity": "200 containers per case",
      "Dimensions": "7.5\" x 5.5\" x 2.5\"",
      "Color": "Clear with black base option",
      "Temperature Range": "-20°F to 250°F",
      "Microwave Safe": "Yes",
      "Dishwasher Safe": "Top rack only",
      "Recyclable": "Yes (#5 PP)",
    },
    features: [
      "Snap-lock lids prevent spills",
      "Microwave and freezer safe",
      "Stackable for easy storage",
      "Crystal clear for food visibility",
      "Leak-resistant seal technology",
      "BPA-free, food-grade materials",
    ],
    relatedProducts: ["thermal-bags-001", "paper-bags-001", "tamper-seals-001"]
  },
};

// Related products data (simplified)
const relatedProductsData: Product[] = [
  {
    id: "thermal-bags-001",
    name: "Insulated Thermal Delivery Bags (Set of 10)",
    description: "Keep orders hot with professional insulated carriers.",
    category: "packaging-takeout",
    priceCents: 12900,
    image: "", // Uses category-based placeholder
    rating: 4.9,
    reviewCount: 89,
    inStock: true,
    freeShipping: true,
    brand: "Restaurant Hub",
  },
  {
    id: "paper-bags-001",
    name: "Handled Paper Bags (250 ct)",
    description: "Durable kraft paper bags for pickup orders.",
    category: "packaging-takeout",
    priceCents: 10200,
    image: "", // Uses category-based placeholder
    rating: 4.6,
    reviewCount: 156,
    inStock: true,
    ecoFriendly: true,
    brand: "GreenChoice",
  },
  {
    id: "tamper-seals-001",
    name: "Tamper-Evident Seals (1,000 ct)",
    description: "Secure delivery bags with safety seals.",
    category: "labels-stickers",
    priceCents: 3400,
    image: "", // Uses category-based placeholder
    badge: "Best Value",
    rating: 4.8,
    reviewCount: 289,
    inStock: true,
    brand: "SafeServe",
  },
  {
    id: "compostable-cutlery-001",
    name: "Compostable Cutlery Kits (500 ct)",
    description: "Eco-friendly cutlery for takeout orders.",
    category: "cutlery-utensils",
    priceCents: 5400,
    image: "", // Uses category-based placeholder
    badge: "Eco",
    rating: 4.7,
    reviewCount: 312,
    inStock: true,
    ecoFriendly: true,
    brand: "GreenChoice",
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const { addItem: addRecentlyViewed } = useRecentlyViewed();
  
  const [product, setProduct] = useState<typeof productDatabase[string] | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  
  // Reviews lazy loading state
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  // Image timeout ref
  const imageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isWishlisted = product ? isInWishlist(product.id) : false;

  // Extract tracking params from URL
  const trackingParams: TrackingParams = {
    src: searchParams.get('src') as TrackingParams['src'] || undefined,
    ref: searchParams.get('ref') || undefined,
    pos: searchParams.get('pos') ? parseInt(searchParams.get('pos')!) : undefined,
    list: searchParams.get('list') || undefined,
    campaign: searchParams.get('utm_campaign') || undefined,
    medium: searchParams.get('utm_medium') || undefined,
  };

  useEffect(() => {
    // Simulate fetching product data
    const productId = params.id as string;
    const foundProduct = productDatabase[productId];
    
    if (foundProduct) {
      setProduct(foundProduct);
      setIsLoaded(true);
    } else {
      // For demo, create a generic product with reliable placeholder images
      const productSeed = productId.replace(/[^a-z0-9]/gi, '').slice(0, 10) || 'product';
      setProduct({
        id: productId,
        name: "Premium Restaurant Supply",
        description: "High-quality supplies for your restaurant needs.",
        longDescription: "Our premium supplies are designed with quality and durability in mind. Perfect for busy restaurants and commercial kitchens.",
        category: "general",
        priceCents: 9900,
        image: `https://picsum.photos/seed/${productSeed}/800/600`,
        images: [
          `https://picsum.photos/seed/${productSeed}1/800/600`,
          `https://picsum.photos/seed/${productSeed}2/800/600`,
          `https://picsum.photos/seed/${productSeed}3/800/600`,
        ],
        rating: 4.5,
        reviewCount: 100,
        inStock: true,
        brand: "Restaurant Hub",
        sku: productId.toUpperCase(),
        specifications: {
          "Material": "Premium Quality",
          "Quantity": "Varies",
        },
        features: [
          "High quality materials",
          "Durable construction",
          "Commercial grade",
        ],
        relatedProducts: []
      });
      setIsLoaded(true);
    }
  }, [params.id]);

  // Image timeout handling - show fallback after 8 seconds
  useEffect(() => {
    if (!imageLoaded && !imageError && product) {
      imageTimeoutRef.current = setTimeout(() => {
        if (!imageLoaded) {
          setImageError(true);
        }
      }, 8000);
    }
    
    return () => {
      if (imageTimeoutRef.current) {
        clearTimeout(imageTimeoutRef.current);
      }
    };
  }, [imageLoaded, imageError, product, selectedImage]);

  // Reset image state when changing images
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [selectedImage]);

  // Lazy load reviews when tab is selected
  useEffect(() => {
    if (activeTab === "reviews" && !reviewsLoaded && !reviewsLoading && product) {
      setReviewsLoading(true);
      // Simulate API call delay
      const timer = setTimeout(() => {
        const generatedReviews = generateSampleReviews(product.id, product.reviewCount || 10);
        setReviews(generatedReviews);
        setReviewsLoaded(true);
        setReviewsLoading(false);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [activeTab, reviewsLoaded, reviewsLoading, product]);

  // Track recently viewed
  useEffect(() => {
    if (product && isLoaded) {
      addRecentlyViewed({
        id: product.id,
        name: product.name,
        priceCents: product.priceCents,
        image: product.image,
      });
    }
  }, [product, isLoaded, addRecentlyViewed]);

  // Track product view for analytics
  useEffect(() => {
    if (product && isLoaded && !hasTrackedView) {
      trackProductView({
        productId: product.id,
        productName: product.name,
        category: product.category,
        price: product.priceCents / 100,
        brand: product.brand,
      }, trackingParams);
      setHasTrackedView(true);
    }
  }, [product, isLoaded, hasTrackedView, trackingParams]);

  const handleWishlistToggle = () => {
    if (!product) return;
    
    // Track wishlist action
    trackAddToWishlist({
      productId: product.id,
      productName: product.name,
      category: product.category,
      price: product.priceCents / 100,
      brand: product.brand,
    }, trackingParams);
    
    toggleItem({
      id: product.id,
      name: product.name,
      priceCents: product.priceCents,
      image: product.image,
    });
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    
    // Track add to cart
    trackAddToCart({
      productId: product.id,
      productName: product.name,
      category: product.category,
      price: product.priceCents / 100,
      brand: product.brand,
    }, quantity, trackingParams);
    
    addItem({
      id: product.id,
      name: product.name,
      priceCents: product.priceCents,
      image: product.image,
    }, quantity);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsAddingToCart(false);
  };

  const handleShare = async (platform: 'copy' | 'facebook' | 'twitter' | 'email') => {
    const url = window.location.href;
    const text = `Check out ${product?.name} at Restaurant Hub!`;
    
    switch (platform) {
      case 'copy':
        await navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`;
        break;
    }
    setShowShareMenu(false);
  };

  const discount = product?.originalPriceCents 
    ? Math.round((1 - product.priceCents / product.originalPriceCents) * 100)
    : 0;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-slate-900">Product not found</h1>
        <Link href="/shop" className="mt-4 text-orange-500 hover:text-orange-600">
          ← Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      {/* Breadcrumbs - Sticky */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/shop" className="text-slate-500 hover:text-orange-500 transition-colors">Shop</Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <Link href={`/shop/category/${product.category}`} className="text-slate-500 hover:text-orange-500 transition-colors capitalize">
              {product.category.replace(/-/g, ' ')}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-900 font-medium truncate max-w-50 sm:max-w-none">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Image Gallery - Left Side */}
          <div className="lg:col-span-7 space-y-3">
            {/* Main Image - 4:3 aspect ratio for better product display */}
            <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 shadow-sm">
              {/* If no images at all, show a large SVG placeholder */}
              {(!product.images || product.images.length === 0) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 z-10">
                  <div className="w-24 h-24 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="w-12 h-12 text-slate-300"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-500">No product image</p>
                </div>
              )}
              {/* Loading State */}
              {product.images && product.images.length > 0 && !imageLoaded && !imageError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 z-10">
                  <div className="w-8 h-8 border-2 border-slate-200 border-t-orange-500 rounded-full animate-spin" />
                </div>
              )}
              {/* Error/Fallback State - Compact professional placeholder */}
              {product.images && product.images.length > 0 && imageError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 z-10">
                  <div className="w-16 h-16 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="w-7 h-7 text-slate-300"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <p className="mt-3 text-xs font-medium text-slate-500">Image unavailable</p>
                  <button 
                    onClick={() => {
                      setImageError(false);
                      setImageLoaded(false);
                    }}
                    className="mt-2 px-3 py-1.5 text-[11px] font-medium text-slate-500 hover:text-orange-500 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Retry
                  </button>
                </div>
              )}
              {/* Actual Image */}
              {product.images && product.images.length > 0 && !imageError && (
                <Image
                  src={product.images[selectedImage] || product.image}
                  alt={product.name}
                  fill
                  className={`object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                  onLoad={() => {
                    setImageLoaded(true);
                    if (imageTimeoutRef.current) {
                      clearTimeout(imageTimeoutRef.current);
                    }
                  }}
                  onError={() => setImageError(true)}
                  priority
                />
              )}
              {/* Image Navigation */}
              {product.images && product.images.length > 1 && !imageError && (
                <>
                  <button 
                    onClick={() => setSelectedImage(i => Math.max(0, i - 1))}
                    disabled={selectedImage === 0}
                    aria-label="Previous image"
                    title="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setSelectedImage(i => Math.min(product.images!.length - 1, i + 1))}
                    disabled={selectedImage === product.images.length - 1}
                    aria-label="Next image"
                    title="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-xs font-medium flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    {selectedImage + 1} / {product.images.length}
                  </div>
                </>
              )}
              
              {/* Badges moved outside image area to avoid overlap with controls */}
            </div>
            {/* Badges - now outside image area for no overlap */}
            {(product.badge || discount > 0) && (
              <div className="flex gap-2 mt-2 items-center">
                {product.badge && (
                  <span className={`px-2 py-1 text-[10px] font-semibold rounded-md shadow-sm ${
                    product.badge === "Best Seller" ? "bg-orange-500 text-white" :
                    product.badge === "New" ? "bg-blue-600 text-white" :
                    product.badge === "Sale" ? "bg-red-600 text-white" :
                    "bg-amber-500 text-white"
                  }`}>
                    {product.badge}
                  </span>
                )}
                {discount > 0 && (
                  <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-red-500 text-white shadow-sm">
                    -{discount}%
                  </span>
                )}
              </div>
            )}

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImage(idx);
                      setImageLoaded(false);
                    }}
                    aria-label={`View image ${idx + 1} of ${product.images!.length}`}
                    title={`View image ${idx + 1}`}
                    className={`relative w-16 h-12 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx 
                        ? "border-orange-500 ring-1 ring-orange-200" 
                        : "border-slate-200 hover:border-orange-300"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - Right Side */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-20 space-y-6">
              {/* Brand & Stock Status */}
              <div className="flex items-center justify-between">
                {product.brand && (
                  <Link href={`/shop?brand=${product.brand}`} className="text-sm font-semibold text-orange-500 uppercase tracking-wider hover:text-orange-600 transition-colors">
                    {product.brand}
                  </Link>
                )}
                {product.inStock !== false ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Out of Stock
                  </span>
                )}
              </div>
              
              {/* Name */}
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {product.name}
              </h1>

              {/* Rating & Reviews */}
              {product.rating && (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating!)
                              ? "fill-amber-400 text-amber-400"
                              : i < product.rating!
                              ? "fill-amber-200 text-amber-400"
                              : "fill-slate-200 text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{product.rating}</span>
                  </div>
                  <button 
                    onClick={() => setActiveTab("reviews")}
                    className="text-sm text-orange-500 hover:text-orange-600 hover:underline transition"
                  >
                    {product.reviewCount} reviews
                  </button>
                  <span className="text-slate-300">|</span>
                  <span className="text-sm text-slate-500">SKU: {product.sku}</span>
                </div>
              )}

              {/* Price */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-slate-900">
                    {formatPrice(product.priceCents)}
                  </span>
                  {product.originalPriceCents && (
                    <span className="text-lg text-slate-400 line-through">
                      {formatPrice(product.originalPriceCents)}
                    </span>
                  )}
                  {product.unitType && (
                    <span className="text-sm text-slate-500 font-medium">/ {product.unitType}</span>
                  )}
                </div>
                {discount > 0 && (
                  <p className="mt-2 text-sm text-orange-500 font-medium">
                    You save {formatPrice(product.originalPriceCents! - product.priceCents)} ({discount}% off)
                  </p>
                )}
              </div>

              {/* Description */}
              <p className="text-slate-600 leading-relaxed">{product.description}</p>

              {/* Quick Features */}
              {product.features && (
                <div className="space-y-2">
                  {product.features.slice(0, 4).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="mt-0.5 p-0.5 rounded-full bg-orange-100">
                        <Check className="h-3 w-3 text-orange-500" />
                      </div>
                      <span className="text-sm text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-4">
                  <label htmlFor="quantity-input" className="text-sm font-medium text-slate-700">Quantity:</label>
                  <div className="flex items-center bg-slate-100 rounded-lg">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                      title="Decrease quantity"
                      className="p-2.5 hover:bg-slate-200 rounded-l-lg transition-colors disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      id="quantity-input"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      aria-label="Product quantity"
                      title="Enter quantity"
                      className="w-14 text-center font-semibold bg-transparent border-none focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      aria-label="Increase quantity"
                      title="Increase quantity"
                      className="p-2.5 hover:bg-slate-200 rounded-r-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {product.minOrder && product.minOrder > 1 && (
                    <span className="text-xs text-slate-500">Min. order: {product.minOrder}</span>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || product.inStock === false}
                    className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-semibold text-base transition-all ${
                      isAddingToCart 
                        ? "bg-orange-500 text-white" 
                        : "bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.98] shadow-lg shadow-orange-500/25"
                    } disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}
                  >
                    {isAddingToCart ? (
                      <>
                        <Check className="h-5 w-5 animate-bounce" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button 
                    onClick={handleWishlistToggle}
                    className={`p-3.5 rounded-xl border-2 transition-all active:scale-95 ${
                      isWishlisted 
                        ? "border-red-400 bg-red-50 text-red-500" 
                        : "border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-500 hover:text-red-500"
                    }`}
                    title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                  </button>

                  <div className="relative">
                    <button 
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="p-3.5 rounded-xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500 transition-all active:scale-95"
                      title="Share"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                    
                    {showShareMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                        <button onClick={() => handleShare('copy')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700">
                          {copiedLink ? <Check className="h-4 w-4 text-orange-500" /> : <Copy className="h-4 w-4" />}
                          {copiedLink ? 'Link Copied!' : 'Copy Link'}
                        </button>
                        <button onClick={() => handleShare('facebook')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700">
                          <Facebook className="h-4 w-4" />
                          Facebook
                        </button>
                        <button onClick={() => handleShare('twitter')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700">
                          <Twitter className="h-4 w-4" />
                          Twitter
                        </button>
                        <button onClick={() => handleShare('email')} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-sm text-slate-700">
                          <Mail className="h-4 w-4" />
                          Email
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-2">
                {product.freeShipping && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/80">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-xs font-semibold text-blue-900">Free Shipping</p>
                      <p className="text-[10px] text-blue-600">Orders over $99</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-orange-50/80">
                  <Shield className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-xs font-semibold text-orange-900">Secure Checkout</p>
                    <p className="text-[10px] text-orange-500">256-bit SSL</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/80">
                  <RefreshCw className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="text-xs font-semibold text-amber-900">Easy Returns</p>
                    <p className="text-[10px] text-amber-600">30-day policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-50/80">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-xs font-semibold text-purple-900">Fast Delivery</p>
                    <p className="text-[10px] text-purple-600">2-5 business days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none">
            {[
              { id: "description", label: "Description", icon: Info },
              { id: "specs", label: "Specifications", icon: Package },
              { id: "reviews", label: `Reviews (${product.reviewCount})`, icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-500 bg-orange-50/50"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6 lg:p-8">
            {activeTab === "description" && product.longDescription && (
              <div className="prose prose-slate max-w-none">
                {product.longDescription.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-slate-600 whitespace-pre-line leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            {activeTab === "specs" && product.specifications && (
              <div className="grid sm:grid-cols-2 gap-x-8">
                {Object.entries(product.specifications).map(([key, value], idx) => (
                  <div key={key} className={`flex justify-between py-3 ${idx < Object.entries(product.specifications).length - 2 ? 'border-b border-slate-100' : ''}`}>
                    <span className="text-sm font-medium text-slate-700">{key}</span>
                    <span className="text-sm text-slate-600 text-right">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-4">
                {/* Review Summary - Compact */}
                <div className="flex items-center gap-6 p-4 rounded-lg bg-slate-50/80 border border-slate-100">
                  <div className="text-center shrink-0">
                    <div className="text-3xl font-bold text-slate-900">{product.rating}</div>
                    <div className="flex justify-center mt-1">
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
                    <p className="mt-0.5 text-[11px] text-slate-500">{product.reviewCount} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const percent = stars === 5 ? 68 : stars === 4 ? 22 : stars === 3 ? 7 : stars === 2 ? 2 : 1;
                      return (
                        <div key={stars} className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 w-6">{stars}★</span>
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-400 rounded-full transition-all" 
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 w-6">{percent}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Reviews List - Lazy Loaded */}
                <div className="space-y-3">
                  {/* Loading Skeleton */}
                  {reviewsLoading && (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-3 rounded-lg border border-slate-100 animate-pulse">
                          <div className="flex items-center gap-2">
                            <div className="h-3.5 w-20 bg-slate-100 rounded" />
                            <div className="h-3 w-12 bg-slate-100 rounded" />
                          </div>
                          <div className="flex items-center gap-1 mt-1.5">
                            {[...Array(5)].map((_, j) => (
                              <div key={j} className="h-2.5 w-2.5 bg-slate-100 rounded" />
                            ))}
                            <div className="h-2.5 w-12 bg-slate-100 rounded ml-1" />
                          </div>
                          <div className="mt-2 h-3.5 w-40 bg-slate-100 rounded" />
                          <div className="mt-1.5 h-3 w-full bg-slate-100 rounded" />
                          <div className="mt-1 h-3 w-2/3 bg-slate-100 rounded" />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Loaded Reviews */}
                  {reviewsLoaded && reviews.length > 0 && (
                    <>
                      {(showAllReviews ? reviews : reviews.slice(0, 5)).map((review) => (
                        <div key={review.id} className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-900">{review.name}</span>
                            {review.verified && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-50 text-orange-500 text-[10px] font-medium rounded">
                                <BadgeCheck className="h-2.5 w-2.5" />
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[11px] text-slate-400">{review.date}</span>
                          </div>
                          <h4 className="mt-2 text-sm font-medium text-slate-800">{review.title}</h4>
                          <p className="mt-1 text-xs text-slate-600 leading-relaxed">{review.text}</p>
                          <div className="mt-2 flex items-center">
                            <button className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-orange-500 transition-colors">
                              <ThumbsUp className="h-3 w-3" /> Helpful ({review.helpful})
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {/* Load More / Show Less Button */}
                      {reviews.length > 5 && (
                        <div className="flex justify-center pt-2">
                          <button
                            onClick={() => setShowAllReviews(!showAllReviews)}
                            className="px-4 py-2 text-xs font-medium text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            {showAllReviews ? (
                              <>Show Less</>
                            ) : (
                              <>
                                <MessageSquare className="h-3 w-3" />
                                Load {reviews.length - 5} more
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Empty State */}
                  {reviewsLoaded && reviews.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No reviews yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Related Products</h2>
            <Link href={`/shop/category/${product.category}`} className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProductsData.map((relatedProduct, idx) => (
              <ProductCard 
                key={relatedProduct.id} 
                product={relatedProduct}
                index={idx}
                trackingSource="recommendation"
                trackingList={`related_products_${product.id}`}
              />
            ))}
          </div>
        </div>

        {/* Recently Viewed Products */}
        <RecentlyViewedSection excludeId={product.id} />
      </div>

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
}
