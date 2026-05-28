---
applyTo: '**'
description: 'AI coding agent instructions for Crypto Pay — crypto payment acceptance platform'
---

## Project: Crypto Pay

Accept crypto payments instantly, securely, and globally. Non-custodial wallet-to-wallet processing with a modern merchant dashboard.

- **GitHub:** https://github.com/photospheremedia/Crypto-Pay
- **Git workflow (humans):** [CONTRIBUTING.md](../CONTRIBUTING.md) — branches, commits, PRs, CI triggers
- **App:** Next.js 16 portal at `apps/portal` (port 3001)
- **Stack:** pnpm monorepo · Next.js 16 · Tailwind CSS v4 · Supabase (auth + DB) · TypeScript strict

---

## Token Efficiency Rules

1. **No unnecessary markdown files** — implement code, not docs
2. **No audit reports, summaries, or phase logs** — these have already cluttered this repo
3. **Brief proposals only** — 2-3 sentences before major changes, then wait for approval
4. **Fix it, don't document it**

---

## Architecture

```
apps/portal       — Next.js 16 main app (marketing + account dashboard + admin)
apps/storefront   — Demo storefront (mock data)
packages/db       — Supabase client factories
packages/shared   — Shared types and constants
supabase/         — Migrations and edge functions
```

### Route layout (`apps/portal/app`)

| Route | Purpose |
|-------|---------|
| `(marketing)/` | Public pages (home, pricing, how-it-works, developers) |
| `(login)/` `(signup)/` | Auth flows |
| `account/` | Merchant dashboard (wallet setup, orders, settings) |
| `admin/` | Internal control plane |
| `api/` | API routes (crypto-rates, chat, auth, etc.) |

### No middleware

`middleware.ts` is **not used** in Next.js 16. Route protection is via Supabase RLS + server-side auth checks.

---

## Branding

- **Name:** Crypto Pay
- **Tagline:** Accept Crypto Payments. Instantly. Securely. Globally.
- **Logo color:** `#f0531c` (matches `public/favicon.svg` and all app icons)
- **Brand orange palette** is defined in `app/globals.css` `@theme` block as `--color-orange-*`
- **Do not use emerald, teal, or cyan as primary brand colors** — those are for success states only

### Tailwind v4 gradient syntax

Always use `bg-linear-to-{dir}` — `bg-gradient-to-{dir}` was removed in Tailwind v4.1.

```tsx
// ✅ Correct
className="bg-linear-to-r from-orange-500 to-orange-600"

// ❌ Wrong (removed in v4.1)
className="bg-gradient-to-r from-orange-500 to-orange-600"
```

---

## Supabase

```typescript
// Server components and API routes
import { getSupabaseServerClient } from "@crypto-pay/db/supabaseServer";
const supabase = await getSupabaseServerClient();

// Service role (bypasses RLS — use sparingly)
import { getSupabaseServiceClient } from "@crypto-pay/db/supabaseServer";

// Auth — prefer getClaims() for performance
const { data } = await supabase.auth.getClaims(); // fastest, cached JWKS
const { data: { user } } = await supabase.auth.getUser(); // full user object
```

**RLS policies** — always specify `TO authenticated` and wrap `auth.uid()` in `SELECT`:

```sql
create policy "Users can access own records" on wallets
to authenticated
using ( (select auth.uid()) = user_id );
```

**SECURITY DEFINER functions** — always set `search_path = ''`:

```sql
create or replace function my_func()
returns boolean language plpgsql
security definer set search_path = ''
as $$ ... $$;
```

---

## Key Commands

```bash
pnpm install              # install all deps
pnpm dev:portal           # dev server on localhost:3001
pnpm typecheck:portal     # run tsc via portal workspace
pnpm db:types             # regenerate database.types.ts
pnpm db:push              # push migrations to Supabase
pnpm build:portal         # production build
pnpm test                 # Playwright E2E tests
```

---

## Tech Stack Details

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16.1.6 (App Router) |
| Styling | Tailwind CSS v4 + tw-animate-css |
| Components | Radix UI primitives + shadcn/ui pattern |
| Auth | Supabase Auth (email + OAuth) |
| Database | Supabase PostgreSQL with RLS |
| Email | Resend via `apps/portal/lib/email/` |
| Rate limiting | Upstash Redis |
| CAPTCHA | Cloudflare Turnstile |
| AI / Chat | Groq (`llama-3.3-70b-versatile`) + OpenAI fallback |
| Deployment | Netlify (portal) + Supabase edge functions |
| Testing | Playwright E2E |

---

## AI Chat

```typescript
import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

const result = streamText({
  model: groq('llama-3.3-70b-versatile'),
  messages,
  maxOutputTokens: 1000, // not maxTokens
});
return result.toUIMessageStreamResponse();
```

---

## Email

```typescript
import { sendEmail } from '@/lib/email/sender';

await sendEmail({
  to: { email: 'user@example.com', name: 'User' },
  subject: 'Welcome to Crypto Pay',
  template: 'welcome',
  templateData: { firstName: 'John', dashboardUrl: '...' }
});
```

Brand colors for HTML emails are defined in `lib/email/config.ts` → `emailBrandColors` (uses `BRAND.colors` from `lib/cryptopay/constants.ts`).

---

## Crypto Rates

Live rates via CoinGecko at `apps/portal/app/api/crypto-rates/route.ts`.

Supported coins: BTC, ETH, LTC, USDT, USDC.
Supported fiat: USD, EUR, GBP, CAD, AUD.

---

## Environment Variables

Local: `apps/portal/.env.local` (copy from `apps/portal/.env.example`)

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `GROQ_API_KEY` (optional, falls back to OpenAI)

---

## MCP & Agent Skills

**Master workflow:** `.agents/skills/dev-workflow/SKILL.md` (always-on Cursor rule: `.cursor/rules/dev-workflow.mdc`).

While coding: lint/typecheck portal (`pnpm typecheck:portal`), watch dev server output, use Supabase MCP advisors/logs for backend.

**Documentation order:** project skill → Context7 MCP → domain MCP → CLI → web (last).

Project MCP config: `.cursor/mcp.json`. Agent skills: `.agents/skills/`. Library map: `dev-workflow/library-index.md`.

| Step | Source | Use for |
|------|--------|---------|
| 1 | Project skills | `supabase`, `multilingual-website`, `shadcn`, `context7-mcp`, etc. |
| 2 | `context7` | Library/framework docs (`resolve-library-id` → `query-docs`) |
| 3 | Domain MCP | `supabase`, `shadcn` (cwd `apps/portal`), `netlify` — see `.cursor/rules/netlify-mcp.mdc` |
| 4 | CLI | `supabase`, `netlify`, `pnpm exec shadcn` when MCP lacks a tool |
| 5 | Web | WebSearch/WebFetch only if 1–4 fail |

### Context7

- **When:** setup/config questions, API references, or code using external libraries (Next.js, Supabase, Tailwind, etc.).
- **How:** `resolve-library-id` → pick best match → `query-docs` with library ID and the user's question.
- **Do not use for:** refactors, business-logic debugging, or generic programming concepts.
- **Optional:** set `CONTEXT7_API_KEY` in Cursor MCP env or `.env.local` for higher rate limits (get key at context7.com/dashboard).

### shadcn

- Run CLI from `apps/portal` or `npx shadcn@latest -c apps/portal`.
- Use MCP for registry search/install; use `shadcn info --json` for project config.

---

## Refactoring Rules

- **Minor** — implement directly
- **Moderate** — brief proposal, wait for approval
- **Major / breaking** — always stop and propose first

**Never** refactor without permission. **Never** create summary documents about changes made.
