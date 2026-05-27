#!/usr/bin/env bash
# Connect photospheremedia/Crypto-Pay to Vercel (GitHub → deploy).
#
# Prereqs:
#   - GitHub repo: https://github.com/photospheremedia/Crypto-Pay
#   - Vercel account: photospheremedia (or team with access)
#   - apps/portal/.env.local filled (Supabase usbxwewohpsbjwiuazpf + keys)
#
# Usage:
#   pnpm vercel:setup              # opens dashboard + prints checklist
#   VERCEL_TEAM=your-team-slug pnpm vercel:setup --link
#   pnpm vercel:env-sync           # after link, push .env.local to Vercel
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

GITHUB_REPO="photospheremedia/Crypto-Pay"
PROJECT_NAME="${VERCEL_PROJECT_NAME:-crypto-pay-portal}"
IMPORT_URL="https://vercel.com/new/import?s=https://github.com/${GITHUB_REPO}"
DOCS_URL="https://vercel.com/docs/deployments/git/vercel-for-github"

usage() {
  cat <<EOF
Usage: $(basename "$0") [options]

Options:
  --link     Run vercel link (non-interactive if VERCEL_TEAM + VERCEL_PROJECT_NAME set)
  --open     Open Vercel import page in browser (default with no args)
  --help

Env:
  VERCEL_TEAM          Team slug or ID (PhotoSphere Media on Vercel)
  VERCEL_PROJECT_NAME  Default: crypto-pay-portal

Phone signup error "The user could not be found":
  - Do NOT create account with phone first. Use "Continue with GitHub" at vercel.com/signup
    (log in as photospheremedia GitHub org owner).
  - If the number was used on another Vercel account, use a different
    number or https://vercel.com/accountrecovery (Vercel may block reused numbers 12h+).
  - If you already have a Vercel account: Sign IN at vercel.com/login, not sign up.

Steps (dashboard — recommended first time):
  1. vercel login  (use photospheremedia Google/GitHub — NOT skullcandyxxx)
  2. Open import URL → select PhotoSphere team → Import Crypto-Pay
  3. Framework: Next.js | Root Directory: . (repo root) | vercel.json is used
  4. Add env vars (or run pnpm vercel:env-sync after vercel link)
  5. Deploy — production branch: master

Monorepo settings (auto from vercel.json):
  install: pnpm install
  build:   pnpm --filter @crypto-pay/portal build
  output:  apps/portal/.next

EOF
}

cmd_open() {
  echo "==> PhotoSphere Vercel + GitHub setup"
  echo "    GitHub: https://github.com/${GITHUB_REPO}"
  echo "    Import: $IMPORT_URL"
  echo ""
  if [[ "$(vercel whoami 2>/dev/null || true)" == *"skullcandy"* ]]; then
    echo "⚠️  CLI is logged in as skullcandyxxx. For PhotoSphere, run:"
    echo "    vercel logout && vercel login"
    echo ""
  fi
  if [[ "$(uname -s)" == "Darwin" ]]; then
    open "$IMPORT_URL" 2>/dev/null || true
    open "https://github.com/apps/vercel" 2>/dev/null || true
  fi
  usage
}

cmd_link() {
  if ! command -v vercel >/dev/null 2>&1; then
    echo "Run: pnpm install"
    exit 1
  fi

  echo "==> Current Vercel user: $(vercel whoami 2>/dev/null || echo 'not logged in')"
  echo "==> Linking project ${PROJECT_NAME}..."

  link_args=(-y --project "$PROJECT_NAME")
  if [[ -n "${VERCEL_TEAM:-}" ]]; then
    link_args+=(--team "$VERCEL_TEAM")
  fi

  vercel link "${link_args[@]}"

  echo ""
  echo "==> Patching monorepo settings via API (optional)..."
  if [[ -n "${VERCEL_TOKEN:-}" && -n "${VERCEL_TEAM:-}" ]]; then
    TEAM_ID="$(vercel teams ls 2>/dev/null | awk -v t="$VERCEL_TEAM" '$0 ~ t {print $1; exit}')"
    if [[ -n "$TEAM_ID" ]]; then
      VERCEL_TOKEN="$VERCEL_TOKEN" PROJECT="$PROJECT_NAME" TEAM_ID="$TEAM_ID" \
        "$ROOT/scripts/update-vercel-project.sh" || true
    fi
  else
    echo "    Set VERCEL_TOKEN + VERCEL_TEAM to auto-patch, or confirm in dashboard:"
    echo "    Root: / | Build: pnpm --filter @crypto-pay/portal build | Output: apps/portal/.next"
  fi

  echo ""
  echo "Next: pnpm vercel:env-sync"
}

main() {
  local cmd="${1:-}"
  case "$cmd" in
    --link) cmd_link ;;
    --open|"") cmd_open ;;
    -h|--help) usage ;;
    *)
      echo "Unknown: $cmd"
      usage
      exit 1
      ;;
  esac
}

main "$@"
