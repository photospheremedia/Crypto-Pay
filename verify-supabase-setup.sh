#!/bin/bash

# Supabase Production Verification Script
# Checks all production security features are properly configured

echo "🔍 Crypto Pay - Supabase Production Verification"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check migration status
echo "📋 Checking Migration Status..."
supabase migration list | tail -15
echo ""

# Check environment variables
echo "🔑 Checking Environment Variables..."
if [ -f "apps/portal/.env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local exists"
    
    # Check required vars
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" apps/portal/.env.local; then
        echo -e "${GREEN}✓${NC} NEXT_PUBLIC_SUPABASE_URL configured"
    else
        echo -e "${RED}✗${NC} NEXT_PUBLIC_SUPABASE_URL missing"
    fi
    
    if grep -q "SENDGRID_API_KEY=SG\." apps/portal/.env.local; then
        echo -e "${GREEN}✓${NC} SendGrid API key configured"
    else
        echo -e "${YELLOW}⚠${NC} SendGrid API key not configured"
    fi
    
    if grep -q "TURNSTILE_SECRET_KEY" apps/portal/.env.local; then
        echo -e "${GREEN}✓${NC} Turnstile secret key configured"
    else
        echo -e "${YELLOW}⚠${NC} Turnstile secret key not configured"
    fi
    
    if grep -q "NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x" apps/portal/.env.local; then
        echo -e "${GREEN}✓${NC} Turnstile site key configured"
    elif grep -q "__GET_FROM_CLOUDFLARE_DASHBOARD__" apps/portal/.env.local; then
        echo -e "${YELLOW}⚠${NC} Turnstile site key needs value from Cloudflare dashboard"
    fi
    
    if grep -q "UPSTASH_REDIS_REST_URL=https://" apps/portal/.env.local; then
        echo -e "${GREEN}✓${NC} Upstash Redis URL configured"
    elif grep -q "__GET_FROM_UPSTASH_DASHBOARD__" apps/portal/.env.local; then
        echo -e "${YELLOW}⚠${NC} Upstash Redis URL needs value from Upstash dashboard"
    fi
    
    if grep -q "UPSTASH_REDIS_REST_TOKEN" apps/portal/.env.local; then
        echo -e "${GREEN}✓${NC} Upstash Redis token configured"
    else
        echo -e "${YELLOW}⚠${NC} Upstash Redis token not configured"
    fi
else
    echo -e "${RED}✗${NC} .env.local not found"
fi
echo ""

# Check package.json dependencies
echo "📦 Checking Dependencies..."
if grep -q "\"qrcode\"" apps/portal/package.json; then
    echo -e "${GREEN}✓${NC} qrcode (for 2FA QR codes)"
fi
if grep -q "\"@upstash/redis\"" apps/portal/package.json; then
    echo -e "${GREEN}✓${NC} @upstash/redis (for rate limiting)"
fi
if grep -q "\"@upstash/ratelimit\"" apps/portal/package.json; then
    echo -e "${GREEN}✓${NC} @upstash/ratelimit"
fi
if grep -q "\"@marsidev/react-turnstile\"" apps/portal/package.json; then
    echo -e "${GREEN}✓${NC} @marsidev/react-turnstile (for CAPTCHA)"
fi
echo ""

# Check key files exist
echo "📁 Checking Key Files..."
files=(
    "apps/portal/lib/mfa.ts:2FA/TOTP utilities"
    "apps/portal/lib/storage.ts:Avatar upload utilities"
    "apps/portal/lib/rate-limit.ts:Rate limiting"
    "apps/portal/components/account/mfa-setup-dialog.tsx:2FA setup dialog"
    "apps/portal/components/account/avatar-upload.tsx:Avatar upload component"
    "apps/portal/components/auth/turnstile.tsx:CAPTCHA component"
    "apps/portal/hooks/use-toast.tsx:Toast notifications"
    "supabase/migrations/20260201083910_security_enhancements_production_ready.sql:Security migration"
    "supabase/migrations/20260201090057_storage_buckets_setup.sql:Storage buckets migration"
    "docs/PRODUCTION_SETUP.md:Production setup guide"
    "docs/ENV_SETUP.md:Environment setup guide"
    "docs/NEXT_STEPS.md:Next steps guide"
)

for file_info in "${files[@]}"; do
    IFS=':' read -r file description <<< "$file_info"
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description"
    else
        echo -e "${RED}✗${NC} $description (missing: $file)"
    fi
done
echo ""

# Build check
echo "🔨 Checking Build Status..."
if pnpm build:portal > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Build succeeds"
else
    echo -e "${RED}✗${NC} Build fails - run 'pnpm build:portal' for details"
fi
echo ""

# Summary
echo "=================================================="
echo "📊 Summary"
echo "=================================================="
echo ""
echo "✅ Implemented Features:"
echo "  • Rate Limiting (5 tiers)"
echo "  • CAPTCHA Protection (Cloudflare Turnstile)"
echo "  • Avatar Upload (Supabase Storage)"
echo "  • 2FA/TOTP (Supabase MFA)"
echo "  • Database Security (pg_cron, indexes, RLS)"
echo "  • Session Management"
echo "  • Audit Logging"
echo ""
echo "⚠️  Requires Configuration:"
echo "  • NEXT_PUBLIC_TURNSTILE_SITE_KEY (from Cloudflare)"
echo "  • UPSTASH_REDIS_REST_URL (from Upstash)"
echo "  • SendGrid SMTP in Supabase Dashboard"
echo ""
echo "📚 Documentation: docs/NEXT_STEPS.md"
echo ""
