#!/usr/bin/env bash
# Store Supabase CI credentials in GitHub Actions secrets.
# Usage: pnpm supabase:secrets  (after pnpm supabase:connect)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${SUPABASE_ENV_FILE:-$ROOT/.env.supabase}"
PORTAL_ENV="$ROOT/apps/portal/.env.local"
REPO="${GITHUB_REPO:-photospheremedia/Crypto-Pay}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

PROJECT_REF="${SUPABASE_PROJECT_REF:-usbxwewohpsbjwiuazpf}"
if [[ -f "$PORTAL_ENV" ]]; then
  if grep -q '^SUPABASE_PROJECT_REF=' "$PORTAL_ENV" 2>/dev/null; then
    PROJECT_REF="$(grep '^SUPABASE_PROJECT_REF=' "$PORTAL_ENV" | cut -d= -f2- | tr -d '"')"
  fi
fi

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "SUPABASE_ACCESS_TOKEN required. Run: pnpm supabase:connect"
  exit 1
fi
if [[ ! "${SUPABASE_ACCESS_TOKEN}" =~ ^sbp_ ]]; then
  echo "SUPABASE_ACCESS_TOKEN must start with sbp_"
  exit 1
fi

echo "==> Setting GitHub secrets on $REPO"
gh secret set SUPABASE_ACCESS_TOKEN -R "$REPO" -b "$SUPABASE_ACCESS_TOKEN"
gh secret set SUPABASE_PROJECT_REF -R "$REPO" -b "$PROJECT_REF"

RESEND_KEY=""
if [[ -f "$PORTAL_ENV" ]] && grep -q '^RESEND_API_KEY=re_' "$PORTAL_ENV" 2>/dev/null; then
  RESEND_KEY="$(grep '^RESEND_API_KEY=' "$PORTAL_ENV" | cut -d= -f2- | tr -d '"')"
fi
if [[ -n "$RESEND_KEY" && "$RESEND_KEY" != __PASTE* ]]; then
  gh secret set RESEND_API_KEY -R "$REPO" -b "$RESEND_KEY"
  echo "  RESEND_API_KEY set (Auth SMTP sync in supabase.yml deploy job)"
fi

echo "Done. Supabase CI/CD: .github/workflows/supabase.yml"
