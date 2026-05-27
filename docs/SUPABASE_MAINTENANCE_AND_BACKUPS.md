# Supabase maintenance & backups (Crypto Pay)

**Production project:** PhotoSphere — `usbxwewohpsbjwiuazpf`  
**Dashboard:** https://supabase.com/dashboard/project/usbxwewohpsbjwiuazpf

**Agents:** read [supabase-production-maintenance skill](../.agents/skills/supabase-production-maintenance/SKILL.md) before any migration, restore, or destructive SQL.

---

## What is protected vs not

| Action | Affects live users / data? |
|--------|----------------------------|
| `git push`, deploy portal, edit docs | **No** — code only |
| `pnpm db:push` on linked PhotoSphere | **Yes** — schema + can break app if wrong |
| `supabase db reset` (linked) | **Yes** — **wipes entire database** |
| Dashboard restore / PITR restore | **Yes** — downtime; data rolled back to a point in time |
| Deleting users in Auth dashboard | **Yes** — permanent for that user |
| `DELETE` / `DROP` in SQL | **Yes** |

**Rule:** Treat PhotoSphere as the single source of truth for merchants, wallets, and auth. When in doubt, ask before destructive work.

---

## Agent & developer guidelines (do not ruin production data)

### Always

1. Use **only** `usbxwewohpsbjwiuazpf` (see `.env.supabase`, `apps/portal/.env.local`, GitHub `SUPABASE_PROJECT_REF`).
2. Run `pnpm supabase:status` and confirm the linked ref before `db:push`.
3. Apply schema via **versioned migrations** in `supabase/migrations/` and `pnpm db:push` — not one-off MCP SQL on production unless emergency and user-approved.
4. Use idempotent patterns: `IF NOT EXISTS`, `DROP … IF EXISTS`, `DO $$ … IF to_regclass …` for optional objects.
5. After schema changes: Supabase MCP `get_advisors`, `pnpm db:types`, smoke-test admin stats + wallet APIs.

### Never (without explicit user approval)

- `supabase db reset --linked` on production
- `DROP TABLE` on tenant/user/wallet tables
- Bulk `DELETE FROM auth.users` or `memberships`
- `migration repair` on production without a written plan
- Pointing `.env.local` at another project ref “just to test”
- Assuming `public.backup_logs` replaces platform backups

### `public.backup_logs` is not platform backup

Migration `20260202213118_add_audit_and_backup_logging.sql` creates an **application** table for backup job metadata. It does **not** back up Postgres or Auth. Use Supabase Dashboard backups + optional `pnpm supabase:db:dump` for real recovery.

---

## Supabase backup types (official)

