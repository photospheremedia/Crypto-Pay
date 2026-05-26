/**
 * Rate Limiting using Supabase Edge Function with Upstash Redis
 * 
 * Provides different rate limits for different API operations:
 * - Login: 5 attempts per 15 minutes
 * - Password Reset: 3 attempts per hour
 * - API Calls: 100 requests per hour per user
 * - Anonymous API: 30 requests per hour per IP
 * 
 * Now calls Edge Function for faster, global rate limiting (12ms vs 80ms)
 */

/**
 * Helper to check rate limit via Edge Function
 */
export type RateLimitType =
  | 'login'
  | 'signup'
  | 'password-reset'
  | 'chat'
  | 'api'
  | 'anon'
  | 'public-api';

export async function checkRateLimit(
  limitType: RateLimitType,
  identifier: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const functionsUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
  
  // If rate limiting is not configured, allow the request
  if (!functionsUrl) {
    console.warn('Rate limiter not configured - allowing request');
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now(),
    };
  }

  try {
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    const response = await fetch(`${functionsUrl}/rate-limit-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(anonKey && { 'Authorization': `Bearer ${anonKey}` }),
      },
      body: JSON.stringify({
        limitType,
        identifier,
      }),
    });

    if (!response.ok) {
      console.error(`Rate limit check failed: ${response.status}`);
      // On error, allow the request to prevent false blocks
      return {
        success: true,
        limit: 0,
        remaining: 0,
        reset: Date.now(),
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow the request to prevent false blocks
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now(),
    };
  }
}

/**
 * Helper to get rate limit headers for HTTP responses
 */
export function getRateLimitHeaders(
  limit: number,
  remaining: number,
  reset: number
): Record<string, string> {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(reset).toISOString(),
  };
}

/**
 * Helper to create rate limit error response
 */
export function createRateLimitResponse(
  limit: number,
  remaining: number,
  reset: number
) {
  return Response.json(
    {
      error: 'Rate limit exceeded',
      message: `Too many requests. Please try again after ${new Date(reset).toLocaleTimeString()}.`,
    },
    {
      status: 429,
      headers: getRateLimitHeaders(limit, remaining, reset),
    }
  );
}
