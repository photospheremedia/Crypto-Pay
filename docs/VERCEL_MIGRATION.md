# Portal hosting on Vercel

Production: **cryptopay.sale** · Project **crypto-pay-portal** (PhotoSphere team).

Netlify has been **removed** from this repo; all portal hosting, CI, env sync, and Porkbun web DNS use Vercel.

## CLI + account (PhotoSphere only)

```bash
pnpm vercel:auth-photosphere --link
pnpm exec vercel whoami   # photospheremedia
```

| Item | Value |
|------|--------|
| Team slug | `photospheremedia-s-projects` |
| Team ID | `team_AflYR0tFtYDkhqMjaEg0vyQj` |
| Project ID | `prj_miNyfjtzgh3gEjxh6LN4inBj7BNX` |

**Cursor:** Settings → MCP → **Vercel** → sign in as PhotoSphere (not personal alt accounts).

## Project settings (dashboard)

| Setting | Value |
|---------|--------|
| Framework | **Next.js** |
| Root Directory | **`apps/portal`** (import) or **`.`** with root `vercel.json` — match CLI link |
| Install | `pnpm install --frozen-lockfile` |
| Build | `pnpm --filter @crypto-pay/portal build` |
| Output Directory | **empty** (never `apps/portal/.next`) |
| Node | **24.x** |
| Production branch | **master** |

## Environment + deploy

```bash
pnpm vercel:env-sync      # from apps/portal/.env.local
pnpm vercel:secrets       # optional — GitHub Actions VERCEL_*
```

Use **one** production deploy path: Vercel GitHub app **or** `.github/workflows/vercel.yml`.

## Domains + DNS

1. Vercel → **crypto-pay-portal** → **Domains** → add `cryptopay.sale` and `www.cryptopay.sale` (external DNS at Porkbun).
2. Porkbun records (already applied via `pnpm dns:apply`):
   - `A @` → `76.76.21.21`
   - `CNAME www` → `cname.vercel-dns.com`
3. Supabase Auth → add `https://cryptopay.sale/auth/callback` and `https://www.cryptopay.sale/auth/callback`.

## Verify

```bash
curl -sI "https://cryptopay.sale/login" | head -5
# Server: Vercel — not DEPLOYMENT_NOT_FOUND

curl -sL "https://cryptopay.sale/login" | grep -oE '/_next/static/chunks/[^"]+\.js' | head -1
# chunk URL should return 200 + application/javascript
```

## Decommission Netlify (manual)

In Netlify UI for site **crypto-pay-portal**: disable auto-build, remove `cryptopay.sale` custom domain, archive or delete site when Vercel is stable.

---

See [PLATFORM_CONFIGURATION.md](./PLATFORM_CONFIGURATION.md) for full env matrix and troubleshooting.
