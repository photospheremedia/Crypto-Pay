# Analytics & Vector Buckets - Implementation Checklist

**Status**: Configuration & Documentation ✅ COMPLETE  
**Last Updated**: 2026-02-02

---

## ✅ What's Been Done

### Configuration
- [x] Enabled `storage.analytics` in `supabase/config.toml`
- [x] Enabled `storage.vector` in `supabase/config.toml`
- [x] Added analytics bucket definition
- [x] Added vectors bucket definition

### Cleanup & Migration
- [x] Created migration to remove incorrectly-created file buckets
- [x] Migration includes deletion of old vectors/analytics buckets
- [x] Migration includes detailed instructions for proper setup

### Documentation
- [x] Created `VECTOR_BUCKETS_SETUP.md` - Complete implementation guide
- [x] Created `ANALYTICS_BUCKETS_SETUP.md` - Complete implementation guide
- [x] Created `BUCKETS_FIX_SUMMARY.md` - Overview of changes
- [x] Created this checklist for next steps

---

## 📋 Next Steps (In Order)

### Phase 1: Apply Migration (Required First)
- [ ] Run: `supabase db push --include-all`
- [ ] Verify old buckets deleted from Supabase Dashboard
- [ ] Confirm no errors in migration output

### Phase 2: Vector Implementation (For Chat Context)
- [x] ✅ Vector bucket created in dashboard
- [x] ✅ Access key obtained: `af95e172e18489d1b7e203bbf9c909d9b`
- [ ] Create vector index:
  - [ ] Index name: `chat-embeddings-openai`
  - [ ] Dimension: 1536 (for OpenAI text-embedding-3-small)
  - [ ] Distance metric: cosine
  - [ ] Data type: float32
- [ ] Add credentials to `.env.local` (see [S3_ANALYTICS_CREDENTIALS.md](S3_ANALYTICS_CREDENTIALS.md))
- [ ] Implement in chat endpoint:
  - [ ] Generate embeddings for user messages
  - [ ] Store embeddings with metadata (conversation_id, message_id)
  - [ ] Query similar messages for context
  - [ ] Pass context to LLM for awareness

### Phase 3: Analytics Implementation (For Event Tracking)
- [x] ✅ Analytics bucket created in dashboard
- [x] ✅ Access key obtained: `6fed82842ac56074b2fd924c7fb43849`
- [x] ✅ Iceberg Catalog URI available
- [ ] Add credentials to `.env.local` (see [S3_ANALYTICS_CREDENTIALS.md](S3_ANALYTICS_CREDENTIALS.md))
- [ ] Design event schema:
  - [ ] Order events (order_placed, order_delivered)
  - [ ] Revenue events (payment_processed, refund_issued)
  - [ ] Customer events (customer_signup, customer_action)
  - [ ] System events (performance_metric, error_logged)
- [ ] Implement event logging:
  - [ ] Track orders with metadata (amount, platform, prep_time)
  - [ ] Track customer actions with context (device, referral)
  - [ ] Track revenue by platform and time period
- [ ] Build analytics queries:
  - [ ] Daily revenue dashboard
  - [ ] Platform performance comparison
  - [ ] Peak order times analysis
  - [ ] Customer behavior insights
- [ ] Set up real-time replication (optional):
  - [ ] Sync orders → analytics automatically
  - [ ] Sync customers → analytics automatically
  - [ ] Sync payments → analytics automatically

---

## 🎯 Implementation Timeline

| Phase | Task | Est. Time | Status |
|-------|------|-----------|--------|
| 1 | Run migration | 5 min | ⏳ Ready |
| 2 | Vector bucket creation | 10 min | ⏳ Awaiting migration |
| 2 | Vector index setup | 10 min | ⏳ Awaiting bucket |
| 2 | Chat endpoint integration | 2-3 hours | ⏳ Design phase |
| 3 | Request analytics access | 48 hours | ⏳ To start |
| 3 | Analytics bucket creation | 10 min | ⏳ Awaiting approval |
| 3 | Event schema design | 1-2 hours | ⏳ Requirements |
| 3 | Event logging implementation | 3-5 hours | ⏳ Development |
| 3 | Analytics queries & dashboards | 2-4 hours | ⏳ Design phase |

**Total estimated time**: 1-2 weeks (vectors 2-3 days, analytics 1-2 weeks)

---

## 📚 Reference Guide

### Vector Buckets
**Purpose**: Store AI embeddings, enable semantic search, power chat context

**Key Files**:
- [VECTOR_BUCKETS_SETUP.md](VECTOR_BUCKETS_SETUP.md) - Complete guide
- [AI_CHAT_SETUP.md](AI_CHAT_SETUP.md) - Existing chat implementation

