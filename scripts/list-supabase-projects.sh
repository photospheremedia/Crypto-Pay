#!/usr/bin/env bash
# List Supabase projects using the Management API
# Usage: source .env.local && ./scripts/list-supabase-projects.sh
set -euo pipefail

if [ -z "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  echo "Error: SUPABASE_ACCESS_TOKEN must be set"
  exit 1
fi

echo "Fetching Supabase projects..."

curl -sS -X GET "https://api.supabase.com/v1/projects" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" | jq .
