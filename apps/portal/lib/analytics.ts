/**
 * Analytics — respects cookie consent, sends to GA/FB if loaded.
 */

import { isCookieCategoryAllowed } from '@/components/cookie-consent';

export type TrackingEvent =
  | 'page_view'
  | 'signup'
  | 'login'
  | 'wallet_connected'
  | 'payment_initiated'
  | 'payment_completed'
  | 'conversion';

export interface TrackingParams {
  campaign?: string;
  medium?: string;
  [key: string]: string | number | boolean | undefined;
}

export function trackEvent(event: TrackingEvent, data?: TrackingParams): void {
  if (!isCookieCategoryAllowed('analytics')) return;

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event, data);
  }

  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, data);
  }
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('analytics_session_id');
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', id);
  }
  return id;
}
