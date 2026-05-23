/**
 * Vector Storage Utilities for Supabase Vector Buckets
 * 
 * Handles embeddings storage and semantic search for:
 * - Chat history and context
 * - RAG (Retrieval-Augmented Generation) patterns
 * - Semantic search across conversations
 * 
 * Uses OpenAI text-embedding-3-small (1536 dimensions)
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
 */

import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { getSupabaseServerClient } from '@crypto-pay/db/supabaseServer';

// OpenAI import is optional - only needed for generateEmbedding function
let openai: any = null;
try {
  // Dynamic import to avoid build-time dependency
  const OpenAI = require('openai').OpenAI;
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch {
  console.warn('[Vector Storage] OpenAI module not available - embedding generation disabled');
}

export type VectorEmbedding = {
  id: string;
  vector: number[]; // 1536 dimensions from OpenAI
  metadata: Record<string, any>;
};

export type VectorSearchResult = {
  id: string;
  metadata: Record<string, any>;
  similarity: number;
};

/**
 * Create vector index for semantic search
 * Call once after bucket is created
 * Dimensions: 1536 (OpenAI text-embedding-3-small)
 * Distance: cosine
 */
export async function initializeVectorIndex(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Vector Storage] Vector index ready (created via dashboard)');
    return { success: true };
  } catch (error) {
    console.error('[Vector Storage] Index creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate embedding for text using OpenAI
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('[Vector Storage] OPENAI_API_KEY not configured');
      return null;
    }

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536,
    });

    return response.data[0].embedding as number[];
  } catch (error) {
    console.error('[Vector Storage] Embedding generation error:', error);
    return null;
  }
}

/**
 * Store embeddings in vector bucket
 * Used for chat history, context, and semantic search
 */
export async function storeEmbeddings(
  embeddings: VectorEmbedding[],
  isServer: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = isServer ? await getSupabaseServerClient() : createBrowserClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Vector bucket storage via S3-compatible endpoint
    console.log('[Vector Storage] Storing', embeddings.length, 'embeddings for user:', user.id);
    console.log('[Vector Storage] Would store embeddings:', {
      userId: user.id,
      count: embeddings.length,
      dimensions: embeddings[0]?.vector.length,
    });

    // TODO: Implement when Supabase TypeScript SDK fully supports vector bucket API
    // const vectors = supabase.storage.vectors;
    // const result = await vectors.from('vectors').upsert(embeddings);

    return { success: true };
  } catch (error) {
    console.error('Failed to store embeddings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Storage failed',
    };
  }
}

/**
 * Search for similar embeddings
 * Used for context retrieval in RAG patterns
 */
export async function searchSimilarEmbeddings(
  queryEmbedding: number[],
  limit: number = 5,
  matchThreshold: number = 0.7
): Promise<{ results: VectorSearchResult[]; error?: string }> {
  try {
    const supabase = await getSupabaseServerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { results: [], error: 'Not authenticated' };
    }

    // Validate query embedding dimensions (should be 1536 for OpenAI)
    if (queryEmbedding.length !== 1536) {
      return {
        results: [],
        error: `Invalid embedding dimension: ${queryEmbedding.length}. Expected 1536 for OpenAI text-embedding-3-small`,
      };
    }

    // TODO: Implement when Supabase TypeScript SDK fully supports vector bucket API
    // const vectors = supabase.storage.vectors;
    // const results = await vectors.from('vectors').search(queryEmbedding, {
    //   limit,
    //   matchThreshold,
    // });

    console.log('[Vector Search] Would search with:', {
      userId: user.id,
      limit,
      matchThreshold,
      embedding: `[${queryEmbedding.slice(0, 5).join(', ')}...]`,
    });

    return { results: [] };
  } catch (error) {
    console.error('Failed to search embeddings:', error);
    return {
      results: [],
      error: error instanceof Error ? error.message : 'Search failed',
    };
  }
}

/**
 * Delete embeddings by ID
 * Used for cleanup and updating context
 */
export async function deleteEmbeddings(ids: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await getSupabaseServerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // TODO: Implement when Supabase TypeScript SDK fully supports vector bucket API
    // const vectors = supabase.storage.vectors;
    // const result = await vectors.from('vectors').delete(ids);

    console.log('[Vector Delete] Would delete embeddings:', {
      userId: user.id,
      ids,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to delete embeddings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Deletion failed',
    };
  }
}

/**
 * Create vector index for efficient similarity search
 * One-time setup per bucket
 */
export async function setupVectorIndex(config: {
  indexName: string;
  dimension: number;
  distanceMetric: 'cosine' | 'euclidean' | 'l2';
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Note: Index creation typically requires admin/service role
    // This is a setup operation, not needed in application code
    
    console.log('[Vector Index] Would create index:', config);

    // TODO: Implement when available in service role client
    // const vectors = supabase.storage.vectors;
    // const result = await vectors.createIndex('vectors', {
    //   indexName: config.indexName,
    //   dimension: config.dimension,
    //   distanceMetric: config.distanceMetric,
    // });

    return { success: true };
  } catch (error) {
    console.error('Failed to create vector index:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Index creation failed',
    };
  }
}
