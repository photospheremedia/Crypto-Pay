# Crypto Pay — Supabase project

This repo uses **one** Supabase project. Do not use the old Restaurant Hub ref (`xfairwgarmpvbogiuduk`).

| Field | Value |
|-------|--------|
| **Project URL** | https://hwntncyiqaltzvlidscg.supabase.co |
| **Project ref** | `hwntncyiqaltzvlidscg` |
| **Cursor MCP connection** | `C412-6403` |
| **MCP URL** (in `.vscode/mcp.json`) | `https://mcp.supabase.com/mcp?project_ref=hwntncyiqaltzvlidscg` |
| **Dashboard** | https://supabase.com/dashboard/project/hwntncyiqaltzvlidscg |

## Verify in Cursor

1. Open **Cursor Settings → MCP → Supabase** (connection **C412-6403**).
2. Confirm the linked project ref is **`hwntncyiqaltzvlidscg`**.
3. Ask the agent to run `list_projects` — you should see only this project (or this as the active one).

## Local env

```bash
NEXT_PUBLIC_SUPABASE_URL=https://hwntncyiqaltzvlidscg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Dashboard → API → anon or publishable key>
SUPABASE_SERVICE_ROLE_KEY=<server only>
NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL=https://hwntncyiqaltzvlidscg.supabase.co/functions/v1
```

## GitHub Actions

- `SUPABASE_PROJECT_REF` = `hwntncyiqaltzvlidscg`
- `SUPABASE_ACCESS_TOKEN` = your Supabase personal access token

## Code reference

Shared constants: `apps/portal/lib/cryptopay/constants.ts` → `SUPABASE`.
