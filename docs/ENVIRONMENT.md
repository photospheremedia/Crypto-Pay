# Environment Variables

## Portal (apps/portal)
Set these in Vercel or in `apps/portal/.env.local` for local dev.

```
NEXT_PUBLIC_SUPABASE_URL=__PASTE_HERE__
NEXT_PUBLIC_SUPABASE_ANON_KEY=__PASTE_HERE__
SUPABASE_SERVICE_ROLE_KEY=__PASTE_HERE__

DELIVERY_PROVIDER_CLIENT_ID=__PASTE_HERE__
DELIVERY_PROVIDER_CLIENT_SECRET=__PASTE_HERE__
DELIVERY_PROVIDER_WEBHOOK_SECRET=__PASTE_HERE__

SKRILL_MERCHANT_EMAIL=__PASTE_HERE__
SKRILL_MERCHANT_ID=__PASTE_HERE__
SKRILL_SECRET_WORD=__PASTE_HERE__
SKRILL_API_BASE_URL=__PASTE_HERE__

NEXT_PUBLIC_APP_URL=http://localhost:3001
```

Notes:
- Use the Supabase **publishable key** for `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase renamed the legacy anon key).
- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it in the browser.
- Delivery provider values are placeholders. Add real secrets in Vercel only.
- Skrill values are required once payments are enabled.

## Storefront (apps/storefront)
Optional demo settings:

```
SITE_NAME=Restaurant Hub Solution
COMPANY_NAME=Restaurant Hub Solution
RHS_DATA_MODE=mock
RHS_PORTAL_URL=http://localhost:3001
```
