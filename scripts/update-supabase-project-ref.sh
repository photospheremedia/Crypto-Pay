#!/usr/bin/env bash
# Replace Supabase project ref across repo config (after account migration).
# Usage: ./scripts/update-supabase-project-ref.sh <old-ref> <new-ref>
set -euo pipefail

OLD_REF="${1:-}"
NEW_REF="${2:-}"

if [[ -z "$NEW_REF" ]]; then
  echo "Usage: $0 [old-ref] <new-ref>"
  echo "Example: $0  abcdefghijklmnop"
  exit 1
fi

if [[ "$OLD_REF" == "$NEW_REF" ]]; then
  echo "Old and new refs are the same; nothing to do."
  exit 0
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

FILES=(
  .cursor/mcp.json
  .mcp.json
  .vscode/mcp.json
  apps/portal/.env.example
  scripts/apply-remaining-migrations.mjs
  scripts/build-migration-payloads.mjs
  scripts/check-env.sh
  scripts/handoff-photospheremedia-account.sh
  scripts/setup-resend-secrets.ps1
  scripts/supabase-auth.sh
  scripts/update_supabase_templates.py
  supabase/scripts/build-edge-deploy-payload.mjs
  .env.supabase.example
)

echo "==> Replacing $OLD_REF → $NEW_REF"
for f in "${FILES[@]}"; do
  if [[ -f "$f" ]]; then
    if grep -q "$OLD_REF" "$f"; then
      sed -i '' "s/${OLD_REF}/${NEW_REF}/g" "$f"
      echo "    updated $f"
    fi
  fi
done

if [[ -f supabase/.temp/project-ref ]]; then
  echo "$NEW_REF" > supabase/.temp/project-ref
  echo "    updated supabase/.temp/project-ref"
fi

if [[ -f supabase/.temp/linked-project.json ]]; then
  python3 -c "
import json, pathlib
p = pathlib.Path('supabase/.temp/linked-project.json')
data = json.loads(p.read_text())
data['ref'] = '$NEW_REF'
p.write_text(json.dumps(data, indent=2) + '\n')
"
  echo "    updated supabase/.temp/linked-project.json"
fi

echo ""
echo "✅ Repo refs updated. Still update manually:"
echo "   apps/portal/.env.local (URL + anon + service_role)"
echo "   .env.supabase → SUPABASE_PROJECT_REF=$NEW_REF"
echo "   GitHub secrets: SUPABASE_PROJECT_REF, SUPABASE_ACCESS_TOKEN (photospheremedia token)"
echo "   Vercel env vars if deployed"
echo "   Cursor MCP: sign in as photospheremedia00@gmail.com"
