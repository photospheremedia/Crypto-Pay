/**
 * Chat Context Builder with Vector Support
 * 
 * Builds enhanced chat context using vector embeddings for RAG patterns
 */

import { generateEmbedding, searchVectors, VectorEmbedding } from './vectors';

export interface ChatContext {
  systemPrompt: string;
  conversationHistory: Array<{ role: string; content: string }>;
  relevantContext: string;
  metadata: {
    vectorsUsed: boolean;
    similarMessagesCount: number;
    relevanceThreshold: number;
  };
}

/**
 * Build enhanced chat context with vector-based retrieval
 */
export async function buildChatContext(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  vectorHistory: VectorEmbedding[] = [],
  enableVectors: boolean = true
): Promise<ChatContext> {
  let relevantContext = '';
  let vectorsUsed = false;
  let similarMessagesCount = 0;

  // Attempt to use vectors for context retrieval if enabled
  if (enableVectors && vectorHistory.length > 0) {
    try {
      const queryEmbedding = await generateEmbedding(userMessage);
      
      if (queryEmbedding) {
        const similarMessages = searchVectors(
          queryEmbedding,
          vectorHistory,
          5, // Retrieve top 5 similar messages
          0.6 // Relevance threshold
        );

        if (similarMessages.length > 0) {
          relevantContext = similarMessages
            .map((msg) => `${msg.metadata.role}: ${msg.metadata.content}`)
            .join('\n\n');
          
          vectorsUsed = true;
          similarMessagesCount = similarMessages.length;
          
          console.log('[Chat Context] Retrieved', similarMessagesCount, 'relevant messages via vectors');
        }
      }
    } catch (error) {
      console.error('[Chat Context] Vector retrieval failed:', error);
      // Gracefully fall back to non-vector approach
    }
  }

  // Build system prompt
  const systemPrompt = buildSystemPrompt(relevantContext);

  return {
    systemPrompt,
    conversationHistory,
    relevantContext,
    metadata: {
      vectorsUsed,
      similarMessagesCount,
      relevanceThreshold: 0.6,
    },
  };
}

/**
 * Build system prompt for the AI model
 */
function buildSystemPrompt(relevantContext: string): string {
  const basePrompt = `You are a helpful restaurant operations assistant for Restaurant Hub. 
You help restaurant owners and staff with:
- Menu management and product ordering
- Delivery platform integration (Uber Eats, DoorDash, Grubhub, etc.)
- Order tracking and fulfillment
- Supply chain and inventory management
- Analytics and business insights

Be professional, concise, and actionable in your responses.`;

  if (relevantContext) {
    return `${basePrompt}

Here is relevant context from the conversation history:
${relevantContext}

Use this context to provide informed responses.`;
  }

  return basePrompt;
}

/**
 * Format conversation history for API calls
 */
export function formatConversationForAPI(
  context: ChatContext,
  userMessage: string
): Array<{ role: string; content: string }> {
  return [
    {
      role: 'system',
      content: context.systemPrompt,
    },
    ...context.conversationHistory,
    {
      role: 'user',
      content: userMessage,
    },
  ];
}

/**
 * Extract metadata from chat context
 */
export function extractContextMetadata(context: ChatContext) {
  return {
    vector_context_used: context.metadata.vectorsUsed,
    similar_messages_retrieved: context.metadata.similarMessagesCount,
    context_length: context.relevantContext.length,
    conversation_length: context.conversationHistory.length,
  };
}
