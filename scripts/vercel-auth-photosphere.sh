#!/usr/bin/env bash
# Ensure Vercel CLI + repo link use PhotoSphere (not personal alt accounts).
#
# Usage:
#   pnpm vercel:auth-photosphere
#   pnpm vercel:auth-photosphere --link   # also vercel link at repo root
#
# Token (optional, for CI / non-interactive):
#   cp .env.vercel.example .env.vercel  # VERCEL_TOKEN from photospheremedia team member
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/vercel-photosphere.sh
source "$ROOT/scripts/lib/vercel-photosphere.sh"

ENV_FILE="${VERCEL_ENV_FILE:-$ROOT/.env.vercel}"
DO_LINK=false
[[ "${1:-}" == "--link" ]] && DO_LINK=true

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

whoami_out="$(pnpm exec vercel whoami 2>/dev/null || true)"
if [[ -n "$whoami_out" && "$whoami_out" == *"$VERCEL_FORBIDDEN_ACCOUNT_PATTERN"* ]]; then
  echo "==> Wrong Vercel CLI user: $whoami_out"
  echo "    Logging out — sign in with PhotoSphere GitHub (photospheremedia), not personal accounts."
  pnpm exec vercel logout || true
  whoami_out=""
fi

if [[ -z "$whoami_out" ]]; then
  if [[ -n "${VERCEL_TOKEN:-}" ]]; then
    echo "==> Using VERCEL_TOKEN from $ENV_FILE (non-interactive)"
    export VERCEL_TOKEN
  else
    echo "==> Sign in to Vercel as PhotoSphere (GitHub: photospheremedia org owner)"
    echo "    Run: pnpm vercel:login"
    echo "    Then re-run: pnpm vercel:auth-photosphere --link"
    pnpm exec vercel login
  fi
fi

echo "==> Vercel CLI user: $(pnpm exec vercel whoami ${VERCEL_TOKEN:+-t "$VERCEL_TOKEN"} 2>/dev/null || echo unknown)"

if $DO_LINK; then
  scope="${VERCEL_TEAM_ID:-$VERCEL_TEAM_SLUG}"
  echo "==> Linking $VERCEL_PROJECT_NAME (scope $scope) at repo root..."
  link_args=(link --yes --project "$VERCEL_PROJECT_NAME" --scope "$scope")
  [[ -n "${VERCEL_TOKEN:-}" ]] && link_args+=(-t "$VERCEL_TOKEN")
  (cd "$ROOT" && pnpm exec vercel "${link_args[@]}")
  echo "==> Wrote $ROOT/.vercel/project.json"
fi

echo ""
echo "Cursor Vercel MCP: Settings → MCP → Vercel → sign out, then sign in with the same PhotoSphere account."
echo "Next: pnpm vercel:env-sync && pnpm vercel:secrets"
