'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Settings2, Shield, BarChart3, ChevronDown,
  Megaphone, Cog, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
    description: 'Essential for the website to function properly. These cookies are required for basic functionality like secure login and authentication.',
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
    description: 'Used to deliver relevant content and track campaign performance. These cookies may be set by our marketing partners.',
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
      setIsVisible(true);
      setIsAnimating(true);
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
    setShowSettings(false);
    saveConsent({
      essential: true,
      functional: true,
      analytics: true,
      advertising: true,
    });
  };

  const handleRejectNonEssential = () => {
    setShowSettings(false);
    saveConsent(defaultPreferences);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
    setShowSettings(false);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'essential') return;
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Non-blocking bottom banner — page stays usable */}
      <div
        role="region"
        aria-labelledby="cookie-consent-title"
        className={`pointer-events-auto fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 shadow-lg backdrop-blur-sm transition-all duration-300 ${
          isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-4">
          <div className="min-w-0 flex-1">
            <h3 id="cookie-consent-title" className="text-sm font-semibold text-slate-900">
              Cookie preferences
            </h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              We use cookies for essential features and optional analytics.{' '}
              <Link
                href="/privacy-policy#cookies"
                className="text-emerald-600 hover:underline"
              >
                Cookie Policy
              </Link>
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <Button size="sm" onClick={handleAcceptAll}>
              Accept all
            </Button>
            <Button size="sm" variant="outline" onClick={handleRejectNonEssential}>
              Essential only
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSettings(true)}
              className="gap-1.5"
            >
              <Settings2 className="size-4" />
              Customize
            </Button>
          </div>
        </div>
      </div>

      <CookiePreferencesDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        preferences={preferences}
        expandedCategory={expandedCategory}
        onExpandedCategoryChange={setExpandedCategory}
        onTogglePreference={togglePreference}
        onSelectAll={() =>
          setPreferences({
            essential: true,
            functional: true,
            analytics: true,
            advertising: true,
          })
        }
        onDeselectAll={() => setPreferences(defaultPreferences)}
        onSave={handleSavePreferences}
      />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COOKIE PREFERENCES DIALOG (shadcn — only when user opts in)
// ═══════════════════════════════════════════════════════════════════════════════

function CookieCategoryList({
  preferences,
  expandedCategory,
  onExpandedCategoryChange,
  onTogglePreference,
}: {
  preferences: CookiePreferences;
  expandedCategory: string | null;
  onExpandedCategoryChange: (id: string | null) => void;
  onTogglePreference: (key: keyof CookiePreferences) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {cookieCategories.map((category) => {
        const Icon = category.icon;
        const isEnabled = preferences[category.id as keyof CookiePreferences];
        const isExpanded = expandedCategory === category.id;

        return (
          <div
            key={category.id}
            className={`rounded-xl border transition-all ${
              isEnabled ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`shrink-0 rounded-lg p-2 ${
                    isEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-semibold text-slate-900">{category.name}</h5>
                      {category.locked && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-600">
                          Required
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isEnabled}
                      aria-label={`${isEnabled ? 'Disable' : 'Enable'} ${category.name} cookies`}
                      disabled={category.locked}
                      onClick={() => onTogglePreference(category.id as keyof CookiePreferences)}
                      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                        isEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                      } ${category.locked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{category.description}</p>
                  <button
                    type="button"
                    onClick={() => onExpandedCategoryChange(isExpanded ? null : category.id)}
                    className="mt-2 flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-emerald-600"
                  >
                    {isExpanded ? 'Hide details' : 'View details'}
                    <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
            {isExpanded && (
              <div className="px-4 pb-4">
                <div className="ml-11 border-l-2 border-slate-200 pl-3">
                  <div className="flex flex-wrap gap-1.5">
                    {category.examples.map((example, i) => (
                      <span key={i} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
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
  );
}

function CookiePreferencesDialog({
  open,
  onOpenChange,
  preferences,
  expandedCategory,
  onExpandedCategoryChange,
  onTogglePreference,
  onSelectAll,
  onDeselectAll,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: CookiePreferences;
  expandedCategory: string | null;
  onExpandedCategoryChange: (id: string | null) => void;
  onTogglePreference: (key: keyof CookiePreferences) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cookie preferences</DialogTitle>
          <DialogDescription>
            Choose which optional cookies we may use. Essential cookies are always on.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-end gap-2 text-xs">
          <button type="button" onClick={onSelectAll} className="font-medium text-emerald-600 hover:underline">
            Select all
          </button>
          <span className="text-slate-300">|</span>
          <button type="button" onClick={onDeselectAll} className="font-medium text-slate-500 hover:underline">
            Essential only
          </button>
        </div>
        <CookieCategoryList
          preferences={preferences}
          expandedCategory={expandedCategory}
          onExpandedCategoryChange={onExpandedCategoryChange}
          onTogglePreference={onTogglePreference}
        />
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <Link
            href="/privacy-policy#cookies"
            className="text-xs text-emerald-600 hover:underline sm:mr-auto"
          >
            Cookie Policy
          </Link>
          <Button onClick={onSave} className="gap-2">
            <Check className="size-4" />
            Save preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
        className={className || "text-sm text-slate-500 hover:text-emerald-500 transition"}
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

  return (
    <CookiePreferencesDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      preferences={preferences}
      expandedCategory={expandedCategory}
      onExpandedCategoryChange={setExpandedCategory}
      onTogglePreference={togglePreference}
      onSelectAll={() =>
        setPreferences({
          essential: true,
          functional: true,
          analytics: true,
          advertising: true,
        })
      }
      onDeselectAll={() => setPreferences(defaultPreferences)}
      onSave={handleSave}
    />
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
