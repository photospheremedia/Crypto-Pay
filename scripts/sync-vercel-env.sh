#!/usr/bin/env bash
# Push apps/portal/.env.local → Vercel (production, preview, development).
# Requires: pnpm vercel:link (PhotoSphere team).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/apps/portal/.env.local"
OUT="$ROOT/.vercel-env-import.tmp"

# Same allowlist as former Netlify sync (scripts/sync-netlify-env.sh).
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
  ADMIN_REVIEW_EMAIL
  ADMIN_ALLOWED_EMAILS
  NEXT_PUBLIC_TURNSTILE_SITE_KEY
  TURNSTILE_SECRET_KEY
  GROQ_API_KEY
  OPENAI_API_KEY
  INTERNAL_API_KEY
)

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — fill Supabase keys first."
  exit 1
fi

if [[ ! -f "$ROOT/.vercel/project.json" ]]; then
  echo "Not linked. Run: pnpm vercel:link"
  exit 1
fi

if ! command -v vercel >/dev/null 2>&1; then
  echo "Install Vercel CLI: pnpm install (repo root)"
  exit 1
fi

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

: > "$OUT"
while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%%#*}"
  line="$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  [[ -z "$line" ]] && continue
  if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
    name="${BASH_REMATCH[1]}"
    val="${BASH_REMATCH[2]}"
    val="${val%\"}"; val="${val#\"}"; val="${val%\'}"; val="${val#\'}"
    if is_allowed "$name" && [[ -n "$val" && "$val" != __PASTE* ]]; then
      echo "${name}=${val}" >> "$OUT"
    fi
  fi
done < "$ENV_FILE"

if ! grep -q '^NEXT_PUBLIC_APP_URL=' "$OUT" 2>/dev/null; then
  echo "NEXT_PUBLIC_APP_URL=https://cryptopay.sale" >> "$OUT"
fi

count="$(wc -l < "$OUT" | tr -d ' ')"
if [[ "$count" -eq 0 ]]; then
  echo "No env vars to sync from $ENV_FILE"
  rm -f "$OUT"
  exit 1
fi

cd "$ROOT"
echo "==> Syncing $count variables to Vercel (production, preview, development)..."

while IFS= read -r line || [[ -n "$line" ]]; do
  [[ -z "$line" ]] && continue
  name="${line%%=*}"
  val="${line#*=}"
  sensitive=false
  is_sensitive "$name" && sensitive=true
  for target in production preview development; do
    args=(env add "$name" "$target" --yes --force)
    $sensitive && args+=(--sensitive)
    if printf '%s' "$val" | pnpm exec vercel "${args[@]}" >/dev/null 2>&1; then
      echo "  OK $name → $target"
    else
      echo "  WARN $name → $target (check vercel link / team)"
    fi
  done
done < "$OUT"

rm -f "$OUT"
echo ""
echo "Done. List: pnpm exec vercel env ls production"
