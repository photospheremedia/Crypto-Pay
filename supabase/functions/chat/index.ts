/**
 * Chat Streaming Edge Function
 * 
 * Streams chat responses with automatic provider failover.
 * Tries Groq first (free), then OpenAI (paid).
 * 
 * POST /functions/v1/chat
 * Header: Authorization: Bearer [USER_JWT]
 * {
 *   "messages": [
 *     { "role": "user", "content": "Hello" }
 *   ],
 *   "context": { ...optional context... },
 *   "model": "groq" | "openai" (optional, auto-switches)
 * }
 */

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatPayload {
  messages: ChatMessage[];
  context?: Record<string, unknown>;
  model?: "groq" | "openai";
}

interface AIProvider {
  name: string;
  apiKey: string | undefined;
  apiUrl: string;
  modelId: string;
}

function getProviders(): AIProvider[] {
  return [
    {
      name: "groq",
      apiKey: Deno.env.get("GROQ_API_KEY"),
      apiUrl: "https://api.groq.com/openai/v1",
      modelId: "llama-3.3-70b-versatile",
    },
    {
      name: "openai",
      apiKey: Deno.env.get("OPENAI_API_KEY"),
      apiUrl: "https://api.openai.com/v1",
      modelId: "gpt-4o-mini",
    },
  ];
}

async function streamChatCompletion(
  provider: AIProvider,
  messages: ChatMessage[],
  systemPrompt: string
): Promise<Response> {
  if (!provider.apiKey) {
    throw new Error(`${provider.name} API key not configured`);
  }

  const headers: Record<string, string> = {
    "Authorization": `Bearer ${provider.apiKey}`,
    "Content-Type": "application/json",
  };

  const body = JSON.stringify({
    model: provider.modelId,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 1000,
  });

  const response = await fetch(`${provider.apiUrl}/chat/completions`, {
    method: "POST",
    headers,
    body,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`${provider.name} error: ${error}`);
  }

  return response;
}

