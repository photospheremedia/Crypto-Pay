#!/usr/bin/env bash
# Enable Supabase platform backups (Small compute + PITR) via Management API.
# Requires: Pro (or Team/Enterprise) org plan — not available on Free.
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
ORG="${CRYPTO_PAY_SUPABASE_ORG_SLUG:-xrjxgpvrileqpzfopehl}"

PITR_VARIANT="${PITR_VARIANT:-pitr_7}"   # pitr_7 | pitr_14 | pitr_28
COMPUTE_VARIANT="${COMPUTE_VARIANT:-ci_small}"

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "Missing SUPABASE_ACCESS_TOKEN in $ENV_FILE"
  echo "Run: pnpm supabase:connect"
  exit 1
fi

auth_hdr=(-H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" -H "Content-Type: application/json")

plan="$(curl -sS "${auth_hdr[@]}" "https://api.supabase.com/v1/organizations/$ORG" | python3 -c "import json,sys; print(json.load(sys.stdin).get('plan','?'))")"

echo "==> Enable platform backups (PITR)"
echo "    Project: $REF"
echo "    Org:     $ORG (plan: $plan)"
echo "    PITR:    $PITR_VARIANT + compute $COMPUTE_VARIANT"
echo ""

if [[ "$plan" == "free" ]]; then
  echo "❌ Organization is on the Free plan. Supabase blocks add-on changes via API:"
  echo "   \"Project addons cannot be edited on the free tier.\""
  echo ""
  echo "Upgrade first (billing):"
  echo "  $DASH/settings/billing"
  echo "  https://supabase.com/dashboard/org/$ORG/billing"
  echo ""
  echo "Then either:"
  echo "  1. Re-run:  pnpm supabase:backup:enable"
  echo "  2. Dashboard: $DASH/database/backups → Point in Time"
  echo ""
  echo "Until then, use off-site logical dumps:"
  echo "  pnpm supabase:db:dump"
  exit 1
fi

patch_addon() {
  local type="$1" variant="$2"
  echo "→ PATCH addon $type → $variant"
  local body http
  body="$(python3 -c "import json; print(json.dumps({'addon_type': '$type', 'addon_variant': '$variant'}))")"
  http="$(curl -sS -o /tmp/supabase-addon.json -w "%{http_code}" -X PATCH \
    "https://api.supabase.com/v1/projects/$REF/billing/addons" \
    "${auth_hdr[@]}" -d "$body")"
  if [[ "$http" != "200" && "$http" != "201" ]]; then
    echo "   HTTP $http: $(cat /tmp/supabase-addon.json)"
    exit 1
  fi
  echo "   OK"
}

patch_addon "compute_instance" "$COMPUTE_VARIANT"
echo "   Waiting 30s for compute resize…"
sleep 30
patch_addon "pitr" "$PITR_VARIANT"

echo ""
echo "Waiting for PITR to activate (up to ~3 min)…"
for _ in $(seq 1 18); do
  pitr="$(curl -sS "${auth_hdr[0]}" "https://api.supabase.com/v1/projects/$REF/database/backups" \
    | python3 -c "import json,sys; print(json.load(sys.stdin).get('pitr_enabled'))")"
  if [[ "$pitr" == "True" ]]; then
    echo "✅ PITR enabled."
    exec "$ROOT/scripts/supabase-backup-status.sh"
  fi
  sleep 10
done

echo "⚠️  PITR still reporting off. Check dashboard:"
echo "   $DASH/database/backups"
exec "$ROOT/scripts/supabase-backup-status.sh"
