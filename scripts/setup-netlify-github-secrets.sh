#!/usr/bin/env bash
# Store Netlify CI credentials in GitHub Actions secrets (NOT in git).
#
# Prereqs:
#   gh auth login
#   netlify login && netlify link   # writes site id to .netlify/state.json
#
# Usage:
#   cp .env.netlify.example .env.netlify   # optional overrides
#   ./scripts/setup-netlify-github-secrets.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${NETLIFY_ENV_FILE:-$ROOT/.env.netlify}"
REPO="${GITHUB_REPO:-photospheremedia/Crypto-Pay}"
STATE_FILE="$ROOT/.netlify/state.json"
if [[ ! -f "$STATE_FILE" && -f "$ROOT/apps/portal/.netlify/state.json" ]]; then
  STATE_FILE="$ROOT/apps/portal/.netlify/state.json"
fi
NETLIFY_SITE_ID="${NETLIFY_SITE_ID:-d54f3b5a-17e4-4ddd-b01d-166716dd4dc5}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if [[ -z "${NETLIFY_AUTH_TOKEN:-}" ]]; then
  echo "NETLIFY_AUTH_TOKEN is required."
  echo "  Netlify → User settings → Applications → Personal access tokens → New access token"
  echo "  Or: netlify login (then paste token into .env.netlify)"
  exit 1
fi

if [[ -z "${NETLIFY_SITE_ID:-}" && -f "$STATE_FILE" ]]; then
  NETLIFY_SITE_ID="$(node -e "
    const s = require(process.argv[1]);
    const id = s.siteId || s.site_id;
    if (!id) process.exit(1);
    process.stdout.write(id);
  " "$STATE_FILE" 2>/dev/null || true)"
fi

if [[ -z "${NETLIFY_SITE_ID:-}" ]]; then
  echo "NETLIFY_SITE_ID is required."
  echo "  Netlify → Site configuration → General → Site details → Site ID (API ID)"
  echo "  Or run: netlify link"
  exit 1
fi

echo "==> Setting GitHub secrets on $REPO (values are never printed)"
gh secret set NETLIFY_AUTH_TOKEN -R "$REPO" -b "$NETLIFY_AUTH_TOKEN"
gh secret set NETLIFY_SITE_ID -R "$REPO" -b "$NETLIFY_SITE_ID"
echo "Done. Pushes to main/master that touch apps/portal will run .github/workflows/netlify.yml"
