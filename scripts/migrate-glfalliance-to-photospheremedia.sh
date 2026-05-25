#!/usr/bin/env bash
# Move Crypto Pay Supabase from merchant@example.com → PhotoSphere Media (photospheremedia).
#
# Supabase does not move a project between personal accounts in-place. This script:
#   1. (optional) dumps data from the OLD legacy-account project
#   2. creates a NEW project under PhotoSphere Media org (photospheremedia token)
#   3. pushes migrations + deploys functions
#   4. updates repo project refs
#
# Prerequisites — two tokens (create at https://supabase.com/dashboard/account/tokens):
#   .env.supabase.legacy-account   — signed in as merchant@example.com
#   .env.supabase               — signed in as photospheremedia00@gmail.com
#
# Usage:
#   cp .env.supabase.example .env.supabase
#   cp .env.supabase.example .env.supabase.legacy-account
#   # fill each file with the matching account's sbp_ token
#   pnpm supabase:migrate-account
#   pnpm supabase:migrate-account --dump-only
#   pnpm supabase:migrate-account --provision-only
#   pnpm supabase:migrate-account --update-refs <new-ref>
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

OLD_REF="${OLD_PROJECT_REF:-}"
OLD_ENV="${SUPABASE_OLD_ENV_FILE:-$ROOT/.env.supabase.legacy-account}"
NEW_ENV="${SUPABASE_ENV_FILE:-$ROOT/.env.supabase}"
BACKUP_DIR="${SUPABASE_BACKUP_DIR:-$ROOT/backups/supabase}"
DUMP_FILE="${DUMP_FILE:-}"

ORG_NAME="${SUPABASE_ORG_NAME:-PhotoSphere Media}"
PROJECT_NAME="${SUPABASE_PROJECT_NAME:-Crypto Pay}"
PHOTOSPHERE_EMAIL="${PHOTOSPHERE_EMAIL:-photospheremedia00@gmail.com}"
LEGACY_EMAIL="${LEGACY_EMAIL:-merchant@example.com}"

DO_DUMP=false
DO_PROVISION=false
DO_UPDATE_REFS=""
DO_RESTORE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dump-only) DO_DUMP=true ;;
    --provision-only) DO_PROVISION=true ;;
    --restore-data) DO_RESTORE=true ;;
    --update-refs)
      shift
      DO_UPDATE_REFS="${1:-}"
      ;;
    --help|-h)
      sed -n '2,22p' "$0"
      exit 0
      ;;
    *)
      if [[ -z "$DO_UPDATE_REFS" && "$1" != --* ]]; then
        DO_UPDATE_REFS="$1"
      fi
      ;;
  esac
  shift
done

# Default: full migration (dump + provision; refs after provision)
if ! $DO_DUMP && ! $DO_PROVISION && [[ -z "$DO_UPDATE_REFS" ]]; then
  DO_DUMP=true
  DO_PROVISION=true
fi

load_env() {
  local file="${1:-}"
  [[ -n "$file" && -f "$file" ]] || return 1
  set -a
  # shellcheck disable=SC1090
  source "$file"
  set +a
  [[ -n "${SUPABASE_ACCESS_TOKEN:-}" ]]
}

login_with() {
  local file="$1"
  local label="$2"
  unset SUPABASE_ACCESS_TOKEN SUPABASE_PROJECT_REF
  if ! load_env "$file"; then
    echo "Missing token in $file ($label)"
    echo "Create sbp_ token while signed in as $label"
    exit 1
  fi
  supabase login --token "$SUPABASE_ACCESS_TOKEN" --name "crypto-pay-$label"
}

cmd_dump() {
  echo "==> Phase 1: dump OLD project ($OLD_REF) as $LEGACY_EMAIL"
  login_with "$OLD_ENV" "legacy-account"
  mkdir -p "$BACKUP_DIR"
  DUMP_FILE="${DUMP_FILE:-$BACKUP_DIR/${OLD_REF}-$(date +%Y%m%d-%H%M%S).sql}"

  supabase link --project-ref "$OLD_REF"
  echo "    Dumping public schema data to $DUMP_FILE ..."
  supabase db dump --linked -f "$DUMP_FILE" --data-only --schema public --use-copy
  echo "    ✅ Data dump saved: $DUMP_FILE"
  echo ""
  echo "    Note: auth.users are NOT in this dump. Users must re-register or use"
  echo "    Supabase dashboard export / support for full auth migration."
}

