#!/usr/bin/env bash
# Crypto Pay — Supabase CLI auth (works in Cursor, CI, and local Terminal)
#
# One-time setup:
#   cp .env.supabase.example .env.supabase
#   # Paste sbp_... from https://supabase.com/dashboard/account/tokens
#   pnpm supabase:login
#
# Commands:
#   pnpm supabase:status   # health check
#   pnpm supabase:login    # login + link project (if you have access)
#   pnpm supabase:handoff  # create/link a project on YOUR account
#   pnpm supabase:logout   # clear local CLI session
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT_REF="${SUPABASE_PROJECT_REF:-usbxwewohpsbjwiuazpf}"
ENV_FILE="${SUPABASE_ENV_FILE:-$ROOT/.env.supabase}"
TOKEN_URL="https://supabase.com/dashboard/account/tokens"
PROJECT_URL="https://supabase.com/dashboard/project/${PROJECT_REF}"

usage() {
  cat <<EOF
Usage: $(basename "$0") <command>

Commands:
  status    Show CLI login, linked project, and token file hints
  login     Authenticate CLI (token file or prompt) and link $PROJECT_REF
  handoff   Create or link a Crypto Pay project you own (see scripts/handoff-*.sh)
  projects  List projects visible to your token
  logout    supabase logout
  open      Open token + project pages in the browser (macOS)

Env:
  SUPABASE_ACCESS_TOKEN   Personal access token (sbp_...)
  SUPABASE_PROJECT_REF    Default: $PROJECT_REF
  SUPABASE_ENV_FILE       Default: .env.supabase

EOF
}

