---
name: netlify
description: >-
  Crypto Pay Netlify hosting. Use for portal deploys, netlify.toml, env sync,
  crypto-pay-portal site, GitHub Actions CI, Netlify MCP/CLI, or production
  cryptopay.sale configuration.
---

# Netlify (Crypto Pay)

The **portal** (`apps/portal`) is hosted on Netlify as site **crypto-pay-portal** → production **cryptopay.sale**.

## Read first

| Resource | Path |
|----------|------|
| Documentation index | `docs/INDEX.md` |
| Supabase + Resend + Netlify env | `docs/PLATFORM_CONFIGURATION.md` (Netlify section) |
| Ship checklist | `docs/PROD_READINESS.md` |
| Cursor Netlify MCP rule | `.cursor/rules/netlify-mcp.mdc` |

## Child skills (deeper reference)

| Topic | Skill |
|-------|--------|
| CLI, deploy, link, env | `.agents/skills/netlify-cli-and-deploy/SKILL.md` |
| `netlify.toml` syntax | `.agents/skills/netlify-config/SKILL.md` |

## This repo setup

| Item | Value |
|------|--------|
| Config file | Root `netlify.toml` |
| Build base | `apps/portal` |
| Build command | `pnpm install` + `pnpm --filter @crypto-pay/portal build` |
| Publish | `apps/portal/.next` |
| Node | 24 (see `[build.environment]` in `netlify.toml`) |
| Plugin | `@netlify/plugin-nextjs` |

**One canonical site** — do not create duplicate Netlify sites from Git import. Run `pnpm netlify:audit` or use **Netlify MCP** `list-sites` when unsure.

## Commands (repo root)

```bash
cp .env.netlify.example .env.netlify   # NETLIFY_AUTH_TOKEN
pnpm netlify:connect
pnpm netlify:status
pnpm netlify:env-sync    # apps/portal/.env.local → Netlify UI
pnpm netlify:deploy      # production
pnpm netlify:preview     # deploy preview
pnpm netlify:audit
```

CI: `.github/workflows/netlify.yml` (push to `main`/`master` when portal changes).

## Required Netlify env vars

Sync from `apps/portal/.env.local` via `pnpm netlify:env-sync`:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server routes only)
- `NEXT_PUBLIC_APP_URL=https://cryptopay.sale`
- `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO`, `ADMIN_REVIEW_EMAIL`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- Optional: `GROQ_API_KEY` / `OPENAI_API_KEY` for chat

## Agent preferences

1. Prefer **Netlify MCP** in Cursor over raw CLI when the server is enabled (see `.cursor/mcp.json` → `scripts/mcp-netlify.sh`).
2. Avoid triple deploy: if GitHub Actions builds on push, disable redundant Netlify UI auto-build.
3. DNS for `cryptopay.sale` may use Porkbun scripts (`pnpm dns:apply`) — see `docs/PORKBUN-SECRETS.md`.

## Related skills

| Skill | Path |
|-------|------|
| Platform scope | `.agents/skills/crypto-pay-platform/SKILL.md` |
| Supabase | `.agents/skills/supabase/SKILL.md` |
| Resend (env sync) | `.agents/skills/resend/SKILL.md` |
