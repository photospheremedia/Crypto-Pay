## API style guide (portal backend)

This document defines how we design and document backend endpoints so:

- **Admin tooling** is predictable and safe
- **User API calls** are consistent and easy to consume
- **Multi-tenant isolation** is preserved (no cross-tenant reads/writes)

This is modeled after “API reference” style docs where each endpoint has:

- **Purpose**
- **Auth requirements**
- **Request** (method, path, query/body schema)
- **Response** (shape + examples)
- **Errors** (status codes + `code`)

### Route grouping

- **Public/user routes**: `apps/portal/app/api/**`
  - Example: `GET /api/user`
- **Admin routes**: `apps/portal/app/api/admin/**`
  - Must enforce admin permissions using `checkAdminAccess()` (or wrappers).
- **Internal automation routes**: `apps/portal/app/api/internal/**`
  - Never called by browsers directly.
  - Require `INTERNAL_API_KEY` + `x-internal-key`.

### Auth & authorization (Next.js Route Handlers)

Per Next.js route handler guidance, every handler must enforce:

- **Authentication**: return **401** when no session/user
- **Authorization**: return **403** when user lacks role/permission

We implement admin checks via `checkAdminAccess()` and use explicit permission gates.
See Next.js docs excerpt for the two-tier pattern (401 then 403): `/vercel/next.js` docs (Next.js v16 route handlers + auth guidance).

### Standard error format

Use the shared helpers in `apps/portal/lib/api/route-error.ts`:

- `routeUnauthorized()` → `{ error, code: "unauthorized" }` (401)
- `routeForbidden()` → `{ error, code: "forbidden" }` (403)
- `routeBadRequest()` → `{ error, code: "bad_request" }` (400)
- `routeError()` → `{ error, code? }` (defaults 500)

Avoid ad-hoc `{ error: "..." }` unless there is a strong reason.

### Request body parsing

Prefer `parseRequestJson()` from `apps/portal/lib/api/parse-request-json.ts` so invalid JSON becomes a **400**, not a 500.

### Caching & runtime

Route handlers should explicitly choose runtime when it matters:

- `export const runtime = "nodejs"` for most endpoints
- `export const runtime = "edge"` only when we need edge latency and can comply with edge constraints

Use route segment config `runtime` per Next.js v16 docs.

### Data access rules (multi-tenant safety)

**Golden rule**: a user-scoped endpoint must never accept a `tenant_id` from the client.
Tenant context must come from:

- **RLS + `auth.uid()`** policies, or
- server-side tenant resolution (e.g. `resolveTenantContext(slug)`) and then filtering by that tenant.

Admin endpoints may legitimately access cross-tenant data **only** with explicit permissions (e.g. `canManageAllTenants`).

### Endpoint documentation template

Copy/paste this template into new endpoint docs:

#### <NAME>

- **Method**: `GET|POST|PATCH|DELETE`
- **Path**: `/api/...`
- **Auth**:
  - **401** if not signed in
  - **403** if missing permission `<permission>`
- **Request**
  - **Query**: `...?a=b`
  - **Body**: JSON schema (zod) summary
- **Response**
  - **200**: `{ success: true, data: ... }`
- **Errors**
  - **400**: `{ error, code: "bad_request" }`
  - **401**: `{ error, code: "unauthorized" }`
  - **403**: `{ error, code: "forbidden" }`
  - **500**: `{ error }`

