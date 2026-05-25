#!/usr/bin/env bash
# Connect CLI + MCP to PhotoSphere Media (photospheremedia00@gmail.com).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="$ROOT/.env.supabase"
PORTAL_ENV="$ROOT/apps/portal/.env.local"
TOKEN_URL="https://supabase.com/dashboard/account/tokens"

# Project ref from portal env
REF="usbxwewohpsbjwiuazpf"
if [[ -f "$PORTAL_ENV" ]]; then
  if grep -q '^SUPABASE_PROJECT_REF=' "$PORTAL_ENV" 2>/dev/null; then
    REF="$(grep '^SUPABASE_PROJECT_REF=' "$PORTAL_ENV" | cut -d= -f2- | tr -d '"' | tr -d "'")"
  elif grep -q '^NEXT_PUBLIC_SUPABASE_URL=' "$PORTAL_ENV" 2>/dev/null; then
    URL="$(grep '^NEXT_PUBLIC_SUPABASE_URL=' "$PORTAL_ENV" | cut -d= -f2- | tr -d '"' | tr -d "'")"
    REF="$(echo "$URL" | sed -n 's|https://\([a-z0-9]*\)\.supabase\.co.*|\1|p')"
  fi
fi

need_token() {
  [[ -f "$ENV_FILE" ]] && grep -qE '^SUPABASE_ACCESS_TOKEN=sbp_[a-zA-Z0-9]+' "$ENV_FILE"
}

if ! need_token; then
  echo "PhotoSphere Media — Supabase CLI + MCP setup"
  echo "Sign in as photospheremedia00@gmail.com → $TOKEN_URL"
  open "$TOKEN_URL" 2>/dev/null || true
  if [[ -t 0 ]]; then
    read -rsp "Paste photospheremedia sbp_ token: " token
    echo ""
    if [[ ! "$token" =~ ^sbp_ ]]; then
      echo "Invalid token"
      exit 1
    fi
    cat > "$ENV_FILE" <<EOF
# photospheremedia00@gmail.com — do not commit (gitignored via .env.*)
SUPABASE_ACCESS_TOKEN=$token
SUPABASE_PROJECT_REF=$REF
EOF
    chmod 600 "$ENV_FILE"
    echo "Saved $ENV_FILE"
  else
    echo "Run in Terminal: pnpm supabase:connect"
    exit 1
  fi
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

echo "==> CLI login (PhotoSphere)..."
supabase login --token "$SUPABASE_ACCESS_TOKEN" --name "crypto-pay-photospheremedia"

echo "==> Link project $REF..."
supabase link --project-ref "$REF"

echo "==> Verify access..."
supabase projects list | head -15

echo "==> MCP configs use scripts/mcp-supabase.sh + .env.supabase"
echo "    Restart Cursor → Settings → Tools & MCP → ensure Supabase is enabled"
echo "    Disable any duplicate Supabase plugin signed in as another account (e.g. Skullcandyxxx)"
echo ""
pnpm supabase:status 2>/dev/null || true
