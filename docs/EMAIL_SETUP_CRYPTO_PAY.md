# Email setup (Resend)

Crypto Pay sends transactional email through **Resend**. Wallet verification, admin review, and merchant status updates are implemented in this repo—not on the Runner server.

**Full platform context:** [PLATFORM_CONFIGURATION.md](./PLATFORM_CONFIGURATION.md#resend-email)

## Quick setup

1. Add to `apps/portal/.env.local`:

```env
RESEND_API_KEY=re_...
EMAIL_FROM=Crypto Pay <noreply@cryptopay.sale>
EMAIL_REPLY_TO=your-monitored-inbox@example.com
ADMIN_REVIEW_EMAIL=your-monitored-inbox@example.com
```

2. Verify domain in [Resend dashboard](https://resend.com/domains) (SPF/DKIM for `cryptopay.sale`).

3. Sync to Supabase Auth SMTP + edge secrets:

```bash
pnpm resend:sync
pnpm netlify:env-sync   # if deploying portal
```

4. Verify (portal + Supabase):

```bash
pnpm resend:verify          # from repo root — SMTP, secrets, domain
# or portal only:
cd apps/portal && pnpm email:verify
```

## What sends when

| Event | Recipients | Code path |
|-------|------------|-----------|
| Merchant saves wallet (portal) | Admin review + merchant confirmation | `merchant-wallet-service.ts`, `notify-admin.ts` |
| Runner attaches wallet | Admin review | `supabase/functions/runner-api` |
| Admin verifies / rejects | Merchant | `PATCH /api/admin/wallets`, `runWalletStatusEmailWorkflow` |

## Templates & assets

- React/HTML templates: `apps/portal/lib/email/templates.ts`, `lib/email/templates/wallet.ts`
- Logo: `public/email/` — run `pnpm email:logo` before production builds
- Use `EMAIL_LOGO_URL` or production `NEXT_PUBLIC_APP_URL` for image URLs in mail clients (not `localhost`)

## Supabase Auth email

`pnpm resend:sync` configures Supabase to send auth mail (confirm signup, reset password) via Resend SMTP. Template HTML can be synced with:

```bash
cd apps/portal && pnpm email:sync-auth        # local templates
pnpm email:sync-auth:push   # push to Supabase project
```

## Do not

- Put `RESEND_API_KEY` in client components or `NEXT_PUBLIC_*`
- Send fulfillment/payment emails from Runner for wallet verification (use Crypto Pay workflows)
- Skip idempotency for repeated admin actions (see `lib/email/workflow-keys.ts`)
