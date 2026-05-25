#!/usr/bin/env bash
# Point cryptopay.sale DNS at Netlify via Porkbun API.
#
# Setup:
#   cp .env.porkbun.example .env.porkbun
#   # Add keys + NETLIFY_SITE_HOSTNAME (from Netlify after import)
#   # In Netlify: add custom domain cryptopay.sale + www.cryptopay.sale first
#
# Usage:
#   pnpm dns:plan              # show current + planned records
#   pnpm dns:apply             # apply (with confirmation)
#   ./scripts/configure-porkbun-dns-netlify.sh --apply --yes
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${PORKBUN_ENV_FILE:-$ROOT/.env.porkbun}"
API_BASE="https://api.porkbun.com/api/json/v3"
DRY_RUN=true
AUTO_YES=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply) DRY_RUN=false ;;
    --yes) AUTO_YES=true ;;
    -h|--help)
      sed -n '1,18p' "$0"
      exit 0
      ;;
  esac
  shift
done

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  echo "  cp .env.porkbun.example .env.porkbun"
  echo "  Add PORKBUN_API_KEY, PORKBUN_SECRET_API_KEY, NETLIFY_SITE_HOSTNAME"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

DOMAIN="${PORKBUN_DOMAIN:-cryptopay.sale}"
NETLIFY_HOST="${NETLIFY_SITE_HOSTNAME:-}"

if [[ -z "${PORKBUN_API_KEY:-}" || -z "${PORKBUN_SECRET_API_KEY:-}" ]]; then
  echo "Set PORKBUN_API_KEY and PORKBUN_SECRET_API_KEY in $ENV_FILE"
  echo "  Porkbun → Account → API Access → copy pk1_ and sk1_ (enable API on ${DOMAIN})"
  if [[ -n "${PORKBUN_API_KEY:-}" && -z "${PORKBUN_SECRET_API_KEY:-}" ]]; then
    echo "  PORKBUN_SECRET_API_KEY is empty — DNS cannot be updated until sk1_ is set."
  fi
  exit 1
fi

if [[ -z "$NETLIFY_HOST" ]]; then
  echo "Set NETLIFY_SITE_HOSTNAME in $ENV_FILE (e.g. crypto-pay-abc123.netlify.app)"
  exit 1
fi

pb_post() {
  local endpoint="$1"
  local extra="${2:-{}}"
  curl -sS -X POST "${API_BASE}/${endpoint}" \
    -H "Content-Type: application/json" \
    -d "$(jq -n \
      --arg apikey "$PORKBUN_API_KEY" \
      --arg secretapikey "$PORKBUN_SECRET_API_KEY" \
      --argjson extra "$extra" \
      '{apikey: $apikey, secretapikey: $secretapikey} + $extra')"
}

echo "==> Porkbun DNS for $DOMAIN → Netlify ($NETLIFY_HOST)"
echo ""

ping_resp="$(pb_post "ping" "{}")"
if ! echo "$ping_resp" | jq -e '.status == "SUCCESS"' >/dev/null 2>&1; then
  echo "Porkbun API ping failed:"
  echo "$ping_resp" | jq . 2>/dev/null || echo "$ping_resp"
  exit 1
fi
echo "    API: OK (your IP: $(echo "$ping_resp" | jq -r '.yourIp // "?"'))"

records="$(pb_post "dns/retrieve/${DOMAIN}" "{}")"
if ! echo "$records" | jq -e '.status == "SUCCESS"' >/dev/null 2>&1; then
  echo "dns/retrieve failed:"
  echo "$records" | jq .
  exit 1
fi

echo ""
echo "==> Current DNS records:"
echo "$records" | jq -r '.records[]? | "\(.type)\t\(.name // "@")\t\(.content)\t(id=\(.id))"' | sort

# Planned Netlify external DNS (https://docs.netlify.com/domains/configure-domains/configure-external-dns/)
declare -a PLAN
PLAN+=("ALIAS|@|apex-loadbalancer.netlify.com")
PLAN+=("CNAME|www|${NETLIFY_HOST}")

echo ""
echo "==> Planned records:"
printf '  %s\n' "${PLAN[@]/@/apex}"

if $DRY_RUN; then
  echo ""
  echo "Dry run only. To apply: pnpm dns:apply"
  exit 0
fi

if ! $AUTO_YES; then
  read -rp "Apply DNS changes to ${DOMAIN}? [y/N] " confirm
  [[ "${confirm,,}" == "y" || "${confirm,,}" == "yes" ]] || exit 0
fi

delete_conflicts() {
  local rtype="$1"
  local name="$2"
  echo "$records" | jq -c --arg t "$rtype" --arg n "$name" \
    '.records[]? | select(.type == $t and ((.name // "") == $n))' | while read -r rec; do
    id="$(echo "$rec" | jq -r '.id')"
    echo "    delete $rtype ${name:-@} (id=$id)"
    del="$(pb_post "dns/delete/${DOMAIN}/${id}" "{}")"
    if ! echo "$del" | jq -e '.status == "SUCCESS"' >/dev/null; then
      echo "$del" | jq .
      exit 1
    fi
  done
}

create_record() {
  local rtype="$1"
  local name="$2"
  local content="$3"
  local payload
  payload="$(jq -n --arg type "$rtype" --arg name "$name" --arg content "$content" \
    '{type: $type, name: $name, content: $content, ttl: "600"}')"
  echo "    create $rtype ${name:-@} → $content"
  resp="$(pb_post "dns/create/${DOMAIN}" "$payload")"
  if ! echo "$resp" | jq -e '.status == "SUCCESS"' >/dev/null; then
    echo "$resp" | jq .
    exit 1
  fi
}

echo ""
echo "==> Applying..."

# Clear conflicting apex / www records (including old Vercel: 76.76.21.21, vercel-dns-017)
for pair in "A|@" "AAAA|@" "ALIAS|@" "ANAME|@" "CNAME|@" "CNAME|www" "A|www" "ALIAS|*"; do
  IFS='|' read -r t n <<< "$pair"
  delete_conflicts "$t" "$n"
done
# Delete any record still pointing at Vercel
echo "$records" | jq -c '.records[]?' | while read -r rec; do
  content="$(echo "$rec" | jq -r '.content')"
  if [[ "$content" == *vercel* || "$content" == "76.76.21.21" ]]; then
    id="$(echo "$rec" | jq -r '.id')"
    rtype="$(echo "$rec" | jq -r '.type')"
    rname="$(echo "$rec" | jq -r '.name // ""')"
    echo "    delete legacy Vercel $rtype ${rname:-@} (id=$id) → $content"
    if ! $DRY_RUN; then
      del="$(pb_post "dns/delete/${DOMAIN}/${id}" "{}")"
      echo "$del" | jq -e '.status == "SUCCESS"' >/dev/null || { echo "$del" | jq .; exit 1; }
    fi
  fi
done

create_record "ALIAS" "" "apex-loadbalancer.netlify.com"
create_record "CNAME" "www" "$NETLIFY_HOST"

echo ""
echo "✅ DNS updated. Propagation can take up to 24h (often minutes)."
echo ""
echo "Next:"
echo "  1. Netlify → Domain management → verify cryptopay.sale + www.cryptopay.sale"
echo "  2. Add any TXT verification record Netlify shows (re-run with manual TXT if needed)"
echo "  3. Set NEXT_PUBLIC_APP_URL=https://cryptopay.sale in Netlify env"
echo "  4. Enable HTTPS in Netlify (automatic after DNS verifies)"
