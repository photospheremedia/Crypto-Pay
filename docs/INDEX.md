# Crypto Pay documentation index

**Agents: read this file first** before implementing features, changing infra, or answering architecture questions. It routes you to the right doc—do not guess platform boundaries or env setup.

**End-to-end env + APIs:** [ENV_AND_API_GUIDE.md](./ENV_AND_API_GUIDE.md) — system map, every env var, sync commands, auth layers, and portal/Edge/Runner flows.

**Humans:** same entry point for onboarding and ops.

---

## Start here (by task)

| I need to… | Read |
|------------|------|
| Understand what Crypto Pay vs Runner owns | [crypto-pay-platform skill](../.agents/skills/crypto-pay-platform/SKILL.md) → [RUNNER_INTEGRATION.md](./RUNNER_INTEGRATION.md) |
| Configure **Supabase** | [supabase skill](../.agents/skills/supabase/SKILL.md) → [PLATFORM_CONFIGURATION.md](./PLATFORM_CONFIGURATION.md) |
| Protect production DB / backups | [supabase-production-maintenance skill](../.agents/skills/supabase-production-maintenance/SKILL.md) → [SUPABASE_MAINTENANCE_AND_BACKUPS.md](./SUPABASE_MAINTENANCE_AND_BACKUPS.md) |
| Configure **Resend** (email) | [resend skill](../.agents/skills/resend/SKILL.md) → [EMAIL_SETUP_CRYPTO_PAY.md](./EMAIL_SETUP_CRYPTO_PAY.md) |
| Configure **Vercel** (portal deploy) | [VERCEL_MIGRATION.md](./VERCEL_MIGRATION.md) → [PLATFORM_CONFIGURATION.md](./PLATFORM_CONFIGURATION.md) |
| Know merchant UI vs admin UI | [MERCHANT_VS_ADMIN_UI.md](./MERCHANT_VS_ADMIN_UI.md) |
| Set up local dev / login | [LOCAL_DEV.md](./LOCAL_DEV.md) |
| Trace merchant signup → wallet → verify | [ACCOUNT_SETUP_WORKFLOW.md](./ACCOUNT_SETUP_WORKFLOW.md) |
| Integrate Runner (wallet attach, webhooks) | [RUNNER_INTEGRATION.md](./RUNNER_INTEGRATION.md) |
| Understand env vars + APIs end-to-end | [ENV_AND_API_GUIDE.md](./ENV_AND_API_GUIDE.md) |
| Add or change a portal API route | [ENV_AND_API_GUIDE.md](./ENV_AND_API_GUIDE.md) → [API_STYLE_GUIDE.md](./API_STYLE_GUIDE.md) → [ADMIN_AND_USER_API_REFERENCE.md](./ADMIN_AND_USER_API_REFERENCE.md) |
| Set up transactional email | [resend skill](../.agents/skills/resend/SKILL.md) → [EMAIL_SETUP_CRYPTO_PAY.md](./EMAIL_SETUP_CRYPTO_PAY.md) |
| Ship / production checklist | [PROD_READINESS.md](./PROD_READINESS.md) |
| Review RLS / multi-tenant safety | [MULTITENANT_SECURITY_CHECKLIST.md](./MULTITENANT_SECURITY_CHECKLIST.md) |
| Fix errors / i18n / API JSON | [ERROR_HANDLING.md](./ERROR_HANDLING.md) |
| Build or change **UI** (components, forms, admin) | [shadcn skill](../.agents/skills/shadcn/SKILL.md) — use shadcn MCP when adding components |
| How to code (lints, MCP order) | [dev-workflow skill](../.agents/skills/dev-workflow/SKILL.md) |

---

## Platform boundaries (summary)

| **Crypto Pay (this repo)** | **Runner (separate server)** |
|----------------------------|------------------------------|
| User management & auth | Payment processing & checkout |
| Merchant wallet registration | On-chain monitoring & settlement |
| Admin wallet verification | Charge APIs & payment webhooks |
| Email & comms (Resend) | `external_id` store mapping |

