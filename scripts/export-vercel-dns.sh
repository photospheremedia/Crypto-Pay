#!/usr/bin/env bash
# Export DNS records Vercel expects for cryptopay.sale (old skullcandyxxx project).
# Use this to fix Porkbun when migration to Netlify — compare live Porkbun vs Vercel.
#
# Usage:
#   pnpm dns:export-vercel
#   ./scripts/export-vercel-dns.sh --netlify your-site.netlify.app
set -euo pipefail

DOMAIN="${DOMAIN:-cryptopay.sale}"
NETLIFY_HOST="${1#--netlify=}"
[[ "${1:-}" == --netlify=* ]] && NETLIFY_HOST="${1#--netlify=}"
[[ "${2:-}" == --netlify=* ]] && NETLIFY_HOST="${2#--netlify=}"

echo "==> Vercel DNS export for ${DOMAIN}"
echo "    (requires: vercel login as account that owns the domain)"
echo ""

if ! command -v vercel >/dev/null 2>&1; then
  echo "Install: pnpm add -D vercel"
  exit 1
fi

echo "Account: $(vercel whoami 2>/dev/null || echo 'not logged in')"
echo ""

echo "--- Vercel domain inspect (nameserver mismatch = normal with Porkbun DNS) ---"
vercel domains inspect "$DOMAIN" 2>&1 || true
echo ""

echo "--- Vercel DNS records (what the old deploy used) ---"
vercel dns ls "$DOMAIN" 2>&1 || true
echo ""

echo "--- Live public DNS (dig) ---"
echo "NS:"
dig +short NS "$DOMAIN" | sed 's/^/  /'
echo "A (apex):"
dig +short A "$DOMAIN" | sed 's/^/  /'
echo "www:"
dig +short CNAME "www.${DOMAIN}" | sed 's/^/  /'
dig +short A "www.${DOMAIN}" | sed 's/^/  /'
echo ""

cat <<EOF
--- Porkbun + Netlify (recommended; keep Porkbun nameservers)

Do NOT switch nameservers to Vercel unless you want Vercel to host DNS.
Keep: curitiba/fortaleza/maceio/salvador.ns.porkbun.com

Replace old Vercel records in Porkbun with:

  Type    Host    Content
  ALIAS   @       apex-loadbalancer.netlify.com
  CNAME   www     ${NETLIFY_HOST:-YOUR-SITE.netlify.app}

Old Vercel equivalents were typically:
  ALIAS   @       0a58a04a353802dd.vercel-dns-017.com  (or A → 76.76.21.21)
  ALIAS   *       cname.vercel-dns-017.com

Apply via Porkbun API:
  cp .env.porkbun.example .env.porkbun
  pnpm dns:apply

EOF
