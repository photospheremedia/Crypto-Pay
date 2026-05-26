#!/usr/bin/env bash
# Import apps/portal/.env.local into linked Netlify site (all deploy contexts).
# Requires: netlify login && netlify link
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/apps/portal/.env.local"
OUT="$ROOT/.netlify-env-import.tmp"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

STATE_FILE="$ROOT/apps/portal/.netlify/state.json"
LINK_DIR="$ROOT/apps/portal"
if [[ ! -f "$STATE_FILE" && -f "$ROOT/.netlify/state.json" ]]; then
  STATE_FILE="$ROOT/.netlify/state.json"
  LINK_DIR="$ROOT"
fi
if [[ ! -f "$STATE_FILE" ]]; then
  echo "Not linked. Run: pnpm netlify:link"
  exit 1
fi

# Build allowlisted import file (bootstrap logic)
ALLOW=(
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
)
: > "$OUT"
while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%%#*}"
  line="$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  [[ -z "$line" ]] && continue
  if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
    name="${BASH_REMATCH[1]}"
    val="${BASH_REMATCH[2]}"
    val="${val%\"}"; val="${val#\"}"; val="${val%\'}"; val="${val#\'}"
    for a in "${ALLOW[@]}"; do
      if [[ "$name" == "$a" && -n "$val" && "$val" != __PASTE* ]]; then
        echo "${name}=${val}" >> "$OUT"
        break
      fi
    done
  fi
done < "$ENV_FILE"
if ! grep -q '^NEXT_PUBLIC_APP_URL=' "$OUT"; then
  echo "NEXT_PUBLIC_APP_URL=https://cryptopay.sale" >> "$OUT"
fi

echo "==> Importing $(wc -l < "$OUT" | tr -d ' ') vars to Netlify ($(basename "$LINK_DIR"))"
cd "$LINK_DIR"
pnpm exec netlify env:import "$OUT" --replace-existing
rm -f "$OUT"
echo "Done."
pnpm exec netlify env:list 2>&1 | head -20 || true
