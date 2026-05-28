#!/usr/bin/env bash
# Store Vercel CI credentials in GitHub Actions (NOT in git).
#
# Prereqs:
#   gh auth login
#   pnpm vercel:link   # writes .vercel/project.json at repo root
#
# Usage:
#   cp .env.vercel.example .env.vercel
#   # paste VERCEL_TOKEN
#   ./scripts/setup-vercel-github-secrets.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${VERCEL_ENV_FILE:-$ROOT/.env.vercel}"
REPO="${GITHUB_REPO:-photospheremedia/Crypto-Pay}"

for candidate in "$ROOT/.vercel/project.json" "$ROOT/apps/portal/.vercel/project.json"; do
  if [[ -f "$candidate" ]]; then
    PROJECT_JSON="$candidate"
    break
  fi
done

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "VERCEL_TOKEN is required."
  echo "  https://vercel.com/account/tokens → New Token"
  echo "  Or: pnpm vercel:login && add token to .env.vercel"
  exit 1
fi

if [[ -z "${VERCEL_ORG_ID:-}" || -z "${VERCEL_PROJECT_ID:-}" ]]; then
  if [[ -z "${PROJECT_JSON:-}" ]]; then
    echo "Missing .vercel/project.json — run: pnpm vercel:link"
    exit 1
  fi
  read -r VERCEL_ORG_ID VERCEL_PROJECT_ID < <(
    node -e "
      const p = require(process.argv[1]);
      const org = p.orgId || p.org_id;
      const proj = p.projectId || p.project_id;
      if (!org || !proj) process.exit(1);
      console.log(org + ' ' + proj);
    " "$PROJECT_JSON"
  )
fi

echo "==> Setting GitHub secrets on $REPO (values are never printed)"
gh secret set VERCEL_TOKEN -R "$REPO" -b "$VERCEL_TOKEN"
gh secret set VERCEL_ORG_ID -R "$REPO" -b "$VERCEL_ORG_ID"
gh secret set VERCEL_PROJECT_ID -R "$REPO" -b "$VERCEL_PROJECT_ID"
echo "Done. Pushes to master run .github/workflows/vercel.yml (disable duplicate Netlify deploy)."
