# Caching Strategy for Restaurant Hub Solution

**Status**: Planning Phase | **Priority**: High | **Expected Benefit**: 40-60% reduction in database calls

---

## Executive Summary

Our performance analysis identified **27,500+ auth-related database calls** as the dominant workload. While this is expected for a web application with per-request auth verification, we can optimize this layer with strategic caching to reduce latency and database load.

**Current Bottlenecks**:
- Auth overhead: 27,500+ calls (1.4% of total query time but high volume)
- Membership lookups: 4,990 RLS policy checks (2.50s per request)
- Chat history retrieval: 5,197 sequential scans
- Session validation: O(n) lookups for user/session verification

**Post-Index Optimization Expected Gains**:
- RLS check: 2.50s → <500ms (5x improvement via covering index)
- Chat queries: 5-10x faster (via composite index)
- Auth calls: Still high volume but now faster via caching layer

---

## Caching Strategy: Three-Tier Approach

### 1. **Auth Session Caching** (Tier 1: Request-Level)
**Current State**: 27,500+ auth calls to verify user/session/identity  
**Problem**: Every API request calls `getSupabaseServerClient()` which verifies auth  
**Solution**: Cache auth state within request context (already done via Next.js request context)

#### Implementation (Already in place):
```typescript
// apps/portal/lib/supabase/server.ts
export async function getSupabaseServerClient() {
  // Supabase client initialization includes built-in session caching
  // Session is verified once per request, reused for all queries in that request
  const supabase = await createClient(); // Reuses cached session
  return supabase;
}
```

**Best Practice**: The Supabase client already caches the session within a request context. The high call count (27,500+) is expected and normal—it represents per-request auth verification, not per-query calls.

#### No Action Needed:
✅ Supabase client handles this automatically  
✅ Session tokens are cached within request lifecycle  
✅ No additional code required  

---

### 2. **Membership & Tenant Caching** (Tier 2: Cross-Request)
**Current State**: Every API route calls `resolveTenantContext()` which queries:
- `memberships` table (4,990 RLS checks)
- `tenants` table (1,236 sequential scans)  
- `user_profiles` table (implicit via auth)

**Problem**: These queries happen on every request even for the same user/tenant combination  
**Solution**: Cache with TTL using Supabase Realtime or application-level caching

#### Option A: Supabase Realtime Caching (Recommended)
Leverage existing Realtime subscriptions to maintain live cache:

```typescript
// apps/portal/lib/cache/tenant-context-cache.ts (NEW FILE)
import { createClient } from '@/lib/supabase/server';

const TENANT_CONTEXT_CACHE = new Map<string, CachedTenantContext>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export interface CachedTenantContext {
  userId: string;
  tenant: TenantWithMembers;
  membership: TenantMembership;
  cachedAt: number;
}

export async function getCachedTenantContext(
  slug: string,
  userId: string
): Promise<CachedTenantContext | null> {
  const cacheKey = `${userId}:${slug}`;
  const cached = TENANT_CONTEXT_CACHE.get(cacheKey);

  // Return cache if fresh (TTL not expired)
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
    return cached;
  }

  // Cache miss or stale - fetch fresh data
  const ctx = await resolveTenantContext(slug, userId);
  const cached_ctx = {
    userId,
    tenant: ctx.tenant,
    membership: ctx.membership,
    cachedAt: Date.now(),
  };

  TENANT_CONTEXT_CACHE.set(cacheKey, cached_ctx);

  // Setup realtime listener to invalidate cache on changes
  const supabase = await createClient();
  supabase
    .channel(`tenant:${ctx.tenant.id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'memberships',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        TENANT_CONTEXT_CACHE.delete(cacheKey); // Invalidate cache
      }
    )
    .subscribe();

  return cached_ctx;
}
```

**Benefits**:
- 5-minute TTL reduces repeated lookups from 27,500 to ~100/hour
- Realtime invalidation ensures data freshness
- No external service (Redis) required
- Integrates with Supabase native features

**Implementation Effort**: ~200 lines of code  
**Risk**: Low (cache misses fall back to fresh queries)  

---

#### Option B: Vercel KV (If Higher Performance Needed)
For distributed caching across Vercel Edge Functions:

```typescript
// apps/portal/lib/cache/vercel-kv-cache.ts
import { kv } from '@vercel/kv';

