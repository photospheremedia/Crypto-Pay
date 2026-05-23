/**
 * Cloudflare Turnstile Verification Edge Function
 * 
 * Verifies Turnstile CAPTCHA tokens from client-side form submissions.
 * 
 * POST /functions/v1/verify-turnstile
 * {
 *   "token": "turnstile_token_from_client",
 *   "remoteIp": "user_ip_address"
 * }
 */

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface TurnstileRequest {
  token: string;
  remoteIp?: string;
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
    const { token, remoteIp } = (await req.json()) as TurnstileRequest;

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Missing token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const secretKey = Deno.env.get("TURNSTILE_SECRET_KEY");
    if (!secretKey) {
      console.error("TURNSTILE_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify with Cloudflare
    const verifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    const verifyResponse = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        remoteip: remoteIp,
      }),
    });

    const result = await verifyResponse.json();

    if (!verifyResponse.ok) {
      console.error("Turnstile verification failed:", result);
      return new Response(
        JSON.stringify({ success: false, error: "Verification failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: result.success === true,
        errorCodes: result["error-codes"] || [],
        challengeTs: result.challenge_ts,
        hostname: result.hostname,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error verifying Turnstile:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
