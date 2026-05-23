#!/usr/bin/env bash
# Patch Vercel project settings to use monorepo root and pnpm
# Usage:
#   VERCEL_TOKEN=xxxx PROJECT=your-project-id-or-name [TEAM_ID=team_xxx] ./scripts/update-vercel-project.sh
set -euo pipefail

if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "Error: VERCEL_TOKEN must be set"
  exit 1
fi
if [ -z "${PROJECT:-}" ]; then
  echo "Error: PROJECT must be set (project id or name)"
  exit 1
fi

TEAM_QUERY=""
if [ -n "${TEAM_ID:-}" ]; then
  TEAM_QUERY="?teamId=${TEAM_ID}"
fi

API_URL="https://api.vercel.com/v9/projects/${PROJECT}${TEAM_QUERY}"

read -r -d '' PAYLOAD <<'JSON'
{
  "rootDirectory": "/",
  "installCommand": "pnpm install",
  "buildCommand": "pnpm --filter ./apps/portal build",
  "outputDirectory": "apps/portal/.next",
  "framework": "nextjs"
}
JSON

echo "Patching project ${PROJECT}..."

resp=$(curl -sS -X PATCH "$API_URL" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" -w "\n%{http_code}")

body=$(echo "$resp" | sed '$d')
code=$(echo "$resp" | tail -n1)

if [ "$code" = "200" ]; then
  echo "Project updated successfully."
  echo "$body" | jq .
  exit 0
fi

echo "Failed to update project (HTTP $code):" >&2
echo "$body" | jq . >&2 || echo "$body" >&2
exit 1
