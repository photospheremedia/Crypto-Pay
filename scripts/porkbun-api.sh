#!/usr/bin/env bash
# Porkbun REST API helper (no official Porkbun CLI — this uses api.porkbun.com).
#
# Setup:
#   cp .env.porkbun.example .env.porkbun
#   # Keys: https://porkbun.com/account/api
#   # Enable API on cryptopay.sale → Domain Management → Details → API Access
#
# Usage:
#   pnpm porkbun:ping
#   pnpm porkbun:domains
#   pnpm porkbun:dns
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${PORKBUN_ENV_FILE:-$ROOT/.env.porkbun}"
API_BASE="https://api.porkbun.com/api/json/v3"
DOMAIN="${PORKBUN_DOMAIN:-cryptopay.sale}"

load_env() {
  if [[ -f "$ENV_FILE" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
  fi
}

pb_post() {
  local endpoint="$1"
  local extra="${2:-{}}"
  if [[ -z "${PORKBUN_API_KEY:-}" || -z "${PORKBUN_SECRET_API_KEY:-}" ]]; then
    echo "Missing credentials. Create $ENV_FILE from .env.porkbun.example" >&2
    exit 1
  fi
  # Allow passing extra as either a JSON object string ("{}") or empty.
  curl -sS -X POST "${API_BASE}/${endpoint}" \
    -H "Content-Type: application/json" \
    -d "$(jq -n \
      --arg apikey "$PORKBUN_API_KEY" \
      --arg secretapikey "$PORKBUN_SECRET_API_KEY" \
      --arg extra "$extra" \
      '{apikey: $apikey, secretapikey: $secretapikey} + ((($extra|fromjson?) // {}) | select(type=="object"))')"
}

cmd_ping() {
  echo "==> Porkbun API (no auth)"
  curl -sS -X POST "${API_BASE}/ip" -H "Content-Type: application/json" -d '{}' | jq .
  echo ""
  if [[ -f "$ENV_FILE" ]]; then
    load_env
    echo "==> Porkbun ping (authenticated)"
    resp="$(pb_post "ping" "{}")"
    echo "$resp" | jq .
    if ! echo "$resp" | jq -e '.status == "SUCCESS"' >/dev/null; then
      exit 1
    fi
  else
    echo "No $ENV_FILE — add keys to test authenticated ping"
    exit 1
  fi
}

cmd_domains() {
  load_env
  echo "==> Domains"
  pb_post "domain/listAll" "{}" | jq .
}

cmd_dns() {
  load_env
  echo "==> DNS for $DOMAIN"
  pb_post "dns/retrieve/${DOMAIN}" "{}" | jq .
}

usage() {
  cat <<EOF
Usage: $(basename "$0") <command>

Commands:
  ping      Test API + auth (requires .env.porkbun)
  domains   List all domains
  dns       List DNS records for \$PORKBUN_DOMAIN ($DOMAIN)

Third-party CLIs (optional):
  npm i -g porkbun-cli && porkbun ping
  pip install porkbun-api && python -m porkbun ...

Official: REST API only — https://porkbun.com/api/json/v3/documentation

EOF
}

main() {
  case "${1:-ping}" in
    ping) cmd_ping ;;
    domains) cmd_domains ;;
    dns) cmd_dns ;;
    -h|--help|help) usage ;;
    *) echo "Unknown: $1"; usage; exit 1 ;;
  esac
}

main "$@"
