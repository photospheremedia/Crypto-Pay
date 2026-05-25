#!/usr/bin/env bash
# Cursor MCP: Netlify (reads token from .env.netlify — gitignored).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${NETLIFY_ENV_FILE:-$ROOT/.env.netlify}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

# MCP server expects NETLIFY_PERSONAL_ACCESS_TOKEN
if [[ -n "${NETLIFY_AUTH_TOKEN:-}" && -z "${NETLIFY_PERSONAL_ACCESS_TOKEN:-}" ]]; then
  export NETLIFY_PERSONAL_ACCESS_TOKEN="$NETLIFY_AUTH_TOKEN"
fi

if [[ -z "${NETLIFY_PERSONAL_ACCESS_TOKEN:-}" ]]; then
  echo "MCP: missing token in $ENV_FILE" >&2
  echo "Create PAT: https://app.netlify.com/user/applications#personal-access-tokens" >&2
  echo "Then: pnpm netlify:connect" >&2
  exit 1
fi

exec npx -y @netlify/mcp@latest
