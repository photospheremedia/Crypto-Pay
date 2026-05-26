/**
 * Rate Limiting Check Edge Function
 * 
 * Checks and enforces rate limits using Upstash Redis.
 * Runs as middleware before main request handling.
 * 
 * POST /functions/v1/rate-limit-check
 * {
 *   "identifier": "user_id_or_ip",
 *   "limitType": "login" | "signup" | "api" | "anon" | "passwordReset"
 * }
 */

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

const limitConfigs: Record<string, RateLimitConfig> = {
  login: { maxRequests: 5, windowSeconds: 900 }, // 5 per 15 min (brute force protection)
  signup: { maxRequests: 5, windowSeconds: 3600 }, // 5 per hour
  "password-reset": { maxRequests: 3, windowSeconds: 3600 },
  passwordReset: { maxRequests: 3, windowSeconds: 3600 }, // legacy alias
  chat: { maxRequests: 20, windowSeconds: 900 }, // 20 per 15 min
  api: { maxRequests: 300, windowSeconds: 3600 }, // authenticated dashboard
  anon: { maxRequests: 30, windowSeconds: 3600 }, // guest / anonymous
  "public-api": { maxRequests: 120, windowSeconds: 3600 }, // analytics, misc public POST
};

interface RateLimitRequest {
  identifier: string;
  limitType: string;
}

async function checkRedisLimit(
  redisUrl: string,
  redisToken: string,
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const response = await fetch(
    `${redisUrl}/incr/${key}`,
    {
      headers: {
        "Authorization": `Bearer ${redisToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Redis error");
  }

  const data = await response.json();
  const currentCount = data.result;

  // Set expiration on first request
  if (currentCount === 1) {
    await fetch(`${redisUrl}/expire/${key}/${windowSeconds}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${redisToken}`,
      },
    });
  }

  const remaining = Math.max(0, maxRequests - currentCount);
  const isLimited = currentCount > maxRequests;
  const resetTimestamp = Date.now() + (windowSeconds * 1000);

  return {
    success: !isLimited,
    limit: maxRequests,
    remaining,
    reset: resetTimestamp,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const payload = (await req.json()) as RateLimitRequest;

    if (!payload.identifier || !payload.limitType) {
      return new Response(
        JSON.stringify({ error: "Missing identifier or limitType" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config = limitConfigs[payload.limitType];
    if (!config) {
      return new Response(
        JSON.stringify({ error: `Unknown limitType: ${payload.limitType}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const redisUrl = Deno.env.get("UPSTASH_REDIS_REST_URL");
    const redisToken = Deno.env.get("UPSTASH_REDIS_REST_TOKEN");

    if (!redisUrl || !redisToken) {
      console.warn("Redis not configured, allowing request");
      return new Response(
        JSON.stringify({
          success: true,
          limit: config.maxRequests,
          remaining: config.maxRequests,
          reset: Date.now() + (config.windowSeconds * 1000),
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const key = `ratelimit:${payload.limitType}:${payload.identifier}`;
    const result = await checkRedisLimit(
      redisUrl,
      redisToken,
      key,
      config.maxRequests,
      config.windowSeconds
    );

    if (!result.success) {
      const retryAfterSeconds = Math.ceil((result.reset - Date.now()) / 1000);
      return new Response(
        JSON.stringify({
          success: false,
          limit: result.limit,
          remaining: result.remaining,
          reset: result.reset,
          error: "Rate limit exceeded",
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(retryAfterSeconds),
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Rate limit check error:", error);
    return new Response(
      JSON.stringify({ error: "Rate limit check failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
