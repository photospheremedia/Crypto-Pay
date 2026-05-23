#!/bin/bash

# =====================================================
# STORAGE BUCKETS SETUP SCRIPT
# Created: 2026-02-02
# Purpose: Create all storage buckets with proper configuration
# =====================================================

set -e  # Exit on error

echo "🗄️  Setting up Supabase Storage buckets..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install with: brew install supabase/tap/supabase"
    exit 1
fi

# Check if linked to a project
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Run: supabase login"
    exit 1
fi

echo "📦 Creating buckets..."

# 1. Product Images (Public)
echo "  → product-images (public)"
supabase storage create product-images --public || echo "    (already exists)"

# 2. Email Attachments (Private)
echo "  → email-attachments (private)"
supabase storage create email-attachments || echo "    (already exists)"

# 3. Import Files (Private)
echo "  → import-files (private)"
supabase storage create import-files || echo "    (already exists)"

# 4. Exports (Private)
echo "  → exports (private)"
supabase storage create exports || echo "    (already exists)"

# 5. Vectors (Private) - AI Embeddings
echo "  → vectors (private)"
supabase storage create vectors || echo "    (already exists)"

# 6. Analytics (Private) - Logs & Metrics
echo "  → analytics (private)"
supabase storage create analytics || echo "    (already exists)"

echo ""
echo "✅ Buckets created successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. RLS policies will be applied via SQL migration"
echo "   2. Configure CORS in Supabase Dashboard if needed"
echo "   3. Set file size limits in Supabase Dashboard"
echo ""
echo "🔍 View buckets: supabase storage list"
echo ""
