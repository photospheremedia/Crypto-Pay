#!/usr/bin/env bash
# List Netlify sites for this account and flag likely Crypto Pay duplicates.
#
# Prefer Netlify MCP in Cursor: list-sites / netlify://sites (see .cursor/rules/netlify-mcp.mdc).
# CLI fallback when MCP is unavailable.
#
# Prereqs: NETLIFY_AUTH_TOKEN in .env.netlify or env (pnpm netlify:connect)
#
# Usage:
#   pnpm netlify:audit
#   ./scripts/netlify-audit-sites.sh --json
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=lib/netlify-site.sh
source "$ROOT/scripts/lib/netlify-site.sh"

ENV_FILE="${NETLIFY_ENV_FILE:-$ROOT/.env.netlify}"
PORKBUN_ENV="${PORKBUN_ENV_FILE:-$ROOT/.env.porkbun}"
JSON=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --json) JSON=true ;;
    -h|--help)
      sed -n '1,12p' "$0"
      exit 0
      ;;
  esac
  shift
done

load_token() {
  if [[ -f "$ENV_FILE" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
  fi
  [[ -n "${NETLIFY_AUTH_TOKEN:-}${NETLIFY_PERSONAL_ACCESS_TOKEN:-}" ]]
}

canonical_host() {
  if [[ -f "$PORKBUN_ENV" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$PORKBUN_ENV"
    set +a
  fi
  echo "${NETLIFY_SITE_HOSTNAME:-}"
}

if ! load_token; then
  echo "Missing Netlify token."
  echo "  cp .env.netlify.example .env.netlify"
  echo "  # add PAT, then: pnpm netlify:connect"
  exit 1
fi

export NETLIFY_AUTH_TOKEN="${NETLIFY_AUTH_TOKEN:-$NETLIFY_PERSONAL_ACCESS_TOKEN}"

CANON_HOST="$(canonical_host)"
resp="$(curl -sS -H "Authorization: Bearer ${NETLIFY_AUTH_TOKEN}" \
  "https://api.netlify.com/api/v1/sites?per_page=100")"

if ! echo "$resp" | jq -e 'type == "array"' >/dev/null 2>&1; then
  echo "Netlify API error:"
  echo "$resp" | jq . 2>/dev/null || echo "$resp"
  exit 1
fi

scored="$(echo "$resp" | jq --arg repo "$NETLIFY_GITHUB_REPO" --arg name "$NETLIFY_SITE_NAME" --arg host "$CANON_HOST" '
  [.[] | select(
    (.name | ascii_downcase | test("crypto|cryptopay|cryptiva"))
    or ((.build_settings.repo_url // "") | test("Crypto-Pay|crypto-pay"; "i"))
    or ((.custom_domain // "") | test("cryptopay"; "i"))
    or ((.default_domain // "") | test("crypto-pay|cryptopay"; "i"))
    or (.name == $name)
  ) | . as $s | (
    (if $s.name == $name then 100 else 0 end)
    + (if $host != "" and (($s.default_domain // "") == $host or (($s.ssl_url // $s.url // "") | contains($host))) then 80 else 0 end)
    + (if (($s.custom_domain // "") | test("cryptopay"; "i")) then 60 else 0 end)
    + (if (($s.build_settings.repo_url // "") | test("Crypto-Pay"; "i")) then 20 else 0 end)
  ) as $score | {
    score: $score,
    id: $s.id,
    name: $s.name,
    url: ($s.ssl_url // $s.url),
    default_domain: $s.default_domain,
    custom_domain: ($s.custom_domain // null),
    repo: ($s.build_settings.repo_url // null),
    repo_branch: ($s.build_settings.repo_branch // null),
    updated_at: $s.updated_at,
    admin_url: ($s.admin_url // ("https://app.netlify.com/sites/" + $s.name))
  }]
  | sort_by(-.score)
')"

count="$(echo "$scored" | jq 'length')"

if [[ "$JSON" == true ]]; then
  echo "$scored" | jq --arg canonical_name "$NETLIFY_SITE_NAME" --arg canonical_host "$CANON_HOST" \
    '{canonical_name, canonical_host, keeper: .[0], sites: .}'
  exit 0
fi

echo "==> Netlify audit (Crypto Pay)"
echo "    Canonical site name: $NETLIFY_SITE_NAME"
[[ -n "$CANON_HOST" ]] && echo "    Canonical host (.env.porkbun): $CANON_HOST"
echo ""

if [[ "$count" -eq 0 ]]; then
  echo "No matching sites found. Create/link one:"
  echo "  pnpm netlify:bootstrap"
  exit 0
fi

echo "$scored" | jq -r '.[] | "\(.name)\t\(.score)\t\(.id)\t\(.url)\t\(.custom_domain // "—")\t\(.repo // "—")"' | \
while IFS=$'\t' read -r name score id url domain repo; do
  tag="DELETE?"
  [[ "$count" -eq 1 ]] && tag="KEEP"
  [[ "$(echo "$scored" | jq -r '.[0].id')" == "$id" ]] && tag="KEEP"
  echo "[$tag] $name (score $score)"
  echo "    URL:     $url"
  echo "    Domain:  $domain"
  echo "    Site ID: $id"
  echo "    Repo:    $repo"
  echo ""
done

keeper="$(echo "$scored" | jq -r '.[0].name')"
keeper_id="$(echo "$scored" | jq -r '.[0].id')"

if [[ "$count" -gt 1 ]]; then
  echo "==> Duplicate sites ($count). Keep: $keeper ($keeper_id)"
  echo "    Delete the others: Netlify → Site configuration → General → Delete site"
  echo ""
  echo "    Then: pnpm netlify:link   # re-link to $NETLIFY_SITE_NAME"
  echo "          pnpm netlify:secrets"
elif [[ "$keeper" != "$NETLIFY_SITE_NAME" ]]; then
  echo "==> One site; name is \"$keeper\" (repo expects \"$NETLIFY_SITE_NAME\")."
  echo "    Rename in Netlify UI, or export NETLIFY_SITE_NAME=$keeper before netlify:link"
else
  echo "==> OK: one site \"$keeper\"."
fi
