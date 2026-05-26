# Local development login

## Quick start

```bash
pnpm install
cp apps/portal/.env.example apps/portal/.env.local
# Paste NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

pnpm dev:setup    # dev user + localhost APP_URL
pnpm dev:portal   # http://localhost:3001
```

Sign in at **http://localhost:3001/login** with the email/password printed by `dev:setup`.

Default dev user (override with env vars):

| Variable | Default |
|----------|---------|
| `LOCAL_DEV_EMAIL` | `merchant@example.com` |
| `LOCAL_DEV_PASSWORD` | `CryptoPayDev!2026` |

## Why `NEXT_PUBLIC_APP_URL` matters locally

`.env.local` often points at production (`https://cryptopay.sale`). For local work, copy:

```bash
cp apps/portal/.env.development.local.example apps/portal/.env.development.local
```

Next.js loads `.env.development.local` in dev and sets `NEXT_PUBLIC_APP_URL=http://localhost:3001` for auth redirects and emails.

Email logos use `NEXT_PUBLIC_APP_URL/email/logo.png`. In dev, mail clients cannot load `localhost` images — use production `NEXT_PUBLIC_APP_URL` when testing real sends, or set `EMAIL_LOGO_URL` to a public CDN URL.

## Supabase dashboard (one-time)

**Authentication → URL configuration**

- **Site URL:** `http://localhost:3001` (or keep production; both can work for password login)
- **Redirect URLs:** add `http://localhost:3001/auth/callback`

## Test the merchant onboarding flow

After `pnpm dev:portal`, you can walk through signup → add wallet:

1. Open http://localhost:3001/signup and create a test user (or use the `dev:setup` user at `/login`).
2. You should land on **Account → Wallets** (`/account?tab=wallets`); the add-wallet dialog opens if you have no wallets.
3. Submit a payout address; it appears as **Pending** until an admin verifies it in the admin wallets UI.

Full sequence diagrams, redirect rules, and file map: [ACCOUNT_SETUP_WORKFLOW.md](./ACCOUNT_SETUP_WORKFLOW.md).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Email or password is incorrect" | Run `pnpm dev:setup` again |
| Login works but session lost | Confirm `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` |
| Redirects to production after OAuth | Use `.env.development.local` with localhost URL |
| Admin vs account | Users with `owner`+ membership may go to `/admin/dashboard` |
| 404 after signup on `/account/setup` | Should redirect automatically; see [ACCOUNT_SETUP_WORKFLOW.md](./ACCOUNT_SETUP_WORKFLOW.md) |