cmd_provision() {
  echo "==> Phase 2: create/link NEW project as $PHOTOSPHERE_EMAIL ($ORG_NAME)"
  login_with "$NEW_ENV" "photospheremedia"

  if supabase projects list -o json | python3 -c "
import json, sys
ref = sys.argv[1]
print('yes' if any(p.get('id') == ref for p in json.load(sys.stdin)) else 'no')
" "$OLD_REF" 2>/dev/null | grep -q yes; then
    echo "    PhotoSphere account already has $OLD_REF — linking it."
    NEW_REF="$OLD_REF"
    supabase link --project-ref "$NEW_REF"
  else
    echo "    Creating new project (old $OLD_REF stays on $LEGACY_EMAIL until you delete it)."
    if [[ -n "${SUPABASE_DB_PASSWORD:-}" ]]; then
      DB_PASS="$SUPABASE_DB_PASSWORD"
    else
      read -rsp "Database password for new project: " DB_PASS
      echo ""
    fi
    ORG_ID="$(supabase orgs list -o json | ORG_NAME="$ORG_NAME" python3 -c "
import json, sys, os
name = os.environ.get('ORG_NAME', 'PhotoSphere Media')
orgs = json.load(sys.stdin)
m = next((o for o in orgs if o.get('name') == name), None)
print(m['id'] if m else '')
")"
    if [[ -z "$ORG_ID" ]]; then
      echo "Create org \"$ORG_NAME\" in dashboard (signed in as $PHOTOSPHERE_EMAIL), then:"
      echo "  SUPABASE_ORG_ID=<id> $0 --provision-only"
      exit 1
    fi
    CREATE_JSON="$(supabase projects create "$PROJECT_NAME" \
      --org-id "$ORG_ID" \
      --db-password "$DB_PASS" \
      --region "${SUPABASE_REGION:-us-east-1}" \
      -o json)"
    NEW_REF="$(echo "$CREATE_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")"
    echo "    New project ref: $NEW_REF"
    supabase link --project-ref "$NEW_REF"
  fi

  echo "==> Pushing migrations..."
  yes | supabase db push --include-all

  echo "==> Deploying edge functions..."
  supabase functions deploy --project-ref "$(cat supabase/.temp/project-ref)"

  NEW_REF="$(cat supabase/.temp/project-ref)"
  echo "$NEW_REF" > "$ROOT/.supabase-migration-new-ref"
  echo "    ✅ New ref: $NEW_REF"

  if $DO_RESTORE; then
    LATEST_DUMP="$(ls -t "$BACKUP_DIR"/${OLD_REF}-*.sql 2>/dev/null | head -1 || true)"
    if [[ -n "$LATEST_DUMP" && -f "$LATEST_DUMP" ]]; then
      echo "==> Restoring public data from $LATEST_DUMP ..."
      supabase db query --linked --file "$LATEST_DUMP" || {
        echo "    ⚠️  Restore via query failed. Import manually in SQL editor or psql."
      }
    else
      echo "    No dump found in $BACKUP_DIR — skip restore or run --dump-only first."
    fi
  fi

  "$ROOT/scripts/update-supabase-project-ref.sh" "$OLD_REF" "$NEW_REF"

  echo ""
  echo "==> Migration provision complete"
  print_next_steps "$NEW_REF"
}

print_next_steps() {
  local ref="$1"
  cat <<EOF

Next steps:
  1. Dashboard (photospheremedia): https://supabase.com/dashboard/project/$ref/settings/api
  2. apps/portal/.env.local:
       NEXT_PUBLIC_SUPABASE_URL=https://$ref.supabase.co
       NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL=https://$ref.supabase.co/functions/v1
       (+ anon + service_role keys)
  3. pnpm db:types && pnpm check:env
  4. GitHub (photospheremedia/Crypto-Pay or your fork):
       gh secret set SUPABASE_PROJECT_REF -b "$ref"
       gh secret set SUPABASE_ACCESS_TOKEN -b "<photospheremedia sbp_ token>"
  5. Decommission OLD project on $LEGACY_EMAIL when satisfied:
       https://supabase.com/dashboard/project/$OLD_REF/settings/general

EOF
}

if $DO_DUMP; then
  cmd_dump
fi

if $DO_PROVISION; then
  cmd_provision
fi

if [[ -n "$DO_UPDATE_REFS" ]]; then
  "$ROOT/scripts/update-supabase-project-ref.sh" "$OLD_REF" "$DO_UPDATE_REFS"
  print_next_steps "$DO_UPDATE_REFS"
fi

if ! $DO_DUMP && ! $DO_PROVISION && [[ -z "$DO_UPDATE_REFS" ]]; then
  echo "Nothing to do. Use --help"
  exit 1
fi
