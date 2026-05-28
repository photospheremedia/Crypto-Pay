# Platform configuration — Supabase, Resend, Vercel

Guide for developers and agents configuring Crypto Pay infrastructure. Secrets live in `apps/portal/.env.local` (gitignored); sync to hosted environments with the scripts below—**never commit API keys**.

**End-to-end (env + APIs + flows):** [ENV_AND_API_GUIDE.md](./ENV_AND_API_GUIDE.md)  
**Index:** [INDEX.md](./INDEX.md)

**Agent skills:** [Supabase](../.agents/skills/supabase/SKILL.md) · [Resend](../.agents/skills/resend/SKILL.md) · Vercel ([VERCEL_MIGRATION.md](./VERCEL_MIGRATION.md), `.cursor/rules/vercel-photosphere.mdc`)

**Related:** [LOCAL_DEV.md](./LOCAL_DEV.md) · [MERCHANT_VS_ADMIN_UI.md](./MERCHANT_VS_ADMIN_UI.md) · [PROD_READINESS.md](./PROD_READINESS.md)

---

## Configuration flow (recommended order)

```text
1. Supabase project + keys → apps/portal/.env.local
2. pnpm dev:setup              (local auth user + membership)
3. pnpm resend:sync            (Resend → Supabase Auth SMTP + edge secrets)
   pnpm resend:verify          (Supabase SMTP + secrets + portal Resend domain)
4. pnpm vercel:link && pnpm vercel:env-sync   (portal → Vercel; see VERCEL_MIGRATION.md)
5. pnpm vercel:secrets         (optional — GitHub Actions deploy)
6. supabase db push            (migrations, when schema changes)
7. Deploy edge functions       (runner-api, etc.)
```

---

## Supabase

### What it powers

| Area | Usage |
|------|--------|
| **Auth** | Merchant signup/login, OAuth, email confirm, sessions (cookies via `@supabase/ssr`) |
| **Database** | `merchant_wallets`, `memberships`, `user_profiles`, admin data, `runner_api_*` |
| **RLS** | Row-level security — primary multi-tenant guard; never bypass from browser |
| **Edge Functions** | `runner-api` (Runner handshake), `verify-turnstile`, rate limits, etc. |
| **Storage** | Assets where configured (see security advisors for bucket policies) |

### Dashboard

Production project (PhotoSphere): `usbxwewohpsbjwiuazpf`  
API settings: `https://supabase.com/dashboard/project/usbxwewohpsbjwiuazpf/settings/api`

### Local env (`apps/portal/.env.local`)

```env
# PhotoSphere production ref — do not change without updating .env.supabase + GitHub secrets
NEXT_PUBLIC_SUPABASE_URL=https://usbxwewohpsbjwiuazpf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
SUPABASE_SERVICE_ROLE_KEY=<service role — server only>
NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL=https://usbxwewohpsbjwiuazpf.supabase.co/functions/v1
```

| Variable | Client-safe? | Notes |
|----------|----------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | RLS-scoped; OK in browser |
| `SUPABASE_SERVICE_ROLE_KEY` | **Never** | Admin routes, scripts, edge internal DB only |
| `NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL` | Yes | Runner API base; optional override |

### Auth URL configuration (required)

**Authentication → URL configuration**

| Setting | Local | Production |
|---------|-------|------------|
| Site URL | `http://localhost:3001` | `https://cryptopay.sale` |
| Redirect URLs | `http://localhost:3001/auth/callback` | `https://cryptopay.sale/auth/callback`, `https://www.cryptopay.sale/auth/callback` |

OAuth and email links use `NEXT_PUBLIC_APP_URL` from the portal. For local dev, copy:

```bash
cp apps/portal/.env.development.local.example apps/portal/.env.development.local
```

### Migrations & types

```bash
pnpm supabase:login          # if needed
pnpm db:push                 # apply migrations to linked project
pnpm db:types                # regenerate apps/portal/lib/database.types.ts
```

Before changing RLS or schema: read `.agents/skills/supabase/SKILL.md` and run Supabase MCP advisors.

**Production data:** read [SUPABASE_MAINTENANCE_AND_BACKUPS.md](./SUPABASE_MAINTENANCE_AND_BACKUPS.md). Never `db reset` on PhotoSphere. `git push` does not change database rows.

### Backups (platform)

