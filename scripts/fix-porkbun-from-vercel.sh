#!/usr/bin/env bash
# Fix Porkbun DNS: remove old Vercel targets, point cryptopay.sale at Netlify.
# Reads Vercel's record list for reference; applies Netlify records via Porkbun API.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DOMAIN="${PORKBUN_DOMAIN:-cryptopay.sale}"

echo "==> Step 1: Export current Vercel + live DNS"
"$ROOT/scripts/export-vercel-dns.sh" || true
echo ""

if [[ ! -f "$ROOT/.env.porkbun" ]]; then
  echo "==> Step 2: Missing .env.porkbun"
  echo ""
  echo "Porkbun API (enable on ${DOMAIN} in Porkbun dashboard):"
  echo "  cp .env.porkbun.example .env.porkbun"
  echo ""
  echo "If Porkbun API fails, set records manually in Porkbun UI:"
  echo "  Delete: A/ALIAS/CNAME pointing to vercel-dns-017.com or 76.76.21.21"
  echo "  Add ALIAS @ → apex-loadbalancer.netlify.com"
  echo "  Add CNAME www → <your-netlify-site>.netlify.app"
  exit 1
fi

echo "==> Step 2: Apply Netlify DNS via Porkbun API"
exec "$ROOT/scripts/configure-porkbun-dns-netlify.sh" --apply "$@"