Do not integrate third-party payment SaaS by name in this codebase.

---

## Documentation catalog

### Architecture & agents

| Doc | Description |
|-----|-------------|
| [../.agents/skills/crypto-pay-platform/SKILL.md](../.agents/skills/crypto-pay-platform/SKILL.md) | Platform scope, config/UI pointers, agent checklist |
| [../.agents/skills/dev-workflow/SKILL.md](../.agents/skills/dev-workflow/SKILL.md) | Health checks, docs order (skills → MCP → CLI → web) |
| [../.agents/skills/dev-workflow/library-index.md](../.agents/skills/dev-workflow/library-index.md) | Skill ↔ Context7 ↔ MCP map |

### Platform skills (Supabase, Resend, Vercel)

| Service | Project skill | Project docs |
|---------|---------------|--------------|
| **Supabase** | [supabase/SKILL.md](../.agents/skills/supabase/SKILL.md) | [PLATFORM_CONFIGURATION.md](./PLATFORM_CONFIGURATION.md), [SUPABASE_MAINTENANCE_AND_BACKUPS.md](./SUPABASE_MAINTENANCE_AND_BACKUPS.md), [MULTITENANT_SECURITY_CHECKLIST.md](./MULTITENANT_SECURITY_CHECKLIST.md) |
| **Resend** | [resend/SKILL.md](../.agents/skills/resend/SKILL.md) | [EMAIL_SETUP_CRYPTO_PAY.md](./EMAIL_SETUP_CRYPTO_PAY.md) |
| **Vercel** | — | [VERCEL_MIGRATION.md](./VERCEL_MIGRATION.md), [PLATFORM_CONFIGURATION.md](./PLATFORM_CONFIGURATION.md) |

Postgres tuning (with Supabase): [supabase-postgres-best-practices/SKILL.md](../.agents/skills/supabase-postgres-best-practices/SKILL.md).

### UI skill (shadcn/ui)

| Topic | Project skill | Notes |
|-------|---------------|--------|
| **shadcn/ui** | [shadcn/SKILL.md](../.agents/skills/shadcn/SKILL.md) | Portal components in `apps/portal/components/ui/`; CLI + **shadcn MCP**; styling rules in `shadcn/rules/` |
| Locales / copy | [multilingual-website/SKILL.md](../.agents/skills/multilingual-website/SKILL.md) | Use with shadcn for translated merchant/admin UI |

### Configuration & hosting

| Doc | Description |
|-----|-------------|
| [ENV_AND_API_GUIDE.md](./ENV_AND_API_GUIDE.md) | **Master guide** — env matrix, sync playbook, `/api` families, auth, E2E flows |
| [PLATFORM_CONFIGURATION.md](./PLATFORM_CONFIGURATION.md) | **Supabase**, **Resend**, **Netlify** — env, sync scripts, deploy order |
| [EMAIL_SETUP_CRYPTO_PAY.md](./EMAIL_SETUP_CRYPTO_PAY.md) | Resend domains, `pnpm resend:sync`, wallet email flows |
| [LOCAL_DEV.md](./LOCAL_DEV.md) | `dev:setup`, redirect URLs, Playwright, troubleshooting |
| [PROD_READINESS.md](./PROD_READINESS.md) | Advisors, edge functions, production env checklist |
| [SUPABASE_MAINTENANCE_AND_BACKUPS.md](./SUPABASE_MAINTENANCE_AND_BACKUPS.md) | Production data safety, daily backups, PITR, logical dumps |
| [PORKBUN-SECRETS.md](./PORKBUN-SECRETS.md) | Domain/DNS API (ops) |
| [ACCOUNT-CREDENTIALS.md](./ACCOUNT-CREDENTIALS.md) | Org accounts (secrets in gitignored local file) |

### UI surfaces

