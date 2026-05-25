#!/usr/bin/env bash
# Cursor MCP: PhotoSphere Supabase (reads token from .env.supabase, never commit tokens).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${SUPABASE_ENV_FILE:-$ROOT/.env.supabase}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

REF="${SUPABASE_PROJECT_REF:-usbxwewohpsbjwiuazpf}"

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "MCP: missing SUPABASE_ACCESS_TOKEN in $ENV_FILE" >&2
  echo "Run: pnpm supabase:connect" >&2
  exit 1
fi

exec npx -y @supabase/mcp-server-supabase@latest \
  --access-token "$SUPABASE_ACCESS_TOKEN" \
  --project-ref "$REF"
