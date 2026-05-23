# Local Setup

## Prerequisites
- Node.js 20+
- pnpm 9+
- Supabase project (for portal auth + DB)

## Install
From the repo root:

```bash
pnpm install
```

## Run portal
```bash
pnpm dev:portal
```

Portal runs on `http://localhost:3001`.

## Optional storefront
```bash
pnpm dev:storefront
```

Storefront runs on `http://localhost:3000`.

## Supabase
Apply migrations:

```sql
-- run in order
supabase/migrations/0001_tenants.sql
supabase/migrations/0002_core.sql
supabase/migrations/0003_rebrand.sql
supabase/migrations/0004_rls_definer.sql
supabase/migrations/0005_profiles_billing.sql
supabase/migrations/0006_roles_cleanup.sql
```

## Environment files
Copy placeholders and fill values locally (do not commit secrets):

```bash
cp apps/portal/.env.example apps/portal/.env.local
```
