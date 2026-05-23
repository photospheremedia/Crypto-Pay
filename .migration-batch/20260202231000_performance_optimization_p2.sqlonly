-- Performance Optimization Migration - Part 2
-- Created: 2026-02-02
-- Purpose: Complete the remaining indexes from performance optimization
-- Note: idx_memberships_rls_optimization was created in previous attempt

-- ============================================================================
-- 1. CHAT CONVERSATION FILTERING INDEX
-- ============================================================================
-- Problem: chat_conversations table shows 5,197 sequential scans
-- Root cause: Missing index on user filtering + sorting by created_at
-- Solution: Composite index for user-based queries with descending time sort
--
-- Typical query pattern:
--   SELECT * FROM chat_conversations 
--   WHERE user_id = $1 
--   ORDER BY created_at DESC 
--   LIMIT 20;
--
-- This index optimizes:
-- - Filtering by user_id (common in chat history retrieval)
-- - Sorting by created_at (descending for latest-first pagination)
-- - Reduces sequential scans from 5,197 to near-zero

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_created
ON chat_conversations (user_id, created_at DESC)
INCLUDE (id, status, lead_status, message_count);

COMMENT ON INDEX idx_chat_conversations_user_created IS
'Chat conversation filtering index for user-based history retrieval.
Optimizes: WHERE user_id = ? ORDER BY created_at DESC pagination pattern.
Reduces sequential scans from 5,197 to near-zero.
Expected improvement: 5-10x faster chat history queries.';

-- ============================================================================
-- 2. TENANT FILTERING INDEX
-- ============================================================================
-- Problem: Some queries filter by tenant_id + status across multiple tables
-- Note: Primary key tenants_pkey already exists
-- This adds support for tenant-based queries with status filtering
-- Improvement: Reduces sequential scans for tenant filtering

CREATE INDEX IF NOT EXISTS idx_tenants_status_created
ON tenants (status, created_at DESC)
WHERE status = 'active';

COMMENT ON INDEX idx_tenants_status_created IS
'Tenant status filtering with time-based sort.
Partial index: only includes active tenants (status = active).
Improves tenant list views and dashboard queries.
Reduces index bloat by excluding deleted/inactive tenants.';

-- ============================================================================
-- 3. USER SESSION INDEX (for caching strategy)
-- ============================================================================
-- Problem: Auth overhead is 27,500+ calls (expected but can be cached)
-- Solution: Index for fast user session lookups with expiry
-- This supports caching layer optimization in application code
-- Note: expires_at already has an index, this adds user_id for combined lookups

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active
ON user_sessions (user_id, expires_at DESC);

COMMENT ON INDEX idx_user_sessions_user_active IS
'User session lookup index with expiry time.
Optimizes: WHERE user_id = ? AND expires_at > ? queries.
Supports caching strategy by enabling fast lookups of valid sessions.
Expected improvement: Session validation from O(n) to O(log n).';

-- ============================================================================
-- STATISTICS & ANALYSIS
-- ============================================================================
-- Update statistics to help query planner recognize new indexes
-- This ensures the optimizer will consider these indexes in query plans

ANALYZE chat_conversations;
ANALYZE tenants;
ANALYZE user_sessions;

-- ============================================================================
-- VERIFICATION STEPS (Run after deployment)
-- ============================================================================
-- 1. Check index creation was successful:
--    SELECT * FROM pg_indexes 
--    WHERE indexname LIKE 'idx_%' 
--    ORDER BY schemaname, tablename, indexname;
--
-- 2. Verify improvement via Supabase CLI:
--    supabase inspect db index-stats --linked
--    (Should show all three new indexes in use)
--
-- 3. Check sequential scan reduction:
--    supabase inspect db table-stats --linked
--    (chat_conversations should drop from 5,197 scans to <100)
--
-- 4. Verify total optimization:
--    supabase inspect db calls --linked
--    (Auth overhead should remain constant, but queries should be faster)