| Doc | Description |
|-----|-------------|
| [MERCHANT_VS_ADMIN_UI.md](./MERCHANT_VS_ADMIN_UI.md) | `/account` (merchant) vs `/admin` (staff), realms, route map |
| [ACCOUNT_SETUP_WORKFLOW.md](./ACCOUNT_SETUP_WORKFLOW.md) | Signup, wallets tab, admin verification sequence |

### APIs & integration

| Doc | Description |
|-----|-------------|
| [RUNNER_INTEGRATION.md](./RUNNER_INTEGRATION.md) | Runner API (HMAC), webhooks, `external_id`, examples |
| [API_STYLE_GUIDE.md](./API_STYLE_GUIDE.md) | Route handler auth, errors, multi-tenant rules |
| [ADMIN_AND_USER_API_REFERENCE.md](./ADMIN_AND_USER_API_REFERENCE.md) | Living `/api/*` index |

### Quality & security

| Doc | Description |
|-----|-------------|
| [MULTITENANT_SECURITY_CHECKLIST.md](./MULTITENANT_SECURITY_CHECKLIST.md) | RLS, tenant isolation |
| [ERROR_HANDLING.md](./ERROR_HANDLING.md) | next-intl, boundaries, safe JSON |

### Repo meta

| Doc | Description |
|-----|-------------|
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | Git workflow, PRs, CI |
| [../.github/copilot-instructions.md](../.github/copilot-instructions.md) | Copilot agent summary |
| [../README.md](../README.md) | Repo overview & quick commands |

---

## Key code locations

| Concern | Path |
|---------|------|
| Merchant realm / routes | `apps/portal/lib/auth/user-realm.ts`, `proxy.ts` |
| Admin auth | `apps/portal/lib/admin-auth.ts` |
| Merchant wallets (portal) | `apps/portal/lib/wallets/merchant-wallet-service.ts` |
| Account API | `apps/portal/app/api/account/wallets/` |
| Admin wallet verify | `apps/portal/app/api/admin/wallets/route.ts` |
| Runner edge API | `supabase/functions/runner-api/index.ts` |
| Runner → portal webhook | `apps/portal/lib/runner-api/dispatch-wallet-webhook.ts` |
| Sign Runner requests | `apps/portal/lib/runner-api/sign-request.ts` |
| Portal env template | `apps/portal/.env.example` |
| Vercel build | `vercel.json` |
| shadcn config + UI primitives | `apps/portal/components.json`, `apps/portal/components/ui/` |
| Account / admin feature UI | `apps/portal/components/account/`, `apps/portal/components/admin/` |

---

## Agent workflow (mandatory order)

1. **`docs/INDEX.md`** (this file) — pick the right doc for the task  
2. **Platform / stack skill** when applicable:
   - Supabase (DB, auth, RLS, migrations, edge) → `.agents/skills/supabase/SKILL.md`
   - Resend (email) → `.agents/skills/resend/SKILL.md`
   - Vercel (deploy, env) → [VERCEL_MIGRATION.md](./VERCEL_MIGRATION.md)
   - **shadcn/ui** (portal UI, forms, tables, dialogs) → `.agents/skills/shadcn/SKILL.md`
3. **`.agents/skills/crypto-pay-platform/SKILL.md`** — if touching users, wallets, Runner, or platform boundaries  
4. **Task-specific doc** from the catalog above  
5. **`.agents/skills/dev-workflow/SKILL.md`** — while implementing (lints, typecheck, MCP)  
6. **Context7 / domain MCP** — library APIs only after project docs (see dev-workflow skill)

---

## Cursor rules (always on)

| Rule | Path |
|------|------|
| Platform boundaries | `.cursor/rules/crypto-pay-platform.mdc` |
| Dev workflow | `.cursor/rules/dev-workflow.mdc` |
| Vercel (PhotoSphere) | `.cursor/rules/vercel-photosphere.mdc` |

---

*Last updated: documentation index for Crypto Pay monorepo — prefer updating this file when adding new `docs/*.md` guides.*
