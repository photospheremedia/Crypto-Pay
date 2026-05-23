-- =====================================================
-- SUPABASE STORAGE BUCKETS SETUP
-- File storage for: products, emails, invoices, imports
-- =====================================================

-- =====================================================
-- CREATE BUCKETS
-- =====================================================

-- Product images and media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true, -- Public access for product images
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Email attachments (invoices, quotes, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'email-attachments',
    'email-attachments',
    false, -- Private - requires authentication
    10485760, -- 10MB limit
    ARRAY[
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'image/jpeg',
        'image/png'
    ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Import/Export CSV files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'import-export',
    'import-export',
    false, -- Private - admin only
    52428800, -- 50MB limit for bulk files
    ARRAY[
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
    ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Invoice PDFs (generated)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'invoices',
    'invoices',
    false, -- Private - customers can only see their own
    5242880, -- 5MB limit
    ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- User avatars/profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true, -- Public for displaying user avatars
    2097152, -- 2MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- STORAGE POLICIES (Row Level Security)
-- =====================================================

-- ===== PRODUCT IMAGES (Public Read, Admin Write) =====

DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (
        SELECT 1 FROM public.memberships m
        WHERE m.user_id = auth.uid()
        AND m.role IN ('rhs_admin', 'admin', 'owner')
        AND m.status = 'active'
    )
);

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'product-images' AND
    EXISTS (
        SELECT 1 FROM public.memberships m
        WHERE m.user_id = auth.uid()
        AND m.role IN ('rhs_admin', 'admin', 'owner')
        AND m.status = 'active'
    )
);

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'product-images' AND
    EXISTS (
        SELECT 1 FROM public.memberships m
        WHERE m.user_id = auth.uid()
        AND m.role IN ('rhs_admin', 'admin', 'owner')
        AND m.status = 'active'
    )
);

-- ===== EMAIL ATTACHMENTS (Admin Only) =====

DROP POLICY IF EXISTS "Admins can manage email attachments" ON storage.objects;
CREATE POLICY "Admins can manage email attachments"
ON storage.objects FOR ALL
USING (
    bucket_id = 'email-attachments' AND
    EXISTS (
        SELECT 1 FROM public.memberships m
        WHERE m.user_id = auth.uid()
        AND m.role IN ('rhs_admin', 'admin')
        AND m.status = 'active'
    )
);

-- ===== IMPORT/EXPORT (Admin Only) =====

DROP POLICY IF EXISTS "Admins can manage import/export files" ON storage.objects;
CREATE POLICY "Admins can manage import/export files"
ON storage.objects FOR ALL
USING (
    bucket_id = 'import-export' AND
    EXISTS (
        SELECT 1 FROM public.memberships m
        WHERE m.user_id = auth.uid()
        AND m.role IN ('rhs_admin', 'admin', 'owner')
        AND m.status = 'active'
    )
);

-- ===== INVOICES (Customers see own, Admins see all) =====

DROP POLICY IF EXISTS "Users can view own invoices" ON storage.objects;
CREATE POLICY "Users can view own invoices"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'invoices' AND
    (
        -- Admins can see all
        EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.user_id = auth.uid()
            AND m.role IN ('rhs_admin', 'admin', 'owner')
            AND m.status = 'active'
        )
        -- Customers can see their own (name starts with their user_id)
        OR (name LIKE (auth.uid()::text || '%'))
    )
);

DROP POLICY IF EXISTS "Admins can manage invoices" ON storage.objects;
CREATE POLICY "Admins can manage invoices"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'invoices' AND
    EXISTS (
        SELECT 1 FROM public.memberships m
        WHERE m.user_id = auth.uid()
        AND m.role IN ('rhs_admin', 'admin', 'owner')
        AND m.status = 'active'
    )
);

-- ===== AVATARS (Users manage own, Public read) =====

DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' AND
    (name = (auth.uid()::text || '.jpg') OR 
     name = (auth.uid()::text || '.png') OR 
     name = (auth.uid()::text || '.webp'))
);

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' AND
    (name = (auth.uid()::text || '.jpg') OR 
     name = (auth.uid()::text || '.png') OR 
     name = (auth.uid()::text || '.webp'))
);

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' AND
    (name = (auth.uid()::text || '.jpg') OR 
     name = (auth.uid()::text || '.png') OR 
     name = (auth.uid()::text || '.webp'))
);

-- =====================================================
-- STORAGE HELPER FUNCTIONS
-- =====================================================

-- Get public URL for product image
CREATE OR REPLACE FUNCTION public.get_product_image_url(file_name TEXT)
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT CONCAT(
    current_setting('app.settings.supabase_url', true),
    '/storage/v1/object/public/product-images/',
    file_name
  );
$$;

-- Get signed URL for private file (1 hour expiry)
CREATE OR REPLACE FUNCTION public.get_private_file_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  signed_url TEXT;
BEGIN
  -- Generate signed URL with 1 hour expiry
  SELECT storage.get_signed_url(bucket_name, file_path, 3600)
  INTO signed_url;
  
  RETURN signed_url;
END;
$$;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION public.get_product_image_url IS 'Generate public URL for product images';
COMMENT ON FUNCTION public.get_private_file_url IS 'Generate time-limited signed URL for private files';
