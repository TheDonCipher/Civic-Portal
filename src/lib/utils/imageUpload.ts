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
    // Validate file security before upload
    const validation = validateFileUpload(file);
    if (!validation.isValid) {
      throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

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
    // Validate file security before upload
    const validation = validateFileUpload(file);
    if (!validation.isValid) {
      throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

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
  // Use reliable default images from Pixabay based on category
  const defaultImages: Record<string, string> = {
    infrastructure:
      "https://cdn.pixabay.com/photo/2018/01/10/18/49/city-3073958_1280.jpg",
    environment:
      "https://cdn.pixabay.com/photo/2015/12/01/20/28/green-1072828_1280.jpg",
    safety:
      "https://cdn.pixabay.com/photo/2019/04/13/00/47/police-4123365_1280.jpg",
    community:
      "https://cdn.pixabay.com/photo/2017/02/10/12/03/volunteer-2055010_1280.jpg",
    education:
      "https://cdn.pixabay.com/photo/2015/09/05/21/51/reading-925589_1280.jpg",
    healthcare:
      "https://cdn.pixabay.com/photo/2016/11/09/15/27/dna-1811955_1280.jpg",
    transportation:
      "https://cdn.pixabay.com/photo/2017/10/27/10/27/subway-2893851_1280.jpg",
    housing:
      "https://cdn.pixabay.com/photo/2016/11/18/17/46/house-1836070_1280.jpg",
    water: "https://cdn.pixabay.com/photo/2013/07/18/20/26/sea-164989_1280.jpg",
    electricity:
      "https://cdn.pixabay.com/photo/2015/09/02/12/25/wind-power-918947_1280.jpg",
  };

  const lowerCategory = category?.toLowerCase() || 'infrastructure';
  return defaultImages[lowerCategory as keyof typeof defaultImages] || defaultImages['infrastructure'];
};
