---
name: dev-workflow
description: >-
  Crypto Pay development workflow. While implementing features, proactively
  checks Next.js/portal and backend (Supabase, API routes) for errors; resolves
  library questions via project skills, then Context7 MCP, domain MCP, CLI, and
  web last. Use when coding in apps/portal, API routes, Supabase migrations,
  or when debugging build/runtime/type errors during active development.
---

# Crypto Pay — development workflow

Apply this skill for **every implementation task** in this repo (portal, API, DB, infra). Do not wait for the user to ask for checks or docs.

## 1. Health checks while coding

Run checks **incrementally** — after meaningful edits, before declaring done.

### Portal (Next.js)

| When | Action |
|------|--------|
| After editing TS/TSX in `apps/portal` | `ReadLints` on touched paths |
| Type errors suspected or API/types changed | `pnpm typecheck:portal` (repo root) |
| Routing, middleware, RSC, caching, `next.config` | Context7: `/vercel/next.js` (match installed version in `apps/portal/package.json`) |
| Before “done” on UI/routes | Confirm dev server terminal has no new errors; run targeted Playwright spec if one exists for the flow |

### Backend & data

| When | Action |
|------|--------|
| Migrations, RLS, SQL, schema | Read `.agents/skills/supabase/SKILL.md`; production: `.agents/skills/supabase-production-maintenance/SKILL.md`; use **Supabase MCP** (`list_tables`, `get_advisors`) before changing production patterns |
| Auth/session/API routes under `apps/portal/app/api` | Verify types + `lib/` helpers; check Supabase logs via MCP if behavior is wrong |
| Postgres performance | `.agents/skills/supabase-postgres-best-practices/SKILL.md` |
| Signup, email confirm, welcome mail | `.agents/skills/auth-signup-flow/SKILL.md` |
| Email (Resend) | `.agents/skills/resend/SKILL.md` or Context7 `/websites/resend` |

### Monorepo scripts (CLI verification)

```bash
pnpm typecheck:portal          # TypeScript
pnpm build:portal              # Full Next build — use before merge-sized changes
pnpm test                      # Playwright (portal)
pnpm supabase:status           # Local/linked Supabase CLI
```

Prefer **targeted** commands over full build when iterating.

## 2. Documentation & guidance — strict order

For any library, API, or platform question:

```
1. Project skill     → .agents/skills/<name>/SKILL.md (see library-index.md)
2. Context7 MCP      → resolve-library-id → query-docs (read tool schemas first)
3. Domain MCP        → supabase | shadcn (this repo’s .cursor/mcp.json)
4. CLI               → --help, official CLI (supabase, vercel, shadcn, etc.)
5. Web               → WebSearch / WebFetch only if 1–4 fail or MCP unavailable
```

**Never** skip to web search when Context7 or a project skill covers the stack.

### Context7 MCP (required pattern)

Server: `context7` (also `project-0-crypto-pay-context7`). **Read** `tools/resolve-library-id.json` and `tools/query-docs.json` before calling.

1. `resolve-library-id` with `libraryName` + full user/task `query`
2. Pick best match (official package, version if specified)
3. `query-docs` with `libraryId` + specific question (max 3 calls per question per Context7 rules)

Detailed steps: `.agents/skills/context7-mcp/SKILL.md`

### Domain MCP (when topic matches)

| Topic | MCP server | Notes |
|-------|------------|--------|
| Supabase DB/auth/logs | `supabase` | Advisors + logs before schema guesses |
| shadcn/ui components | `shadcn` | `apps/portal` cwd; see `shadcn/mcp.md` |
| Vercel deploy/site | — | `docs/VERCEL_MIGRATION.md`, `.cursor/rules/vercel-photosphere.mdc` |

### CLI (after MCP)

Use for **verification**, not primary docs:

- `pnpm exec supabase --help`, `supabase db …`
- `pnpm vercel:deploy` / `pnpm vercel:env-sync` (PhotoSphere account)
- `npx shadcn@latest …` — see `.agents/skills/shadcn/cli.md`

### Web (last resort)

WebSearch/WebFetch only when MCP and CLI do not answer, or for vendor status/incidents.

## 3. i18n & portal conventions

Locale/routing/copy: `.agents/skills/multilingual-website/SKILL.md` before inventing routing or `messages/*.json` patterns.

## 4. Definition of done (implementation)

- [ ] Lints clean on changed files
- [ ] `pnpm typecheck:portal` passes (if types touched)
- [ ] No new errors in dev terminal (if server running)
- [ ] Library usage matches fetched docs / project skill (not stale training data)
- [ ] Backend: RLS/migrations/advisors considered for data changes
- [ ] User-facing strings go through i18n when in portal UI

## 5. Quick reference

- Library → skill map: [library-index.md](library-index.md)
- Context7 only: [../context7-mcp/SKILL.md](../context7-mcp/SKILL.md)
- MCP config: `.cursor/mcp.json`
