#!/usr/bin/env bash
# Bootstrap Crypto Pay on a fresh Supabase account (e.g. photospheremedia).
# Run after: supabase logout && supabase login (as the new account).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ORG_NAME="${SUPABASE_ORG_NAME:-PhotoSphere Media}"
PROJECT_NAME="${SUPABASE_PROJECT_NAME:-Crypto Pay}"
DB_PASSWORD="${SUPABASE_DB_PASSWORD:-}"
REGION="${SUPABASE_REGION:-us-east-1}"

echo "==> Crypto Pay — new Supabase project bootstrap"
echo "    Org: $ORG_NAME | Project: $PROJECT_NAME | Region: $REGION"
echo ""

if ! command -v supabase >/dev/null 2>&1; then
  echo "Install Supabase CLI: https://supabase.com/docs/guides/cli"
  exit 1
fi

if [[ -z "$DB_PASSWORD" ]]; then
  read -rsp "Database password for new project: " DB_PASSWORD
  echo ""
fi

if [[ -n "${SUPABASE_ORG_ID:-}" ]]; then
  ORG_ID="$SUPABASE_ORG_ID"
else
  ORG_ID="$(supabase orgs list -o json | ORG_NAME="$ORG_NAME" python3 -c "
import json, sys, os
name = os.environ.get('ORG_NAME', 'PhotoSphere Media')
orgs = json.load(sys.stdin)
match = next((o for o in orgs if o.get('name') == name), None)
print(match['id'] if match else '')
")"
fi

if [[ -z "$ORG_ID" ]]; then
  echo "No org named \"$ORG_NAME\". Create it in the dashboard, then rerun with:"
  echo "  SUPABASE_ORG_ID=<org-id> $0"
  echo "Or pick an org: supabase orgs list"
  exit 1
fi

echo "==> Creating project (org $ORG_ID)..."
CREATE_JSON="$(supabase projects create "$PROJECT_NAME" \
  --org-id "$ORG_ID" \
  --db-password "$DB_PASSWORD" \
  --region "$REGION" \
  -o json)"

PROJECT_REF="$(echo "$CREATE_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")"
echo "    Project ref: $PROJECT_REF"

echo "==> Linking local repo..."
supabase link --project-ref "$PROJECT_REF"

echo "==> Pushing migrations..."
supabase db push

echo "==> Deploying edge functions..."
supabase functions deploy

echo ""
echo "Done. Next steps:"
echo "  1. Cursor: Settings → MCP → Supabase → sign in as photospheremedia"
echo "  2. Optional MCP URL scope: https://mcp.supabase.com/mcp?project_ref=$PROJECT_REF"
echo "  3. Copy API keys → apps/portal/.env.local:"
echo "     NEXT_PUBLIC_SUPABASE_URL=https://$PROJECT_REF.supabase.co"
echo "     NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL=https://$PROJECT_REF.supabase.co/functions/v1"
echo "  4. pnpm db:types && pnpm dev:portal"
