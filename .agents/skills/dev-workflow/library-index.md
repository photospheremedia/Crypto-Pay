# Library & platform → skill / Context7 / MCP

Use with `.agents/skills/dev-workflow/SKILL.md`. Prefer **project skill** first, then **Context7** `libraryId` (resolve if unsure).

## Project skills (`.agents/skills/`)

| Topic | Skill path |
|-------|------------|
| Dev workflow (this) | `dev-workflow/SKILL.md` |
| Context7 usage | `context7-mcp/SKILL.md` |
| Next.js i18n / locales | `multilingual-website/SKILL.md` |
| Supabase (auth, RLS, migrations) | `supabase/SKILL.md` |
| Production DB safety & backups | `supabase-production-maintenance/SKILL.md` |
| Signup, confirm email, welcome (Supabase + Resend) | `auth-signup-flow/SKILL.md` |
| Postgres tuning | `supabase-postgres-best-practices/SKILL.md` |
| Resend transactional + Auth SMTP | `resend/SKILL.md` |
| shadcn/ui | `shadcn/SKILL.md` (+ `apps/portal/.agents/skills/shadcn/`) |
| Netlify deploy/config | `netlify-cli-and-deploy/SKILL.md`, `netlify-config/SKILL.md` |

## Context7 library IDs (common in this repo)

Resolve with `resolve-library-id` when version-specific IDs matter.

| Stack | Typical Context7 ID |
|-------|---------------------|
| Next.js | `/vercel/next.js` |
| React | `/facebook/react` |
| next-intl | `/amannn/next-intl` |
| Supabase JS | `/supabase/supabase-js` |
| Drizzle | `/drizzle-team/drizzle-orm` |
| Tailwind CSS v4 | `/tailwindlabs/tailwindcss` |
| Playwright | `/microsoft/playwright` |
| Vercel AI SDK | `/vercel/ai` |
| Resend | `/websites/resend` or `/resend/resend` |
| Supabase Auth guides | `/websites/supabase` |
| Supabase SSR | `/supabase/ssr` |

## Domain MCP (no separate skill required)

| Need | Server |
|------|--------|
| Tables, migrations, logs, advisors | `supabase` |
| Component registry / add / docs | `shadcn` |
| Sites, deploys, env | `netlify` |

## Cursor plugin skills (user install — use when relevant)

Available under `~/.cursor/plugins/cache/…/skills/` when plugins enabled:

- `nextjs`, `next-upgrade`, `next-cache-components` (Vercel)
- `auth`, `ai-sdk`, `vercel-functions`, `env-vars`, `deployments-cicd`
- `supabase`, `supabase-postgres-best-practices` (Supabase plugin)
- `resend`, `react-email`, `email-best-practices` (Resend)

Prefer **project** `.agents/skills` copies when both exist (repo-specific conventions).
