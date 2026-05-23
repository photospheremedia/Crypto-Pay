# Crypto Pay — GitHub, Supabase & Vercel

## Repos & services

| Service | Value |
|---------|--------|
| **GitHub** | https://github.com/Skullcandyxxx/Crypto-Pay |
| **Supabase project ref** | `hwntncyiqaltzvlidscg` |
| **Supabase URL** | `https://hwntncyiqaltzvlidscg.supabase.co` |
| **Vercel team** | `skullcandyxxxs-projects` |
| **Vercel project (portal)** | `portal` — connect this project to the Crypto-Pay repo |

## 1. Git push → auto-deploy

After the Vercel project is linked to **Skullcandyxxx/Crypto-Pay**, every push to `master` deploys the site.

**Vercel project settings (monorepo):**

- Root Directory: `.` (repo root)
- Framework: Next.js
- Install Command: `pnpm install`
- Build Command: `pnpm build:portal`
- Output Directory: `apps/portal/.next`

Or use the root `vercel.json` (already configured).

## 2. GitHub Actions → Supabase migrations

Workflow: `.github/workflows/supabase.yml` (runs on push to `master` / `main` when `supabase/**` changes).

Add these **GitHub repository secrets** (Settings → Secrets → Actions):

| Secret | Value |
|--------|--------|
| `SUPABASE_ACCESS_TOKEN` | [Supabase account token](https://supabase.com/dashboard/account/tokens) |
| `SUPABASE_PROJECT_REF` | `hwntncyiqaltzvlidscg` |

First push with migrations will run `supabase db push` against the new project.

## 3. Vercel environment variables

In Vercel → **portal** project → Settings → Environment Variables, set (Production + Preview):

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://hwntncyiqaltzvlidscg.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable or anon key (Dashboard → API) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only — never expose to client |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL, e.g. `https://portal-skullcandyxxxs-projects.vercel.app` |

Optional (from Restaurant Hub; add when enabling features):

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, Turnstile secret
- `RESEND_API_KEY`, Stripe keys, etc. — see `docs/ENVIRONMENT.md`

Pull env locally:

```bash
pnpm vercel:env
```

## 4. Local development

```bash
cp apps/portal/.env.example apps/portal/.env.local
# Fill Supabase keys from Dashboard
pnpm install
pnpm dev:portal
```

## 5. More guides (from Restaurant Hub)

- `docs/SETUP.md` — local dev
- `docs/ENVIRONMENT.md` — all env vars
- `docs/DEPLOYMENT-VERCEL.md` — Vercel import steps
- `docs/SECURITY.md`, `SUPABASE_VERIFICATION_CHECKLIST.md` — production checks

## 6. Link Vercel to GitHub (one-time)

If not already connected via Cursor/Vercel MCP:

1. Vercel Dashboard → **portal** → Settings → Git  
2. Connect **Skullcandyxxx/Crypto-Pay**, production branch `master`  
3. Redeploy

Or CLI (logged in to Vercel):

```bash
cd "path/to/Crypto Pay"
pnpm vercel:link
# Then connect Git in the dashboard
```
