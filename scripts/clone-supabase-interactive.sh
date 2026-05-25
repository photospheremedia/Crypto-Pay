#!/usr/bin/env bash
# Interactive clone: legacy-account → PhotoSphere Media (run in Terminal, not Cursor agent shell)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

OLD_REF=""
GLF_ENV="$ROOT/.env.supabase.legacy-account"
PS_ENV="$ROOT/.env.supabase"

need_token() {
  local file="$1"
  [[ -f "$file" ]] && grep -qE '^SUPABASE_ACCESS_TOKEN=sbp_[a-zA-Z0-9]+' "$file"
}

write_env() {
  local file="$1"
  local ref="$2"
  local token="$3"
  cat > "$file" <<EOF
SUPABASE_ACCESS_TOKEN=$token
SUPABASE_PROJECT_REF=$ref
EOF
  chmod 600 "$file"
}

prompt_token() {
  local label="$1"
  local file="$2"
  local ref="$3"
  local url="https://supabase.com/dashboard/account/tokens"

  if need_token "$file"; then
    echo "✅ $label token already in $(basename "$file")"
    return
  fi

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo " $label"
  echo " Sign in: $label account → $url"
  echo " Create token → paste below (input hidden)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  open "$url" 2>/dev/null || true
  read -rsp "Paste sbp_ token: " token
  echo ""
  if [[ ! "$token" =~ ^sbp_ ]]; then
    echo "Invalid token (must start with sbp_)"
    exit 1
  fi
  write_env "$file" "$ref" "$token"
  echo "Saved $(basename "$file")"
}

echo "Crypto Pay — clone Supabase to PhotoSphere Media"
echo "  FROM: merchant@example.com  project $OLD_REF"
echo "  TO:   photospheremedia00@gmail.com  org \"PhotoSphere Media\""
echo ""

prompt_token "merchant@example.com" "$GLF_ENV" "$OLD_REF"
prompt_token "photospheremedia00@gmail.com" "$PS_ENV" "$OLD_REF"

read -rsp "Database password for NEW PhotoSphere project: " db_pass
echo ""
export SUPABASE_DB_PASSWORD="$db_pass"

echo ""
echo "Starting migration (dump → create → push → update refs)..."
echo ""

# Non-interactive password for provision phase
export SUPABASE_DB_PASSWORD
"$ROOT/scripts/migrate-legacy-account-to-photospheremedia.sh" --dump-only

unset SUPABASE_ACCESS_TOKEN SUPABASE_PROJECT_REF
export SUPABASE_DB_PASSWORD="$db_pass"
"$ROOT/scripts/migrate-legacy-account-to-photospheremedia.sh" --provision-only

NEW_REF=""
if [[ -f "$ROOT/.supabase-migration-new-ref" ]]; then
  NEW_REF="$(cat "$ROOT/.supabase-migration-new-ref")"
fi

echo ""
if [[ -n "$NEW_REF" ]]; then
  echo "🎉 New project ref: $NEW_REF"
  echo "   Dashboard: https://supabase.com/dashboard/project/$NEW_REF/settings/api"
  echo "   Update apps/portal/.env.local with URL + keys, then: pnpm db:types"
else
  echo "Check output above for errors."
fi
