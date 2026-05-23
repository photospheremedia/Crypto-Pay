'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ExternalLink } from 'lucide-react';

export interface Advertisement {
  id: string;
  type: 'banner' | 'sidebar' | 'inline' | 'popup';
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl: string;
  linkText?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  badge?: string;
  startDate?: string;
  endDate?: string;
  priority?: number;
  targetCategories?: string[];
  dismissable?: boolean;
}

interface AdBannerProps {
  ad: Advertisement;
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'full';
  onDismiss?: () => void;
}

export function AdBanner({ ad, className = '', size = 'medium', onDismiss }: AdBannerProps) {
  const sizeClasses = {
    small: 'h-20',
    medium: 'h-32',
    large: 'h-48',
    full: 'h-64'
  };

  return (
    <div 
      className={`relative rounded-xl overflow-hidden ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: ad.backgroundColor || '#1f2937' }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={ad.imageUrl}
          alt={ad.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center p-6">
        <div className="flex-1">
          {ad.badge && (
            <span 
              className="inline-block px-3 py-1 text-xs font-bold rounded-full mb-2"
              style={{ 
                backgroundColor: ad.accentColor || '#f97316',
                color: '#fff'
              }}
            >
              {ad.badge}
            </span>
          )}
          <h3 
            className="text-xl md:text-2xl font-bold mb-1"
            style={{ color: ad.textColor || '#fff' }}
          >
            {ad.title}
          </h3>
          {ad.description && (
            <p 
              className="text-sm md:text-base opacity-90 mb-3 max-w-md"
              style={{ color: ad.textColor || '#fff' }}
            >
              {ad.description}
            </p>
          )}
          <Link
            href={ad.linkUrl}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-transform hover:scale-105"
            style={{ 
              backgroundColor: ad.accentColor || '#f97316',
              color: '#fff'
            }}
          >
            {ad.linkText || 'Shop Now'}
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Dismiss Button */}
      {ad.dismissable && onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Sponsored Label */}
      <div className="absolute bottom-2 right-2 text-xs text-white/50 font-medium">
        Sponsored
      </div>
    </div>
  );
}

interface AdSidebarProps {
  ad: Advertisement;
  className?: string;
}

export function AdSidebar({ ad, className = '' }: AdSidebarProps) {
  return (
    <div 
      className={`rounded-xl overflow-hidden ${className}`}
      style={{ backgroundColor: ad.backgroundColor || '#1f2937' }}
    >
      {/* Image */}
      <div className="relative aspect-square">
        <Image
          src={ad.imageUrl}
          alt={ad.title}
          fill
          className="object-cover"
        />
        {ad.badge && (
          <span 
            className="absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded"
            style={{ 
              backgroundColor: ad.accentColor || '#f97316',
              color: '#fff'
            }}
          >
            {ad.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 
          className="font-semibold mb-1 line-clamp-2"
          style={{ color: ad.textColor || '#fff' }}
        >
          {ad.title}
        </h4>
        {ad.description && (
          <p 
            className="text-sm opacity-80 mb-3 line-clamp-2"
            style={{ color: ad.textColor || '#fff' }}
          >
            {ad.description}
          </p>
        )}
        <Link
          href={ad.linkUrl}
          className="block w-full text-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors hover:opacity-90"
          style={{ 
            backgroundColor: ad.accentColor || '#f97316',
            color: '#fff'
          }}
        >
          {ad.linkText || 'Learn More'}
        </Link>
        <p className="text-xs text-center mt-2 opacity-50" style={{ color: ad.textColor || '#fff' }}>
          Sponsored
        </p>
      </div>
    </div>
  );
}

interface AdInlineProps {
  ad: Advertisement;
  className?: string;
}

export function AdInline({ ad, className = '' }: AdInlineProps) {
  return (
    <Link
      href={ad.linkUrl}
      className={`group block rounded-xl overflow-hidden border-2 border-transparent hover:border-orange-500 transition-colors ${className}`}
    >
      <div 
        className="flex items-center gap-4 p-4"
        style={{ backgroundColor: ad.backgroundColor || '#1f2937' }}
      >
        {/* Image */}
        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={ad.imageUrl}
            alt={ad.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {ad.badge && (
              <span 
                className="px-2 py-0.5 text-xs font-bold rounded"
                style={{ 
                  backgroundColor: ad.accentColor || '#f97316',
                  color: '#fff'
                }}
              >
                {ad.badge}
              </span>
            )}
            <span className="text-xs opacity-50" style={{ color: ad.textColor || '#fff' }}>
              Sponsored
            </span>
          </div>
          <h4 
            className="font-semibold line-clamp-1"
            style={{ color: ad.textColor || '#fff' }}
          >
            {ad.title}
          </h4>
          {ad.description && (
            <p 
              className="text-sm opacity-80 line-clamp-1"
              style={{ color: ad.textColor || '#fff' }}
            >
              {ad.description}
            </p>
          )}
        </div>

        {/* CTA */}
        <div 
          className="px-3 py-1.5 rounded-lg text-sm font-semibold flex-shrink-0"
          style={{ 
            backgroundColor: ad.accentColor || '#f97316',
            color: '#fff'
          }}
        >
          {ad.linkText || 'View'}
        </div>
      </div>
    </Link>
  );
}

interface AdPopupProps {
  ad: Advertisement;
  onClose: () => void;
}

export function AdPopup({ ad, onClose }: AdPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="relative max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: ad.backgroundColor || '#1f2937' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image */}
        <div className="relative aspect-video">
          <Image
            src={ad.imageUrl}
            alt={ad.title}
            fill
            className="object-cover"
          />
          {ad.badge && (
            <span 
              className="absolute top-4 left-4 px-3 py-1 text-sm font-bold rounded"
              style={{ 
                backgroundColor: ad.accentColor || '#f97316',
                color: '#fff'
              }}
            >
              {ad.badge}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 
            className="text-2xl font-bold mb-2"
            style={{ color: ad.textColor || '#fff' }}
          >
            {ad.title}
          </h3>
          {ad.description && (
            <p 
              className="opacity-80 mb-4"
              style={{ color: ad.textColor || '#fff' }}
            >
              {ad.description}
            </p>
          )}
          <div className="flex gap-3">
            <Link
              href={ad.linkUrl}
              className="flex-1 text-center px-6 py-3 rounded-lg font-semibold transition-colors hover:opacity-90"
              style={{ 
                backgroundColor: ad.accentColor || '#f97316',
                color: '#fff'
              }}
            >
              {ad.linkText || 'Shop Now'}
            </Link>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-lg font-semibold border border-gray-600 hover:bg-gray-700 transition-colors"
              style={{ color: ad.textColor || '#fff' }}
            >
              Maybe Later
            </button>
          </div>
          <p className="text-xs text-center mt-4 opacity-50" style={{ color: ad.textColor || '#fff' }}>
            Sponsored Content
          </p>
        </div>
      </div>
    </div>
  );
}

// Sample advertisements for demo purposes
export const sampleAds: Advertisement[] = [
  {
    id: 'ad-1',
    type: 'banner',
    title: '50% Off All Eco-Friendly Packaging!',
    description: 'Limited time offer on sustainable takeout containers and bags.',
    imageUrl: '/images/placeholder-product.svg',
    linkUrl: '/shop/category/packaging-takeout?filter=eco-friendly',
    linkText: 'Shop Eco Collection',
    backgroundColor: '#065f46',
    accentColor: '#10b981',
    badge: 'LIMITED TIME',
    targetCategories: ['packaging-takeout'],
    dismissable: true
  },
  {
    id: 'ad-2',
    type: 'sidebar',
    title: 'New Kitchen Equipment',
    description: 'Commercial-grade equipment at wholesale prices.',
    imageUrl: '/images/placeholder-product.svg',
    linkUrl: '/shop/category/kitchen-equipment',
    linkText: 'View Equipment',
    backgroundColor: '#1e3a5f',
    accentColor: '#3b82f6',
    badge: 'NEW',
    targetCategories: ['kitchen-equipment']
  },
  {
    id: 'ad-3',
    type: 'inline',
    title: 'Free Shipping on Orders $500+',
    description: 'Stock up and save on delivery costs.',
    imageUrl: '/images/placeholder-product.svg',
    linkUrl: '/shop',
    linkText: 'Shop Now',
    backgroundColor: '#7c2d12',
    accentColor: '#f97316',
    badge: 'FREE SHIPPING'
  },
  {
    id: 'ad-4',
    type: 'banner',
    title: 'Bulk Cutlery Deals',
    description: 'Save up to 40% when you order cases of 1000+',
    imageUrl: '/images/placeholder-product.svg',
    linkUrl: '/shop/category/cutlery-utensils',
    linkText: 'View Cutlery',
    backgroundColor: '#4c1d95',
    accentColor: '#8b5cf6',
    badge: 'BULK SAVINGS',
    targetCategories: ['cutlery-utensils']
  }
];

// Hook to get relevant ads
export function useAds(options?: {
  category?: string;
  type?: Advertisement['type'];
  limit?: number;
}) {
  const [ads, setAds] = useState<Advertisement[]>([]);

  useEffect(() => {
    // In production, this would fetch from an API
    let filtered = [...sampleAds];

    if (options?.type) {
      filtered = filtered.filter(ad => ad.type === options.type);
    }

    if (options?.category) {
      filtered = filtered.filter(ad => 
        !ad.targetCategories || 
        ad.targetCategories.includes(options.category!)
      );
    }

    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    setAds(filtered);
  }, [options?.category, options?.type, options?.limit]);

  return ads;
}
