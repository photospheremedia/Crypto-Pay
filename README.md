# Crypto Pay

Accept crypto payments instantly, securely, and globally. Non-custodial wallet-to-wallet processing with a modern merchant dashboard.

## Repo

- **GitHub:** https://github.com/photospheremedia/Crypto-Pay
- **App:** Next.js portal in `apps/portal` (port **3001**)
- **Contributing (Git & PRs):** [CONTRIBUTING.md](CONTRIBUTING.md)

## Stack

- pnpm monorepo (`@crypto-pay/portal`, `@crypto-pay/db`)
- Next.js 16, Tailwind v4, Supabase (auth + admin platform)
- Live crypto-to-fiat rates via CoinGecko (`/api/crypto-rates`)

## Local development

```powershell
cd "C:\Users\FreeBandz\Projects\Crypto Pay"
pnpm install
pnpm dev:portal
```

Open http://localhost:3001 — marketing pages are public (no sign-in required).

Copy `apps/portal/.env.example` to `apps/portal/.env.local` and add your Supabase keys when connecting auth.

**Sign in locally:** run `pnpm dev:setup`, then open http://localhost:3001/login (see [docs/LOCAL_DEV.md](docs/LOCAL_DEV.md)).

**Docs:** [docs/README.md](docs/README.md) — includes [merchant account setup workflow](docs/ACCOUNT_SETUP_WORKFLOW.md).

## Deploy (Vercel + GitHub)

Portal hosting: **Vercel** (PhotoSphere team). Config: `vercel.json`.

```bash
pnpm vercel:auth-photosphere --link
pnpm vercel:env-sync       # push keys from apps/portal/.env.local
pnpm vercel:deploy         # production CLI deploy (or use Vercel GitHub app)
pnpm vercel:secrets        # repo admin: GitHub Actions VERCEL_* secrets
pnpm dns:apply             # Porkbun → Vercel (apex + www)
```

**CI/CD:** `.github/workflows/vercel.yml` — typecheck on PR; production deploy on push to `master` (or Vercel GitHub app alone — use one path).

See [docs/VERCEL_MIGRATION.md](docs/VERCEL_MIGRATION.md). Production branch: `master`. Supabase: `usbxwewohpsbjwiuazpf`. Domain: `cryptopay.sale`.

## Project layout

| Path | Purpose |
|------|---------|
| `apps/portal` | Crypto Pay website + account + admin |
| `packages/db` | Supabase clients |
| `supabase/` | Migrations and edge functions |

## Branding

- **Name:** Crypto Pay (not CryptivaPay)
- **Tagline:** Accept Crypto Payments. Instantly. Securely. Globally.
