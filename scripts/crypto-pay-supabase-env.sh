#!/usr/bin/env bash
# Crypto Pay production Supabase — PhotoSphere Media only.
# Override with SUPABASE_PROJECT_REF in .env.supabase or the environment.
CRYPTO_PAY_SUPABASE_PROJECT_REF="${SUPABASE_PROJECT_REF:-usbxwewohpsbjwiuazpf}"
CRYPTO_PAY_SUPABASE_URL="https://${CRYPTO_PAY_SUPABASE_PROJECT_REF}.supabase.co"
CRYPTO_PAY_SUPABASE_FUNCTIONS_URL="${CRYPTO_PAY_SUPABASE_URL}/functions/v1"
CRYPTO_PAY_SUPABASE_DASHBOARD="https://supabase.com/dashboard/project/${CRYPTO_PAY_SUPABASE_PROJECT_REF}"
