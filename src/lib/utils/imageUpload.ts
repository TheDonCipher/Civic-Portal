import { supabase } from "../supabase";
import { validateFileUpload } from "../security/enhancedSecurity";

/**
 * Uploads an image to Supabase storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param path - The path within the bucket
 * @param onProgress - Optional callback for upload progress
 * @returns The URL of the uploaded image
 */
export const uploadImageToStorage = async (
  file: File,
  bucket: string = "issues",
  path: string = "issue-images",
  onProgress?: (progress: number) => void,
): Promise<string> => {
  try {
    // Create a sanitized filename to avoid validation issues
    const fileExt = file.name.split(".").pop()?.toLowerCase() || 'jpg';
    const sanitizedFileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${path}/${sanitizedFileName}`;

    // Validate file type and size (simplified validation)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type not supported. Please use: ${allowedTypes.join(', ')}`);
    }

    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    // Upload the image
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Simulate progress if callback provided
    if (onProgress) {
      onProgress(100);
    }

    // Get the public URL for the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error in uploadImageToStorage:", error);
    throw error;
  }
};

/**
 * Resizes an image before uploading to reduce file size
 * @param file - The file to resize
 * @param maxWidth - Maximum width of the resized image
 * @param maxHeight - Maximum height of the resized image
 * @param quality - Quality of the resized image (0-1)
 * @returns A promise that resolves to the resized file
 */
export const resizeImageBeforeUpload = async (
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    try {
      // If file is not an image or is small enough, return it as is
      if (!file.type.startsWith("image/") || file.size <= 500 * 1024) {
        return resolve(file);
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          // Create canvas and draw resized image
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            return reject(new Error("Could not get canvas context"));
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return reject(new Error("Could not create blob"));
              }

              // Create new file from blob
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });

              resolve(resizedFile);
            },
            file.type,
            quality,
          );
        };
        img.onerror = () => {
          reject(new Error("Error loading image"));
        };
      };
      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };
    } catch (error) {
      console.error("Error resizing image:", error);
      resolve(file); // Fall back to original file on error
    }
  });
};

/**
 * Uploads an image to Supabase storage (legacy function for backward compatibility)
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param path - The path within the bucket
 * @returns The URL of the uploaded image
 */
export const uploadImage = async (
  file: File,
  bucket: string = "issues",
  path: string = "issue-images",
): Promise<string | null> => {
  try {
    // Create a sanitized filename to avoid validation issues
    const fileExt = file.name.split(".").pop()?.toLowerCase() || 'jpg';
    const sanitizedFileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${path}/${sanitizedFileName}`;

    // Validate file type and size (simplified validation)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      console.error(`File type not supported: ${file.type}`);
      return null;
    }

    if (file.size > maxSize) {
      console.error('File size too large');
      return null;
    }

    // Upload the image
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      return null;
    }

    // Get the public URL for the uploaded image
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error in uploadImage:", error);
    return null;
  }
};

/**
 * Deletes an image from Supabase storage
 * @param url - The URL of the image to delete
 * @param bucket - The storage bucket name
 * @returns Boolean indicating success or failure
 */
export const deleteImage = async (
  url: string,
  bucket: string = "issues",
): Promise<boolean> => {
  try {
    // Extract the file path from the URL
    const pathSegments = url.split("/");
    const filePath = pathSegments[pathSegments.length - 1];

    if (!filePath) {
      console.error("Could not extract file path from URL:", url);
      return false;
    }

    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error("Error deleting image:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteImage:", error);
    return false;
  }
};

/**
 * Returns a default image URL for a given category
 * @param category - The category to get a default image for
 * @returns The URL of the default image
 */
export const getCategoryDefaultImage = (category: string): string => {
  // Use reliable default images from Unsplash based on category
  const defaultImages: Record<string, string> = {
    infrastructure:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&crop=center",
    environment:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center",
    safety:
      "https://images.unsplash.com/photo-1593115057322-e94b77572f20?w=800&h=600&fit=crop&crop=center",
    community:
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop&crop=center",
    education:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop&crop=center",
    healthcare:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop&crop=center",
    transportation:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop&crop=center",
    housing:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=center",
    water:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center",
    electricity:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=600&fit=crop&crop=center",
  };

  const lowerCategory = category?.toLowerCase() || 'infrastructure';
  return defaultImages[lowerCategory as keyof typeof defaultImages] || defaultImages['infrastructure'];
};
