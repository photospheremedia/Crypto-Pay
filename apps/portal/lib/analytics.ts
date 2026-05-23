/**
 * Analytics and Tracking System
 * Tracks user interactions for marketing and business intelligence
 * RESPECTS COOKIE CONSENT - Only tracks when user has given permission
 */

import { isCookieCategoryAllowed } from '@/components/cookie-consent';

export type TrackingSource = 
  | 'homepage'
  | 'category'
  | 'search'
  | 'recommendation'
  | 'recently_viewed'
  | 'related'
  | 'wishlist'
  | 'cart'
  | 'advertisement'
  | 'direct';

export type TrackingEvent = 
  | 'view'
  | 'click'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'add_to_wishlist'
  | 'remove_from_wishlist'
  | 'checkout_start'
  | 'purchase'
  | 'search'
  | 'filter'
  | 'sort';

export interface TrackingParams {
  src?: TrackingSource;
  ref?: string; // Reference ID (e.g., category slug, search query)
  pos?: number; // Position in list
  list?: string; // List name (e.g., "homepage_featured", "search_results")
  campaign?: string; // Marketing campaign ID
  medium?: string; // Traffic medium (email, social, etc.)
}

export interface ProductTrackingData {
  productId: string;
  productName: string;
  category: string;
  price: number;
  brand?: string;
  position?: number;
  list?: string;
}

/**
 * Generate tracking URL parameters
 */
export function generateTrackingParams(params: TrackingParams): URLSearchParams {
  const searchParams = new URLSearchParams();
  
  if (params.src) searchParams.set('src', params.src);
  if (params.ref) searchParams.set('ref', params.ref);
  if (params.pos !== undefined) searchParams.set('pos', params.pos.toString());
  if (params.list) searchParams.set('list', params.list);
  if (params.campaign) searchParams.set('utm_campaign', params.campaign);
  if (params.medium) searchParams.set('utm_medium', params.medium);
  
  return searchParams;
}

/**
 * Build product URL with tracking
 */
export function buildProductUrl(
  productId: string, 
  tracking?: TrackingParams
): string {
  const baseUrl = `/shop/product/${productId}`;
  
  if (!tracking) return baseUrl;
  
  const params = generateTrackingParams(tracking);
  const queryString = params.toString();
  
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Build category URL with tracking
 */
export function buildCategoryUrl(
  categorySlug: string,
  subcategorySlug?: string,
  tracking?: TrackingParams
): string {
  const baseUrl = `/shop/category/${categorySlug}`;
  const params = new URLSearchParams();
  
  if (subcategorySlug) params.set('sub', subcategorySlug);
  
  if (tracking) {
    const trackingParams = generateTrackingParams(tracking);
    trackingParams.forEach((value, key) => params.set(key, value));
  }
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Parse tracking params from URL
 */
export function parseTrackingParams(searchParams: URLSearchParams): TrackingParams {
  return {
    src: searchParams.get('src') as TrackingSource | undefined,
    ref: searchParams.get('ref') || undefined,
    pos: searchParams.get('pos') ? parseInt(searchParams.get('pos')!) : undefined,
    list: searchParams.get('list') || undefined,
    campaign: searchParams.get('utm_campaign') || undefined,
    medium: searchParams.get('utm_medium') || undefined,
  };
}

/**
 * Track an analytics event
 * RESPECTS COOKIE CONSENT - Only tracks if user allowed analytics cookies
 * In production, this would send to analytics service (Google Analytics, Mixpanel, etc.)
 */
export function trackEvent(
  event: TrackingEvent,
  data: ProductTrackingData & TrackingParams
): void {
  // Check if analytics cookies are allowed
  if (!isCookieCategoryAllowed('analytics')) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Blocked - user declined analytics cookies');
    }
    return;
  }
  
  // Build event payload
  const payload = {
    event,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    ...data,
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event, payload);
  }
  
  // Send to Google Analytics if loaded
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, {
      event_category: data.category,
      event_label: data.productName,
      value: data.price,
      items: [{
        item_id: data.productId,
        item_name: data.productName,
        item_category: data.category,
        price: data.price,
        item_brand: data.brand,
        index: data.position,
        item_list_name: data.list,
      }],
    });
  }
  
  // Send to Facebook Pixel if loaded and advertising allowed
  if (typeof window !== 'undefined' && (window as any).fbq && isCookieCategoryAllowed('advertising')) {
    const fbEventMap: Record<TrackingEvent, string> = {
      view: 'ViewContent',
      click: 'ViewContent',
      add_to_cart: 'AddToCart',
      remove_from_cart: 'RemoveFromCart',
      add_to_wishlist: 'AddToWishlist',
      remove_from_wishlist: 'AddToWishlist',
      checkout_start: 'InitiateCheckout',
      purchase: 'Purchase',
      search: 'Search',
      filter: 'Search',
      sort: 'Search',
    };
    
    (window as any).fbq('track', fbEventMap[event], {
      content_ids: [data.productId],
      content_name: data.productName,
      content_category: data.category,
      value: data.price,
      currency: 'USD',
    });
  }
  
  // Store in local analytics queue for batch processing
  queueAnalyticsEvent(payload);
}

/**
 * Track product view
 */
export function trackProductView(
  product: ProductTrackingData,
  tracking?: TrackingParams
): void {
  trackEvent('view', { ...product, ...tracking });
}

/**
 * Track add to cart
 */
export function trackAddToCart(
  product: ProductTrackingData,
  quantity: number,
  tracking?: TrackingParams
): void {
  trackEvent('add_to_cart', { 
    ...product, 
    ...tracking,
    quantity 
  } as any);
}

/**
 * Track add to wishlist
 */
export function trackAddToWishlist(
  product: ProductTrackingData,
  tracking?: TrackingParams
): void {
  trackEvent('add_to_wishlist', { ...product, ...tracking });
}

/**
 * Track search
 */
export function trackSearch(
  query: string,
  resultsCount: number
): void {
  trackEvent('search', {
    productId: '',
    productName: '',
    category: '',
    price: 0,
    ref: query,
    pos: resultsCount,
  });
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('analytics_session_id');
  
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  
  return sessionId;
}

/**
 * Queue analytics event for batch processing
 */
function queueAnalyticsEvent(payload: any): void {
  if (typeof window === 'undefined') return;
  
  const queue = JSON.parse(localStorage.getItem('analytics_queue') || '[]');
  queue.push(payload);
  
  // Keep only last 100 events
  const trimmedQueue = queue.slice(-100);
  localStorage.setItem('analytics_queue', JSON.stringify(trimmedQueue));
}

/**
 * Get analytics queue (for debugging/export)
 */
export function getAnalyticsQueue(): any[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('analytics_queue') || '[]');
}

/**
 * Clear analytics queue
 */
export function clearAnalyticsQueue(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('analytics_queue');
}
