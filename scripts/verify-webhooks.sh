#!/bin/bash

# Webhook Configuration Verification Script
# This script helps verify that webhooks are properly configured and responding

set -e

PROJECT_REF="xfairwgarmpvbogiuduk"
FUNCTIONS_URL="https://${PROJECT_REF}.supabase.co/functions/v1"

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

FUNCTIONS=("verify-turnstile" "send-email" "rate-limit-check" "stripe-webhook" "urban-piper-webhook" "chat")

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

SECRETS=("TURNSTILE_SECRET_KEY" "RESEND_API_KEY" "UPSTASH_REDIS_REST_URL" "UPSTASH_REDIS_REST_TOKEN" "STRIPE_WEBHOOK_SECRET" "URBAN_PIPER_WEBHOOK_SECRET")

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
echo "🔗 Stripe Webhook:"
echo "   ${FUNCTIONS_URL}/stripe-webhook"
echo ""
echo "🔗 Urban Piper Webhook:"
echo "   ${FUNCTIONS_URL}/urban-piper-webhook"
echo ""
echo "======================================"
echo ""
echo "Next Steps:"
echo "1. Go to Stripe Dashboard → Developers → Webhooks"
echo "2. Click 'Add endpoint'"
echo "3. Enter URL: ${FUNCTIONS_URL}/stripe-webhook"
echo "4. Select events: payment_intent.succeeded, charge.refunded, invoice.payment_failed"
echo "5. Copy Signing Secret and run:"
echo "   supabase secrets set STRIPE_WEBHOOK_SECRET=\"whsec_...\" --project-ref $PROJECT_REF"
echo ""
echo "6. Go to Urban Piper Dashboard → Settings → Webhooks"
echo "7. Add webhook URL: ${FUNCTIONS_URL}/urban-piper-webhook"
echo "8. If signing secret provided, run:"
echo "   supabase secrets set URBAN_PIPER_WEBHOOK_SECRET=\"...\" --project-ref $PROJECT_REF"
echo ""