Source: [Database Backups](https://supabase.com/docs/guides/platform/backups)

| Type | Granularity | Plans | Notes |
|------|-------------|-------|--------|
| **Daily backups** | Once per day | Free, Pro, Team, Enterprise | Pro: 7 days retention; restore from Dashboard → Database → Backups |
| **Point-in-Time Recovery (PITR)** | ~2 min RPO | Pro+ add-on | Requires **Small compute** or larger; replaces daily backups when enabled |
| **Physical backups** | Underlying snapshots + WAL | Postgres 15.8.1.079+ | PhotoSphere uses WAL-G when PITR enabled |

**Not included in DB backups:** Storage object files (only metadata in DB). Custom role passwords are not in downloadable daily backups — reset after restore if needed.

---

## Setup checklist (PhotoSphere production)

Run `pnpm supabase:backup:status` to print API status and this checklist.

### 0. Plan requirement (current blocker)

PhotoSphere’s org (`photospheremedia`) is on the **Free** plan as of the last API check. Supabase returns:

`Project addons cannot be edited on the free tier.`

| Capability | Free | Pro+ |
|------------|------|------|
| Daily backups (7-day on Pro) | Limited | Yes |
| PITR add-on | No | Yes (~$100–400/mo by retention) |
| `pnpm supabase:backup:enable` | Exits with upgrade instructions | Enables Small compute + PITR via API |
| `pnpm supabase:db:dump` | **Yes** (logical SQL dump) | Yes |

**Upgrade:** [Org billing](https://supabase.com/dashboard/org/xrjxgpvrileqpzfopehl/billing) → Pro, then run `pnpm supabase:backup:enable` or use Dashboard → Database → Backups.

### 1. Daily backups (baseline)

1. Open [Database → Backups](https://supabase.com/dashboard/project/usbxwewohpsbjwiuazpf/database/backups).
2. Confirm daily backups appear (Pro: last 7 days).
3. Note the latest backup time before risky migrations.

### 2. Point-in-Time Recovery (recommended for production)

PITR is **not enabled** until you turn it on in the dashboard (check with `pnpm supabase:backup:status`).

1. **Compute:** Project must use at least **Small** compute add-on ([docs](https://supabase.com/docs/guides/platform/backups#point-in-time-recovery)).
2. **Enable:** [Database → Backups → Point in Time](https://supabase.com/dashboard/project/usbxwewohpsbjwiuazpf/database/backups/pitr) → enable add-on.
3. **Retention:** Choose 7 / 14 / 28 days ([pricing](https://supabase.com/docs/guides/platform/manage-your-usage/point-in-time-recovery)).
4. **Note:** Enabling PITR stops separate daily backups (PITR is finer-grained).

### 3. Off-site logical dump (optional, best practice)

Before large migrations or quarterly:

```bash
pnpm supabase:login    # if needed
pnpm supabase:db:dump  # writes to backups/ (gitignored)
```

Uses `supabase db dump` against the **linked** project. Store the `.sql` file outside the repo (1Password, S3, encrypted disk).

### 4. Auth & storage

- **Auth users:** not fully captured by logical dump alone — use [Auth export](https://supabase.com/docs/guides/platform/migrating-within-supabase) or rely on PITR for full restore.
- **Storage buckets:** back up objects separately if you rely on uploaded files.

### 5. Management API (automation)

After **Pro** upgrade:

```bash
pnpm supabase:backup:enable   # Small compute + PITR (default 7-day: pitr_7)
# Optional: PITR_VARIANT=pitr_14 pnpm supabase:backup:enable
```

```bash
# From repo root, with .env.supabase loaded:
pnpm supabase:backup:status

# Or manually:
export SUPABASE_ACCESS_TOKEN="sbp_..."   # PhotoSphere account token
export PROJECT_REF="usbxwewohpsbjwiuazpf"
curl -sS -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/database/backups"
```

Restore via API (downtime): [restore-pitr](https://supabase.com/docs/guides/platform/backups#managing-backups-programmatically) — only when the user explicitly requests it.

---

## Restore process (human)

1. Pick backup **before** the incident time (Dashboard shows available points).
2. Expect **full project downtime** until restore completes.
3. Re-create replication slots / subscriptions if you use them (Realtime slot is handled by Supabase).
4. Re-test portal login, wallets, and admin stats.

Duplicate to a new project (safer drill): [Duplicate project](https://supabase.com/docs/guides/platform/duplicate-project).

---

## Commands (repo)

| Command | Purpose |
|---------|---------|
| `pnpm supabase:backup:status` | API: org plan, PITR on/off, backup list, dashboard links |
| `pnpm supabase:backup:enable` | Pro+: enable Small compute + PITR via Management API |
| `pnpm supabase:db:dump` | Logical SQL dump → `backups/` |
| `pnpm supabase:status` | Confirm linked ref + token |
| `pnpm db:push` | Apply migrations to linked DB |
| `pnpm db:types` | Regenerate types after schema change |

---

## Related docs

| Doc | Topic |
|-----|--------|
| [PLATFORM_CONFIGURATION.md](./PLATFORM_CONFIGURATION.md) | Env vars, migrations, edge functions |
| [MULTITENANT_SECURITY_CHECKLIST.md](./MULTITENANT_SECURITY_CHECKLIST.md) | RLS, tenant isolation |
| [PROD_READINESS.md](./PROD_READINESS.md) | Ship checklist |
| [ACCOUNT-CREDENTIALS.md](./ACCOUNT-CREDENTIALS.md) | Tokens (never commit) |
