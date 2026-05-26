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

## Deploy (Netlify + GitHub)

Hosting uses **Netlify** (GitHub login — no Vercel phone signup). Config: `netlify.toml`.

```bash
pnpm netlify:bootstrap   # import URL + env prep
pnpm netlify:login       # GitHub (photospheremedia)
pnpm netlify:link        # link site crypto-pay-portal
pnpm netlify:env-sync    # push Supabase keys from .env.local
pnpm netlify:deploy      # production deploy
pnpm netlify:audit       # CLI fallback; prefer Netlify MCP (list-sites) in Cursor
pnpm netlify:secrets     # repo admin: GitHub Actions deploy secrets
```

**CI/CD:** `.github/workflows/netlify.yml` — production deploy on push to `main`/`master` when portal files change; PRs typecheck and optional Netlify preview (requires `NETLIFY_AUTH_TOKEN` + `NETLIFY_SITE_ID`).

Production branch: `master`. Supabase: `usbxwewohpsbjwiuazpf`. Domain: `cryptopay.sale` (Porkbun DNS → `pnpm dns:apply`).

## Project layout

| Path | Purpose |
|------|---------|
| `apps/portal` | Crypto Pay website + account + admin |
| `packages/db` | Supabase clients |
| `supabase/` | Migrations and edge functions |

## Branding

- **Name:** Crypto Pay (not CryptivaPay)
- **Tagline:** Accept Crypto Payments. Instantly. Securely. Globally.
