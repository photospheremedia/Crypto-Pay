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
  walletLinked?: boolean;
}

function buildSystemPrompt(context?: ChatContext): string {
  let prompt = `You are a helpful assistant for Crypto Pay — a platform for businesses to accept cryptocurrency payments directly to their own wallet.

WHAT CRYPTO PAY DOES:
- Merchants connect a wallet address (BTC first; more assets planned)
- They create payment links or API charges
- Customers pay on-chain; Crypto Pay tracks payment status
- Funds settle to the merchant wallet (not a pooled custody account)

PRICING:
- Standard: transparent fee per successful transaction
- Business Scale: custom volume pricing — direct users to /contact for sales

COMMUNICATION:
- Be accurate and concise. Do not invent features or metrics.
- If you do not know something, say so and suggest /contact or /faq.
- Do not reference restaurant, delivery, supply chain, or shop features.`;

  if (context && !context.isGuest) {
    const parts: string[] = [];
    if (context.userName) parts.push(`Signed-in user: ${context.userName}`);
    if (context.walletLinked) parts.push("Wallet: linked on account");
    if (parts.length) prompt += `\n\nUSER CONTEXT:\n${parts.join("\n")}`;
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

    // Optional wallet context for signed-in merchants
    let walletLinked = false;
    if (!isGuestUser && bodyUserId) {
      try {
        const supabase = await createClient();
        const { data: wallet } = await supabase
          .from("user_wallet_profiles")
          .select("wallet_address")
          .eq("user_id", bodyUserId)
          .maybeSingle();
        walletLinked = Boolean(wallet?.wallet_address);
      } catch {
        // non-blocking
      }
    }

    console.log('[Chat API] Calling AI model...');
    
    const context: ChatContext = {
      userName,
      userEmail,
      isGuest: isGuestUser,
      userId: bodyUserId,
      walletLinked,
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
