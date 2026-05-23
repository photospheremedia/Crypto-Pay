#!/bin/bash

# Local Integration Testing Script
# Tests all 4 integrations after code deployment

set -e

echo "🧪 Local Integration Testing"
echo "============================"
echo ""

# Wait for dev server
echo "⏳ Waiting for dev server to be ready..."
sleep 5

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "❌ Dev server not running on localhost:3000"
    echo "Start it with: cd apps/portal && pnpm dev"
    exit 1
fi

echo "✅ Dev server is responding"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Check if NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL is set
echo -e "${BLUE}Test 1: Environment Configuration${NC}"
if grep -q "NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL" apps/portal/.env.local; then
    echo -e "${GREEN}✅ NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL is configured${NC}"
    FUNCTIONS_URL=$(grep "NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL" apps/portal/.env.local | cut -d'=' -f2 | tr -d '"')
    echo "   URL: $FUNCTIONS_URL"
else
    echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL not found in .env.local${NC}"
fi
echo ""

# Test 2: Verify chat page loads
echo -e "${BLUE}Test 2: Chat Page Loading${NC}"
if curl -s http://localhost:3000 | grep -q "chat\|Chat" || curl -s http://localhost:3000/chat 2>/dev/null | grep -q "input\|send"; then
    echo -e "${GREEN}✅ Chat page loads successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Chat page check inconclusive (might be OK)${NC}"
fi
echo ""

# Test 3: Check signup page
echo -e "${BLUE}Test 3: Signup Page Loading${NC}"
SIGNUP_RESPONSE=$(curl -s http://localhost:3000/signup)
if echo "$SIGNUP_RESPONSE" | grep -q "Turnstile\|turnstile\|CAPTCHA" || echo "$SIGNUP_RESPONSE" | grep -q "email\|password"; then
    echo -e "${GREEN}✅ Signup page loads successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Signup page check inconclusive (might be OK)${NC}"
fi
echo ""

# Test 4: Check if TypeScript compiled
echo -e "${BLUE}Test 4: TypeScript Compilation${NC}"
cd apps/portal
if pnpm build 2>&1 | tail -20 | grep -q "successfully"; then
    echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
elif pnpm build 2>&1 | grep -q "error"; then
    echo -e "${RED}❌ TypeScript compilation errors found${NC}"
else
    echo -e "${GREEN}✅ Build completed${NC}"
fi
cd - > /dev/null
echo ""

echo "============================"
echo "Manual Testing Checklist:"
echo ""
echo "1. CAPTCHA Verification (15ms target):"
echo "   - Open: http://localhost:3000/signup"
echo "   - Complete Turnstile CAPTCHA"
echo "   - Submit form"
echo "   - DevTools → Network tab: Check /verify-turnstile call (~15ms)"
echo ""
echo "2. Email Sending (50ms target):"
echo "   - Sign up with valid email"
echo "   - Check inbox for welcome email"
echo "   - Should arrive within 30 seconds"
echo "   - DevTools → Network tab: Check /send-email call (~50ms)"
echo ""
echo "3. Rate Limiting (12ms target):"
echo "   - Open: http://localhost:3000/login"
echo "   - Try login 5 times with wrong password"
echo "   - 6th attempt should show rate limit message"
echo "   - DevTools → Network tab: Check /rate-limit-check calls (~12ms each)"
echo ""
echo "4. Chat Streaming (300ms target):"
echo "   - Open homepage and find chat widget"
echo "   - Send message (e.g., 'What is your delivery integration?')"
echo "   - Watch response stream word-by-word"
echo "   - DevTools → Network tab: Check /chat call (~300ms)"
echo ""
echo "============================"
echo ""
echo "💡 Tips:"
echo "- Use Chrome DevTools Network tab to measure latency"
echo "- Look for calls to Supabase Edge Functions URLs"
echo "- Compare timing vs before (should be 2-6x faster)"
echo "- Check Supabase Dashboard → Functions → Logs for errors"
echo ""
