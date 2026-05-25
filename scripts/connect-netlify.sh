#!/usr/bin/env bash
# Connect Netlify CLI + MCP to your account (PhotoSphere / photospheremedia).
#
# 1. Create token: https://app.netlify.com/user/applications#personal-access-tokens
# 2. cp .env.netlify.example .env.netlify → paste token
# 3. pnpm netlify:connect
#
# Or interactive: pnpm netlify:login (browser)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck source=lib/netlify-site.sh
source "$ROOT/scripts/lib/netlify-site.sh"
ENV_FILE="${NETLIFY_ENV_FILE:-$ROOT/.env.netlify}"

nl() {
  pnpm exec netlify "$@"
}

load_token() {
  [[ -f "$ENV_FILE" ]] || return 1
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
  [[ -n "${NETLIFY_AUTH_TOKEN:-}${NETLIFY_PERSONAL_ACCESS_TOKEN:-}" ]]
}

echo "==> Netlify connect (CLI + MCP)"
echo ""

if load_token; then
  export NETLIFY_AUTH_TOKEN="${NETLIFY_AUTH_TOKEN:-$NETLIFY_PERSONAL_ACCESS_TOKEN}"
  export NETLIFY_PERSONAL_ACCESS_TOKEN="${NETLIFY_PERSONAL_ACCESS_TOKEN:-$NETLIFY_AUTH_TOKEN}"
  echo "    Token: loaded from $(basename "$ENV_FILE")"
  echo ""
  echo "==> CLI account:"
  if nl status 2>&1; then
    :
  else
    nl api whoami 2>&1 || true
  fi
  echo ""
  if [[ ! -f "$ROOT/.netlify/state.json" ]]; then
    echo "==> Linking site $NETLIFY_SITE_NAME..."
    nl link --name "$NETLIFY_SITE_NAME" -y 2>&1 || nl init -y 2>&1 || true
  else
    echo "==> Already linked:"
    nl status 2>&1 || true
  fi
  echo ""
  echo "==> MCP: restart Cursor (or reload MCP) so the netlify server connects"
  echo "    Then use MCP tools (list-sites, get-site-info) — see .cursor/rules/netlify-mcp.mdc"
  echo "    Optional: pnpm netlify:env-sync"
  exit 0
fi

echo "No token in $ENV_FILE"
echo ""
if [[ -t 0 ]]; then
  echo "Opening browser login (interactive)..."
  nl login
  nl link --name "$NETLIFY_SITE_NAME" -y || nl init
  echo ""
  echo "Save token for MCP: create PAT and add to .env.netlify"
else
  echo "Run in Terminal:"
  echo "  cp .env.netlify.example .env.netlify"
  echo "  # paste PAT from https://app.netlify.com/user/applications#personal-access-tokens"
  echo "  pnpm netlify:connect"
  echo "  # or: pnpm netlify:login"
  if [[ "$(uname -s)" == "Darwin" ]]; then
    open "https://app.netlify.com/user/applications#personal-access-tokens" 2>/dev/null || true
  fi
  exit 1
fi
