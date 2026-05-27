---
name: resend
description: >-
  Crypto Pay + Resend email. Use for transactional mail (wallet verification,
  admin review, onboarding), RESEND_API_KEY setup, pnpm resend:sync, Supabase Auth
  SMTP, templates in apps/portal/lib/email, or any Resend API work in this repo.
---

# Resend (Crypto Pay)

Crypto Pay owns **all** merchant and admin transactional email in this repo—not the Runner app.

## Read first

| Resource | Path |
|----------|------|
| Documentation index | `docs/INDEX.md` |
| **Env + API end-to-end** | `docs/ENV_AND_API_GUIDE.md` (email paths, sync playbook) |
| Email setup | `docs/EMAIL_SETUP_CRYPTO_PAY.md` |
| Env + sync with Supabase/Netlify | `docs/PLATFORM_CONFIGURATION.md` (Resend section) |
| Wallet email flows | `docs/ACCOUNT_SETUP_WORKFLOW.md` |

## Environment (portal)

In `apps/portal/.env.local` (see `.env.example`):

```env
RESEND_API_KEY=re_...
EMAIL_FROM=Crypto Pay <noreply@cryptopay.sale>
EMAIL_REPLY_TO=<monitored-inbox>
ADMIN_REVIEW_EMAIL=<monitored-inbox>
# ADMIN_ALLOWED_EMAILS=comma,separated
```

| Variable | Server-only | Purpose |
|----------|-------------|---------|
| `RESEND_API_KEY` | Yes | API + Supabase SMTP password after sync |
| `EMAIL_FROM` | Yes | Verified domain required in Resend dashboard |
| `EMAIL_REPLY_TO` | Yes | Merchant replies (monitored Gmail, not unmonitored alias) |
| `ADMIN_REVIEW_EMAIL` | Yes | New pending wallet notifications |

Never use `NEXT_PUBLIC_*` for Resend secrets.

## Sync commands

```bash
pnpm resend:sync        # → Supabase Edge secrets + Auth SMTP (scripts/setup-resend-secrets.sh)
pnpm netlify:env-sync   # → Netlify build env (after .env.local is correct)
cd apps/portal && pnpm email:verify
cd apps/portal && pnpm email:preview
```

Auth template push: `pnpm email:sync-auth` / `pnpm email:sync-auth:push` (from `apps/portal`).

## Code locations

| Concern | Path |
|---------|------|
| Templates | `apps/portal/lib/email/templates.ts`, `lib/email/templates/wallet.ts` |
| Workflows / idempotency | `apps/portal/lib/email/workflows.ts`, `lib/email/workflow-keys.ts` |
| Admin notify | `apps/portal/lib/wallets/notify-admin.ts` |
| Merchant wallet save | `apps/portal/lib/wallets/merchant-wallet-service.ts` |
| Admin verify email | `apps/portal/app/api/admin/wallets/route.ts` |
| Runner pending notify | `supabase/functions/runner-api/index.ts` |
| Schedule / send helper | `apps/portal/lib/email/schedule.ts`, `lib/email.ts` |
| Logo assets | `apps/portal/public/email/` — `pnpm email:logo` before build |

## Crypto Pay rules

1. Use existing workflow helpers—do not add ad-hoc `fetch('https://api.resend.com')` in route handlers without idempotency.
2. Wallet status emails: respect `merchant_status_emailed_for_request` / workflow keys to avoid duplicates.
3. Email images must use production URLs (`EMAIL_LOGO_URL` or `NEXT_PUBLIC_APP_URL`)—not `localhost` in real sends.
4. Domain `cryptopay.sale` must be verified in Resend (SPF/DKIM).

## Resend API details

For SDK syntax, batch send, webhooks, and template variables, also use the **Resend Cursor plugin skill** (`resend`) when installed, or Context7 `/resend/resend`.

## Related skills

| Skill | Path |
|-------|------|
| Signup + confirm + welcome | `.agents/skills/auth-signup-flow/SKILL.md` |
| Platform scope | `.agents/skills/crypto-pay-platform/SKILL.md` |
| Supabase (Auth SMTP) | `.agents/skills/supabase/SKILL.md` |
| Netlify (env sync) | `.agents/skills/netlify/SKILL.md` |
