# Vector Buckets Implementation Guide

**Status**: Alpha | **Created**: 2026-02-02  
**Purpose**: Semantic search, chat context storage, RAG patterns

## Overview

Vector buckets store AI embeddings with similarity search capabilities. Perfect for:
- Chat memory and conversation context
- Semantic search across user messages
- Retrieval-Augmented Generation (RAG)
- Low-cost vector search alternative to dedicated vector databases

## Prerequisites

### ✅ Vector Bucket Created
Your vector bucket has been successfully created in Supabase dashboard.

**S3 Connection Details**:
```
Endpoint: https://xfairwgarmpvbogiuduk.storage.supabase.co/storage/v1/s3
Region: us-east-1
Bucket: vectors
```

**Access Keys** (Store securely in `.env.local`):
- Vectors Access Key: `af95e172e18489d1b7e203bbf9c909d9b`
- Service Token: `SUPABASE_SERVICE_TOKEN_REDACTED`

**S3 Protocol Support**:
Supabase Storage supports S3-compatible clients for programmatic access.

**Note**: Local Supabase setup has limited vector functionality. Use hosted project for full features.

## Quick Start

### 1. Create Vector Bucket via SDK

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-service-role-key'  // Must use service role for bucket creation
)

// Create vector bucket
await supabase.storage.vectors.createBucket('vectors')
console.log('✓ Vector bucket created: vectors')
```

### 2. Create Vector Index

```typescript
const bucket = supabase.storage.vectors.from('vectors')

// Create embedding index for chat context
await bucket.createIndex({
  indexName: 'chat-embeddings-openai',
  dataType: 'float32',
  dimension: 1536,           // OpenAI text-embedding-3-small
  distanceMetric: 'cosine'   // Cosine similarity for text
})

console.log('✓ Index created: chat-embeddings-openai')
```

### 3. Store Embeddings

```typescript
import { OpenAI } from '@ai-sdk/openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Generate embedding for chat message
const embedding = await openai.embed({
  model: 'text-embedding-3-small',
  text: userMessage
})

// Store in vector bucket
const bucket = supabase.storage.vectors.from('vectors')
await bucket.upsert([
  {
    id: `chat_${conversationId}_${messageId}`,
    vector: embedding.embedding,  // Float32 array
    metadata: {
      conversation_id: conversationId,
      message_id: messageId,
      text_content: userMessage,
      sender: 'user',
      created_at: new Date().toISOString()
    }
  }
])
```

### 4. Search Similar Messages

```typescript
const bucket = supabase.storage.vectors.from('vectors')

// Find similar past messages
const results = await bucket.search(queryEmbedding, {
  limit: 5,
  matchThreshold: 0.7
})

// results[0].metadata contains original message context
console.log(results)
// Output:
// [
//   {
//     id: 'chat_..._123',
//     similarity: 0.92,
//     metadata: { text_content: '...', created_at: '...' }
//   },
//   ...
// ]
```

## Use Cases in Restaurant Hub

### Chat Context & Memory

```typescript
// When customer asks follow-up question, retrieve context
async function getConversationContext(conversationId: string, userQuery: string) {
  const queryEmbedding = await generateEmbedding(userQuery)
  
  const bucket = supabase.storage.vectors.from('vectors')
  const similar = await bucket.search(queryEmbedding, {
    limit: 5,
    matchThreshold: 0.6
  })
  
  // Filter to this conversation only
  const context = similar
    .filter(result => result.metadata.conversation_id === conversationId)
    .map(result => result.metadata.text_content)
  
  // Pass to LLM for context-aware response
  return context
}
```

### RAG Pattern (Restaurant Knowledge Base)

```typescript
// Store menu items, policies, procedures
async function indexMenuItems(tenant: string) {
  const menuItems = await getMenuItems(tenant)
  
  for (const item of menuItems) {
    const embedding = await generateEmbedding(item.description)
    
    await bucket.upsert([{
      id: `menu_${tenant}_${item.id}`,
      vector: embedding,
      metadata: {
        tenant_id: tenant,
        item_id: item.id,
        name: item.name,
        price: item.price,
        description: item.description,
        category: item.category
      }
    }])
  }
}

// Answer customer questions using menu context
async function answerMenuQuestion(tenant: string, question: string) {
  const queryEmbedding = await generateEmbedding(question)
  
  const results = await bucket.search(queryEmbedding, { limit: 3 })
  const menuContext = results
    .filter(r => r.metadata.tenant_id === tenant)
    .map(r => `${r.metadata.name} ($${r.metadata.price}): ${r.metadata.description}`)
    .join('\n')
  
  // Use menu context in AI response
  return await generateAIResponse(question, menuContext)
}
```

## Configuration

### Distance Metrics

| Metric | Use Case | Formula |
|--------|----------|---------|
| `cosine` | Text/semantic search | Most common, normalized distance |
| `euclidean` | Geometric similarity | Straight-line distance |
| `l2` | Neural networks | Euclidean alternative |

**Recommendation for Restaurant Hub**: Use `cosine` for all text-based embeddings (chat, menu, reviews).

### Embedding Dimensions

| Model | Dimension | Cost | Quality |
|-------|-----------|------|---------|
| text-embedding-3-small | 1536 | Low | Good ✓ |
| text-embedding-3-large | 3072 | Medium | Better |
| text-embedding-ada-002 | 1536 | High | Good |

**For Restaurant Hub**: Use `text-embedding-3-small` (1536) - perfect balance of cost and quality.

## Limits & Constraints

```typescript
// Key limits from Supabase docs
const limits = {
  maxIndexesPerBucket: 10,
  maxVectorsPerBatchOperation: 500,
  maxDimension: 4096,
  distanceMetricImmutable: true  // Cannot change after index creation
}
```

## Performance Tips

1. **Batch Operations**: Insert 500 vectors at a time for best performance
2. **Index Once**: Create indexes upfront, don't change distance metrics
3. **Metadata**: Use metadata for filtering (tenant_id, etc.)
4. **TTL**: Consider archiving old vectors if conversation history grows
5. **Threshold**: Start with matchThreshold 0.7, adjust based on results

## Error Handling

```typescript
const bucket = supabase.storage.vectors.from('vectors')

try {
  await bucket.upsert([{ /* vector */ }])
} catch (error) {
  if (error.message.includes('dimension mismatch')) {
    console.error('Embedding dimension does not match index (expected 1536)')
  } else if (error.message.includes('max_index_exceeded')) {
    console.error('Cannot create more than 10 indexes per bucket')
  }
  throw error
}
```

## Next Steps

1. ✅ Enable vector bucket in `config.toml` - DONE
2. ⬜ Create vector bucket via SDK or Dashboard
3. ⬜ Create chat-embeddings index
4. ⬜ Implement embedding generation in chat endpoint
5. ⬜ Store embeddings from chat messages
6. ⬜ Implement similarity search for context retrieval

## Related

- [Supabase Vector Buckets Docs](https://supabase.com/docs/guides/storage/vector)
- [OpenAI Embedding Models](https://platform.openai.com/docs/guides/embeddings)
- [RAG Pattern Best Practices](https://docs.anthropic.com/en/docs/build-a-system-prompt-with-retrieval)
