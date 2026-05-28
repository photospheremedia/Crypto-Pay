# Netlify → Vercel migration (portal)

Use this after importing **photospheremedia/Crypto-Pay** on [vercel.com](https://vercel.com). Production domain: **cryptopay.sale**.

## 0. CLI + Cursor MCP (PhotoSphere account)

**Wrong account:** do not use personal alt accounts (e.g. `skullcandyxxx`). Use **`photospheremedia`**.

```bash
pnpm vercel:auth-photosphere --link   # logout wrong user, login, link repo
pnpm exec vercel whoami               # must print: photospheremedia
```

| Item | Value |
|------|--------|
| Team slug | `photospheremedia-s-projects` |
| Team ID | `team_AflYR0tFtYDkhqMjaEg0vyQj` |
| Project | `crypto-pay-portal` |
| Project ID | `prj_miNyfjtzgh3gEjxh6LN4inBj7BNX` |

**Cursor:** Settings → MCP → **Vercel** → sign out if needed, sign in as the same PhotoSphere GitHub user.

---

## 1. Vercel project settings (dashboard)

Confirm these match repo `vercel.json` (Settings → General → Build & Development):

| Setting | Value |
|---------|--------|
| Framework Preset | **Next.js** |
| Root Directory | **`apps/portal`** (matches dashboard import) or **`.`** if using root `vercel.json` only — pick one and keep CLI link in sync |
| Install Command | `pnpm install --frozen-lockfile` |
| Build Command | `pnpm --filter @crypto-pay/portal build` |
| Output Directory | *(leave empty — Next.js on Vercel manages output)* |
| Node.js Version | **24.x** |
| Production Branch | **master** |

Do **not** set Output Directory to `apps/portal/.next` (that pattern broke Netlify static chunks).

## 2. Environment variables

From a filled `apps/portal/.env.local`:

```bash
pnpm vercel:link          # if CLI not linked yet
pnpm vercel:env-sync      # production + preview + development
```

Minimum production set (same as Netlify): see [PLATFORM_CONFIGURATION.md](./PLATFORM_CONFIGURATION.md).

Set **`NEXT_PUBLIC_APP_URL`** to your live URL (`https://cryptopay.sale` or the `*.vercel.app` preview until DNS cutover).

Update **Supabase Auth** redirect URLs for the Vercel hostname before testing login.

## 3. GitHub Actions

Two deploy paths — use **one** to avoid double production deploys:

| Path | Setup |
|------|--------|
| **A. Vercel GitHub app** (you already imported) | Often enough; ensure Netlify workflow does not also deploy |
| **B. `.github/workflows/vercel.yml`** | `pnpm vercel:secrets` after `pnpm vercel:link` |

Bootstrap Actions secrets:

```bash
cp .env.vercel.example .env.vercel   # VERCEL_TOKEN
pnpm vercel:link
pnpm vercel:secrets
```

## 4. Pause Netlify production deploys

Until DNS points at Vercel:

- **GitHub:** `.github/workflows/netlify.yml` production `deploy` job runs only on **`workflow_dispatch`** (manual).
- **Netlify UI:** Site **crypto-pay-portal** → disable “Build on push” if still enabled.

Keep Netlify live until you verify Vercel, then switch DNS.

## 5. DNS cutover (cryptopay.sale)

When Vercel preview/production looks correct:

1. Vercel → Project → **Domains** → add `cryptopay.sale` (+ `www` if used).
2. Porkbun (or DNS host): point apex/`www` to Vercel (A/CNAME per Vercel instructions).
3. Wait for SSL, then smoke-test login, admin, account, `/_next/static` (200 + correct MIME).

Optional: `pnpm dns:export-vercel` when that script is restored for Porkbun alignment.

## 6. Verify after deploy

```bash
curl -sL "https://YOUR_DEPLOY_URL/login" | grep -oE '/_next/static/chunks/[^"]+\.js' | head -1
curl -sI "https://YOUR_DEPLOY_URL<chunk-path>"
# Expect HTTP 200 and application/javascript (not text/plain 404)
```

## 7. Rollback

Point DNS back to Netlify; run **workflow_dispatch** on Netlify CI/CD if you need a fresh Netlify build.

---

**Agents:** hosting primary = Vercel; Netlify = legacy until DNS cutover. See [PLATFORM_CONFIGURATION.md](./PLATFORM_CONFIGURATION.md).
