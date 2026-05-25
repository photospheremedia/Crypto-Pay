#!/usr/bin/env bash
# One-shot Netlify setup helper for Crypto Pay.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
NL="pnpm exec netlify"
GITHUB_REPO="photospheremedia/Crypto-Pay"
IMPORT_URL="https://app.netlify.com/start/deploy?repository=https://github.com/${GITHUB_REPO}"
ENV_LOCAL="$ROOT/apps/portal/.env.local"
ENV_EXPORT="$ROOT/.netlify-env-import.tmp"

netlify_cli() {
  pnpm exec netlify "$@"
}

echo "==> Crypto Pay — Netlify setup"
echo ""

if [[ ! -f "$ENV_LOCAL" ]]; then
  echo "Missing $ENV_LOCAL — copy from apps/portal/.env.example and add Supabase keys."
  exit 1
fi

# Build env file for Netlify import (production URL)
ALLOW=(
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL
  NEXT_PUBLIC_APP_URL
  RESEND_API_KEY
  EMAIL_FROM
  EMAIL_REPLY_TO
  NEXT_PUBLIC_TURNSTILE_SITE_KEY
  TURNSTILE_SECRET_KEY
  GROQ_API_KEY
)

: > "$ENV_EXPORT"
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
        if [[ "$name" == "NEXT_PUBLIC_APP_URL" ]]; then
          echo "${name}=https://cryptopay.sale" >> "$ENV_EXPORT"
        else
          echo "${name}=${val}" >> "$ENV_EXPORT"
        fi
        break
      fi
    done
  fi
done < "$ENV_LOCAL"

if ! grep -q '^NEXT_PUBLIC_APP_URL=' "$ENV_EXPORT"; then
  echo "NEXT_PUBLIC_APP_URL=https://cryptopay.sale" >> "$ENV_EXPORT"
fi

echo "Prepared $(wc -l < "$ENV_EXPORT" | tr -d ' ') env vars for Netlify import."
echo ""

if [[ -f "$ROOT/.netlify/state.json" ]]; then
  echo "==> Site already linked locally."
  site="$(jq -r '.siteId // empty' "$ROOT/.netlify/state.json" 2>/dev/null || true)"
  [[ -n "$site" ]] && echo "    Site ID: $site"
else
  echo "==> Step 1: Import or open existing site (browser)"
  echo "    Prefer existing site name: crypto-pay-portal (do NOT create a second Crypto-Pay site)"
  echo "    $IMPORT_URL"
  echo "    Team: PhotoSphere | Branch: master | Build: uses netlify.toml"
  echo "    If using GitHub Actions (.github/workflows/netlify.yml):"
  echo "      Site configuration → Build & deploy → Continuous deployment → Stop builds (or unlink repo)"
  echo "    Check duplicates: pnpm netlify:audit"
  if [[ "$(uname -s)" == "Darwin" ]]; then
    open "$IMPORT_URL" 2>/dev/null || true
  fi
  echo ""
  echo "==> Step 2: Link CLI (Terminal)"
  echo "    pnpm netlify:login"
  echo "    pnpm netlify:link"
fi

echo ""
echo "==> Step 3: Push env vars to Netlify"
echo "    pnpm netlify:env-sync"
echo ""
echo "==> Step 4: Custom domains in Netlify UI"
echo "    cryptopay.sale + www.cryptopay.sale"
echo "    Then: pnpm dns:apply (Porkbun)"
echo ""
echo "==> Step 5: GitHub Actions (auto deploy on push, like Supabase)"
echo "    cp .env.netlify.example .env.netlify"
echo "    pnpm netlify:secrets     # NETLIFY_AUTH_TOKEN + NETLIFY_SITE_ID"
echo ""
echo "==> Step 6: Deploy"
echo "    git push origin master   # triggers .github/workflows/netlify.yml"
echo "    pnpm netlify:deploy      # manual prod deploy"
