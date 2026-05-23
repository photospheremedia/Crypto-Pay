#!/bin/bash
# ==============================================================================
# Environment Keys Checker & Tracker
# ==============================================================================
# Run this script to verify and track all API keys
# Usage: pnpm check:env OR ./scripts/check-env.sh
# ==============================================================================

set -e

ENV_FILE="apps/portal/.env.local"
SUPABASE_REF="xfairwgarmpvbogiuduk"

echo "🔍 Checking environment configuration..."
echo ""

# Check if .env.local exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Missing $ENV_FILE"
    echo "   Run: cd apps/portal && vercel env pull .env.local"
    exit 1
fi

# Check required variables exist
REQUIRED_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "NEXT_PUBLIC_APP_URL"
)

MISSING=0
for VAR in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${VAR}=" "$ENV_FILE" 2>/dev/null; then
        echo "❌ Missing: $VAR"
        MISSING=1
    fi
done

if [ $MISSING -eq 1 ]; then
    echo ""
    echo "⚠️  Some required variables are missing!"
    echo "   Run: cd apps/portal && vercel env pull .env.local"
    exit 1
fi

echo "✅ Required variables present"
echo ""

# Function to decode JWT and extract dates
decode_jwt_dates() {
    local KEY_NAME=$1
    local JWT=$2
    
    if [ -z "$JWT" ] || [ "$JWT" == '""' ]; then
        echo "   $KEY_NAME: ❌ Not set"
        return
    fi
    
    # Remove quotes if present
    JWT=$(echo "$JWT" | tr -d '"')
    
    # Decode JWT payload (base64 decode the middle part with proper padding)
    PAYLOAD_B64=$(echo "$JWT" | cut -d'.' -f2)
    # Add padding if needed (base64 requires length divisible by 4)
    PADDING=$(( 4 - ${#PAYLOAD_B64} % 4 ))
    if [ $PADDING -ne 4 ]; then
        PAYLOAD_B64="${PAYLOAD_B64}$(printf '%0.s=' $(seq 1 $PADDING))"
    fi
    PAYLOAD=$(echo "$PAYLOAD_B64" | base64 -d 2>/dev/null || echo "")
    
    if [ -n "$PAYLOAD" ]; then
        IAT=$(echo "$PAYLOAD" | grep -o '"iat":[0-9]*' | cut -d':' -f2)
        EXP=$(echo "$PAYLOAD" | grep -o '"exp":[0-9]*' | cut -d':' -f2)
        ROLE=$(echo "$PAYLOAD" | grep -o '"role":"[^"]*"' | cut -d'"' -f4)
        
        if [ -n "$IAT" ] && [ -n "$EXP" ]; then
            IAT_DATE=$(date -r "$IAT" "+%Y-%m-%d" 2>/dev/null || date -d "@$IAT" "+%Y-%m-%d" 2>/dev/null || echo "unknown")
            EXP_DATE=$(date -r "$EXP" "+%Y-%m-%d" 2>/dev/null || date -d "@$EXP" "+%Y-%m-%d" 2>/dev/null || echo "unknown")
            
            # Check if expired or expiring soon
            NOW=$(date +%s)
            DAYS_LEFT=$(( (EXP - NOW) / 86400 ))
            
            if [ $DAYS_LEFT -lt 0 ]; then
                STATUS="❌ EXPIRED"
            elif [ $DAYS_LEFT -lt 30 ]; then
                STATUS="⚠️  Expires in $DAYS_LEFT days"
            else
                STATUS="✅ Valid ($DAYS_LEFT days left)"
            fi
            
            echo "   $KEY_NAME ($ROLE):"
            echo "      Issued:  $IAT_DATE"
            echo "      Expires: $EXP_DATE"
            echo "      Status:  $STATUS"
        else
            echo "   $KEY_NAME: ⚠️  Could not parse JWT claims"
        fi
    else
        echo "   $KEY_NAME: ⚠️  Could not decode JWT"
    fi
}

# Function to check non-JWT API keys
check_api_key() {
    local KEY_NAME=$1
    local KEY_VAR=$2
    local EXPECTED_PREFIX=$3
    
    KEY_VALUE=$(grep "^${KEY_VAR}=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2 | tr -d '"')
    
    if [ -z "$KEY_VALUE" ]; then
        echo "   $KEY_NAME: ❌ Not set"
    elif [ "$KEY_VALUE" == "PLACEHOLDER_GET_FROM_CLOUDFLARE_DASHBOARD" ] || [[ "$KEY_VALUE" == *"PLACEHOLDER"* ]]; then
        echo "   $KEY_NAME: ⚠️  Placeholder (needs real key)"
    elif [ -n "$EXPECTED_PREFIX" ] && [[ ! "$KEY_VALUE" == $EXPECTED_PREFIX* ]]; then
        echo "   $KEY_NAME: ⚠️  Unexpected format (expected: ${EXPECTED_PREFIX}...)"
    else
        # Mask the key for display
        MASKED="${KEY_VALUE:0:8}...${KEY_VALUE: -4}"
        echo "   $KEY_NAME: ✅ Set ($MASKED)"
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔑 SUPABASE KEYS (JWT - Auto-expire)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ANON_KEY=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" "$ENV_FILE" | cut -d'=' -f2)
SERVICE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" "$ENV_FILE" | cut -d'=' -f2)

decode_jwt_dates "Anon Key" "$ANON_KEY"
echo ""
decode_jwt_dates "Service Role Key" "$SERVICE_KEY"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 THIRD-PARTY API KEYS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_api_key "Resend" "RESEND_API_KEY" "re_"
check_api_key "SendGrid" "SENDGRID_API_KEY" "SG."
check_api_key "Groq" "GROQ_API_KEY" "gsk_"
check_api_key "Turnstile Site Key" "NEXT_PUBLIC_TURNSTILE_SITE_KEY" ""
check_api_key "Turnstile Secret" "TURNSTILE_SECRET_KEY" ""
check_api_key "Upstash Redis Token" "UPSTASH_REDIS_REST_TOKEN" ""
check_api_key "Google Places API" "NEXT_PUBLIC_GOOGLE_PLACES_API_KEY" "AIza"
check_api_key "Cloudflare API" "CLOUDFLARE_API_TOKEN" ""

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔗 OAUTH CREDENTIALS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_api_key "Google OAuth Client ID" "SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID" ""
check_api_key "Google OAuth Secret" "SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET" "GOCSPX-"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 QUICK COMMANDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Pull fresh from Vercel:  cd apps/portal && vercel env pull .env.local"
echo "   Get Supabase keys:       supabase projects api-keys --project-ref $SUPABASE_REF"
echo "   List Vercel env vars:    vercel env ls production"
echo "   Regenerate Supabase:     supabase projects api-keys regenerate --project-ref $SUPABASE_REF"
echo ""