export async function getCachedTenantContextKV(slug: string, userId: string) {
  const cacheKey = `tenant:${userId}:${slug}`;
  
  // Try cache first
  const cached = await kv.get(cacheKey);
  if (cached) return cached;

  // Cache miss - fetch and store with 5 min expiry
  const ctx = await resolveTenantContext(slug, userId);
  await kv.setex(cacheKey, 300, JSON.stringify(ctx)); // 5 min TTL

  return ctx;
}
```

**Benefits**:
- Global Redis backend (Vercel KV)
- Persistent across edge function invocations
- Works with Vercel Edge Middleware

**Requirement**: Enable Vercel KV in project settings  
**Cost**: Vercel KV pricing (minimal for this use case)  

---

### 3. **Static Data Caching** (Tier 3: Long-Lived)
**Current State**: Product catalog, tenant metadata, role definitions loaded on every request  
**Problem**: These change infrequently (weekly/monthly updates)  
**Solution**: Cache with long TTL (1 hour) or use ISR (Incremental Static Regeneration)

#### Product Catalog Caching:
```typescript
// apps/portal/lib/cache/product-cache.ts
import { cache } from 'react';

// React cache: caches for duration of single request
export const getCachedProducts = cache(async (tenantId: string) => {
  return await supabase
    .from('products')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true);
});

