---
name: supabase-production-maintenance
description: >-
  Protects Crypto Pay production Supabase data (PhotoSphere usbxwewohpsbjwiuazpf)
  during schema work, migrations, and ops. Use when changing migrations, running
  db push, restoring backups, deleting users/tenants, or when the user asks about
  database maintenance, backups, PITR, or avoiding data loss.
---

# Supabase production maintenance (Crypto Pay)

## Non-negotiables

| Rule | Why |
|------|-----|
| **Production project only:** `usbxwewohpsbjwiuazpf` (PhotoSphere) | Wrong ref wipes or corrupts the wrong database |
| **`git push` / GitHub never changes Supabase data** | Only migrations, dashboard, or API calls touch rows |
| **Never `supabase db reset --linked` on production** | Destroys all data and auth users |
| **Never `DROP TABLE` / mass `DELETE` without explicit user approval** | Irreversible without restore |
| **Never delete `auth.users` or run destructive scripts without confirmation** | Merchants lose login and wallets |
| **Never run `migration repair --status reverted` on production** without understanding impact | Breaks migration history |

Read **`docs/SUPABASE_MAINTENANCE_AND_BACKUPS.md`** before any production schema or data change.

## Before changing production schema

1. Confirm linked project: `pnpm supabase:status` → ref `usbxwewohpsbjwiuazpf`.
2. Run advisors: Supabase MCP `get_advisors` (security + performance).
3. Prefer **repo migrations** + `pnpm db:push` (linked) over ad-hoc MCP `apply_migration` on live.
4. Dry-run mentally: idempotent `IF NOT EXISTS`, safe `DROP POLICY IF EXISTS`, no `DROP TRIGGER` on missing tables without guards.
5. After push: `pnpm db:types`, smoke-test portal (`admin_dashboard_stats`, wallet list).

## What does NOT protect data

- Committing or force-pushing git
- Editing portal code only
- Regenerating TypeScript types

## Backups (platform vs app)

| Layer | What it is | Where |
|-------|------------|--------|
| **Supabase daily / PITR** | Platform snapshots + WAL | Dashboard → Database → Backups / Point in Time |
| **`public.backup_logs`** | App metadata table only | Not a substitute for platform backups |
| **Logical dump** | `pnpm supabase:db:dump` | Off-site copy; run before risky changes |

Check status: `pnpm supabase:backup:status` (shows org plan; Free blocks PITR)

| Command | When |
|---------|------|
| `pnpm supabase:db:dump` | Works on Free — run before risky migrations |
| `pnpm supabase:backup:enable` | After org upgrades to Pro — API enables Small + PITR |

## Restore = downtime

Dashboard restore or PITR **takes the project offline**. Coordinate with the user; do not trigger restore via API unless they explicitly ask.

## Agent checklist (production)

```
[ ] SUPABASE_PROJECT_REF = usbxwewohpsbjwiuazpf
[ ] User approved destructive SQL (if any)
[ ] backup status checked OR user accepts risk
[ ] Migration tested locally / on branch when possible
[ ] No auth.users / tenant mass-delete in migration
[ ] Advisors re-run after schema change
```

## Related

| Resource | Path |
|----------|------|
| Full maintenance + backup setup | `docs/SUPABASE_MAINTENANCE_AND_BACKUPS.md` |
| Supabase skill | `.agents/skills/supabase/SKILL.md` |
| RLS / tenants | `docs/MULTITENANT_SECURITY_CHECKLIST.md` |
| Platform env | `docs/PLATFORM_CONFIGURATION.md` |
