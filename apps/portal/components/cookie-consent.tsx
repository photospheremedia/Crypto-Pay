'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Cookie, X, Settings2, Shield, BarChart3, ChevronDown, ChevronUp, 
  Megaphone, Cog, ExternalLink, Check, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export interface CookiePreferences {
  essential: boolean;       // Always true - cannot be disabled
  functional: boolean;      // Site preferences, personalization
  analytics: boolean;       // Usage tracking, performance
  advertising: boolean;     // Marketing, retargeting, third-party ads
}

export interface ConsentRecord {
  preferences: CookiePreferences;
  timestamp: string;
  version: string;
  ipHash?: string;
  userAgent?: string;
}

// Cookie tiers matching major companies (Sysco, Google, Amazon)
export const COOKIE_TIERS = {
  ESSENTIAL: 'essential',
  FUNCTIONAL: 'functional', 
  ANALYTICS: 'analytics',
  ADVERTISING: 'advertising',
} as const;

const COOKIE_CONSENT_KEY = 'rhs-cookie-consent';
const COOKIE_PREFERENCES_KEY = 'rhs-cookie-preferences';
const CONSENT_VERSION = '2.0.0'; // Bump this to re-ask for consent
const CONSENT_EXPIRY_MONTHS = 13; // GDPR requirement

const defaultPreferences: CookiePreferences = {
  essential: true,
  functional: false,
  analytics: false,
  advertising: false,
};

// Cookie category details for user information
const cookieCategories = [
  {
    id: 'essential',
    name: 'Strictly Necessary',
    description: 'Essential for the website to function properly. These cookies are required for basic functionality like secure login, shopping cart, and checkout.',
    examples: ['Session cookies', 'Authentication tokens', 'CSRF protection', 'Load balancing'],
    locked: true,
    icon: Shield,
    color: 'orange',
  },
  {
    id: 'functional',
    name: 'Functional',
    description: 'Enable personalized features and remember your preferences like language, region, and display settings.',
    examples: ['Language preferences', 'Recently viewed items', 'Theme settings', 'Location data'],
    locked: false,
    icon: Cog,
    color: 'blue',
  },
  {
    id: 'analytics',
    name: 'Analytics & Performance',
    description: 'Help us understand how visitors interact with our website by collecting and reporting anonymous usage information.',
    examples: ['Google Analytics', 'Page views', 'Session duration', 'Error tracking', 'Hotjar'],
    locked: false,
    icon: BarChart3,
    color: 'violet',
  },
  {
    id: 'advertising',
    name: 'Advertising & Marketing',
    description: 'Used to deliver relevant advertisements and track campaign performance. These cookies may be set by our advertising partners.',
    examples: ['Google Ads', 'Facebook Pixel', 'Retargeting', 'Cross-site tracking', 'LinkedIn Insight'],
    locked: false,
    icon: Megaphone,
    color: 'amber',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// TRACKING SCRIPT LOADERS (only load when consent is given)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Load Google Analytics (GA4) - requires analytics consent
 */
function loadGoogleAnalytics(measurementId: string): void {
  if (typeof window === 'undefined') return;
  if ((window as any).gtag) return; // Already loaded
  
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
  
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).gtag = function() {
    (window as any).dataLayer.push(arguments);
  };
  (window as any).gtag('js', new Date());
  (window as any).gtag('config', measurementId, {
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure',
  });
  
  console.log('[Cookies] Google Analytics loaded');
}

/**
 * Load Google Tag Manager - requires advertising consent
 */
function loadGoogleTagManager(containerId: string): void {
  if (typeof window === 'undefined') return;
  if ((window as any).google_tag_manager) return;
  
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js'
  });
  
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
  document.head.appendChild(script);
  
  console.log('[Cookies] Google Tag Manager loaded');
}

/**
 * Load Facebook Pixel - requires advertising consent
 */
