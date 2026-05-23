/**
 * Storage utility for handling file uploads to Supabase Storage
 * Provides type-safe wrappers for avatar uploads with validation
 */

import { createClient } from '@/lib/supabase/client';

// Supported image formats
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export type UploadResult = {
  success: boolean;
  url?: string;
  error?: string;
};

/**
 * Validates image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

/**
 * Uploads avatar image for authenticated user
 * Automatically replaces old avatar (handled by database trigger)
 */
export async function uploadAvatar(file: File): Promise<UploadResult> {
  try {
    const supabase = createClient();

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Generate file path: {user_id}/avatar.{ext}
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${user.id}/avatar.${fileExt}`;

    // Upload file with upsert (replaces existing)
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true, // Replace existing file
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(filePath);

    // Note: Database trigger will automatically update user_profiles.avatar_url
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Avatar upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Deletes user's avatar
 */
export async function deleteAvatar(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // List user's avatar files
    const { data: files, error: listError } = await supabase.storage
      .from('avatars')
      .list(user.id);

    if (listError) {
      return { success: false, error: listError.message };
    }

    if (!files || files.length === 0) {
      return { success: true }; // No avatar to delete
    }

    // Delete all avatar files in user's folder
    const filePaths = files.map((file) => `${user.id}/${file.name}`);
    const { error: deleteError } = await supabase.storage
      .from('avatars')
      .remove(filePaths);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    // Note: Database trigger will automatically clear user_profiles.avatar_url
    return { success: true };
  } catch (error) {
    console.error('Avatar deletion failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Deletion failed',
    };
  }
}

/**
 * Gets avatar URL for a user
 * First checks database, falls back to storage API
 */
export async function getAvatarUrl(userId: string): Promise<string | null> {
  try {
    const supabase = createClient();

    // Try to get from user_profiles first (most reliable)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('avatar_url')
      .eq('user_id', userId)
      .single();

    if (!profileError && profile?.avatar_url) {
      return profile.avatar_url;
    }

    // Fallback: check storage directly
    const { data: files, error: listError } = await supabase.storage
      .from('avatars')
      .list(userId);

    if (listError || !files || files.length === 0) {
      return null;
    }

    // Get most recent avatar
    const avatarFile = files
      .filter((f) => f.name.startsWith('avatar.'))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    if (!avatarFile) {
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(`${userId}/${avatarFile.name}`);

    return publicUrl;
  } catch (error) {
    console.error('Failed to get avatar URL:', error);
    return null;
  }
}

/**
 * Converts File to base64 data URL (for preview before upload)
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
