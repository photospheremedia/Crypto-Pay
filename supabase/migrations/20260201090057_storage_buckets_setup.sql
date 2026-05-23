-- =====================================================
-- Storage Buckets Setup for User Avatars
-- =====================================================
-- Description: Creates storage buckets with proper RLS policies for avatar uploads
-- Created: 2026-02-01
-- =====================================================

-- Create avatars bucket (public for reading)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,  -- Public bucket for reading
  5242880,  -- 5MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- Storage RLS Policies
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;

-- Policy 1: Users can upload their own avatar
-- Path format: avatars/{user_id}/avatar.{ext}
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  -- Ensure file is in user's folder
  name LIKE auth.uid()::text || '/avatar.%'
);

-- Policy 2: Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Avatars are publicly accessible (read-only)
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get avatar URL for a user
CREATE OR REPLACE FUNCTION get_avatar_url(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avatar_path TEXT;
  public_url TEXT;
BEGIN
  -- Check if user has uploaded avatar
  SELECT name INTO avatar_path
  FROM storage.objects
  WHERE bucket_id = 'avatars'
    AND name LIKE user_id::text || '/avatar.%'
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF avatar_path IS NOT NULL THEN
    -- Return public URL from storage
    public_url := (
      SELECT 
        CASE 
          WHEN current_setting('supabase.url', true) IS NOT NULL 
          THEN current_setting('supabase.url', true) || '/storage/v1/object/public/avatars/' || avatar_path
          ELSE '/storage/v1/object/public/avatars/' || avatar_path
        END
    );
    RETURN public_url;
  END IF;
  
  -- Return null if no avatar found
  RETURN NULL;
END;
$$;

-- Function to clean up old avatar files when user uploads new one
CREATE OR REPLACE FUNCTION cleanup_old_avatars()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_folder TEXT;
  old_avatar_count INT;
BEGIN
  -- Get user folder from new avatar path
  user_folder := (storage.foldername(NEW.name))[1];
  
  -- Count how many avatars this user has
  SELECT COUNT(*) INTO old_avatar_count
  FROM storage.objects
  WHERE bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = user_folder
    AND id != NEW.id;
  
  -- If user has more than 1 avatar (keeping the new one), delete old ones
  IF old_avatar_count > 0 THEN
    DELETE FROM storage.objects
    WHERE bucket_id = 'avatars'
      AND (storage.foldername(name))[1] = user_folder
      AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to clean up old avatars on new upload
DROP TRIGGER IF EXISTS cleanup_old_avatars_trigger ON storage.objects;
CREATE TRIGGER cleanup_old_avatars_trigger
  AFTER INSERT ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'avatars')
  EXECUTE FUNCTION cleanup_old_avatars();

-- =====================================================
-- Update user_profiles to sync avatar_url
-- =====================================================

-- Function to update user profile avatar_url when storage object changes
CREATE OR REPLACE FUNCTION sync_profile_avatar_url()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id_from_path UUID;
  new_avatar_url TEXT;
BEGIN
  -- Extract user_id from storage path (format: {user_id}/avatar.{ext})
  user_id_from_path := (storage.foldername(NEW.name))[1]::UUID;
  
  -- Get full public URL
  new_avatar_url := get_avatar_url(user_id_from_path);
  
  -- Update user_profiles table
  UPDATE public.user_profiles
  SET 
    avatar_url = new_avatar_url,
    updated_at = NOW()
  WHERE user_id = user_id_from_path;
  
  RETURN NEW;
END;
$$;

-- Trigger to sync avatar_url on storage changes
DROP TRIGGER IF EXISTS sync_profile_avatar_url_trigger ON storage.objects;
CREATE TRIGGER sync_profile_avatar_url_trigger
  AFTER INSERT OR UPDATE ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'avatars')
  EXECUTE FUNCTION sync_profile_avatar_url();

-- Function to clean profile avatar_url when storage object deleted
CREATE OR REPLACE FUNCTION clear_profile_avatar_url()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id_from_path UUID;
BEGIN
  -- Extract user_id from storage path
  user_id_from_path := (storage.foldername(OLD.name))[1]::UUID;
  
  -- Clear avatar_url in profile
  UPDATE public.user_profiles
  SET 
    avatar_url = NULL,
    updated_at = NOW()
  WHERE user_id = user_id_from_path;
  
  RETURN OLD;
END;
$$;

-- Trigger to clear avatar_url on storage deletion
DROP TRIGGER IF EXISTS clear_profile_avatar_url_trigger ON storage.objects;
CREATE TRIGGER clear_profile_avatar_url_trigger
  AFTER DELETE ON storage.objects
  FOR EACH ROW
  WHEN (OLD.bucket_id = 'avatars')
  EXECUTE FUNCTION clear_profile_avatar_url();

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- NOTE: Indexes on storage.objects are managed by Supabase system
-- and cannot be created by user roles. Supabase handles storage
-- performance optimization automatically.

-- =====================================================
-- Grant Permissions
-- =====================================================

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION get_avatar_url(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION cleanup_old_avatars() TO authenticated;
GRANT EXECUTE ON FUNCTION sync_profile_avatar_url() TO authenticated;
GRANT EXECUTE ON FUNCTION clear_profile_avatar_url() TO authenticated;

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON FUNCTION get_avatar_url(UUID) IS 'Returns public URL for user avatar from storage bucket';
COMMENT ON FUNCTION cleanup_old_avatars() IS 'Automatically deletes old avatar files when user uploads new one';
COMMENT ON FUNCTION sync_profile_avatar_url() IS 'Syncs avatar_url in user_profiles when storage object created/updated';
COMMENT ON FUNCTION clear_profile_avatar_url() IS 'Clears avatar_url in user_profiles when storage object deleted';
