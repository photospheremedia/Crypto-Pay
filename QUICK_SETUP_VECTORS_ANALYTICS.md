# Quick Setup Guide - Analytics & Vector Buckets

**Status**: ✅ Buckets Created | Credentials Ready | Implementation Starting  
**Date**: 2026-02-02

---

## 🚀 Next Steps (In Order)

### Step 1: Add Credentials to `.env.local`
```bash
# In apps/portal/.env.local, add:

# Analytics S3
ANALYTICS_BUCKET_NAME=analytics
ANALYTICS_ACCESS_KEY_ID=6fed82842ac56074b2fd924c7fb43849

# Vectors S3
VECTORS_BUCKET_NAME=vectors
VECTORS_ACCESS_KEY_ID=af95e172e18489d1b7e203bbf9c909d9b

# S3 Endpoint (shared)
S3_ENDPOINT=https://xfairwgarmpvbogiuduk.storage.supabase.co/storage/v1/s3
S3_REGION=us-east-1

# Iceberg Catalog
ICEBERG_CATALOG_URI=https://xfairwgarmpvbogiuduk.storage.supabase.co/storage/v1/iceberg

# Supabase Service Token
SUPABASE_SERVICE_TOKEN=sb_secret_your_token_here
```

### Step 2: Create Vector Index (Required for semantic search)

```typescript
// Run this once to set up the vector index
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xfairwgarmpvbogiuduk.supabase.co',
  process.env.SUPABASE_SERVICE_TOKEN  // Use service token from .env
)

async function setupVectorIndex() {
  const bucket = supabase.storage.vectors.from('vectors')
  
  try {
    await bucket.createIndex({
      indexName: 'chat-embeddings-openai',
      dataType: 'float32',
      dimension: 1536,        // OpenAI text-embedding-3-small
      distanceMetric: 'cosine'
    })
    console.log('✓ Vector index created')
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✓ Vector index already exists')
    } else {
      console.error('Failed to create vector index:', error)
    }
  }
}

setupVectorIndex()
```

### Step 3: Test Vector Storage

```typescript
// Test storing and retrieving embeddings
import { createClient } from '@supabase/supabase-js'
import { openai } from '@ai-sdk/openai'

const supabase = createClient(
  'https://xfairwgarmpvbogiuduk.supabase.co',
  process.env.SUPABASE_SERVICE_TOKEN
)

async function testVectorStorage() {
  // 1. Generate embedding
  const embedding = await openai.embed({
    model: 'text-embedding-3-small',
    text: 'Test message for storage'
  })
  
  // 2. Store in vector bucket
  const bucket = supabase.storage.vectors.from('vectors')
  await bucket.upsert([{
    id: 'test_message_1',
    vector: embedding.embedding,
    metadata: {
      text: 'Test message for storage',
      created_at: new Date().toISOString()
    }
  }])
  console.log('✓ Embedding stored')
  
  // 3. Search for similar embeddings
  const results = await bucket.search(embedding.embedding, { limit: 5 })
  console.log('✓ Search results:', results)
}

testVectorStorage()
```

### Step 4: Test Analytics Events

```typescript
// Test storing analytics events
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xfairwgarmpvbogiuduk.supabase.co',
  process.env.SUPABASE_SERVICE_TOKEN
)

async function testAnalyticsEvent() {
  const analytics = supabase.storage.analytics.from('analytics')
  
  // Store test event
  await analytics.insert([{
    event_id: `test_event_${Date.now()}`,
    event_type: 'test_event',
    tenant_id: 'test-tenant',
    timestamp: new Date().toISOString(),
    data: {
      test_value: 123,
      test_string: 'Hello Analytics'
    }
  }])
  
  console.log('✓ Test event stored')
}

testAnalyticsEvent()
```

---

## 📚 Documentation Reference

| Document | Purpose | When to Read |
|----------|---------|--------------|
| [S3_ANALYTICS_CREDENTIALS.md](S3_ANALYTICS_CREDENTIALS.md) | Credentials & environment setup | Now (step 1) |
| [VECTOR_BUCKETS_SETUP.md](VECTOR_BUCKETS_SETUP.md) | Vector implementation details | Implementing semantic search |
| [ANALYTICS_BUCKETS_SETUP.md](ANALYTICS_BUCKETS_SETUP.md) | Analytics implementation details | Implementing event tracking |
| [BUCKETS_IMPLEMENTATION_CHECKLIST.md](BUCKETS_IMPLEMENTATION_CHECKLIST.md) | Full checklist & timeline | Planning implementation |

---

## 🔍 Verification Checklist

Before moving forward:
- [ ] `.env.local` has all credentials added
- [ ] Can connect to Supabase via SDK
- [ ] Vector index created successfully
- [ ] Can store embeddings without errors
- [ ] Can search vectors with relevant results
- [ ] Can store analytics events without errors
- [ ] All credentials are secure and not committed to Git

---

## 💡 Key Points

✅ **Buckets Ready**: Both analytics and vectors created  
✅ **Credentials Available**: All S3 keys and tokens provided  
✅ **Configuration Updated**: `config.toml` enables both bucket types  
✅ **Migration Ready**: Cleanup migration prepared when needed  

---

## 🚨 Security Reminder

⚠️ **Keep credentials secret**:
- Store in `.env.local` (gitignored)
- Never commit to Git
- Use environment variables in production
- Rotate keys if exposed

---

## What's Next?

**Vectors** (Chat Context):
1. Create index ✅ (see Step 2 above)
2. Implement chat endpoint to store/retrieve embeddings
3. Use context in AI responses

**Analytics** (Event Tracking):
1. Design event schema (orders, revenue, customers)
2. Log events from throughout the app
3. Build analytics queries and dashboards

**Estimated Timeline**:
- Vectors: 2-3 days of development
- Analytics: 1-2 weeks (event schema + implementation)
- Total: ~2 weeks to full feature set

---

## Troubleshooting

### "Cannot connect to S3 endpoint"
→ Check credentials in `.env.local`  
→ Verify S3_ENDPOINT is correct  
→ Make sure SUPABASE_SERVICE_TOKEN is valid  

### "Dimension mismatch" when storing vectors
→ Ensure embedding has 1536 dimensions (for text-embedding-3-small)  
→ Check that dataType is 'float32'  

### "Vector index not found"
→ Run Step 2 above to create index  
→ Verify index name is 'chat-embeddings-openai'  

---

**Ready to start? Begin with Step 1 above.** 🚀
