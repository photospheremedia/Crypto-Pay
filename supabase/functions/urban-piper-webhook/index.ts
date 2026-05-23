/**
 * Urban Piper Webhook Handler Edge Function
 * 
 * Receives and processes Urban Piper delivery integration events.
 * 
 * POST /functions/v1/urban-piper-webhook
 * Header: X-UP-Signature (webhook signature for verification)
 */

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-UP-Signature",
};

interface UrbanPiperEvent {
  type: string;
  integration_id?: string;
  store_id?: string;
  order_id?: string;
  order_status?: string;
  [key: string]: unknown;
}

function verifyUrbanPiperSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Simple signature verification placeholder
    // In production, implement HMAC-SHA256 verification
    return true;
  } catch (_error) {
    return false;
  }
}

async function handleUrbanPiperEvent(
  supabase: ReturnType<typeof createClient>,
  event: UrbanPiperEvent
) {
  console.log(`Processing Urban Piper event: ${event.type}`);

  switch (event.type) {
    case "menu.synced": {
      const integrationId = event.integration_id as string;

      await supabase
        .from("up_delivery_integrations")
        .update({
          last_synced_at: new Date().toISOString(),
          sync_status: "success",
        })
        .eq("id", integrationId);

      console.log(`Menu synced for integration: ${integrationId}`);
      break;
    }

    case "order.received": {
      const orderId = event.order_id as string;

      // Log audit event
      await supabase.rpc("log_audit_event", {
        p_action: "delivery_order_received",
        p_resource_type: "delivery_order",
        p_resource_id: orderId,
        p_description: `Order received from Urban Piper: ${orderId}`,
      });

      console.log(`Order received: ${orderId}`);
      break;
    }

    case "order.status_changed": {
      const orderId = event.order_id as string;
      const orderStatus = event.order_status as string;

      await supabase
        .from("orders")
        .update({
          delivery_status: orderStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("up_order_id", orderId);

      console.log(`Order status updated: ${orderId} → ${orderStatus}`);
      break;
    }

    case "store.configuration_changed": {
      const storeId = event.store_id as string;

      console.log(`Store configuration changed: ${storeId}`);

      // Re-sync store configuration
      await supabase.rpc("log_audit_event", {
        p_action: "store_config_changed",
        p_resource_type: "store",
        p_resource_id: storeId,
        p_description: "Store configuration updated by Urban Piper",
      });
      break;
    }

    default:
      console.log(`Unhandled Urban Piper event type: ${event.type}`);
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
    const signature = req.headers.get("x-up-signature");
    const body = await req.text();

    const webhookSecret = Deno.env.get("URBAN_PIPER_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("URBAN_PIPER_WEBHOOK_SECRET not configured");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify signature
    if (!signature || !verifyUrbanPiperSignature(body, signature, webhookSecret)) {
      console.warn("Invalid Urban Piper webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event = JSON.parse(body) as UrbanPiperEvent;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle event
    await handleUrbanPiperEvent(supabase, event);

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Urban Piper webhook error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Webhook processing failed",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