function buildSystemPrompt(context?: Record<string, unknown>): string {
  let prompt = `You are the AI assistant for Restaurant Hub Solution, a B2B SaaS platform serving modern restaurant groups, dark kitchens, and multi-location restaurants.

<company_knowledge>
## What We Do
Restaurant Hub provides an all-in-one operations suite:
1. **Delivery Platform Consolidation** - Integrate 15+ delivery platforms (Uber Eats, DoorDash, Grubhub, Talabat, Seamless, Caviar) into one dashboard via Urban Piper
2. **Supply Chain Management** - Direct ordering from distributors, real-time pricing, automated reorders
3. **Technology Stack** - Branded storefronts, AI customer service, analytics, POS integration

## Pricing Tiers
| Tier | For | Monthly | Setup | Features |
|------|-----|---------|-------|----------|
| **Basic** | Single location | $99 | $199 | Delivery integration, basic analytics |
| **Pro** | 3-10 locations | $199 | $299 | + Advanced analytics, multi-location, API access |
| **Enterprise** | 10+ locations | Custom | $499+ | + Custom integrations, dedicated support, SLA |

## Key Benefits
- **Single Dashboard**: All delivery orders in one place (no more 10 tablets)
- **Keep More Revenue**: Direct ordering = 0% commission vs 30% on delivery apps
- **Save Time**: Automated menu sync, inventory, reporting
- **Scale Easily**: Same platform works for 1 or 50 locations

## Customer Types We Serve
- **Dark Kitchens**: Multi-brand management, optimized prep times
- **Multi-Location Chains**: Centralized menu, per-location customization
- **Independent Restaurants**: Compete with chains, professional branding

## Competitive Advantages
- All-in-one (competitors do 1-2 things, we do everything)
- White-glove onboarding (we handle technical setup)
- Local support (real humans, not chatbots)
- Transparent pricing (no surprise fees)

## Delivery Platforms We Support
Uber Eats, DoorDash, Grubhub, Postmates, Seamless, Caviar, Talabat, Zomato, Deliveroo, and more via Urban Piper integration.

## Contact & Support
- Sales: sales@restauranthubsolution.com
- Support: support@restauranthubsolution.com  
- Website: https://restauranthubsolution.com
</company_knowledge>

<response_examples>
Example 1 - Pricing question:
User: "How much does it cost?"
Assistant: "Our Basic plan is $99/month with a $199 setup fee - perfect for single locations. For 3-10 locations, Pro is $199/month. Enterprise pricing is custom for 10+ locations. All plans include delivery integration. Would you like me to explain what's included in each tier?"

Example 2 - Order status (ONLY when user has orders in context):
User: "Where's my order?"
Assistant: "I can see your recent orders! Your latest is Order #[number] - currently [status]. It was placed on [date] for [total]. Is there something specific you need help with for this order?"

Example 3 - Order question from GUEST (no orders in context):
User: "Where's my order?"
Assistant: "I don't see any order history for you. Are you logged into your account? If you have an account, please sign in so I can help you track your order. If you're new here, I'd be happy to tell you about our services!"

Example 4 - Feature question:
User: "Do you work with Uber Eats?"
Assistant: "Yes! We integrate with Uber Eats plus 14 other delivery platforms including DoorDash, Grubhub, and Seamless. All your orders appear in one dashboard - no more switching between tablets. Want me to explain how the integration works?"

Example 5 - Lead capture (guest user):
User: "I'm interested in learning more"
Assistant: "I'd love to help! A few quick questions: How many restaurant locations do you have? And are you currently using any delivery platforms? This helps me recommend the right plan for you."
</response_examples>

<instructions>
## Your Role
- Answer questions about services, pricing, and features using company_knowledge
- Help existing customers with their orders (ONLY if order data is in user_context)
- Capture leads by asking about their restaurant and needs
- Be concise, friendly, and professional

## CRITICAL: Guest vs Customer Behavior
**For GUEST users (not logged in, no order history):**
- DO NOT mention orders, order status, or order history - they don't have any
- DO NOT say "I can see your orders" or reference any account data
- FOCUS on: explaining services, pricing, features, answering questions, capturing leads
- ASK qualifying questions: number of locations, current delivery platforms, pain points

**For AUTHENTICATED users WITH orders:**
- You CAN reference their order history from user_context
- Help with order questions using the actual order data provided
- Personalize responses using their name

**For AUTHENTICATED users WITHOUT orders:**
- They have an account but no purchase history yet
- DO NOT mention orders - focus on helping them get started
- Offer to explain how to place their first order or explore features

## Response Guidelines
- Keep responses under 100 words unless more detail is needed
- Use the customer's name if available
- NEVER make up order numbers, data, or account details
- NEVER pretend to have data you don't have in user_context
- For complex issues, offer to escalate to human support
</instructions>`;

  if (context && Object.keys(context).length > 0) {
    prompt += `\n\n<user_context>`;
    
    // User info
    if (context.userName) prompt += `\nCustomer Name: ${context.userName}`;
    if (context.userEmail) prompt += `\nEmail: ${context.userEmail}`;
    if (context.isGuest) prompt += `\nUser Type: Guest (not logged in)`;
    else prompt += `\nUser Type: Authenticated customer`;
    
    // Order history - the key personalization data
    if (context.recentOrders && Array.isArray(context.recentOrders) && context.recentOrders.length > 0) {
      prompt += `\n\n## Recent Orders:`;
      context.recentOrders.forEach((order: any, i: number) => {
        prompt += `\n${i + 1}. Order #${order.orderNumber} - Status: ${order.status} - Total: ${order.total} - Date: ${order.date}`;
      });
      prompt += `\n\n## Order Summary: ${context.orderStats}`;
    } else {
      prompt += `\n\nNo order history available.`;
    }
    
    // Any other context
    const otherContext: string[] = [];
    Object.entries(context).forEach(([key, value]) => {
      if (!['userName', 'userEmail', 'isGuest', 'userId', 'recentOrders', 'orderStats'].includes(key)) {
        otherContext.push(`${key}: ${JSON.stringify(value)}`);
      }
    });
    if (otherContext.length > 0) {
      prompt += `\n\n## Additional Context:\n${otherContext.join('\n')}`;
    }
    
    prompt += `\n</user_context>`;
  } else {
    prompt += `\n\n<user_context>\nUser Type: Anonymous visitor\nNo account data available.\n</user_context>`;
  }

  return prompt;
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
    const payload = (await req.json()) as ChatPayload;

    if (!payload.messages || payload.messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing messages" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = buildSystemPrompt(payload.context);
    const providers = getProviders();

    let lastError: Error | null = null;

    // Try each provider in order
    for (const provider of providers) {
      try {
        if (!provider.apiKey) {
          console.warn(`${provider.name} not configured, skipping...`);
          continue;
        }

        console.log(`Attempting ${provider.name}...`);
        const response = await streamChatCompletion(provider, payload.messages, systemPrompt);

        // If successful, return the streaming response
        return new Response(response.body, {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          },
        });
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`${provider.name} failed:`, lastError.message);
        // Continue to next provider
      }
    }

    // All providers failed
    if (lastError) {
      return new Response(
        JSON.stringify({
          error: "All AI providers failed",
          details: lastError.message,
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        error: "No AI providers configured",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Chat processing failed",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