load_token() {
  if [[ -n "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
    return 0
  fi
  if [[ -f "$ENV_FILE" ]]; then
    # shellcheck disable=SC1090
    set -a
    source "$ENV_FILE"
    set +a
  fi
  [[ -n "${SUPABASE_ACCESS_TOKEN:-}" ]]
}

mask_token() {
  local t="$1"
  if [[ ${#t} -lt 12 ]]; then
    echo "(invalid)"
  else
    echo "${t:0:8}...${t: -4}"
  fi
}

cli_logged_in() {
  SUPABASE_ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-}" \
    supabase projects list -o json >/dev/null 2>&1
}

linked_ref() {
  if [[ -f supabase/.temp/project-ref ]]; then
    tr -d '[:space:]' < supabase/.temp/project-ref
  fi
}

# Returns 0 if the logged-in account can manage PROJECT_REF
can_access_ref() {
  local ref="$1"
  SUPABASE_ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-}" \
    supabase projects list -o json 2>/dev/null | python3 -c "
import json, sys
target = sys.argv[1]
projects = json.load(sys.stdin)
print('yes' if any(p.get('id') == target for p in projects) else 'no')
" "$ref" 2>/dev/null | grep -q yes
}

print_access_denied() {
  local ref="$1"
  echo ""
  echo "❌ Your Supabase account cannot access project: $ref"
  echo ""
  echo "This repo was linked to a project on another account/org."
  echo "Logged-in account sees these projects only:"
  SUPABASE_ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-}" \
    supabase projects list 2>/dev/null || true
  echo ""
  echo "Choose one path:"
  echo "  A) New account (recommended): create YOUR project"
  echo "       pnpm supabase:handoff"
  echo "     Then update .env.supabase SUPABASE_PROJECT_REF + apps/portal/.env.local"
  echo ""
  echo "  B) Same project: sign in with the account that owns $ref"
  echo "       Use that account's sbp_ token in .env.supabase → pnpm supabase:login"
  echo ""
  echo "  C) Team access: owner invites your email to the org in the dashboard"
  echo ""
  echo ""
}

cmd_status() {
  echo "==> Supabase CLI status"
  echo "    CLI:     $(supabase --version 2>/dev/null || echo 'not installed')"
  echo "    Target:  $PROJECT_REF ($PROJECT_URL)"
  echo ""

  if load_token; then
    echo "    Token:   file/env set ($(mask_token "$SUPABASE_ACCESS_TOKEN"))"
  elif [[ -f "$ENV_FILE" ]]; then
    echo "    Token:   $ENV_FILE exists but SUPABASE_ACCESS_TOKEN missing/empty"
  else
    echo "    Token:   not set (copy .env.supabase.example → .env.supabase)"
  fi

  if cli_logged_in; then
    echo "    Login:   ✅ Management API reachable"
    echo ""
    echo "    Projects:"
    SUPABASE_ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-}" \
      supabase projects list 2>/dev/null | sed 's/^/      /' || true
    if load_token && ! can_access_ref "$PROJECT_REF"; then
      echo ""
      echo "    Access:  ❌ token cannot manage $PROJECT_REF (wrong account)"
      echo "    Fix:     pnpm supabase:handoff   # new project on your account"
    elif load_token; then
      echo ""
      echo "    Access:  ✅ can manage $PROJECT_REF"
    fi
  else
    echo "    Login:   ❌ not authenticated"
    echo "    Fix:     pnpm supabase:login"
  fi

  local ref
  ref="$(linked_ref || true)"
  echo ""
  if [[ -n "$ref" ]]; then
    if [[ "$ref" == "$PROJECT_REF" ]]; then
      echo "    Link:    ✅ $ref (local link file)"
    else
      echo "    Link:    ⚠️  $ref (expected $PROJECT_REF — run: pnpm supabase:login)"
    fi
  else
    echo "    Link:    ❌ not linked (run: pnpm supabase:login)"
  fi
  echo ""
}

cmd_projects() {
  if ! load_token && ! cli_logged_in; then
    echo "Not logged in. Run: pnpm supabase:login"
    exit 1
  fi
  supabase projects list
}

cmd_handoff() {
  if ! load_token; then
    echo "Add your token to .env.supabase first, then: pnpm supabase:login"
    exit 1
  fi
  supabase login --token "$SUPABASE_ACCESS_TOKEN" --name "crypto-pay"
  exec "$ROOT/scripts/handoff-photospheremedia-account.sh"
}

cmd_login() {
  if ! command -v supabase >/dev/null 2>&1; then
    echo "Install Supabase CLI: https://supabase.com/docs/guides/cli"
    exit 1
  fi

  if ! load_token; then
    echo "No Supabase access token found."
    echo ""
    echo "  1. Open: $TOKEN_URL"
    echo "  2. Create a token (starts with sbp_)"
    echo "  3. cp .env.supabase.example .env.supabase"
    echo "  4. Paste SUPABASE_ACCESS_TOKEN=... into .env.supabase"
    echo "  5. Run: pnpm supabase:login"
    echo ""
    if [[ -t 0 ]]; then
      read -rsp "Or paste token now (hidden): " SUPABASE_ACCESS_TOKEN
      echo ""
      if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
        exit 1
      fi
    else
      if [[ "$(uname -s)" == "Darwin" ]]; then
        open "$TOKEN_URL" 2>/dev/null || true
      fi
      exit 1
    fi
  fi

  if [[ ! "${SUPABASE_ACCESS_TOKEN}" =~ ^sbp_ ]]; then
    echo "Invalid token format. Expected sbp_... from $TOKEN_URL"
    exit 1
  fi

  echo "==> Logging in to Supabase CLI..."
  supabase login --token "$SUPABASE_ACCESS_TOKEN" --name "crypto-pay"

  echo "==> Verifying account..."
  supabase projects list | head -20

  if ! can_access_ref "$PROJECT_REF"; then
    print_access_denied "$PROJECT_REF"
    echo "Unlinking stale local project ref (dashboard will still work after handoff)..."
    supabase unlink 2>/dev/null || true
    exit 1
  fi

  echo "==> Linking project $PROJECT_REF..."
  supabase link --project-ref "$PROJECT_REF"

  echo ""
  echo "✅ Done. Next:"
  echo "   pnpm supabase:status"
  echo "   pnpm db:push          # apply migrations to remote"
  echo "   pnpm db:types         # regenerate TypeScript types"
  echo ""
  echo "GitHub Actions (same token):"
  echo "   gh secret set SUPABASE_ACCESS_TOKEN -b \"\$SUPABASE_ACCESS_TOKEN\""
  echo "   gh secret set SUPABASE_PROJECT_REF -b \"$PROJECT_REF\""
}

cmd_logout() {
  supabase logout
  echo "Logged out. Token file .env.supabase was not deleted."
}

cmd_open() {
  if [[ "$(uname -s)" == "Darwin" ]]; then
    open "$TOKEN_URL"
    open "$PROJECT_URL"
    echo "Opened token + project pages in browser."
  else
    echo "$TOKEN_URL"
    echo "$PROJECT_URL"
  fi
}

main() {
  local cmd="${1:-status}"
  case "$cmd" in
    status) cmd_status ;;
    login) cmd_login ;;
    handoff) cmd_handoff ;;
    projects) cmd_projects ;;
    logout) cmd_logout ;;
    open) cmd_open ;;
    -h|--help|help) usage ;;
    *)
      echo "Unknown command: $cmd"
      usage
      exit 1
      ;;
  esac
}

main "$@"
