-- =====================================================
-- STORAGE BUCKETS RLS POLICIES
-- Created: 2026-02-02
-- Purpose: Set up RLS policies for storage buckets
-- =====================================================
-- Prerequisites: Run scripts/setup-storage-buckets.sh first
-- Buckets:
-- 1. product-images (public) - Product photos, thumbnails
-- 2. email-attachments (private) - Email campaign attachments
-- 3. import-files (private) - CSV/Excel uploads for bulk operations
-- 4. exports (private) - Generated export files
-- 5. vectors (private) - AI embeddings and vector data
-- 6. analytics (private) - Analytics logs and metrics
-- =====================================================

-- =====================================================
-- 1. PRODUCT IMAGES BUCKET (PUBLIC)
-- =====================================================
-- RLS Policies for product-images
-- Anyone can view (public bucket)
CREATE POLICY "product_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Only admins can upload
CREATE POLICY "product_images_admin_upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid() IN (
    SELECT user_id FROM public.memberships 
    WHERE role IN ('rhs_admin', 'admin', 'owner', 'manager')
  )
);

-- Only admins can update
CREATE POLICY "product_images_admin_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' 
  AND auth.uid() IN (
    SELECT user_id FROM public.memberships 
    WHERE role IN ('rhs_admin', 'admin', 'owner', 'manager')
  )
);

-- Only admins can delete
CREATE POLICY "product_images_admin_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.uid() IN (
    SELECT user_id FROM public.memberships 
    WHERE role IN ('rhs_admin', 'admin', 'owner', 'manager')
  )
);

-- =====================================================
-- 2. EMAIL ATTACHMENTS BUCKET (PRIVATE)
-- =====================================================
-- RLS Policies for email-attachments
-- Only admins can access
CREATE POLICY "email_attachments_admin_all"
ON storage.objects FOR ALL
USING (
  bucket_id = 'email-attachments' 
  AND auth.uid() IN (
    SELECT user_id FROM public.memberships 
    WHERE role IN ('rhs_admin', 'admin', 'owner', 'manager')
  )
);

-- =====================================================
-- 3. IMPORT FILES BUCKET (PRIVATE)
-- =====================================================
-- RLS Policies for import-files
-- Only admins can access
CREATE POLICY "import_files_admin_all"
ON storage.objects FOR ALL
USING (
  bucket_id = 'import-files' 
  AND auth.uid() IN (
    SELECT user_id FROM public.memberships 
    WHERE role IN ('rhs_admin', 'admin', 'owner', 'manager')
  )
);

-- =====================================================
-- 4. EXPORTS BUCKET (PRIVATE)
-- =====================================================
-- RLS Policies for exports
-- Admins can create exports
CREATE POLICY "exports_admin_create"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'exports' 
  AND auth.uid() IN (
    SELECT user_id FROM public.memberships 
    WHERE role IN ('rhs_admin', 'admin', 'owner', 'manager')
  )
);

-- Users can read their own exports
CREATE POLICY "exports_user_read_own"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'exports' 
  AND (
    -- Owner of the file
    owner = auth.uid()
    OR
    -- Admin/manager can see all
    auth.uid() IN (
      SELECT user_id FROM public.memberships 
      WHERE role IN ('rhs_admin', 'admin', 'owner', 'manager')
    )
  )
);

-- Only admins can delete
CREATE POLICY "exports_admin_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'exports' 
  AND auth.uid() IN (
    SELECT user_id FROM public.memberships 
    WHERE role IN ('rhs_admin', 'admin', 'owner', 'manager')
  )
);

-- =====================================================
-- 5. VECTORS BUCKET (PRIVATE) - AI Embeddings
-- =====================================================
-- RLS Policies for vectors
-- Only system/admin access
CREATE POLICY "vectors_admin_all"
ON storage.objects FOR ALL
USING (
  bucket_id = 'vectors' 
  AND auth.uid() IN (
    SELECT user_id FROM public.memberships 
    WHERE role IN ('rhs_admin', 'admin')
  )
);

-- =====================================================
-- 6. ANALYTICS BUCKET (PRIVATE) - Logs & Metrics
-- =====================================================
-- RLS Policies for analytics
-- Only admins can access
CREATE POLICY "analytics_admin_all"
ON storage.objects FOR ALL
USING (
  bucket_id = 'analytics' 
  AND auth.uid() IN (
    SELECT user_id FROM public.memberships 
    WHERE role IN ('rhs_admin', 'admin', 'owner')
  )
);

-- =====================================================
-- S3 CONFIGURATION
-- =====================================================
-- Supabase Storage is S3-compatible
-- Access via: https://<project-ref>.supabase.co/storage/v1/s3
-- Use AWS S3 SDK with:
--   endpoint: https://<project-ref>.supabase.co/storage/v1/s3
--   accessKeyId: <project-service-key>
--   secretAccessKey: <project-service-key>
--   region: us-east-1 (or your region)