| Step | Action |
|------|--------|
| Check status | `pnpm supabase:backup:status` |
| Enable PITR (recommended) | [Database → Backups](https://supabase.com/dashboard/project/usbxwewohpsbjwiuazpf/database/backups) — Pro + Small compute |
| Off-site logical dump | `pnpm supabase:db:dump` → `backups/` (gitignored) |

See [SUPABASE_MAINTENANCE_AND_BACKUPS.md](./SUPABASE_MAINTENANCE_AND_BACKUPS.md) for restore, PITR pricing, and agent safety rules.

### Edge function secrets

Set via dashboard or CLI (also updated by `pnpm resend:sync` for email-related keys):

- `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`
- `TURNSTILE_SECRET_KEY`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (rate limiting)

Deploy functions:

```bash
supabase functions deploy runner-api
# CI: supabase/scripts/build-edge-deploy-payload.mjs
```

### Repo scripts

| Command | Purpose |
|---------|---------|
| `pnpm supabase:connect` | Link CLI to PhotoSphere project |
| `pnpm supabase:status` | Linked project + health |
| `pnpm supabase:backup:status` | PITR on/off, backup API, dashboard links |
| `pnpm supabase:db:dump` | Logical SQL dump to `backups/` |
| `pnpm dev:setup` | Local dev user + `cp_admin` when `LOCAL_DEV_ADMIN=1` |
| `pnpm db:push` | Apply migrations to **linked** project only |
| `pnpm db:reset` | **Local Supabase only** — never on production PhotoSphere |

---

## Resend (email)

### What it powers

| Email type | Trigger |
|------------|---------|
| Wallet submitted (merchant) | Portal save / Runner API attach |
| Wallet pending (admin) | New pending `merchant_wallets` row |
| Wallet verified / rejected | Admin `PATCH /api/admin/wallets` |
| Onboarding / auth-related | Supabase Auth SMTP (after sync) |

Crypto Pay owns **all** transactional communication for wallets and onboarding—not the Runner app.

### Local env

```env
RESEND_API_KEY=re_...
EMAIL_FROM=Crypto Pay <noreply@cryptopay.sale>
EMAIL_REPLY_TO=photospheremedia00@gmail.com
ADMIN_REVIEW_EMAIL=photospheremedia00@gmail.com
# ADMIN_ALLOWED_EMAILS=ops@example.com,other@example.com
```

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Resend API + Supabase SMTP password |
| `EMAIL_FROM` | From header (must use verified domain in Resend) |
| `EMAIL_REPLY_TO` | Monitored inbox for merchant replies |
| `ADMIN_REVIEW_EMAIL` | Wallet review notifications |
| `EMAIL_LOGO_URL` / `EMAIL_ASSET_ORIGIN` | Public URLs for images in HTML mail (not `localhost` in real sends) |

### Setup steps

1. Create API key at [Resend](https://resend.com/api-keys).
2. Verify sending domain (`cryptopay.sale`) in Resend dashboard (DNS: SPF/DKIM).
3. Add keys to `apps/portal/.env.local`.
4. Sync to Supabase (and optionally Netlify):

```bash
pnpm resend:sync
```

This runs `scripts/setup-resend-secrets.sh`: pushes secrets to Supabase Edge + configures Auth SMTP (`smtp.resend.com`, port 587).

5. Push same vars to Vercel for Next.js server routes:

```bash
pnpm vercel:env-sync
```

### Verify

```bash
pnpm resend:verify          # Supabase SMTP + secrets + portal domain
cd apps/portal && pnpm email:preview   # template previews
```

### Agent rules

- Use existing templates in `apps/portal/lib/email/` — do not send raw HTML from new routes without workflow helpers.
- Idempotency keys for wallet emails: see `lib/email/workflow-keys.ts`.
- Do not log `RESEND_API_KEY` or full email bodies in production.

**Detail:** [EMAIL_SETUP_CRYPTO_PAY.md](./EMAIL_SETUP_CRYPTO_PAY.md)

---

## SMS (transactional notifications)

Supabase Auth SMS is for **OTP/MFA only**. Merchant wallet alerts use a **server-side SMS provider** from Next.js API routes (`apps/portal/lib/sms/`), never from the browser.

### What it powers

| SMS type | Trigger |
|----------|---------|
| Phone verification OTP | Merchant **Settings** → Send verification code |
| Wallet submitted (merchant) | New pending wallet (`merchant-wallet-service`) |
| Wallet verified / rejected | Admin `PATCH /api/admin/wallets` |

Resend remains **email-only**. Merchants opt in, verify E.164 phone, and can disable SMS without revoking opt-in (`sms_disabled_at`).

### Local env (`apps/portal/.env.local`)

```env
# Provider: twilio (production) or omit for mock (logs to server console in dev)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
SMS_FROM=+15551234567
# alias: TWILIO_PHONE_NUMBER
```

| Variable | Client-safe? | Purpose |
|----------|----------------|--------|
| `SMS_PROVIDER` | No | `twilio` or `mock` |
| `TWILIO_ACCOUNT_SID` | No | Twilio REST API |
| `TWILIO_AUTH_TOKEN` | No | Twilio auth |
| `SMS_FROM` / `TWILIO_PHONE_NUMBER` | No | Sender E.164 |

Sync to Vercel for production portal: `pnpm vercel:env-sync`.

### Schema

Migration `20260528100000_sms_notifications.sql`: `user_settings` SMS columns, `sms_phone_verification_challenges`, `sms_outbound_log` (audit + idempotency).

Apply with `pnpm db:push` on your linked project when ready.

### Verify locally

1. Apply migration (`pnpm db:push`).
2. Open `/account/settings`, enable SMS, opt in, enter `+1…` phone, send code (mock mode prints code in `pnpm dev:portal` terminal).
3. Confirm code → `sms_verified_at` set.
4. Create a wallet or admin-verify one → check `sms_outbound_log` or mock log line.

---

## Vercel (portal hosting)

**Setup:** [VERCEL_MIGRATION.md](./VERCEL_MIGRATION.md) · PhotoSphere CLI rule: `.cursor/rules/vercel-photosphere.mdc`

### What it hosts

- Next.js portal (`apps/portal`) — marketing, **merchant account**, **admin**, `/api/*`
- Production domain: **cryptopay.sale** (Porkbun DNS → Vercel; add domain in Vercel dashboard)

### Config migrated from former Netlify (`netlify.toml`)

| Former Netlify | On Vercel now |
|----------------|---------------|
| `pnpm netlify:build` | `vercel.json` → `pnpm install --frozen-lockfile` + `pnpm --filter @crypto-pay/portal build` |
| Node 24 / pnpm 9.15.5 | Vercel project Node **24.x**; `packageManager` in `package.json` |
| `@netlify/plugin-nextjs` | Native Next.js on Vercel (no `outputDirectory` override) |
| Redirect `/home` → `/` | `vercel.json` `redirects` |
| Security headers on `/*`, `/api/*` | `vercel.json` `headers` + `apps/portal/next.config.ts` |
| Cache `/email/*`, `/_next/static/*` | `vercel.json` + `next.config.ts` |
| `pnpm netlify:env-sync` | `pnpm vercel:env-sync` |
| Netlify CI workflow | `.github/workflows/vercel.yml` |
| Porkbun → Netlify DNS | `scripts/porkbun-dns-vercel.py` · `pnpm dns:apply` |

### Deploy

| Method | Command / trigger |
|--------|-------------------|
| Vercel GitHub app | Dashboard import on `master` |
| GitHub Actions | `.github/workflows/vercel.yml` — optional `VERCEL_*` via `pnpm vercel:secrets` |

Use **one** deploy path on push (Git app **or** Actions, not both).

```bash
pnpm vercel:auth-photosphere --link
pnpm vercel:env-sync
pnpm vercel:secrets    # optional — GitHub Actions only
```

### Environment variables on Vercel

```bash
pnpm vercel:env-sync    # apps/portal/.env.local → production (+ preview/dev where supported)
```

Minimum production set:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL=https://cryptopay.sale`
- `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, `ADMIN_REVIEW_EMAIL`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
- AI keys if chat enabled (`GROQ_API_KEY` / `OPENAI_API_KEY`)

### DNS (Porkbun)

```bash
pnpm dns:plan      # audit
pnpm dns:apply     # apex A 76.76.21.21 + www → cname.vercel-dns.com
```

CI: `.github/workflows/dns-vercel.yml` (manual). See [PORKBUN-SECRETS.md](./PORKBUN-SECRETS.md).

---

## Environment matrix

| Variable | Local `.env.local` | Vercel | Supabase Edge | Browser |
|----------|-------------------|--------|---------------|---------|
| `NEXT_PUBLIC_SUPABASE_*` | ✓ | ✓ | — | ✓ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | ✓ | ✓ (functions) | ✗ |
| `RESEND_API_KEY` | ✓ | ✓ | ✓ | ✗ |
| `RUNNER_API_KEY/SECRET` | ✓ (Runner server) | — | — | ✗ |
| `INTERNAL_API_KEY` | ✓ | ✓ | — | ✗ |

---

## Troubleshooting

| Symptom | Check |
|---------|--------|
| Login works locally, fails in prod | Redirect URLs; `NEXT_PUBLIC_APP_URL` on Vercel |
| JS/CSS 404, layout broken | Wrong `outputDirectory` on host; use `vercel.json` / VERCEL_MIGRATION.md |
| Emails not sent | `RESEND_API_KEY`; domain verified; `pnpm resend:sync` |
| Admin emails missing | `ADMIN_REVIEW_EMAIL`, `ADMIN_ALLOWED_EMAILS` |
| Runner API 401 | Clock skew; HMAC path must be `/v1/wallets` not full URL |
| RLS errors in portal | Policy + `auth.uid()`; use Supabase MCP advisors |
| Build fails on Vercel | `pnpm build:portal` locally; Node 24 in project settings |

---

## Agent checklist (configuration changes)

- [ ] Updated `apps/portal/.env.example` comments if new vars added (no real secrets)
- [ ] Documented sync command (`resend:sync`, `vercel:env-sync`) in this file or LOCAL_DEV
- [ ] No `service_role` or `RESEND_API_KEY` in `NEXT_PUBLIC_*`
- [ ] Supabase Auth redirect URLs mentioned if auth flow changed
- [ ] Migrations applied with `pnpm db:push` when schema changes
