#!/usr/bin/env bash
# Report Supabase platform backup / PITR status for Crypto Pay production (PhotoSphere).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${SUPABASE_ENV_FILE:-$ROOT/.env.supabase}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

# shellcheck source=scripts/crypto-pay-supabase-env.sh
source "$ROOT/scripts/crypto-pay-supabase-env.sh"

REF="$CRYPTO_PAY_SUPABASE_PROJECT_REF"
DASH="$CRYPTO_PAY_SUPABASE_DASHBOARD"

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "Missing SUPABASE_ACCESS_TOKEN in $ENV_FILE"
  echo "Run: pnpm supabase:connect"
  exit 1
fi

echo "==> Crypto Pay Supabase backups"
echo "    Project: $REF"
echo "    Dashboard: $DASH/database/backups"
echo ""

ORG="${CRYPTO_PAY_SUPABASE_ORG_SLUG:-xrjxgpvrileqpzfopehl}"
AUTH=(-H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN")

JSON="$(curl -sS "${AUTH[@]}" \
  "https://api.supabase.com/v1/projects/$REF/database/backups")"
ORG_JSON="$(curl -sS "${AUTH[@]}" "https://api.supabase.com/v1/organizations/$ORG" 2>/dev/null || echo '{}')"

python3 - "$JSON" "$ORG_JSON" "$DASH" "$ORG" <<'PY'
import json, sys

data = json.loads(sys.argv[1])
org = json.loads(sys.argv[2]) if sys.argv[2].strip() else {}
dash = sys.argv[3]
org_slug = sys.argv[4]
plan = org.get("plan", "?")
pitr = data.get("pitr_enabled")
walg = data.get("walg_enabled")
region = data.get("region", "?")
backups = data.get("backups") or []

print(f"Org plan:         {plan}")
print(f"Region:           {region}")
print(f"WAL-G (physical): {walg}")
print(f"PITR enabled:     {pitr}")
print(f"Listed backups:   {len(backups)}")
if backups:
    for b in backups[:10]:
        print(f"  - {b}")
print()
print("Dashboard:")
print(f"  Daily / restore: {dash}/database/backups")
print(f"  PITR settings:   {dash}/database/backups")
print(f"  Billing / plan:  https://supabase.com/dashboard/org/{org_slug}/billing")
print()
print("Docs: docs/SUPABASE_MAINTENANCE_AND_BACKUPS.md")
if plan == "free":
    print()
    print("⚠️  Free plan: PITR and compute add-ons cannot be enabled via API.")
    print("   Upgrade to Pro, then: pnpm supabase:backup:enable")
    print("   Meanwhile: pnpm supabase:db:dump  (logical backup, works today)")
elif not pitr:
    print()
    print("⚠️  PITR is OFF. Enable with: pnpm supabase:backup:enable")
    print("   (requires Small compute + PITR add-on; ~$115/mo for 7-day retention)")
PY
