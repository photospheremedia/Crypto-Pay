#!/bin/bash

# Webhook Configuration Verification Script
# This script helps verify that webhooks are properly configured and responding

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/crypto-pay-supabase-env.sh
source "$ROOT/scripts/crypto-pay-supabase-env.sh"
if [[ -f "$ROOT/.env.supabase" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ROOT/.env.supabase"
  set +a
  # shellcheck source=scripts/crypto-pay-supabase-env.sh
  source "$ROOT/scripts/crypto-pay-supabase-env.sh"
fi

PROJECT_REF="$CRYPTO_PAY_SUPABASE_PROJECT_REF"
FUNCTIONS_URL="$CRYPTO_PAY_SUPABASE_FUNCTIONS_URL"

echo "🔍 Webhook Configuration Verification"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo "Install: brew install supabase/tap/supabase"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}"
echo ""

# Verify project is linked
echo "Checking project link..."
if supabase projects list | grep -q "$PROJECT_REF"; then
    echo -e "${GREEN}✅ Project linked: $PROJECT_REF${NC}"
else
    echo -e "${YELLOW}⚠️  Project link check inconclusive${NC}"
fi
echo ""

# Check Edge Functions are deployed
echo "Checking Edge Functions..."
echo ""

FUNCTIONS=("verify-turnstile" "send-email" "rate-limit-check" "chat")

for func in "${FUNCTIONS[@]}"; do
    if supabase functions list --project-ref "$PROJECT_REF" | grep -q "$func"; then
        echo -e "${GREEN}✅ $func${NC}"
    else
        echo -e "${RED}❌ $func NOT FOUND${NC}"
    fi
done

echo ""
echo "Checking Secrets..."
echo ""

SECRETS=("TURNSTILE_SECRET_KEY" "RESEND_API_KEY" "UPSTASH_REDIS_REST_URL" "UPSTASH_REDIS_REST_TOKEN")

for secret in "${SECRETS[@]}"; do
    if supabase secrets list --project-ref "$PROJECT_REF" | grep -q "$secret"; then
        echo -e "${GREEN}✅ $secret${NC}"
    else
        echo -e "${YELLOW}⚠️  $secret NOT SET${NC}"
    fi
done

echo ""
echo "======================================"
echo "Webhook URLs (for dashboard configuration):"
echo ""
echo "🔗 Chat:"
echo "   ${FUNCTIONS_URL}/chat"
echo ""
echo "======================================"
echo ""
echo "Next Steps:"
echo "1. Ensure TURNSTILE_SECRET_KEY is set for verify-turnstile"
echo "2. Ensure RESEND_API_KEY is set for send-email"
echo "3. Ensure UPSTASH_* secrets are set for rate-limit-check"
echo ""
