#!/usr/bin/env bash
# Run AFTER: pnpm supabase:login (token in .env.supabase)
# Creates org + project under that account, pushes schema, deploys functions.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ORG_NAME="${SUPABASE_ORG_NAME:-PhotoSphere Media}"
PROJECT_NAME="${SUPABASE_PROJECT_NAME:-Crypto Pay}"
REGION="${SUPABASE_REGION:-us-east-1}"
OLD_REF="${OLD_PROJECT_REF:-usbxwewohpsbjwiuazpf}"

if ! supabase projects list -o json >/dev/null 2>&1; then
  echo "Not logged in. Run: supabase login"
  echo "Sign in as photospheremedia00@gmail.com, or: supabase login --token sbp_..."
  exit 1
fi

echo "==> Logged in as:"
supabase projects list 2>&1 | head -3

if supabase projects list -o json | python3 -c "
import json, sys
ref = sys.argv[1]
projects = json.load(sys.stdin)
print('yes' if any(p.get('id') == ref for p in projects) else 'no')
" "$OLD_REF" 2>/dev/null | grep -q yes; then
  echo "==> You already have access to $OLD_REF — linking that project."
  supabase link --project-ref "$OLD_REF"
else
  echo "==> Creating fresh project under your account (recommended for photospheremedia-only ownership)."
  read -rsp "Database password for new project: " DB_PASS
  echo ""
  ORG_ID="$(supabase orgs list -o json | ORG_NAME="$ORG_NAME" python3 -c "
import json, sys, os
name = os.environ.get('ORG_NAME', 'PhotoSphere Media')
orgs = json.load(sys.stdin)
m = next((o for o in orgs if o.get('name') == name), None)
print(m['id'] if m else '')
")"
  if [[ -z "$ORG_ID" ]]; then
    echo "Create organization \"$ORG_NAME\" in the dashboard, then:"
    echo "  SUPABASE_ORG_ID=<id> $0"
    exit 1
  fi
  CREATE_JSON="$(supabase projects create "$PROJECT_NAME" \
    --org-id "$ORG_ID" \
    --db-password "$DB_PASS" \
    --region "$REGION" \
    -o json)"
  PROJECT_REF="$(echo "$CREATE_JSON" | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")"
  echo "    New ref: $PROJECT_REF"
  supabase link --project-ref "$PROJECT_REF"
  yes | supabase db push --include-all
  supabase functions deploy --project-ref "$PROJECT_REF"
fi

PROJECT_REF="$(cat supabase/.temp/project-ref 2>/dev/null || true)"
if [[ -z "$PROJECT_REF" ]]; then
  PROJECT_REF="$(supabase projects list -o json | python3 -c "
import json, sys
for p in json.load(sys.stdin):
    if p.get('name') == 'Crypto Pay':
        print(p['id']); break
")"
fi

echo ""
echo "==> Update GitHub secrets (photospheremedia/Crypto-Pay):"
echo "  gh secret set SUPABASE_PROJECT_REF -R photospheremedia/Crypto-Pay -b \"$PROJECT_REF\""
echo "  gh secret set SUPABASE_ACCESS_TOKEN -R photospheremedia/Crypto-Pay -b \"\$(supabase access-token 2>/dev/null || echo 'paste sbp_ token from dashboard')\""
echo ""
echo "==> MCP URLs (.mcp.json, .cursor/mcp.json, .vscode/mcp.json):"
echo "  https://mcp.supabase.com/mcp?project_ref=$PROJECT_REF"
echo ""
echo "==> apps/portal/.env.local:"
echo "  NEXT_PUBLIC_SUPABASE_URL=https://$PROJECT_REF.supabase.co"
echo "  NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL=https://$PROJECT_REF.supabase.co/functions/v1"
echo "  (copy anon + service_role from dashboard → Settings → API)"
