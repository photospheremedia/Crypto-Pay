---
name: crypto-pay-platform
description: >-
  Crypto Pay platform architecture. Read docs/INDEX.md first, then this skill,
  for merchants, wallets, auth, admin verification, email, Runner API, payments,
  or portal UI (see shadcn skill). Clarifies this repo vs Runner.
---

# Crypto Pay platform architecture

**Read `docs/INDEX.md` first** to route to the right guide, then apply this skill when implementing or reviewing features that touch merchants, wallets, auth, notifications, or external integrations.

## Product split

```text
┌─────────────────────────────────────┐     ┌──────────────────────────────┐
│  Crypto Pay (this monorepo)         │     │  Runner (separate server)    │
├─────────────────────────────────────┤     ├──────────────────────────────┤
│  User management & auth             │     │  Payment processing          │
│  Merchant account / portal UI       │     │  Checkout & charges          │
│  Payout wallet registry             │◄───►│  Chain monitoring            │
│  Admin wallet verification          │ HMAC│  Settlement & webhooks       │
│  Email & comms (Resend)             │     │  Store ↔ merchant mapping    │
└─────────────────────────────────────┘     └──────────────────────────────┘
         Supabase (merchant_wallets, auth, runner_api_*)
```

## Responsibilities in this repo

### User management

- Supabase Auth (signup, login, OAuth callback, MFA, sessions)
- `user_profiles`, `memberships`, platform admin roles (`cp_admin`, etc.)
- Merchant account pages under `apps/portal/app/[locale]/account`
- Admin merchant tools under `apps/portal/app/[locale]/admin`

**Do not** push auth or profile logic into Runner; Runner identifies merchants by `user_id` or `email` when calling the Runner API.

### User wallet addition

- Portal: `POST /api/account/wallets`, wallet form UI, `merchant-wallet-service.ts`
- Runner: `POST /functions/v1/runner-api/v1/wallets` with `external_id`
- Shared table: `public.merchant_wallets`
- Legacy sync: `user_wallet_profiles` for primary wallet row

New wallets start as **`status: pending`** regardless of source.

### Verification

- **Only Crypto Pay admins** approve or reject via `PATCH /api/admin/wallets`
- Material address/network changes reset to `pending` (DB trigger + service logic)
- Verified primary wallet updates `user_wallet_profiles.wallet_verified`

Runner must **not** self-verify wallets; poll or use webhooks after admin action.

### Communication

- Merchant emails: wallet submitted, verified, rejected (`lib/email/workflows.ts`)
- Admin emails: pending wallet review (`lib/wallets/notify-admin.ts`, runner-api edge)
- Auth/onboarding templates — see `docs/ACCOUNT_SETUP_WORKFLOW.md`, `docs/EMAIL_SETUP_CRYPTO_PAY.md`

All customer-facing copy about wallet state should reflect portal/admin truth, not Runner guesses.

## Runner integration (handshake only)

**Canonical doc:** `docs/RUNNER_INTEGRATION.md`

| Piece | Location |
|-------|----------|
| Inbound API (Runner → us) | `supabase/functions/runner-api/index.ts` |
| HMAC auth | `supabase/functions/_shared/runner-auth.ts` |
| Sign requests (tests/scripts) | `apps/portal/lib/runner-api/sign-request.ts` |
| Outbound webhooks (us → Runner) | `apps/portal/lib/runner-api/dispatch-wallet-webhook.ts` |
| Audit log | `public.runner_api_events` |
| API clients | `public.runner_api_clients` |

When extending integration:

1. Update edge function + shared auth if routes change
2. Update `docs/RUNNER_INTEGRATION.md` for the other team
3. Log events to `runner_api_events`
4. Keep secrets server-side (`api_secret`, `webhook_secret`, `SUPABASE_SERVICE_ROLE_KEY`)

## What not to build here

- Merchant payment checkout pages wired to a third-party processor API
- Browser WebSocket “payment detected” flows for fulfillment (Runner’s job)
- Naming third-party payment vendors in code, env examples, or user-facing strings
- Duplicating Runner settlement logic in portal API routes

Internal **BTC provider** env vars (`BTC_PROVIDER_*`) are for optional **internal automation** (`/api/internal/btc/watcher`), not the merchant product surface.

## Agent checklist

Before opening a PR that touches wallets or payments:

- [ ] Change belongs on Crypto Pay vs Runner per table above
- [ ] RLS on `merchant_wallets`; no cross-tenant `user_id` from client body without auth check
- [ ] Runner-linked wallet status change → webhook dispatch considered
- [ ] Emails/idempotency keys updated if verification flow changes
- [ ] `docs/RUNNER_INTEGRATION.md` updated if machine API contract changes
- [ ] No third-party payment brand names in code or UI

## Configuration (Supabase, Resend, Netlify)

**Index:** `docs/INDEX.md` · **Env guide:** `docs/PLATFORM_CONFIGURATION.md`

| Service | Project skill |
|---------|----------------|
| **Supabase** | `.agents/skills/supabase/SKILL.md` |
| **Resend** | `.agents/skills/resend/SKILL.md` |
| **Netlify** | `.agents/skills/netlify/SKILL.md` |

Never put `SUPABASE_SERVICE_ROLE_KEY` or `RESEND_API_KEY` in `NEXT_PUBLIC_*`.

## UI (shadcn/ui)

The portal is built with **shadcn/ui**. Before adding or changing UI:

| Resource | Path |
|----------|------|
| **shadcn skill** | `.agents/skills/shadcn/SKILL.md` |
| Components | `apps/portal/components/ui/` |
| Config | `apps/portal/components.json` |

Use **shadcn MCP** (Cursor) or `pnpm dlx shadcn@latest` from `apps/portal` to search/install components. Compose existing primitives; follow styling rules in the skill. Pair with `multilingual-website` for translated strings.

## Merchant vs admin UI

**Canonical guide:** `docs/MERCHANT_VS_ADMIN_UI.md`

| Surface | Routes | Implement in |
|---------|--------|----------------|
| **Merchant** | `/account/*`, `/api/account/*` | Wallet self-service, settings; RLS as `auth.uid()` |
| **Admin** | `/admin/*`, `/api/admin/*` | Wallet verification, merchants, staff; `checkAdminAccess()` |
| **Public** | `(marketing)/*` | No wallet or admin tools |

Realms: `lib/auth/user-realm.ts` (`admin` \| `merchant`). Staff cannot use `/account`; merchants cannot use `/admin`.

## Related skills & docs

**Full catalog:** `docs/INDEX.md`

| Resource | Path |
|----------|------|
| Documentation index (start here) | `docs/INDEX.md` |
| Dev workflow | `.agents/skills/dev-workflow/SKILL.md` |
| Supabase | `.agents/skills/supabase/SKILL.md` |
| Resend | `.agents/skills/resend/SKILL.md` |
| Netlify | `.agents/skills/netlify/SKILL.md` |
| shadcn/ui | `.agents/skills/shadcn/SKILL.md` |