function loadFacebookPixel(pixelId: string): void {
  if (typeof window === 'undefined') return;
  if ((window as any).fbq) return;
  
  // Facebook Pixel initialization
  (function(f: any, b: any, e: any, v: any) {
    if (f.fbq) return;
    const n: any = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    const t = b.createElement(e);
    t.async = !0;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  
  (window as any).fbq('init', pixelId);
  (window as any).fbq('track', 'PageView');
  
  console.log('[Cookies] Facebook Pixel loaded');
}

/**
 * Load LinkedIn Insight Tag - requires advertising consent
 */
function loadLinkedInInsight(partnerId: string): void {
  if (typeof window === 'undefined') return;
  if ((window as any)._linkedin_data_partner_ids) return;
  
  (window as any)._linkedin_partner_id = partnerId;
  (window as any)._linkedin_data_partner_ids = (window as any)._linkedin_data_partner_ids || [];
  (window as any)._linkedin_data_partner_ids.push(partnerId);
  
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
  document.head.appendChild(script);
  
  console.log('[Cookies] LinkedIn Insight loaded');
}

/**
 * Load Hotjar - requires analytics consent
 */
function loadHotjar(hjid: number, hjsv: number): void {
  if (typeof window === 'undefined') return;
  if ((window as any).hj) return;
  
  (window as any).hj = (window as any).hj || function() {
    ((window as any).hj.q = (window as any).hj.q || []).push(arguments);
  };
  (window as any)._hjSettings = { hjid, hjsv };
  
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://static.hotjar.com/c/hotjar-${hjid}.js?sv=${hjsv}`;
  document.head.appendChild(script);
  
  console.log('[Cookies] Hotjar loaded');
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSENT MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Initialize tracking scripts based on current consent
 */
function initializeTracking(preferences: CookiePreferences): void {
  // Only run on client
  if (typeof window === 'undefined') return;
  
  // Analytics scripts (require analytics consent)
  if (preferences.analytics) {
    // Replace with your actual IDs in production
    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    const HOTJAR_ID = process.env.NEXT_PUBLIC_HOTJAR_ID;
    
    if (GA_MEASUREMENT_ID) {
      loadGoogleAnalytics(GA_MEASUREMENT_ID);
    }
    
    if (HOTJAR_ID) {
      loadHotjar(parseInt(HOTJAR_ID), 6);
    }
  }
  
  // Advertising scripts (require advertising consent)
  if (preferences.advertising) {
    const GTM_CONTAINER_ID = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID;
    const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
    const LINKEDIN_PARTNER_ID = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID;
    
    if (GTM_CONTAINER_ID) {
      loadGoogleTagManager(GTM_CONTAINER_ID);
    }
    
    if (FB_PIXEL_ID) {
      loadFacebookPixel(FB_PIXEL_ID);
    }
    
    if (LINKEDIN_PARTNER_ID) {
      loadLinkedInInsight(LINKEDIN_PARTNER_ID);
    }
  }
  
  // Send consent signal to Google
  if ((window as any).gtag) {
    (window as any).gtag('consent', 'update', {
      'analytics_storage': preferences.analytics ? 'granted' : 'denied',
      'ad_storage': preferences.advertising ? 'granted' : 'denied',
      'ad_user_data': preferences.advertising ? 'granted' : 'denied',
      'ad_personalization': preferences.advertising ? 'granted' : 'denied',
      'functionality_storage': preferences.functional ? 'granted' : 'denied',
      'personalization_storage': preferences.functional ? 'granted' : 'denied',
    });
  }
}

/**
 * Check if consent has expired (13 months per GDPR)
 */
function isConsentExpired(): boolean {
  if (typeof window === 'undefined') return false;
  
  const consentData = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!consentData) return true;
  
  try {
    const record: ConsentRecord = JSON.parse(consentData);
    
    // Check version - if version changed, re-ask for consent
    if (record.version !== CONSENT_VERSION) return true;
    
    // Check expiry
    const consentDate = new Date(record.timestamp);
    const expiryDate = new Date(consentDate);
    expiryDate.setMonth(expiryDate.getMonth() + CONSENT_EXPIRY_MONTHS);
    
    return new Date() > expiryDate;
  } catch {
    return true;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [isAnimating, setIsAnimating] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has already consented and it hasn't expired
    const hasConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const isExpired = isConsentExpired();
    
    if (!hasConsent || isExpired) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences and initialize tracking
      const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        setPreferences(prefs);
        initializeTracking(prefs);
      }
    }
  }, []);

  const saveConsent = useCallback((prefs: CookiePreferences) => {
    // Create consent record for audit trail
    const consentRecord: ConsentRecord = {
      preferences: prefs,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };
    
    // Save to localStorage
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentRecord));
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    
    setPreferences(prefs);
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);

    // Initialize tracking based on new preferences
    initializeTracking(prefs);

    // Dispatch event for other components to react
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: prefs }));
    
    // Log consent for debugging
    console.log('[Cookies] Consent saved:', prefs);
  }, []);

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      functional: true,
      analytics: true,
      advertising: true,
    });
  };

  const handleRejectNonEssential = () => {
    saveConsent(defaultPreferences);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'essential') return;
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Disable page scroll when banner is visible (professional pattern)
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Dark Overlay - blocks page interaction until consent is given */}
      <div 
        className={`fixed inset-0 z-99 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />
      
      {/* Cookie Consent Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        className={`fixed inset-0 z-100 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Modal Container - Full height on mobile, centered card on desktop */}
        <div 
          className={`w-full sm:max-w-2xl lg:max-w-3xl bg-white sm:rounded-2xl shadow-2xl overflow-hidden transition-transform duration-300 ${
            isAnimating ? 'translate-y-0' : 'translate-y-full sm:translate-y-8'
          } max-h-dvh sm:max-h-[90vh] flex flex-col`}
        >
          {/* Main Banner */}
          <div className="p-5 sm:p-6 shrink-0">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-teal-600 shadow-lg">
                <Cookie className="h-7 w-7 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Mobile Header with Icon */}
                <div className="flex items-center gap-3 sm:hidden mb-3">
                  <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-teal-600 shadow">
                    <Cookie className="h-5 w-5 text-white" />
                  </div>
                  <h3 id="cookie-consent-title" className="text-lg font-bold text-slate-900">
                    Your Privacy Choices
                  </h3>
                </div>
                
                {/* Desktop Header */}
                <h3 id="cookie-consent-title" className="hidden sm:block text-xl font-bold text-slate-900">
                  Your Privacy Choices
                </h3>
                
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  We use cookies to enhance your experience, analyze site traffic, and serve personalized content and advertising. 
                  You can accept all cookies, reject non-essential ones, or customize your preferences.
                </p>

                {/* Quick Stats - Hidden on very small screens */}
                <div className="mt-3 hidden xs:flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5 text-orange-500" />
                    <strong className="text-slate-700">4</strong> categories
                  </span>
                  <span className="flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 text-blue-500" />
                    GDPR & CCPA compliant
                  </span>
                  <Link 
                    href="/privacy-policy#cookies" 
                    className="flex items-center gap-1 text-orange-500 hover:text-orange-600 hover:underline"
                  >
                    Cookie Policy
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

                {/* Action Buttons - Stack on mobile, inline on larger screens */}
                <div className="mt-5 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
                  {/* Primary: Accept All - Full width on mobile */}
                  <Button
                    onClick={handleAcceptAll}
                    className="w-full sm:w-auto rounded-xl bg-orange-500 hover:bg-orange-600 text-base sm:text-sm px-8 py-4 sm:py-3 h-auto font-bold shadow-md hover:shadow-lg transition-all order-1"
                  >
                    ✓ Accept All Cookies
                  </Button>
                  
                  {/* Secondary: Reject - Equal prominence on mobile */}
                  <Button
                    onClick={handleRejectNonEssential}
                    variant="outline"
                    className="w-full sm:w-auto rounded-xl text-base sm:text-sm px-6 py-4 sm:py-3 h-auto font-semibold border-2 border-slate-400 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-500 transition-all order-2"
                  >
                    ✗ Reject All
                  </Button>
                  
                  {/* Tertiary: Customize - Text link style on mobile */}
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base sm:text-sm font-semibold text-slate-600 hover:text-orange-500 transition px-4 py-3 rounded-xl hover:bg-slate-100 order-3"
                  >
                    <Settings2 className="h-4 w-4" />
                    Customize Settings
                    {showSettings ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cookie Settings Panel - Scrollable on mobile */}
          {showSettings && (
            <div className="border-t border-slate-200 bg-slate-50 flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Cookie Preferences
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreferences({
                        essential: true,
                        functional: true,
                        analytics: true,
                        advertising: true,
                      })}
                      className="text-xs font-medium text-orange-500 hover:text-orange-600 hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      onClick={() => setPreferences(defaultPreferences)}
                      className="text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {cookieCategories.map((category) => {
                    const Icon = category.icon;
                    const isEnabled = preferences[category.id as keyof CookiePreferences];
                    const isExpanded = expandedCategory === category.id;
                    
                    return (
                      <div
                        key={category.id}
                        className={`rounded-xl border transition-all ${
                          isEnabled 
                            ? 'bg-white border-orange-200 shadow-sm' 
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        {/* Category Header */}
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`shrink-0 p-2 rounded-lg ${
                              isEnabled 
                                ? `bg-${category.color}-100 text-${category.color}-600`
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <h5 className="text-sm font-semibold text-slate-900">
                                    {category.name}
                                  </h5>
                                  {category.locked && (
                                    <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold uppercase rounded-full">
                                      Always Active
                                    </span>
                                  )}
                                </div>
                                
                                {/* Toggle */}
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked="true"
                                  aria-label={`${isEnabled ? 'Disable' : 'Enable'} ${category.name} cookies`}
                                  disabled={category.locked}
                                  onClick={() => togglePreference(category.id as keyof CookiePreferences)}
                                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                                    isEnabled ? 'bg-orange-500' : 'bg-slate-300'
                                  } ${category.locked ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                              </div>
                              
                              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                                {category.description}
                              </p>
                              
                              {/* Expand/Collapse */}
                              <button
                                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                                className="mt-2 text-xs font-medium text-slate-500 hover:text-orange-500 flex items-center gap-1"
                              >
                                {isExpanded ? 'Hide details' : 'View details'}
                                <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-0">
                            <div className="ml-11 pl-3 border-l-2 border-slate-200">
                              <p className="text-xs font-medium text-slate-600 mb-2">Examples of cookies in this category:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {category.examples.map((example, i) => (
                                  <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-[11px] rounded-md">
                                    {example}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Footer - Sticky on mobile */}
              <div className="px-4 sm:px-6 py-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <p className="text-xs text-slate-500 text-center sm:text-left">
                  By clicking "Save Preferences", you agree to our{' '}
                  <Link href="/privacy-policy" className="text-orange-500 hover:underline">
                    Privacy Policy
                  </Link>
                  {' '}and{' '}
                  <Link href="/terms-of-service" className="text-orange-500 hover:underline">
                    Terms of Service
                  </Link>
                </p>
                <Button
                  onClick={handleSavePreferences}
                  className="w-full sm:w-auto rounded-xl bg-orange-500 hover:bg-orange-600 text-base sm:text-sm px-6 py-3 sm:py-2.5 h-auto font-semibold flex items-center justify-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COOKIE SETTINGS BUTTON (for footer/settings page)
// ═══════════════════════════════════════════════════════════════════════════════

export function CookieSettingsButton({ className }: { className?: string }) {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={className || "text-sm text-slate-500 hover:text-orange-500 transition"}
      >
        Cookie Settings
      </button>
      
      {showModal && (
        <CookieSettingsModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COOKIE SETTINGS MODAL (for managing cookies after initial consent)
// ═══════════════════════════════════════════════════════════════════════════════

function CookieSettingsModal({ onClose }: { onClose: () => void }) {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  useEffect(() => {
    const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
  }, []);
  
  const handleSave = () => {
    const consentRecord: ConsentRecord = {
      preferences,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };
    
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentRecord));
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: preferences }));
    initializeTracking(preferences);
    
    onClose();
  };
  
  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'essential') return;
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  
  // Block page scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);
  
  return (
    <div className="fixed inset-0 z-200 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-settings-title"
        className="relative bg-white sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-dvh sm:max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-linear-to-br from-orange-500 to-teal-600 flex items-center justify-center">
                <Cookie className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 id="cookie-settings-title" className="text-lg font-bold text-slate-900">Cookie Preferences</h3>
                <p className="text-xs text-slate-500">Manage your privacy settings</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              aria-label="Close cookie settings"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="space-y-3">
            {cookieCategories.map((category) => {
              const Icon = category.icon;
              const isEnabled = preferences[category.id as keyof CookiePreferences];
              const isExpanded = expandedCategory === category.id;
              
              return (
                <div
                  key={category.id}
                  className={`rounded-xl border transition-all ${
                    isEnabled 
                      ? 'bg-orange-50/50 border-orange-200' 
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`shrink-0 p-2 rounded-lg ${
                        isEnabled ? 'bg-orange-100 text-orange-500' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-semibold text-slate-900">{category.name}</h5>
                            {category.locked && (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-bold uppercase rounded-full">
                                Required
                              </span>
                            )}
                          </div>
                          
                          <button
                            type="button"
                            role="switch"
                            aria-checked="true"
                            aria-label={`${isEnabled ? 'Disable' : 'Enable'} ${category.name} cookies`}
                            disabled={category.locked}
                            onClick={() => togglePreference(category.id as keyof CookiePreferences)}
                            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                              isEnabled ? 'bg-orange-500' : 'bg-slate-300'
                            } ${category.locked ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                                isEnabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                        
                        <p className="mt-1 text-xs text-slate-500">{category.description}</p>
                        
                        <button
                          onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                          className="mt-2 text-xs font-medium text-slate-500 hover:text-orange-500 flex items-center gap-1"
                        >
                          {isExpanded ? 'Hide details' : 'View cookies'}
                          <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <div className="ml-11 pl-3 border-l-2 border-slate-200">
                        <div className="flex flex-wrap gap-1.5">
                          {category.examples.map((example, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-[11px] rounded-md">
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shrink-0">
          <Link href="/privacy-policy#cookies" className="text-xs text-orange-500 hover:underline flex items-center justify-center sm:justify-start gap-1">
            View Cookie Policy
            <ExternalLink className="h-3 w-3" />
          </Link>
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button variant="outline" onClick={onClose} className="rounded-xl h-12 sm:h-auto">
              Cancel
            </Button>
            <Button onClick={handleSave} className="rounded-xl bg-orange-500 hover:bg-orange-600 h-12 sm:h-auto">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK FOR COMPONENTS TO CHECK CONSENT
// ═══════════════════════════════════════════════════════════════════════════════

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (savedPrefs) {
      setConsent(JSON.parse(savedPrefs));
    }

    const handleConsentChange = (e: CustomEvent<CookiePreferences>) => {
      setConsent(e.detail);
    };

    window.addEventListener('cookieConsentChanged', handleConsentChange as EventListener);
    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange as EventListener);
    };
  }, []);

  return {
    consent,
    hasConsent: consent !== null,
    isAnalyticsAllowed: consent?.analytics ?? false,
    isAdvertisingAllowed: consent?.advertising ?? false,
    isFunctionalAllowed: consent?.functional ?? false,
  };
}

/**
 * Check if a specific cookie category is allowed
 */
export function isCookieCategoryAllowed(category: keyof CookiePreferences): boolean {
  if (typeof window === 'undefined') return false;
  
  const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
  if (!savedPrefs) return category === 'essential';
  
  try {
    const prefs: CookiePreferences = JSON.parse(savedPrefs);
    return prefs[category] ?? false;
  } catch {
    return category === 'essential';
  }
}
