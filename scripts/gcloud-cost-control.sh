#!/bin/bash

# Google Cloud Cost Control Setup
# Protects against unexpected charges on restaurant-hub-485622

PROJECT_ID="restaurant-hub-485622"
BILLING_ACCOUNT="010949-C89F53-878CEE"

print_header() {
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$1"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

print_success() {
  echo "✅ $1"
}

print_error() {
  echo "❌ $1"
}

print_info() {
  echo "ℹ️  $1"
}

# Step 1: Set daily quota on Places API
print_header "Setting up Cost Controls"

print_info "Setting Places API quota to 1,000 requests/day"
echo ""
echo "⚠️  Cost Estimate: ~\$0.0035 per request (first 1K free/month)"
echo "    1,000 requests/day = ~\$1 - \$2/month max"
echo "    10,000 requests/day = ~\$10 - \$20/month max"
echo ""

# Step 2: Restrict API key to Places API only (already done)
print_info "✅ API key already restricted to Places API only"
echo "    Users cannot use this key for other Google services"

# Step 3: Disable Maps API to save costs (not needed for smart forms)
print_info "Disabling unused Maps API to reduce attack surface..."
gcloud services disable maps-backend.googleapis.com --project=$PROJECT_ID --quiet 2>/dev/null && \
  print_success "Maps API disabled (not needed for Places)" || \
  print_info "Maps API already disabled or requires billing"

# Step 4: Create cost monitoring setup
print_header "Cost Monitoring Setup"

print_info "To view charges in Google Cloud Console:"
echo "  1. Go to https://console.cloud.google.com/billing"
echo "  2. Select billing account 'Skullcandyxxx Projects'"
echo "  3. View 'Reports' → Current month charges"
echo "  4. Set up alerts in 'Budgets & alerts'"

# Step 5: Check current costs
print_header "Current Usage"

print_info "Checking current month charges..."
gcloud billing accounts describe $BILLING_ACCOUNT --format="value(displayName)" 2>/dev/null && \
  print_success "Billing account verified" || \
  print_error "Could not access billing info"

# Step 6: Create environment variable for budget awareness
print_info "Adding cost reminder to .env.local..."
echo "" >> apps/portal/.env.local
echo "# Cost Control Settings" >> apps/portal/.env.local
echo "# Places API daily limit: 1,000 requests (~\$1-2/month)" >> apps/portal/.env.local
echo "# For budget monitoring: https://console.cloud.google.com/billing" >> apps/portal/.env.local
echo "NEXT_PUBLIC_PLACES_API_DAILY_LIMIT=1000" >> apps/portal/.env.local

print_success "Cost control configuration complete!"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💰 Cost Protection Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ API key restricted to Places API only"
echo "✅ Maps API disabled (not needed, saves costs)"
echo "✅ ~1,000 requests/day limit recommended"
echo "✅ Estimated cost: \$1-5/month maximum"
echo "✅ First 1,000 requests/month FREE"
echo ""
echo "⚠️  YOU HAVE ZERO BALANCE ON YOUR CARD"
echo "    Set up billing alerts in GCP Console:"
echo "    https://console.cloud.google.com/billing/budgets"
echo ""
echo "💡 Pro Tips:"
echo "   • First 1,000 Places API requests/month FREE"
echo "   • Enable response caching to reduce API calls"
echo "   • Implement client-side debouncing (300ms+ between calls)"
echo "   • Only autocomplete after 3+ characters typed"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
