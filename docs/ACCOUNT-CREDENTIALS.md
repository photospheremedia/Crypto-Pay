# demo merchant & PhotoSphere account credentials

**Never commit passwords, `sbp_` tokens, or API keys to git.** Use the gitignored local file for secrets the team shares offline.

## Quick access (secrets)

```bash
cp docs/ACCOUNT-CREDENTIALS.local.example docs/ACCOUNT-CREDENTIALS.local.md
# Fill in passwords, tokens, recovery notes — file stays gitignored
```

Open `docs/ACCOUNT-CREDENTIALS.local.md` in your editor or password manager export. Share updates via 1Password / Bitwarden — not Slack or email.

## Accounts at a glance

| Role | Email / identity | Use today |
|------|------------------|-----------|
| **PhotoSphere (production)** | `photospheremedia00@gmail.com` | Supabase, Netlify, GitHub org, Resend ops, local dev admin |
| **demo merchant (legacy)** | `merchant@example.com` | Old Supabase project; migration dumps only |
| **GitHub org** | [photospheremedia/Crypto-Pay](https://github.com/photospheremedia/Crypto-Pay) | Source + Actions secrets |
| **Vercel (optional)** | PhotoSphere team / `photospheremedia` GitHub login | Alternate deploy path — **not** `skullcandyxxx` |
| **Netlify (production host)** | Netlify via GitHub `photospheremedia` | Site `crypto-pay-portal` |

PhotoSphere is the **canonical** owner for Crypto Pay infrastructure. demo merchant held the original Supabase project before handoff.

## Supabase project refs

| Account | Project ref | Dashboard |
|---------|-------------|-----------|
| PhotoSphere | `usbxwewohpsbjwiuazpf` | https://supabase.com/dashboard/project/usbxwewohpsbjwiuazpf |
| demo merchant (legacy) | `` | https://supabase.com/dashboard/project/ |

Org name on PhotoSphere account: **PhotoSphere Media**.

## Local env files (gitignored)

| File | Account | Purpose |
|------|---------|---------|
| `.env.supabase` | PhotoSphere | `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF` — CLI + Cursor MCP |
| `.env.supabase.legacy-account` | demo merchant | One-time migration / dump from old project |
| `apps/portal/.env.local` | PhotoSphere project keys | App runtime (anon, service role, Resend, etc.) |
| `.env.netlify` | PhotoSphere Netlify PAT | `pnpm netlify:secrets`, MCP |
| `docs/ACCOUNT-CREDENTIALS.local.md` | Both | Human-readable passwords & login notes |

Templates (safe to commit):

```bash
cp .env.supabase.example .env.supabase
cp .env.supabase.legacy-account.example .env.supabase.legacy-account   # only if migrating
cp apps/portal/.env.example apps/portal/.env.local
cp docs/ACCOUNT-CREDENTIALS.local.example docs/ACCOUNT-CREDENTIALS.local.md
```

Create tokens: https://supabase.com/dashboard/account/tokens (sign in as the matching Google account).

## Common commands

| Task | Command |
|------|---------|
| Connect Supabase CLI/MCP (PhotoSphere) | `pnpm supabase:connect` |
| Check linked project / token | `pnpm supabase:status` |
| Migrate legacy account PhotoSphere | `pnpm supabase:migrate-account` (needs both `.env.supabase*` files) |
| Interactive clone | `pnpm supabase:clone` |
| Local dev login user | `pnpm dev:setup` (default `photospheremedia00@gmail.com`) |
| Netlify link + env | `pnpm netlify:connect`, `pnpm netlify:env-sync` |
| Vercel (PhotoSphere) | `pnpm vercel:setup` |
| GitHub Actions secrets map | `.github/secrets.env.example` |

## Local dev defaults

See [LOCAL_DEV.md](./LOCAL_DEV.md). Default dev email is `photospheremedia00@gmail.com` (admin allowlist). Override with `LOCAL_DEV_EMAIL` / `LOCAL_DEV_PASSWORD` in the shell — do not commit passwords.

## Migration (legacy account PhotoSphere)

Supabase does not transfer projects between Google accounts in-place. Workflow:

1. Put legacy token token in `.env.supabase.legacy-account`, PhotoSphere token in `.env.supabase`.
2. `pnpm supabase:migrate-account` (or `--dump-only` / `--provision-only`).
3. Update `apps/portal/.env.local` and GitHub secrets with the **new** PhotoSphere ref if it changed.
4. Decommission the old legacy project in the dashboard when satisfied.

Script: `scripts/migrate-legacy-account-to-photospheremedia.sh`.

## Related docs

| Document | Contents |
|----------|----------|
| [LOCAL_DEV.md](./LOCAL_DEV.md) | Portal env, `dev:setup`, Playwright |
| [PORKBUN-SECRETS.md](./PORKBUN-SECRETS.md) | Domain API keys |
| [.github/secrets.env.example](../.github/secrets.env.example) | CI secret names |
| [ACCOUNT_SETUP_WORKFLOW.md](./ACCOUNT_SETUP_WORKFLOW.md) | Merchant onboarding (not ops logins) |

## If credentials leak

1. Rotate Supabase access tokens and database password in the dashboard.
2. Rotate Resend, Netlify, Porkbun, and GitHub secrets as applicable.
3. Update `docs/ACCOUNT-CREDENTIALS.local.md` and team password manager.
4. Re-run `pnpm supabase:secrets`, `pnpm netlify:secrets`, `pnpm resend:sync` where needed.
