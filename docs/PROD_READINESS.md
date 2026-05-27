## Production readiness checklist (Crypto Pay)

This is a practical “ship list” with current status based on local build + Supabase MCP checks.

### Current hard blockers

#### 1) Portal build can fail due to local disk full

`pnpm build:portal` failed with **“No space left on device (os error 28)”** while writing `.next/...`.

- **Fix**: free disk space on the build machine (CI runner / dev machine) and retry.
- **Why it matters**: we can’t trust production build output until it runs to completion reliably.

### High priority security items (Supabase Advisors)

#### 2) Storage: public buckets allowed listing

Supabase Security Advisor warned that public buckets allowed listing through broad `SELECT` policies on `storage.objects`.

- **Status**: ✅ fixed (removed listing policies)
  - Dropped policies:
    - `Public can view avatars`
    - `Public can view product images`
    - `product_images_public_read`

#### 3) SECURITY DEFINER helper functions callable by authenticated

Advisor still warns about:

- `public.is_cp_admin()` (SECURITY DEFINER)
- `public.is_merchant_account(uuid)` (SECURITY DEFINER)
- `public.platform_admin_tenant_id()` (SECURITY DEFINER)

These are used as **RLS helpers** in our schema. The warning is expected when such functions are executable by `authenticated`.

- **Risk**: if any of these functions returns sensitive data (or bypasses checks), they can be called via `/rest/v1/rpc/*`.
- **Mitigation options**:
  - Keep them but ensure they only return boolean/uuid and don’t expose secrets.
  - Move them to a non-exposed schema (preferred if practical).
  - Revoke execute from `authenticated` only if we can prove RLS doesn’t rely on them.

#### 4) Auth security settings (dashboard)

Advisor still warns:

- Leaked password protection disabled
- MFA options insufficient

These are **dashboard settings**, not code.

### Multi-tenant isolation status

#### 5) RLS tenant isolation exists

Core tenant tables + membership checks exist in:

- `supabase/migrations/0001_tenants.sql`

We also enforce staff vs merchant separation via JWT realm/role logic and RLS policies (see `20260526140000_staff_merchant_rls.sql` + auth hook migrations).

### Realtime status

#### 6) Realtime enabled only where needed (safe default)

Your dashboard showed “Realtime: Disabled” for everything because tables weren’t in the `supabase_realtime` publication.

- **Status**: ✅ enabled for:
  - `public.memberships`
  - `public.chat_conversations`
  - `public.chat_messages`

We intentionally did **not** enable realtime globally.

### Edge Functions status (Supabase)

#### 7) Deployed functions should match repo intent

- **Status**: ✅ fixed — removed obsolete functions from Supabase:
  - `stripe-webhook` (deleted)
  - `urban-piper-webhook` (deleted)

**Currently deployed** (matches repo):

| Function | verify_jwt |
|----------|------------|
| `verify-turnstile` | true |
| `rate-limit-check` | false |
| `send-email` | true |
| `chat` | false |
| `runner-api` | false |

**Note**: `runner-api` is included in `supabase/scripts/build-edge-deploy-payload.mjs` for CI deploy parity.

### Portal API surface (admin vs user)

#### 8) Admin authz consistency

We have `checkAdminAccess()` and `withAdminAuth()` as the standard.

- **Action**: continue normalizing admin routes to consistently use:
  - `routeUnauthorized` / `routeForbidden` / `routeError`
  - `parseRequestJson()` for JSON bodies

### Required environment variables

Make sure runtime has:

- Supabase:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- Email + security:
  - `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- Rate limiting:
  - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Internal automation (if used):
  - `INTERNAL_API_KEY`
- BTC provider (if used):
  - `BTC_PROVIDER_API_KEY`
  - `BTC_PROVIDER_BASE_URL` (+ `BCH_PROVIDER_BASE_URL` if needed)

