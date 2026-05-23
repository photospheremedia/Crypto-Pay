/**
 * Email Sending Edge Function
 * 
 * Sends transactional emails via Resend with automatic retry logic.
 * 
 * POST /functions/v1/send-email
 * {
 *   "to": "user@example.com" | ["user1@example.com", "user2@example.com"],
 *   "subject": "Email Subject",
 *   "html": "<p>HTML content</p>",
 *   "template": "welcome" (optional),
 *   "templateData": {...} (optional),
 *   "replyTo": "support@example.com" (optional)
 * }
 */

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface EmailPayload {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  templateData?: Record<string, unknown>;
  from?: string;
  replyTo?: string;
  tags?: string[];
}

async function sendViaResend(
  to: string[],
  subject: string,
  html: string,
  from: string,
  replyTo: string,
  tags?: string[]
) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      reply_to: replyTo,
      tags: tags?.map((tag) => ({ name: tag, value: "true" })),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Resend API error: ${data.message}`);
  }

  return data;
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delayMs = baseDelayMs * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
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
    const payload = (await req.json()) as EmailPayload;

    // Validate required fields
    if (!payload.to || !payload.subject) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!payload.html && !payload.text && !payload.template) {
      return new Response(
        JSON.stringify({ error: "Missing content: provide html, text, or template" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const to = Array.isArray(payload.to) ? payload.to : [payload.to];
    const from =
      payload.from ||
      Deno.env.get("EMAIL_FROM") ||
      "Crypto Pay <noreply@cryptopay.sale>";
    const replyTo =
      payload.replyTo ||
      Deno.env.get("EMAIL_REPLY_TO") ||
      "support@cryptopay.sale";
    let html = payload.html || "";

    // If template is specified, use it (simplified - can be extended)
    if (payload.template && payload.templateData) {
      // In production, you'd load actual templates from database or file
      // For now, just use the provided HTML
      html = payload.html || `<p>${JSON.stringify(payload.templateData)}</p>`;
    }

    // Send email with automatic retry
    const result = await retryWithBackoff(() =>
      sendViaResend(to, payload.subject, html, from, replyTo, payload.tags)
    );

    console.log(`📧 Email sent successfully: ${result.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to send email",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
