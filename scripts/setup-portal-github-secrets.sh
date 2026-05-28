#!/usr/bin/env bash
# Store portal Supabase keys in GitHub Actions for optional PR Playwright tests.
# Usage: pnpm portal:secrets  (after apps/portal/.env.local exists)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORTAL_ENV="$ROOT/apps/portal/.env.local"
REPO="${GITHUB_REPO:-photospheremedia/Crypto-Pay}"

if [[ ! -f "$PORTAL_ENV" ]]; then
  echo "Missing $PORTAL_ENV — copy from apps/portal/.env.example"
  exit 1
fi

read_env() {
  local key="$1"
  grep -m1 "^${key}=" "$PORTAL_ENV" 2>/dev/null | cut -d= -f2- | tr -d '"' | tr -d "'" || true
}

URL="$(read_env NEXT_PUBLIC_SUPABASE_URL)"
ANON="$(read_env NEXT_PUBLIC_SUPABASE_ANON_KEY)"
SERVICE="$(read_env SUPABASE_SERVICE_ROLE_KEY)"

for name in URL ANON SERVICE; do
  val="${!name}"
  if [[ -z "$val" || "$val" == __PASTE* ]]; then
    echo "Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in $PORTAL_ENV"
    exit 1
  fi
done

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI required: https://cli.github.com/"
  exit 1
fi

echo "==> Setting portal CI test secrets on $REPO"
gh secret set NEXT_PUBLIC_SUPABASE_URL -R "$REPO" -b "$URL"
gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY -R "$REPO" -b "$ANON"
gh secret set SUPABASE_SERVICE_ROLE_KEY -R "$REPO" -b "$SERVICE"

echo "Done. PR workflow can run Playwright when Netlify validate runs (.github/workflows/netlify.yml test job)."
