#!/usr/bin/env bash
# Reconcile production migration history when MCP/dashboard applied ad-hoc versions
# that duplicate repo migrations (20260528*). Safe to re-run: no-ops when already aligned.
#
# Usage: pnpm supabase:migration:repair-drift
# Requires: pnpm supabase:connect (linked usbxwewohpsbjwiuazpf)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ORPHAN_VERSIONS=(
  20260528035414
  20260528035617
  20260528040513
)

REPO_EQUIVALENTS=(
  20260528000000
  20260528000001
  20260528000002
)

echo "==> Revert orphan remote-only migration versions (schema already applied)"
supabase migration repair --status reverted "${ORPHAN_VERSIONS[@]}"

echo "==> Mark canonical repo migrations as applied"
supabase migration repair --status applied "${REPO_EQUIVALENTS[@]}"

echo "==> Push any pending repo migrations"
supabase db push

echo "==> Current migration list"
supabase migration list | tail -15
