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
| `LOCAL_DEV_EMAIL` | `photospheremedia00@gmail.com` |
| `LOCAL_DEV_PASSWORD` | `CryptoPayDev!2026` (set your own in the shell; never commit passwords) |
| `LOCAL_DEV_ADMIN` | `1` — grants `cp_admin` on `crypto-pay-admin` tenant |

Example with a custom password:

```bash
LOCAL_DEV_EMAIL=photospheremedia00@gmail.com LOCAL_DEV_PASSWORD='YourSecurePass!' pnpm dev:setup
```

`photospheremedia00@gmail.com` is also in the app admin allowlist (`lib/admin-email.ts`), so `/admin/dashboard` works after login.

## Why `NEXT_PUBLIC_APP_URL` matters locally

`.env.local` often points at production (`https://cryptopay.sale`). For local work, copy:

```bash
cp apps/portal/.env.development.local.example apps/portal/.env.development.local
```

Next.js loads `.env.development.local` in dev and sets `NEXT_PUBLIC_APP_URL=http://localhost:3001` for auth redirects and emails.

Email logos use `NEXT_PUBLIC_APP_URL/email/logo.png`. In dev, mail clients cannot load `localhost` images — use production `NEXT_PUBLIC_APP_URL` when testing real sends, or set `EMAIL_LOGO_URL` to a public CDN URL.

**Reply-To:** Set `EMAIL_REPLY_TO=photospheremedia00@gmail.com` (or your monitored inbox) so merchant replies are not lost. Sync to Netlify/Supabase with `pnpm netlify:env-sync` and `pnpm resend:sync`. Public contact on the site can stay `support@cryptopay.sale`; that is separate from transactional `Reply-To`.

## Supabase dashboard (one-time)

**Authentication → URL configuration**

- **Site URL:** `http://localhost:3001` (or keep production; both can work for password login)
- **Redirect URLs:** add `http://localhost:3001/auth/callback`

## Playwright: open the app as the dev user

With the portal running on port 3001:

```bash
pnpm dev:setup                  # once — creates/resets dev user
pnpm playwright:connect:login   # opens /login, fills email, signs in, keeps browser open
```

Use this when you are on the login page and want Playwright to sign in for you (dev user from `dev:setup`).

Other commands (from repo root or `apps/portal`):

| Command | Purpose |
|---------|---------|
| `pnpm playwright:connect` | Same as `connect:login` → then `/account` |
| `pnpm playwright:connect:admin` | Login → `/admin/dashboard` |
| `pnpm playwright:login` | Save session headlessly (no visible browser) |
| `pnpm playwright:open` | Open `/account` with saved session only |
| `pnpm playwright:open:admin` | Open `/admin/dashboard` with saved session |
| `pnpm test:authenticated` | Run Playwright specs logged in |

Override credentials: `PLAYWRIGHT_USER_EMAIL` / `PLAYWRIGHT_USER_PASSWORD` (or `LOCAL_DEV_*`).

demo merchant example:

```bash
LOCAL_DEV_EMAIL=merchant@example.com LOCAL_DEV_ADMIN=0 pnpm dev:setup
pnpm playwright:connect:merchant   # merchant → /account (not admin)
```

Playwright signs in via Supabase session cookies by default (avoids `/login` server-action stalls). To test the HTML form instead: `PLAYWRIGHT_LOGIN_UI=1 pnpm playwright:connect`.

### Why QA users appear under Admin → Merchants

Playwright’s **signup test** (`tests/auth.spec.ts`) creates **real** Supabase users (name “QA User”, emails like `qa-signup-<timestamp>@playwright.test`). They show in the merchant directory until removed.

- **Hidden by default** in the admin merchants list (`isTestMerchantEmail` in `lib/admin/merchant-directory.ts`).
- Set `ADMIN_SHOW_TEST_MERCHANTS=1` on the portal if you need to see them while debugging tests.
- Old rows (`@outlook.com` QA signups, manual typos like `colcolli990@gmail.comà`) are not auto-hidden — delete them in Supabase Auth / user detail if unwanted.

## Test the merchant onboarding flow

After `pnpm dev:portal`, you can walk through signup → add wallet:

1. Open http://localhost:3001/signup and create a test user (or use the `dev:setup` user at `/login`).
2. You should land on **Account → Wallets** (`/account?tab=wallets`); the add-wallet dialog opens if you have no wallets.
3. Submit a payout address; it appears as **Pending** until an admin verifies it in the admin wallets UI.

Full sequence diagrams, redirect rules, and file map: [ACCOUNT_SETUP_WORKFLOW.md](./ACCOUNT_SETUP_WORKFLOW.md).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Event handlers cannot be passed to Client Component` + `onError` on intl provider | Remove `onError` from `i18n/request.ts` — handlers live in `IntlProvider` only (next-intl 4 inheritance) |
| Favicon / `/icon` redirects to login or 500 | Metadata routes must skip `proxy.ts` — see `lib/routing/metadata-routes.ts` |
| `SyntaxError: Unexpected non-whitespace character after JSON` on `/en` or `/login` | Corrupted Turbopack cache — run `pnpm dev:portal:clean` (or VS Code task **Dev: Portal (clean .next)**) |
| Port 3001 already in use | Stop the other dev server, or let the VS Code dev task kill it first |
| "Email or password is incorrect" | Run `pnpm dev:setup` again |
| Login works but session lost | Confirm `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` |
| Redirects to production after OAuth | Use `.env.development.local` with localhost URL |
| Admin vs account | `photospheremedia00@gmail.com` + `pnpm dev:setup` → `/admin/dashboard` |
| 404 after signup on `/account/setup` | Redirects to `/account?tab=wallets`; see [ACCOUNT_SETUP_WORKFLOW.md](./ACCOUNT_SETUP_WORKFLOW.md) |

Use **pnpm** from the **repo root** (`pnpm dev:portal`), or from `apps/portal` (`pnpm dev:portal` — same port).

### VS Code / Cursor tasks

Run **Terminal → Run Task** and pick:

| Task | What it does |
|------|----------------|
| **Dev: Portal (Next.js)** | Frees port 3001, starts http://localhost:3001 |
| **Dev: Portal (clean .next)** | Kill port + delete `.next` + start (fixes Turbopack JSON/cache glitches) |
| **Dev: Setup local user** | `pnpm dev:setup` — confirmed dev login |

Open the **monorepo root** (`crypto-pay`) as the workspace folder so `cwd` resolves correctly. If a task “fails” instantly while the server is running, reload the window once — background tasks now wait for Next.js `Ready in`.
