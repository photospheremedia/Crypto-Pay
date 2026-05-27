## Multi-tenant security checklist

Goal: ensure **tenants cannot access other tenants’ data**.

### 1) Data model assumptions

- Tenant membership is stored in `memberships`.
- Tenant identity is stored in `tenants`.
- Admin realm vs merchant realm is derived from JWT custom claims (see `platform_realm`, `user_role`) and `checkAdminAccess()`.

### 2) Backend route rules

#### User-scoped routes

- Must only access rows belonging to `auth.uid()`, or rows restricted by RLS through membership.
- Must not accept `tenant_id` from the client (ever).
- Prefer server-side tenant resolution (`resolveTenantContext(slug)`) + query filters where needed.

#### Admin routes

- Must use `checkAdminAccess()` (or a wrapper) and check required permission per route.
- Must explicitly decide if endpoint is:
  - **platform-wide** (super admin / explicit permission), or
  - **tenant-scoped** (must apply tenant filter).

#### Internal routes

- Must require `INTERNAL_API_KEY` header gating.
- Must not expose sensitive provider errors verbatim to browser clients.

### 3) Database layer: RLS

RLS policies should enforce tenant boundaries even if an API route is buggy.

Recommended pattern (from Supabase docs) is to ensure `tenant_id` matches a claim or a membership-derived tenant context, e.g.:

- `tenant_id = (auth.jwt() ->> 'tenant_id')::uuid`, or
- membership existence checks (join on `memberships` with `auth.uid()`)

Also ensure:

- `SECURITY DEFINER` functions set a safe `search_path` and do not bypass tenant filters accidentally.
- Any “admin bypass” policy is **restrictive** and tied to explicit staff claims/roles.

### 4) Practical verification steps

For every tenant-scoped table:

- **As user A in tenant A**: can read/write own tenant rows
- **As user B in tenant B**: cannot read/write tenant A rows (should return 0 rows or 403)
- **As platform staff**: behavior must match permissions (either allowed or explicitly forbidden)

For every admin route:

- Logged out → **401**
- Logged in as merchant → **403**
- Logged in as staff without permission → **403**
- Logged in with permission → **200**