**Key Decisions**:
- Embedding model: OpenAI `text-embedding-3-small` (1536 dim)
- Distance metric: Cosine (for text similarity)
- Max indexes: 10 per bucket
- Max batch size: 500 vectors per operation

**Code Examples**:
```typescript
// Create bucket
await supabase.storage.vectors.createBucket('vectors')

// Create index
await bucket.createIndex({
  indexName: 'chat-embeddings-openai',
  dimension: 1536,
  distanceMetric: 'cosine'
})

// Store embedding
await bucket.upsert([{
  id: `chat_${conversationId}_${messageId}`,
  vector: embedding,
  metadata: { conversation_id, message_id, text: '...' }
}])

// Search similar
const results = await bucket.search(queryEmbedding, { limit: 5 })
```

### Analytics Buckets
**Purpose**: Track events, analyze trends, build business intelligence

**Key Files**:
- [ANALYTICS_BUCKETS_SETUP.md](ANALYTICS_BUCKETS_SETUP.md) - Complete guide
- [docs/DATABASE.md](DATABASE.md) - Database schema reference

**Key Decisions**:
- Event types: Orders, revenue, customers, system
- Data format: Denormalized JSON in Iceberg
- Query method: Postgres FDW (native SQL)
- Retention: Configurable (default 90 days)

**Code Examples**:
```typescript
// Create bucket (after access approval)
await supabase.storage.analytics.createBucket('analytics')

// Insert events
await analytics.insert([{
  event_id: uuid(),
  event_type: 'order_placed',
  tenant_id: tenantId,
  timestamp: new Date(),
  data: { order_id, amount, platform, ... }
}])

// Query analytics
const { data } = await supabase
  .from('analytics')
  .select('event_type, count(*), sum(data->>amount)')
  .eq('tenant_id', tenantId)
  .group_by('event_type')
```

---

## 🔍 Verification Checklist (After Migration)

- [ ] Migration runs without errors
- [ ] `supabase migration list --linked` shows new migration as applied
- [ ] Old `vectors` bucket is deleted from Storage
- [ ] Old `analytics` bucket is deleted from Storage
- [ ] `config.toml` shows both bucket types enabled
- [ ] No errors in Supabase console/logs

---

## ⚠️ Important Notes

### Local Development
- Analytics buckets **NOT available** in local Supabase setup
- Vector buckets may have **limited functionality** locally
- Test vectors locally, but analytics requires hosted project

### Analytics Access
- Currently **Private Alpha** - requires form submission
- Wait **48 hours** for access approval
- Only available on **Supabase Pro plan**
- Request at: https://forms.supabase.com/analytics-buckets

### Storage Limits
- Vector bucket: Max 10 indexes, 500 vectors/batch
- Analytics bucket: Max 5 namespaces, 10 tables/namespace
- No automatic cleanup - implement retention policies

---

## 💡 Pro Tips

### Vectors
- Start with smaller batch sizes (50-100) while testing
- Test matchThreshold values (0.6-0.8) for your use case
- Consider archiving old conversation vectors monthly
- Store metadata for filtering (tenant_id, user_id, etc.)

### Analytics
- Design event schema before implementation
- Denormalize data (avoid needing joins in queries)
- Use ISO 8601 timestamps consistently
- Include tenant_id in every event for multi-tenant isolation
- Test queries before going to production

---

## 🚀 Success Criteria

### Vector Buckets ✓ when:
- [x] Bucket created and verified in Storage
- [ ] Index created with correct dimensions & distance metric
- [ ] Can store embeddings without errors
- [ ] Can retrieve similar messages with correct results
- [ ] Chat endpoint uses context in responses
- [ ] Performance acceptable (< 500ms retrieval)

### Analytics Buckets ✓ when:
- [ ] Access approved and bucket created
- [ ] Events logging consistently to analytics
- [ ] Queries return correct aggregated data
- [ ] Dashboard displays key metrics
- [ ] Multi-tenant isolation verified
- [ ] Performance acceptable (< 5s for queries)

---

## 📞 Support

**For questions about vectors**: See [VECTOR_BUCKETS_SETUP.md](VECTOR_BUCKETS_SETUP.md)  
**For questions about analytics**: See [ANALYTICS_BUCKETS_SETUP.md](ANALYTICS_BUCKETS_SETUP.md)  
**Official docs**: https://supabase.com/docs/guides/storage/  
**Community**: https://discord.supabase.com/

---

**Last Updated**: 2026-02-02  
**Prepared By**: AI Coding Agent  
**Status**: Ready for implementation
