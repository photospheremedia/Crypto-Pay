# Crypto Pay

Accept crypto payments instantly, securely, and globally. Non-custodial wallet-to-wallet processing with a modern merchant dashboard.

## Repo

- **GitHub:** https://github.com/Skullcandyxxx/Crypto-Pay
- **App:** Next.js portal in `apps/portal` (port **3001**)

## Stack

- pnpm monorepo (`@crypto-pay/portal`, `@crypto-pay/db`)
- Next.js 16, Tailwind v4, Supabase (auth + admin from Restaurant Hub foundation)
- Live crypto-to-fiat rates via CoinGecko (`/api/crypto-rates`)

## Local development

```powershell
cd "C:\Users\FreeBandz\Projects\Crypto Pay"
pnpm install
pnpm dev:portal
```

Open http://localhost:3001 — marketing pages are public (no sign-in required).

Copy `apps/portal/.env.example` to `apps/portal/.env.local` and add your Supabase keys when connecting auth.

## Project layout

| Path | Purpose |
|------|---------|
| `apps/portal` | Crypto Pay website + account + admin |
| `packages/db` | Supabase clients |
| `supabase/` | Migrations (reuse/adapt from Restaurant Hub) |

## Branding

- **Name:** Crypto Pay (not CryptivaPay)
- **Tagline:** Accept Crypto Payments. Instantly. Securely. Globally.
