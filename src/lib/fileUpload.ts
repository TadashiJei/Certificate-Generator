import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export interface FileUploadConfig {
  maxSizeBytes: number;
  allowedTypes: string[];
  maxWidth?: number;
  maxHeight?: number;
  compressionQuality?: number;
}

const DEFAULT_CONFIG: FileUploadConfig = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxWidth: 2000,
  maxHeight: 2000,
  compressionQuality: 0.8
};

export async function validateAndOptimizeImage(
  file: File,
  config: Partial<FileUploadConfig> = {}
): Promise<{ valid: boolean; error?: string; optimizedFile?: File }> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Check file size
  if (file.size > finalConfig.maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${finalConfig.maxSizeBytes / 1024 / 1024}MB`
    };
  }

  // Check file type
  if (!finalConfig.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${finalConfig.allowedTypes.join(', ')}`
    };
  }

  try {
    // Create an image object to check dimensions
    const img = new Image();
    const imageUrl = URL.createObjectURL(file);
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    // Check dimensions
    if (img.width > finalConfig.maxWidth! || img.height > finalConfig.maxHeight!) {
      // Create a canvas to resize the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      // Calculate new dimensions while maintaining aspect ratio
      let newWidth = img.width;
      let newHeight = img.height;

      if (newWidth > finalConfig.maxWidth!) {
        newHeight = (finalConfig.maxWidth! * newHeight) / newWidth;
        newWidth = finalConfig.maxWidth!;
      }

      if (newHeight > finalConfig.maxHeight!) {
        newWidth = (finalConfig.maxHeight! * newWidth) / newHeight;
        newHeight = finalConfig.maxHeight!;
      }

      // Set canvas dimensions and draw resized image
      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob(
          (b) => resolve(b!),
          file.type,
          finalConfig.compressionQuality
        )
      );

      // Clean up
      URL.revokeObjectURL(imageUrl);

      // Create new file from blob
      const optimizedFile = new File([blob], file.name, {
        type: file.type,
        lastModified: file.lastModified,
      });

      return {
        valid: true,
        optimizedFile
      };
    }

    // If image is within size limits, return original file
    URL.revokeObjectURL(imageUrl);
    return {
      valid: true,
      optimizedFile: file
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Failed to process image'
    };
  }
}

export async function uploadFile(
  file: File,
  path: string,
  userId: string
): Promise<{ success: boolean; error?: string; url?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from('certificates')
      .upload(`${userId}/${path}`, file);

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('certificates')
      .getPublicUrl(`${userId}/${path}`);

    return {
      success: true,
      url: publicUrl
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file'
    };
  }
}
