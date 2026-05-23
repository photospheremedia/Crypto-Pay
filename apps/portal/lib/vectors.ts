/**
 * Vector Storage Utilities for Chat Context & RAG
 * 
 * Handles embeddings generation and storage for:
 * - Chat history and context retrieval
 * - RAG (Retrieval-Augmented Generation) patterns
 * - Semantic search across conversations
 * 
 * Uses Groq embeddings API with 1536-dimensional vectors
 * Falls back to OpenAI if GROQ_API_KEY not available
 */

export type VectorEmbedding = {
  id: string;
  vector: number[];
  metadata: Record<string, any>;
};

export type VectorSearchResult = {
  id: string;
  metadata: Record<string, any>;
  similarity: number;
};

/**
 * Generate embedding for text using OpenAI
 * Returns 1536-dimensional vector or null on error
 * 
 * Note: Groq does NOT support embeddings - only chat completions.
 * OpenAI API key required for vector/RAG features.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    // OpenAI is required for embeddings (Groq doesn't have embedding models)
    if (process.env.OPENAI_API_KEY) {
      return await generateOpenAIEmbedding(text);
    }
    
    // No embedding provider available - RAG features disabled
    // This is expected if only using Groq for chat
    return null;
  } catch (error) {
    console.error('[Vector] Embedding generation error:', error);
    return null;
  }
}

/**
 * Generate embedding using OpenAI
 * Required for RAG/vector features - Groq doesn't support embeddings
 */
async function generateOpenAIEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
        dimensions: 1536,
      }),
    });

    if (!response.ok) {
      console.error('[Vector] OpenAI embedding error:', response.status);
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.embedding as number[] || null;
  } catch (error) {
    console.error('[Vector] OpenAI embedding generation error:', error);
    return null;
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error('Vector dimensions must match');
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Search for most similar vectors from a list
 */
export function searchVectors(
  queryVector: number[],
  candidates: VectorEmbedding[],
  limit: number = 5,
  threshold: number = 0.7
): VectorSearchResult[] {
  const scores = candidates
    .map((candidate) => ({
      id: candidate.id,
      metadata: candidate.metadata,
      similarity: calculateCosineSimilarity(queryVector, candidate.vector),
    }))
    .filter((result) => result.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return scores;
}

/**
 * Store conversation in memory with vector indexing
 * For client-side context management
 */
export function buildVectorIndex(
  messages: Array<{ role: string; content: string }>,
  embeddings: Record<string, number[]>
): VectorEmbedding[] {
  return messages
    .filter((msg) => msg.content && msg.content.trim().length > 0)
    .map((msg, idx) => ({
      id: `msg_${idx}_${Date.now()}`,
      vector: embeddings[idx] || [],
      metadata: {
        role: msg.role,
        content: msg.content,
        timestamp: new Date().toISOString(),
      },
    }));
}

/**
 * Retrieve relevant context for chat augmentation
 */
export async function getRelevantContext(
  query: string,
  conversationHistory: VectorEmbedding[],
  limit: number = 3
): Promise<string> {
  try {
    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);
    if (!queryEmbedding) return '';

    // Search for similar messages
    const similar = searchVectors(queryEmbedding, conversationHistory, limit, 0.5);

    // Build context string
    return similar
      .map((result) => `${result.metadata.role}: ${result.metadata.content}`)
      .join('\n\n');
  } catch (error) {
    console.error('[Vector] Context retrieval error:', error);
    return '';
  }
}

/**
 * Store vector in Supabase Vector Bucket
 * 
 * Usage:
 * const embedding = await generateEmbedding('user message');
 * await storeVectorInSupabase(supabase, {
 *   id: `msg_${conversationId}_${messageId}`,
 *   vector: embedding,
 *   metadata: { conversationId, messageId, text: 'user message', role: 'user' }
 * });
 */
export async function storeVectorInSupabase(
  supabase: any,
  vector: VectorEmbedding,
  bucketName: string = 'vectors',
  indexName: string = 'chat-embeddings-openai'
): Promise<boolean> {
  try {
    const bucket = supabase.storage.vectors.from(bucketName);
    
    const { data, error } = await bucket.putVectors({
      vectors: [{
        id: vector.id,
        vector: vector.vector,
        metadata: vector.metadata,
      }],
      upsert: true, // Update if exists
      indexName,
    });

    if (error) {
      console.error('[Vector] Store error:', error);
      return false;
    }

    console.log('[Vector] Stored vector:', vector.id);
    return true;
  } catch (error) {
    console.error('[Vector] Store exception:', error);
    return false;
  }
}

/**
 * Search vectors in Supabase Vector Bucket
 * 
 * Usage:
 * const userMessage = 'What is my order status?';
 * const embedding = await generateEmbedding(userMessage);
 * const results = await searchVectorsInSupabase(supabase, embedding, 5);
 * // Returns top 5 similar messages with metadata
 */
export async function searchVectorsInSupabase(
  supabase: any,
  queryVector: number[],
  topK: number = 5,
  bucketName: string = 'vectors',
  indexName: string = 'chat-embeddings-openai'
): Promise<VectorSearchResult[]> {
  try {
    const bucket = supabase.storage.vectors.from(bucketName);
    
    const { data, error } = await bucket.queryVectors({
      queryVector,
      topK,
      indexName,
    });

    if (error) {
      console.error('[Vector] Search error:', error);
      return [];
    }

    // Transform Supabase response to our format
    return (data?.matches || []).map((match: any) => ({
      id: match.id,
      metadata: match.metadata,
      similarity: match.similarity || 0,
    }));
  } catch (error) {
    console.error('[Vector] Search exception:', error);
    return [];
  }
}

/**
 * Retrieve chat context from Supabase Vector Bucket
 * 
 * This is the RAG pattern integration:
 * - User asks a question
 * - We generate embedding for the question
 * - We search for similar previous messages
 * - We use those as context for the AI response
 */
export async function getChatContextFromVectors(
  supabase: any,
  userMessage: string,
  limit: number = 3
): Promise<string> {
  try {
    // Generate embedding for user's message
    const embedding = await generateEmbedding(userMessage);
    if (!embedding) {
      console.log('[Vector] Could not generate embedding, skipping context');
      return '';
    }

    // Search for similar messages
    const results = await searchVectorsInSupabase(supabase, embedding, limit);
    
    if (results.length === 0) {
      console.log('[Vector] No similar messages found');
      return '';
    }

    // Build context string from results
    const context = results
      .map((result) => {
        const content = result.metadata?.content || '';
        const role = result.metadata?.role || 'assistant';
        const similarity = (result.similarity * 100).toFixed(1);
        return `${role}: ${content} (${similarity}% match)`;
      })
      .join('\n\n');

    console.log(`[Vector] Found ${results.length} context messages`);
    return context;
  } catch (error) {
    console.error('[Vector] Context retrieval exception:', error);
    return '';
  }
}

