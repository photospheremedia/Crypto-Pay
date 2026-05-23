'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2, Trash2, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { uploadAvatar, deleteAvatar, fileToDataURL, validateImageFile } from '@/lib/storage';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  userName?: string;
  onUploadSuccess?: (url: string) => void;
  onDeleteSuccess?: () => void;
}

export function AvatarUpload({
  currentAvatarUrl,
  userName,
  onUploadSuccess,
  onDeleteSuccess,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const displayUrl = previewUrl || currentAvatarUrl;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast({
          title: 'Invalid file',
          description: validation.error,
          variant: 'destructive',
        });
        return;
      }

      // Show preview
      const dataUrl = await fileToDataURL(file);
      setPreviewUrl(dataUrl);

      // Upload
      setUploading(true);
      const result = await uploadAvatar(file);

      if (result.success && result.url) {
        toast({
          title: 'Avatar uploaded',
          description: 'Your profile picture has been updated successfully.',
        });
        setPreviewUrl(null); // Clear preview, use real URL
        onUploadSuccess?.(result.url);
      } else {
        toast({
          title: 'Upload failed',
          description: result.error || 'Failed to upload avatar',
          variant: 'destructive',
        });
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!currentAvatarUrl) return;

    try {
      setDeleting(true);
      const result = await deleteAvatar();

      if (result.success) {
        toast({
          title: 'Avatar deleted',
          description: 'Your profile picture has been removed.',
        });
        setPreviewUrl(null);
        onDeleteSuccess?.();
      } else {
        toast({
          title: 'Delete failed',
          description: result.error || 'Failed to delete avatar',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Get initials for fallback
  const initials = userName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview */}
      <div className="relative">
        <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
          {displayUrl ? (
            <AvatarImage src={displayUrl} alt={userName || 'User avatar'} />
          ) : (
            <AvatarFallback className="text-3xl font-semibold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Upload button overlay */}
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={uploading || deleting}
          className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          aria-label="Change avatar"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Camera className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleButtonClick}
          disabled={uploading || deleting}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload New
            </>
          )}
        </Button>

        {currentAvatarUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={uploading || deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </>
            )}
          </Button>
        )}
      </div>

      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload avatar image"
      />

      {/* Help Text */}
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        JPG, PNG, WebP or GIF. Max 5MB. Recommended: Square image, at least 256x256px.
      </p>
    </div>
  );
}
