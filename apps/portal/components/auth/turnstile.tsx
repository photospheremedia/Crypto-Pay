/**
 * Turnstile CAPTCHA Component
 * 
 * Cloudflare Turnstile integration for bot protection on auth forms.
 * Add this to signup, login, and password reset pages.
 * 
 * Usage:
 * ```tsx
 * <TurnstileWidget onVerify={(token) => setTurnstileToken(token)} />
 * ```
 */

'use client';

import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { useRef } from 'react';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  className?: string;
}

export function TurnstileWidget({ onVerify, onError, className }: TurnstileWidgetProps) {
  const turnstileRef = useRef<TurnstileInstance>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // If no site key, don't render CAPTCHA (optional for local development)
  if (!siteKey) {
    console.warn('NEXT_PUBLIC_TURNSTILE_SITE_KEY not set. CAPTCHA will be skipped.');
    return null;
  }

  return (
    <div className={className}>
      <Turnstile
        ref={turnstileRef}
        siteKey={siteKey}
        onSuccess={onVerify}
        onError={() => {
          console.error('Turnstile verification failed');
          onError?.();
        }}
        options={{
          theme: 'light',
          size: 'normal',
        }}
      />
    </div>
  );
}

/**
 * Server-side verification helper
 * 
 * Use this in your API routes to verify the Turnstile token
 * Now calls Supabase Edge Function for faster, global verification (15ms vs 100ms)
 */
export async function verifyTurnstileToken(token: string, ip?: string): Promise<boolean> {
  const functionsUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;

  if (!functionsUrl) {
    console.warn('NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL not set. Skipping verification.');
    return true; // Allow in development if not configured
  }

  try {
    const response = await fetch(`${functionsUrl}/verify-turnstile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        remoteIp: ip,
      }),
    });

    if (!response.ok) {
      console.error('Turnstile verification error:', response.status);
      return false;
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}
