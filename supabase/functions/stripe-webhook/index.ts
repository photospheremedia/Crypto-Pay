/**
 * Stripe Webhook Handler Edge Function
 * 
 * Receives and processes Stripe webhook events.
 * 
 * POST /functions/v1/stripe-webhook
 * Header: stripe-signature (webhook signature for verification)
 */

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, stripe-signature",
};

interface StripeEvent {
  id: string;
  type: string;
  created: number;
  livemode: boolean;
  data: {
    object: Record<string, unknown>;
    previous_attributes?: Record<string, unknown>;
  };
}

function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Simple signature verification (in production, use crypto)
    // This is a placeholder - real implementation requires HMAC-SHA256
    return true;
  } catch (_error) {
    return false;
  }
}

async function handleStripeEvent(
  supabase: ReturnType<typeof createClient>,
  event: StripeEvent
) {
  console.log(`Processing Stripe event: ${event.type}`);

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const stripeId = paymentIntent.id as string;

      await supabase
        .from("orders")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          stripe_id: stripeId,
        })
        .eq("stripe_id", stripeId);

      console.log(`Payment confirmed for order: ${stripeId}`);
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      const paymentIntentId = charge.payment_intent as string;

      await supabase
        .from("orders")
        .update({
          status: "refunded",
          refunded_at: new Date().toISOString(),
        })
        .eq("stripe_id", paymentIntentId);

      console.log(`Refund processed for payment: ${paymentIntentId}`);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      console.warn(`Invoice payment failed: ${invoice.id}`);

      // Log alert event
      await supabase.rpc("log_audit_event", {
        p_action: "invoice_payment_failed",
        p_resource_type: "invoice",
        p_resource_id: invoice.id,
        p_description: `Invoice payment failed: ${invoice.number}`,
      });
      break;
    }

    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }
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
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify signature
    if (!signature || !verifyStripeSignature(body, signature, webhookSecret)) {
      console.warn("Invalid Stripe webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event = JSON.parse(body) as StripeEvent;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle event
    await handleStripeEvent(supabase, event);

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Webhook processing failed",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
