/**
 * Validation utility functions for secure input handling
 */

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Validate password strength
export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
  return passwordRegex.test(password);
};

// Get password strength feedback
export const getPasswordStrength = (
  password: string,
): {
  score: number; // 0-4, where 4 is strongest
  feedback: string;
} => {
  if (!password) {
    return { score: 0, feedback: "Password is required" };
  }

  let score = 0;
  const feedback = [];

  // Length check
  if (password.length < 8) {
    feedback.push("Password should be at least 8 characters");
  } else {
    score += 1;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push("Add uppercase letters");
  } else {
    score += 1;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push("Add lowercase letters");
  } else {
    score += 1;
  }

  // Number check
  if (!/\d/.test(password)) {
    feedback.push("Add numbers");
  } else {
    score += 1;
  }

  // Special character check
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push("Add special characters");
  } else {
    score += 1;
  }

  return {
    score: Math.min(4, score),
    feedback: feedback.join(", ") || "Strong password",
  };
};

// Validate phone number format
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  // Basic international phone number validation
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phoneNumber.replace(/[\s()-]/g, ""));
};

// Validate URL format
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// Sanitize input to prevent XSS attacks
export const sanitizeInput = (input: string): string => {
  if (!input) return "";

  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

// Validate file type
export const isValidFileType = (
  file: File,
  allowedTypes: string[],
): boolean => {
  return allowedTypes.includes(file.type);
};

// Validate file size
export const isValidFileSize = (
  file: File,
  maxSizeInBytes: number,
): boolean => {
  return file.size <= maxSizeInBytes;
};

// Validate image dimensions
export const validateImageDimensions = (
  file: File,
  minWidth: number,
  minHeight: number,
  maxWidth: number,
  maxHeight: number,
): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(
        img.width >= minWidth &&
          img.width <= maxWidth &&
          img.height >= minHeight &&
          img.height <= maxHeight,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve(false);
    };
    img.src = URL.createObjectURL(file);
  });
};
