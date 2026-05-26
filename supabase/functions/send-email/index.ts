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
  idempotencyKey?: string;
  workflow?: {
    event?: string;
    entityId?: string;
    actorId?: string;
  };
}

async function sendViaResend(
  to: string[],
  subject: string,
  html: string,
  from: string,
  replyTo: string,
  tags?: string[],
  text?: string,
  idempotencyKey?: string,
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
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      text,
      reply_to: replyTo,
      tags: tags?.map((tag) => ({ name: tag, value: "true" })),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Resend API error (${response.status}): ${data?.message || "unknown"}`);
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
      Deno.env.get("ADMIN_REVIEW_EMAIL") ||
      "photospheremedia00@gmail.com";
    let html = payload.html || "";
    const workflowTag = payload.workflow?.event ? [`workflow:${payload.workflow.event}`] : [];
    const mergedTags = [...(payload.tags || []), ...workflowTag].slice(0, 10);

    // If template is specified, use it (simplified - can be extended)
    if (payload.template && payload.templateData) {
      // In production, you'd load actual templates from database or file
      // For now, just use the provided HTML
      html = payload.html || `<p>${JSON.stringify(payload.templateData)}</p>`;
    }

    // Send email with automatic retry
    const result = await retryWithBackoff(() =>
      sendViaResend(
        to,
        payload.subject,
        html,
        from,
        replyTo,
        mergedTags,
        payload.text,
        payload.idempotencyKey,
      )
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
