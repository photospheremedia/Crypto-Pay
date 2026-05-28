#!/bin/bash
# Vector & Analytics Buckets Setup Script
# This script initializes vector and analytics buckets for Crypto Pay

set -e

echo "🚀 Starting Vector & Analytics Buckets Setup..."

# Check environment
if [ ! -f "apps/portal/.env.local" ]; then
  echo "❌ Error: apps/portal/.env.local not found"
  echo "Please create it from apps/portal/.env.example first"
  exit 1
fi

echo "✅ Environment file found"

# Apply database migration
echo ""
echo "📊 Applying database migration..."
if command -v supabase &> /dev/null; then
  echo "Using Supabase CLI..."
  supabase db push --include-all
  echo "✅ Migration applied successfully"
else
  echo "⚠️  Supabase CLI not found. Please run manually:"
  echo "   supabase db push --include-all"
fi

# Create vector index
echo ""
echo "📦 Setting up vector index..."
echo "⚠️  Note: Vector index creation requires manual setup via:"
echo "   1. Supabase Dashboard → Storage → vectors bucket"
echo "   2. Or via SDK (see docs/QUICK_SETUP_VECTORS_ANALYTICS.md)"

# Verify configuration
echo ""
echo "🔍 Verifying configuration..."
if grep -q 'enabled = true' supabase/config.toml | grep -A2 '\[storage.analytics\]'; then
  echo "✅ Analytics bucket enabled"
fi

if grep -q 'enabled = true' supabase/config.toml | grep -A2 '\[storage.vector\]'; then
  echo "✅ Vector bucket enabled"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "📖 Next steps:"
echo "1. Review docs/QUICK_SETUP_VECTORS_ANALYTICS.md for implementation"
echo "2. Create vector index via Supabase dashboard"
echo "3. Test embeddings with: pnpm test"
echo "4. Deploy with: pnpm vercel:deploy"
