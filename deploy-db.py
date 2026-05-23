#!/usr/bin/env python3
"""
Deploy database schema to Supabase using the Python client.
"""
import os
import sys

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ supabase package not found. Installing...")
    os.system("pip3 install supabase --quiet")
    from supabase import create_client, Client

# Supabase credentials
SUPABASE_URL = "https://xfairwgarmpvbogiuduk.supabase.co"
SUPABASE_KEY = "SUPABASE_SERVICE_ROLE_KEY_REDACTED"

def main():
    print("🚀 Deploying database schema to Supabase...\n")
    
    # Read the schema file
    with open('database-schema-supabase.sql', 'r') as f:
        schema = f.read()
    
    print(f"📄 Schema file loaded ({len(schema)} characters)")
    print("📋 Schema ready to deploy")
    print("\n" + "="*60)
    print("⚠️  MANUAL DEPLOYMENT REQUIRED")
    print("="*60)
    print("\nThe Supabase Python client doesn't support direct SQL execution.")
    print("Please follow these steps:\n")
    print("1. Go to: https://supabase.com/dashboard/project/xfairwgarmpvbogiuduk/sql")
    print("2. Click 'New query'")
    print("3. Copy the contents of: database-schema-supabase.sql")
    print("4. Paste into the SQL Editor")
    print("5. Click 'Run' or press Cmd+Enter\n")
    print("The schema will create:")
    print("  ✅ 12 tables (user_profiles, user_settings, organizations, etc.)")
    print("  ✅ Row Level Security policies")
    print("  ✅ Triggers for auto-profile creation")
    print("  ✅ Functions for order/quote number generation")
    print("  ✅ Performance indexes\n")
    print("📋 Schema has been copied to your clipboard!")
    print("="*60)
    
    # Copy to clipboard
    os.system('cat database-schema-supabase.sql | pbcopy')

if __name__ == "__main__":
    main()
