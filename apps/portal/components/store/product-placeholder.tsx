"use client";

import { Package, UtensilsCrossed, Coffee, Tag, Sparkles, ShoppingBag, ScrollText, Truck, Box, Leaf } from "lucide-react";

// Professional placeholder for product images when no image available
// Uses a gradient background with category-appropriate icons

interface ProductPlaceholderProps {
  category?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  name?: string;
}

const categoryIcons: Record<string, React.ElementType> = {
  "packaging": Box,
  "packaging-takeout": Box,
  "cutlery": UtensilsCrossed,
  "cutlery-utensils": UtensilsCrossed,
  "beverages": Coffee,
  "beverages-cups": Coffee,
  "labels": Tag,
  "labels-stickers": Tag,
  "cleaning": Sparkles,
  "cleaning-safety": Sparkles,
  "paper": ScrollText,
  "paper-products": ScrollText,
  "delivery": Truck,
  "eco": Leaf,
  "default": ShoppingBag,
};

const categoryColors: Record<string, { from: string; to: string; icon: string }> = {
  "packaging": { from: "from-amber-100", to: "to-orange-100", icon: "text-amber-600" },
  "packaging-takeout": { from: "from-amber-100", to: "to-orange-100", icon: "text-amber-600" },
  "cutlery": { from: "from-slate-100", to: "to-zinc-100", icon: "text-slate-600" },
  "cutlery-utensils": { from: "from-slate-100", to: "to-zinc-100", icon: "text-slate-600" },
  "beverages": { from: "from-sky-100", to: "to-cyan-100", icon: "text-sky-600" },
  "beverages-cups": { from: "from-sky-100", to: "to-cyan-100", icon: "text-sky-600" },
  "labels": { from: "from-purple-100", to: "to-pink-100", icon: "text-purple-600" },
  "labels-stickers": { from: "from-purple-100", to: "to-pink-100", icon: "text-purple-600" },
  "cleaning": { from: "from-orange-100", to: "to-teal-100", icon: "text-orange-500" },
  "cleaning-safety": { from: "from-orange-100", to: "to-teal-100", icon: "text-orange-500" },
  "paper": { from: "from-yellow-100", to: "to-amber-100", icon: "text-yellow-700" },
  "paper-products": { from: "from-yellow-100", to: "to-amber-100", icon: "text-yellow-700" },
  "delivery": { from: "from-blue-100", to: "to-indigo-100", icon: "text-blue-600" },
  "eco": { from: "from-green-100", to: "to-orange-100", icon: "text-green-600" },
  "default": { from: "from-slate-100", to: "to-slate-200", icon: "text-slate-500" },
};

const sizeClasses = {
  sm: { container: "h-16 w-16", icon: "h-6 w-6" },
  md: { container: "h-24 w-24", icon: "h-8 w-8" },
  lg: { container: "h-32 w-32", icon: "h-12 w-12" },
  xl: { container: "", icon: "h-16 w-16" }, // No fixed size for xl - uses className
  full: { container: "", icon: "h-16 w-16" }, // No fixed size - uses className
};

export function ProductPlaceholder({ 
  category = "default", 
  size = "md", 
  className = "",
  name
}: ProductPlaceholderProps) {
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, "-");
  const Icon = categoryIcons[normalizedCategory] || categoryIcons.default;
  const colors = categoryColors[normalizedCategory] || categoryColors.default;
  const sizes = sizeClasses[size] || sizeClasses.md;

  return (
    <div 
      className={`relative overflow-hidden rounded-xl bg-linear-to-br ${colors.from} ${colors.to} ${sizes.container} flex items-center justify-center ${className}`}
      title={name}
    >
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" className="text-slate-400/30" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>
      
      {/* Icon */}
      <Icon className={`${sizes.icon} ${colors.icon} relative z-10`} />
      
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/20 to-transparent" />
    </div>
  );
}

// Wrapper component that shows image or placeholder
interface SmartProductImageProps {
  src?: string | null;
  alt: string;
  category?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function SmartProductImage({ 
  src, 
  alt, 
  category, 
  size = "md",
  className = "" 
}: SmartProductImageProps) {
  if (src && isValidImageUrl(src)) {
    return (
      <img 
        src={src} 
        alt={alt}
        className={`object-cover ${className}`}
        onError={(e) => {
          // If image fails to load, hide it and show placeholder
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
    );
  }
  
  return <ProductPlaceholder category={category} size={size} name={alt} className={className} />;
}

function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
