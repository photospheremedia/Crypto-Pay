#!/usr/bin/env bash
# Logical dump of the linked Supabase project (PhotoSphere). Output: backups/ (gitignored).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# shellcheck source=scripts/crypto-pay-supabase-env.sh
source "$ROOT/scripts/crypto-pay-supabase-env.sh"

mkdir -p backups
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="backups/cryptopay-${CRYPTO_PAY_SUPABASE_PROJECT_REF}-${STAMP}.sql"

echo "==> Dumping linked project to $OUT"
echo "    Ref: $CRYPTO_PAY_SUPABASE_PROJECT_REF"
echo "    Store this file off-site (encrypted). Do not commit."
echo ""

supabase db dump --linked -f "$OUT"

echo ""
echo "Done: $OUT ($(wc -c < "$OUT" | tr -d ' ') bytes)"
