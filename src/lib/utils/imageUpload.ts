import { supabase } from "@/lib/supabase";

/**
 * Helper functions for image upload and processing
 */

// Default images for different categories
export const getCategoryDefaultImage = (category: string) => {
  const defaultImages = {
    infrastructure:
      "https://cdn.pixabay.com/photo/2018/01/10/18/49/city-3073958_1280.jpg",
    environment:
      "https://cdn.pixabay.com/photo/2015/12/01/20/28/green-1072828_1280.jpg",
    safety:
      "https://cdn.pixabay.com/photo/2019/04/13/00/47/police-4123365_1280.jpg",
    community:
      "https://cdn.pixabay.com/photo/2017/02/10/12/03/volunteer-2055010_1280.jpg",
  };

  return defaultImages[category?.toLowerCase()] || defaultImages.infrastructure;
};

// Validate and process thumbnail URL
export const validateThumbnailUrl = (url: string, category: string) => {
  if (!url) {
    return getCategoryDefaultImage(category);
  }

  try {
    // Check if the URL is valid
    new URL(url);
    // Make sure it starts with http or https
    if (!url.startsWith("http")) {
      console.warn(`Invalid thumbnail URL format: ${url}, using default`);
      return getCategoryDefaultImage(category);
    }
    return url;
  } catch (e) {
    console.warn(`Invalid thumbnail URL: ${url}, using default`, e);
    return getCategoryDefaultImage(category);
  }
};

// Upload image to Supabase storage and return the public URL
export const uploadImageToStorage = async (
  file: File,
  bucket = "issues",
  folder = "issue-images",
  onProgress?: (progress: number) => void,
): Promise<string> => {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    // Generate a unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

    console.log(`Starting image upload for ${fileName}...`);

    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        onUploadProgress: onProgress
          ? (progress) => {
              const percent = Math.round(
                (progress.loaded / progress.total) * 100,
              );
              onProgress(percent);
            }
          : undefined,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    console.log("Upload successful:", uploadData);

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error("Failed to get public URL");
    }

    const publicUrl = publicUrlData.publicUrl;
    console.log("Public URL:", publicUrl);

    // Verify the URL is valid and accessible
    await verifyImageUrl(publicUrl);

    return publicUrl;
  } catch (error) {
    console.error("Error in uploadImageToStorage:", error);
    throw error;
  }
};

// Verify that an image URL is valid and accessible
export const verifyImageUrl = (url: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      console.log("Image URL verified successfully:", url);
      resolve(true);
    };

    img.onerror = (error) => {
      console.error("Image URL verification failed:", url, error);
      reject(new Error(`Failed to load image from URL: ${url}`));
    };

    img.src = url;

    // Set a timeout to prevent hanging if the image takes too long to load
    setTimeout(() => {
      resolve(true); // Resolve anyway to prevent blocking
    }, 5000); // 5 second timeout
  });
};

// Get a data URL from a file (for preview)
export const getDataUrlFromFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target && event.target.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error("Failed to read file"));
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
};

// Resize an image before upload to reduce storage usage
export const resizeImageBeforeUpload = async (
  file: File,
  maxWidth = 1200,
  maxHeight = 800,
  quality = 0.8,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.warn("Could not get canvas context, returning original file");
        resolve(file);
        return;
      }

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
        }

        // Set canvas dimensions and draw the resized image
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.warn("Failed to create blob, returning original file");
              resolve(file);
              return;
            }

            // Create a new File object from the blob
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
        console.warn(
          "Failed to load image for resizing, returning original file",
        );
        resolve(file);
      };

      // Load the image from the file
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          img.src = e.target.result as string;
        } else {
          console.warn(
            "Failed to read file for resizing, returning original file",
          );
          resolve(file);
        }
      };
      reader.onerror = () => {
        console.warn(
          "Failed to read file for resizing, returning original file",
        );
        resolve(file);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.warn(
        "Error in resizeImageBeforeUpload, returning original file",
        error,
      );
      resolve(file);
    }
  });
};
