/**
 * RAG Chat Integration Module
 * 
 * Drop-in module to add RAG (vector context) to your chat endpoint
 * No changes needed elsewhere - just call enhanceChatWithContext()
 */

import { getChatContextFromVectors, generateEmbedding, storeVectorInSupabase } from './vectors';
import type { SupabaseClient } from '@supabase/supabase-js';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

/**
 * Add RAG context to chat messages
 * 
 * Usage:
 * const { messagesWithContext, context } = await enhanceChatWithContext(
 *   supabase,
 *   messages,
 *   conversationId,
 *   userId
 * );
 * 
 * Then pass messagesWithContext to your AI API
 */
export async function enhanceChatWithContext(
  supabase: SupabaseClient<any>,
  messages: ChatMessage[],
  conversationId: string,
  userId: string,
  contextLimit: number = 3
): Promise<{
  messagesWithContext: ChatMessage[];
  context: string;
  contextCount: number;
}> {
  try {
    // Get the last user message
    const lastUserMessage = messages[messages.length - 1];
    if (!lastUserMessage || lastUserMessage.role !== 'user') {
      return {
        messagesWithContext: messages,
        context: '',
        contextCount: 0,
      };
    }

    // Get vector context (similar previous messages)
    const context = await getChatContextFromVectors(
      supabase,
      lastUserMessage.content,
      contextLimit
    );

    // Build enhanced messages
    const messagesWithContext: ChatMessage[] = [
      ...messages,
      // Insert context before the last user message if we found any
      ...(context
        ? [{
            role: 'system' as MessageRole,
            content: `Relevant context from conversation history:\n${context}`,
          }]
        : []),
    ];

    // Count how many context items were added
    const contextCount = context ? context.split('\n\n').length : 0;

    return {
      messagesWithContext,
      context,
      contextCount,
    };
  } catch (error) {
    console.error('[RAG] Error enhancing chat context:', error);
    return {
      messagesWithContext: messages,
      context: '',
      contextCount: 0,
    };
  }
}

/**
 * Store conversation messages for future RAG
 * 
 * Usage (after getting AI response):
 * await storeConversationForRAG(
 *   supabase,
 *   conversationId,
 *   userId,
 *   userMessage,
 *   aiResponse
 * );
 */
export async function storeConversationForRAG(
  supabase: SupabaseClient<any>,
  conversationId: string,
  userId: string,
  userMessage: string,
  aiResponse: string
): Promise<{ success: boolean; messagesStored: number }> {
  try {
    const timestamp = new Date().toISOString();
    const messageTimestamp = Date.now();

    // Generate embeddings
    const [userEmbedding, aiEmbedding] = await Promise.all([
      generateEmbedding(userMessage),
      generateEmbedding(aiResponse),
    ]);

    if (!userEmbedding || !aiEmbedding) {
      console.warn('[RAG] Could not generate embeddings');
      return { success: false, messagesStored: 0 };
    }

    // Store both messages
    const [userStored, aiStored] = await Promise.all([
      storeVectorInSupabase(supabase, {
        id: `msg_${conversationId}_user_${messageTimestamp}`,
        vector: userEmbedding,
        metadata: {
          conversationId,
          userId,
          content: userMessage,
          role: 'user',
          timestamp,
        },
      }),
      storeVectorInSupabase(supabase, {
        id: `msg_${conversationId}_assistant_${messageTimestamp + 1}`,
        vector: aiEmbedding,
        metadata: {
          conversationId,
          userId,
          content: aiResponse,
          role: 'assistant',
          timestamp,
        },
      }),
    ]);

    return {
      success: userStored && aiStored,
      messagesStored: (userStored ? 1 : 0) + (aiStored ? 1 : 0),
    };
  } catch (error) {
    console.error('[RAG] Error storing conversation:', error);
    return { success: false, messagesStored: 0 };
  }
}

/**
 * Initialize RAG for a conversation
 * 
 * Usage (at start of conversation):
 * const ragSession = await initializeRAGSession(supabase, userId);
 * 
 * Later:
 * const { messagesWithContext } = await enhanceChatWithContext(
 *   supabase,
 *   messages,
 *   ragSession.conversationId,
 *   userId
 * );
 */
export async function initializeRAGSession(
  supabase: SupabaseClient<any>,
  userId: string
): Promise<{
  conversationId: string;
  createdAt: string;
}> {
  const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const createdAt = new Date().toISOString();

  console.log('[RAG] Initialized session:', { conversationId, userId, createdAt });

  return {
    conversationId,
    createdAt,
  };
}

/**
 * Full RAG chat flow
 * 
 * Usage (in your chat endpoint):
 * const { userMessage } = req.json();
 * const { messagesWithContext } = await enhanceChatWithContext(
 *   supabase,
 *   messages,
 *   conversationId,
 *   userId
 * );
 * 
 * const aiResponse = await callYourAI(messagesWithContext);
 * 
 * await storeConversationForRAG(
 *   supabase,
 *   conversationId,
 *   userId,
 *   userMessage,
 *   aiResponse
 * );
 */
export async function executeChatWithRAG(
  supabase: SupabaseClient<any>,
  messages: ChatMessage[],
  conversationId: string,
  userId: string,
  callAI: (messages: ChatMessage[]) => Promise<string>
): Promise<{
  response: string;
  contextUsed: number;
  storedForFuture: boolean;
}> {
  try {
    // Enhance with context
    const { messagesWithContext, contextCount } = await enhanceChatWithContext(
      supabase,
      messages,
      conversationId,
      userId
    );

    // Get AI response
    const aiResponse = await callAI(messagesWithContext);

    // Store for future context
    const userMessage = messages[messages.length - 1]?.content || '';
    const { success } = await storeConversationForRAG(
      supabase,
      conversationId,
      userId,
      userMessage,
      aiResponse
    );

    return {
      response: aiResponse,
      contextUsed: contextCount,
      storedForFuture: success,
    };
  } catch (error) {
    console.error('[RAG] Chat execution error:', error);
    throw error;
  }
}
