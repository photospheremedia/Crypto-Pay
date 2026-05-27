# Platform configuration — Supabase, Resend, Netlify

Guide for developers and agents configuring Crypto Pay infrastructure. Secrets live in `apps/portal/.env.local` (gitignored); sync to hosted environments with the scripts below—**never commit API keys**.

**Index:** [INDEX.md](./INDEX.md)

**Agent skills:** [Supabase](../.agents/skills/supabase/SKILL.md) · [Resend](../.agents/skills/resend/SKILL.md) · [Netlify](../.agents/skills/netlify/SKILL.md)

**Related:** [LOCAL_DEV.md](./LOCAL_DEV.md) · [MERCHANT_VS_ADMIN_UI.md](./MERCHANT_VS_ADMIN_UI.md) · [PROD_READINESS.md](./PROD_READINESS.md)

---

## Configuration flow (recommended order)

```text
1. Supabase project + keys → apps/portal/.env.local
2. pnpm dev:setup              (local auth user + membership)
3. pnpm resend:sync            (Resend → Supabase Auth SMTP + edge secrets)
4. pnpm netlify:connect        (link site)
5. pnpm netlify:env-sync       (portal env → Netlify build)
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
| `pnpm dev:setup` | Local dev user + `cp_admin` when `LOCAL_DEV_ADMIN=1` |
| `pnpm db:push` / `pnpm db:reset` | Migrate / reset local stack |

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

5. Push same vars to Netlify for Next.js server routes:

```bash
pnpm netlify:env-sync
```

### Verify

```bash
cd apps/portal && pnpm email:verify
pnpm email:preview          # template previews
```

### Agent rules

- Use existing templates in `apps/portal/lib/email/` — do not send raw HTML from new routes without workflow helpers.
- Idempotency keys for wallet emails: see `lib/email/workflow-keys.ts`.
- Do not log `RESEND_API_KEY` or full email bodies in production.

**Detail:** [EMAIL_SETUP_CRYPTO_PAY.md](./EMAIL_SETUP_CRYPTO_PAY.md)

---

## Netlify (portal hosting)

### What it hosts

- Next.js 16 portal (`apps/portal`) — marketing, **merchant account**, **admin**, `/api/*`
- Production site: **crypto-pay-portal** → `cryptopay.sale`

Config: repo root `netlify.toml` (build base `apps/portal`, Node 24, `@netlify/plugin-nextjs`).

### One canonical site

- **Keep:** site linked via `pnpm netlify:connect` (see `scripts/lib/netlify-site.sh` / `.cursor/rules/netlify-mcp.mdc`).
- Do not create duplicate sites from Git import; run `pnpm netlify:audit` if unsure.

### Local Netlify CLI auth

```bash
cp .env.netlify.example .env.netlify   # NETLIFY_AUTH_TOKEN
pnpm netlify:connect
pnpm netlify:status
```

Use **Netlify MCP** in Cursor when available (preferred over ad-hoc CLI for site list/deploy).

### Environment variables on Netlify

Build-time and serverless functions need the same secrets as `.env.local` (except service role only on server):

```bash
pnpm netlify:env-sync    # from apps/portal/.env.local → Netlify UI
```

Minimum production set:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL=https://cryptopay.sale`
- `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, `ADMIN_REVIEW_EMAIL`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- AI keys if chat enabled (`GROQ_API_KEY` or `OPENAI_API_KEY`)

### Deploy

| Method | Command / trigger |
|--------|-------------------|
| GitHub Actions | `.github/workflows/netlify.yml` |
| Manual | `pnpm netlify:deploy` (prod) / `pnpm netlify:preview` |

Avoid triple deploy: if CI builds on push, disable redundant Netlify UI auto-build.

### DNS

Domain DNS may be managed via Porkbun scripts (`pnpm dns:*`) — see [PORKBUN-SECRETS.md](./PORKBUN-SECRETS.md). `NEXT_PUBLIC_APP_URL` must match the live hostname.

---

## Environment matrix

| Variable | Local `.env.local` | Netlify | Supabase Edge | Browser |
|----------|-------------------|---------|---------------|---------|
| `NEXT_PUBLIC_SUPABASE_*` | ✓ | ✓ | — | ✓ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | ✓ | ✓ (functions) | ✗ |
| `RESEND_API_KEY` | ✓ | ✓ | ✓ | ✗ |
| `RUNNER_API_KEY/SECRET` | ✓ (Runner server) | — | — | ✗ |
| `INTERNAL_API_KEY` | ✓ | ✓ | — | ✗ |

---

## Troubleshooting

| Symptom | Check |
|---------|--------|
| Login works locally, fails in prod | Redirect URLs; `NEXT_PUBLIC_APP_URL` on Netlify |
| Emails not sent | `RESEND_API_KEY`; domain verified; `pnpm resend:sync` |
| Admin emails missing | `ADMIN_REVIEW_EMAIL`, `ADMIN_ALLOWED_EMAILS` |
| Runner API 401 | Clock skew; HMAC path must be `/v1/wallets` not full URL |
| RLS errors in portal | Policy + `auth.uid()`; use Supabase MCP advisors |
| Build fails on Netlify | `pnpm build:portal` locally; Node 24 in `netlify.toml` |

---

## Agent checklist (configuration changes)

- [ ] Updated `apps/portal/.env.example` comments if new vars added (no real secrets)
- [ ] Documented sync command (`resend:sync`, `netlify:env-sync`) in this file or LOCAL_DEV
- [ ] No `service_role` or `RESEND_API_KEY` in `NEXT_PUBLIC_*`
- [ ] Supabase Auth redirect URLs mentioned if auth flow changed
- [ ] Migrations applied with `pnpm db:push` when schema changes