// Application-level cache with revalidation
export const getCachedProductsWithTTL = async (tenantId: string) => {
  const cacheKey = `products:${tenantId}`;
  
  // Check cache
  const cached = appCache.get(cacheKey);
  if (cached && !cached.isExpired()) {
    return cached.data;
  }

  // Fetch and cache with 1 hour TTL
  const products = await supabase.from('products').select('*').eq('tenant_id', tenantId);
  appCache.set(cacheKey, {
    data: products,
    expiresAt: Date.now() + 3600000, // 1 hour
  });

  return products;
};
```

**Cache Strategy by Data Type**:

| Data Type | Frequency | TTL | Strategy | Benefit |
|-----------|-----------|-----|----------|---------|
| **Auth Session** | Every request | Request lifetime | Supabase client (automatic) | ✅ Already optimized |
| **User Profile** | Per user-session | 5 minutes | Memory cache + Realtime invalidation | Reduces 27,500 calls to ~100/hour |
| **Tenant Metadata** | Per user-session | 5 minutes | Memory cache + Realtime invalidation | Reduces 1,236 scans to ~50/hour |
| **Memberships** | Per API request | 5 minutes | Memory cache + Realtime invalidation | Reduces 4,990 RLS checks to ~100/hour |
| **Product Catalog** | Rarely | 1 hour | ISR + on-demand revalidation | Reduces product queries by 90% |
| **Role Definitions** | Never | Static | Bundle-time constants | Zero database calls |
| **Chat History** | Per conversation | 10 minutes | Supabase Realtime subscription | Reduces sequential scans from 5,197 to ~200 |

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
**Objective**: Add indexes + verify improvements

- [x] Create performance optimization migration (20260202230000_...)
- [ ] Deploy migration to Supabase
- [ ] Verify RLS improvement: 2.50s → <500ms
- [ ] Verify chat index: 5-10x speedup
- [ ] Document results in performance report

### Phase 2: Session Caching (Week 2)
**Objective**: Implement tier 1 & 2 caching with realtime invalidation

```typescript
// apps/portal/lib/cache/index.ts (NEW)
export * from './tenant-context-cache';
export * from './session-cache';
export * from './product-cache';
```

- [ ] Implement `getCachedTenantContext()` with Realtime invalidation
- [ ] Add cache warmup on login
- [ ] Monitor cache hit rate via metrics
- [ ] Update relevant API routes to use cached version
- [ ] Test multi-user scenarios for cache correctness

### Phase 3: Static Data Caching (Week 3)
**Objective**: Cache product catalog and admin data

- [ ] Implement ISR for product catalog
- [ ] Add revalidation tags for on-demand updates
- [ ] Cache role/permission definitions
- [ ] Cache tenant settings

### Phase 4: Monitoring & Optimization (Week 4)
**Objective**: Measure real-world improvement

- [ ] Set up metrics for:
  - Cache hit rate (target: 70%+)
  - Average query latency (target: <100ms)
  - Database load (target: 30% reduction)
- [ ] Fine-tune TTLs based on actual patterns
- [ ] Document caching strategy in README

---

## Caching Best Practices (Applied)

✅ **Do's**:
1. **Cache frequently accessed, infrequently changing data** - Tenant context (changes weekly), products (changes rarely)
2. **Use TTL to avoid stale data** - 5 min for user context, 1 hour for catalogs
3. **Invalidate on mutations** - Realtime subscriptions trigger cache clear
4. **Measure before/after** - Compare query counts and latencies
5. **Fall back gracefully** - Cache miss → fetch fresh data (no data loss)

❌ **Don'ts**:
1. Cache frequently mutated data (orders, chat messages) - Use Realtime instead
2. Cache sensitive data without encryption - User context is safe (tied to auth)
3. Cache without TTL - Could serve stale permission data
4. Forget to invalidate on updates - Causes data consistency issues
5. Cache at wrong layer - Auth should be request-level, not global

---

## Expected Improvements

### Post-Index Optimization:
- RLS check latency: 2.50s → <500ms (5x improvement)
- Chat queries: 5-10x faster
- Sequential scans: 14,253 → <100 on memberships

### Post-Caching:
- Auth call volume: 27,500 → ~100/hour per user (99.6% reduction)
- Tenant context queries: 4,990 → ~100/hour (95% reduction)
- Page load time: ~10-15% improvement
- Database CPU: ~30% reduction

### Combined Impact:
- **Dashboard responsiveness**: 50-70% faster (RLS + caching)
- **API throughput**: 2-3x higher (reduced DB calls)
- **Cost**: Reduced RU consumption in Supabase

---

## Monitoring Queries

```sql
-- Check cache effectiveness
SELECT query, calls, mean_exec_time, max_exec_time 
FROM pg_stat_statements 
WHERE query LIKE '%memberships%' 
ORDER BY calls DESC;

-- Verify index usage
SELECT indexname, idx_scan, idx_tup_read, idx_tup_fetch 
FROM pg_stat_user_indexes 
WHERE indexname LIKE 'idx_%' 
ORDER BY idx_scan DESC;

-- Session validation performance
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%user_sessions%' 
ORDER BY mean_exec_time DESC;
```

---

## FAQ

**Q: Won't caching cause stale data?**  
A: Realtime invalidation ensures freshness. Cache misses fall back to fresh queries (safe).

**Q: Why not use Redis?**  
A: Supabase Realtime is built-in and sufficient. Redis adds complexity/cost without proportional benefit for this workload.

**Q: How does this affect multi-tenant isolation?**  
A: Cache is keyed by `{userId}:{tenantId}`. Users can't access other tenants' cached data.

**Q: What if a user's role changes while cached?**  
A: Membership table change triggers Realtime event → invalidates cache → next API call gets fresh data (<100ms).

**Q: How much database load will this reduce?**  
A: Conservative estimate: 30-40% reduction. Aggressive caching could reach 50%+.

---

## Related Documents

- [docs/DATABASE.md](DATABASE.md) - Schema and query patterns
- [docs/DEPLOYMENT.md](DEPLOYMENT.md) - Performance monitoring in production
- Performance Analysis Report (from previous session)

---

**Last Updated**: 2026-02-02  
**Next Review**: After Phase 2 implementation  
**Owner**: Engineering Team
