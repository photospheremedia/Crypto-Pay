import { createClient } from "@/lib/supabase/server";
import { enhanceChatWithContext } from "@/lib/rag-chat";
import { checkRateLimit, createRateLimitResponse } from '@/lib/rate-limit';
import { createGroq } from '@ai-sdk/groq';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, convertToModelMessages } from 'ai';

// Use Edge Runtime for faster global performance (streaming up to 30s)
export const runtime = 'edge';
export const maxDuration = 30;

// Type definitions for chat context
interface ChatContext {
  userName?: string;
  userEmail?: string;
  isGuest: boolean;
  userId?: string;
  recentOrders?: Array<{ orderNumber: string; status: string; total: string; date: string; shipping: string }>;
  orderStats?: string;
}

interface OrderRecord {
  id: string;
  order_number: string;
  status: string;
  total_cents: number;
  created_at: string;
  shipping_method?: string;
}

/**
 * Build system prompt with optional customer context
 * Context helps personalize responses but is gracefully optional
 */
function buildSystemPrompt(context?: ChatContext): string {
  let prompt = `You are a friendly and knowledgeable AI assistant for Restaurant Hub Solution, a B2B SaaS platform that helps restaurant operators manage their business more efficiently.

CORE SERVICES:
1. **Delivery Integration (via Urban Piper)**: Consolidate 15+ delivery platforms (Uber Eats, DoorDash, Grubhub, etc.) into one dashboard
2. **Supply Chain Marketplace**: Direct ordering from suppliers with real-time pricing and automated reorders
3. **Technology Services**: Branded storefronts, AI chatbots, analytics, and POS integrations

PRICING TIERS:
- Basic: $99/mo + $199 setup - Single location, delivery integration, basic analytics
- Pro: $199/mo + $299 setup - Multi-location, advanced analytics, API access
- Enterprise: Custom pricing + $499+ setup - Custom integrations, dedicated support, SLA

COMMUNICATION STYLE:
- Be warm, professional, and helpful
- Use simple language, avoid jargon
- Be concise but thorough
- If unsure about specific details, acknowledge it and offer to connect them with a human
- Encourage scheduling a demo for complex questions`;

  if (context && !context.isGuest) {
    const contextParts: string[] = [];
    
    if (context.userName) {
      contextParts.push(`Customer name: ${context.userName}`);
    }
    
    if (context.recentOrders?.length) {
      contextParts.push(`Recent orders: ${context.recentOrders.map(o => `${o.orderNumber} (${o.status})`).join(', ')}`);
    }
    
    if (context.orderStats) {
      contextParts.push(`Order history: ${context.orderStats}`);
    }
    
    if (contextParts.length > 0) {
      prompt += `\n\nCUSTOMER CONTEXT:\n${contextParts.join('\n')}`;
    }
  }

  return prompt;
}

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    // Parse and validate request
    const body = await req.json();
    const { messages, userName: clientUserName, userId: bodyUserId, userEmail: clientUserEmail, isGuest, conversationId } = body;
    
    // Early validation - empty or invalid messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid or empty messages" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Rate limiting to protect API keys
    const rateLimitIdentifier = bodyUserId || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await checkRateLimit(bodyUserId ? 'api' : 'anon', rateLimitIdentifier);
    
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.limit, rateLimitResult.remaining, rateLimitResult.reset);
    }
    
    // Get authenticated user info (fallback to client-provided if auth fails)
    let userName = clientUserName;
    let userEmail = clientUserEmail;
    let isGuestUser = isGuest ?? true;
    
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        userName = userName || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0];
        userEmail = userEmail || user.email;
        isGuestUser = false;
      }
    } catch (error) {
      // Auth retrieval failed - continue with guest context (graceful degradation)
    }

    // ✨ OPTIONAL: Enhance with RAG context (vector similarity search)
    // Requires OPENAI_API_KEY for embeddings (Groq doesn't support embeddings)
    // Gracefully falls back if not configured
    
    // Convert AI SDK UI messages to simple {role, content} format
    // AI SDK UI format: {role, parts: [{type, text}]} -> {role, content}
    const simpleMessages: { role: 'user' | 'assistant' | 'system'; content: string }[] = messages.map((msg: any) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.parts?.map((p: any) => p.text).join('') || msg.content || '',
    }));
    
    let enhancedMessages = simpleMessages;
    let contextCount = 0;
    try {
      if (conversationId && bodyUserId && process.env.OPENAI_API_KEY) {
        const supabase = await createClient();
        const { messagesWithContext, contextCount: count } = await enhanceChatWithContext(
          supabase,
          simpleMessages,
          conversationId,
          bodyUserId,
          2 // Use 2 most similar messages for context
        );
        enhancedMessages = messagesWithContext;
        contextCount = count;
        if (contextCount > 0) {
          console.log(`[Chat API] ✨ Added ${contextCount} context messages from vector search`);
        }
      }
    } catch (error) {
      // Vector enhancement failed - continue with original messages (no breaking)
      console.log('[Chat API] Vector enhancement skipped:', error instanceof Error ? error.message : error);
      enhancedMessages = simpleMessages;
    }

    // Fetch user's order history if authenticated
    let recentOrders: any[] = [];
    let orderStats = { totalOrders: 0, totalSpent: 0 };
    
    if (!isGuestUser && bodyUserId) {
      try {
        const supabase = await createClient();
        
        // Get recent orders (last 5)
        const { data: orders } = await supabase
          .from('orders')
          .select('id, order_number, status, total_cents, created_at, shipping_method')
          .eq('user_id', bodyUserId)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (orders && orders.length > 0) {
          recentOrders = orders.map(o => ({
            orderNumber: o.order_number,
            status: o.status,
            total: `$${(o.total_cents / 100).toFixed(2)}`,
            date: new Date(o.created_at).toLocaleDateString(),
            shipping: o.shipping_method || 'Standard'
          }));
          
          // Get order stats
          const { data: stats } = await supabase
            .from('orders')
            .select('total_cents')
            .eq('user_id', bodyUserId);
          
          if (stats) {
            orderStats.totalOrders = stats.length;
            orderStats.totalSpent = stats.reduce((sum, o) => sum + (o.total_cents || 0), 0) / 100;
          }
        }
        console.log(`[Chat API] Loaded ${recentOrders.length} orders for user context`);
      } catch (err) {
        console.log('[Chat API] Could not fetch order history:', err);
      }
    }

    console.log('[Chat API] Calling AI model...');
    
    // Build context object for system prompt
    const context: ChatContext = {
      userName,
      userEmail,
      isGuest: isGuestUser,
      userId: bodyUserId,
      ...(recentOrders.length > 0 && {
        recentOrders,
        orderStats: `${orderStats.totalOrders} orders, $${orderStats.totalSpent.toFixed(2)} total spent`
      })
    };

    // Use Groq as primary provider (fast, free tier)
    // Falls back to OpenAI if Groq is not configured
    const groqApiKey = process.env.GROQ_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!groqApiKey && !openaiApiKey) {
      console.error('[Chat API] No AI provider configured (GROQ_API_KEY or OPENAI_API_KEY)');
      return new Response(
        JSON.stringify({ error: "Chat service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      // Create provider - prefer Groq (faster, free), fallback to OpenAI
      let result;
      
      if (groqApiKey) {
        const groq = createGroq({ apiKey: groqApiKey });
        result = streamText({
          model: groq('llama-3.3-70b-versatile'),
          system: buildSystemPrompt(context),
          messages: enhancedMessages,
          temperature: 0.7,
        });
        console.log('[Chat API] Using Groq provider');
      } else {
        const openai = createOpenAI({ apiKey: openaiApiKey });
        result = streamText({
          model: openai('gpt-4o-mini'),
          system: buildSystemPrompt(context),
          messages: enhancedMessages,
          temperature: 0.7,
          maxOutputTokens: 1000,
        });
        console.log('[Chat API] Using OpenAI provider');
      }

      // Return AI SDK UI Message Stream format (compatible with useChat hook)
      return result.toUIMessageStreamResponse();
    } catch (aiError) {
      console.error('[Chat API] AI provider error:', aiError);
      return new Response(
        JSON.stringify({ error: "Chat service error" }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Chat API error:", error);
    
    // Track chat completion with error
    const durationMs = Date.now() - startTime;
    // TODO: trackChatCompleted(sessionId, userId, messages?.length || 0, durationMs);
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
