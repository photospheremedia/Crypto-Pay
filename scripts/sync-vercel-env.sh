#!/usr/bin/env bash
# Push apps/portal/.env.local → Vercel (production, preview, development).
# Requires: vercel link on PhotoSphere team (pnpm vercel:setup first).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/apps/portal/.env.local"

ALLOW_LIST=(
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL
  SUPABASE_PROJECT_REF
  NEXT_PUBLIC_APP_URL
  RESEND_API_KEY
  EMAIL_FROM
  EMAIL_REPLY_TO
  NEXT_PUBLIC_TURNSTILE_SITE_KEY
  TURNSTILE_SECRET_KEY
  GROQ_API_KEY
)

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — fill Supabase keys first."
  exit 1
fi

if ! command -v vercel >/dev/null 2>&1; then
  echo "Install Vercel CLI: pnpm add -D vercel (repo root) or npm i -g vercel@latest"
  exit 1
fi

cd "$ROOT"

is_allowed() {
  local name="$1"
  local x
  for x in "${ALLOW_LIST[@]}"; do
    [[ "$x" == "$name" ]] && return 0
  done
  return 1
}

is_sensitive() {
  [[ "$1" =~ (KEY|SECRET|TOKEN|PASSWORD) ]]
}

declare -A vars=()
while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%%#*}"
  line="$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  [[ -z "$line" ]] && continue
  if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
    name="${BASH_REMATCH[1]}"
    val="${BASH_REMATCH[2]}"
    val="${val%\"}"; val="${val#\"}"; val="${val%\'}"; val="${val#\'}"
    if is_allowed "$name" && [[ -n "$val" && "$val" != __PASTE* ]]; then
      vars["$name"]="$val"
    fi
  fi
done < "$ENV_FILE"

if [[ ${#vars[@]} -eq 0 ]]; then
  echo "No env vars to sync from $ENV_FILE"
  exit 1
fi

echo "==> Syncing ${#vars[@]} variables to Vercel..."
for name in "${!vars[@]}"; do
  val="${vars[$name]}"
  sensitive=false
  is_sensitive "$name" && sensitive=true
  for target in production preview development; do
    args=(env add "$name" "$target" --yes --force)
    $sensitive && args+=(--sensitive)
    if printf '%s' "$val" | vercel "${args[@]}" >/dev/null 2>&1; then
      echo "  OK $name → $target"
    else
      echo "  WARN $name → $target (check vercel link / team)"
    fi
  done
done

echo ""
echo "List: vercel env ls production"
