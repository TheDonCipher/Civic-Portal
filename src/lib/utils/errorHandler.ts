import { toast } from "@/components/ui/use-toast-enhanced";

/**
 * Centralized error handling utility
 * Logs errors to console and displays user-friendly toast notifications
 */

interface ErrorOptions {
  context?: string;
  showToast?: boolean;
  toastTitle?: string;
  toastDescription?: string;
  toastVariant?: "default" | "destructive" | "success" | "warning" | "info";
  details?: Array<{ label: string; value: string }>;
  action?: () => void;
  actionLabel?: string;
}

// Handle API errors
export const handleApiError = (
  error: any,
  options: ErrorOptions = {},
): void => {
  const {
    context = "API Request",
    showToast = true,
    toastTitle = "Operation Failed",
    toastDescription = "There was an error processing your request. Please try again.",
    toastVariant = "destructive",
    details = [],
    action,
    actionLabel,
  } = options;

  // Extract error message if available
  const errorMessage = error?.message || error?.error?.message || String(error);
  const errorCode = error?.code || error?.error?.code || "UNKNOWN_ERROR";
  const statusCode = error?.status || error?.statusCode || 500;

  // Log detailed error to console for debugging
  console.error(`Error in ${context}:`, {
    message: errorMessage,
    code: errorCode,
    status: statusCode,
    originalError: error,
  });

  // Show user-friendly toast notification
  if (showToast) {
    toast({
      title: toastTitle,
      description: toastDescription,
      variant: toastVariant,
      details: [
        ...details,
        { label: "Error", value: errorMessage },
        { label: "Code", value: errorCode },
      ],
      action: action
        ? {
            label: actionLabel || "Retry",
            onClick: action,
          }
        : undefined,
    });
  }
};

// Handle form validation errors
export const handleFormError = (
  error: any,
  options: ErrorOptions = {},
): void => {
  const {
    context = "Form Validation",
    showToast = true,
    toastTitle = "Validation Error",
    toastDescription = "Please check the form for errors and try again.",
    toastVariant = "warning",
    details = [],
  } = options;

  // Log validation errors to console
  console.error(`Error in ${context}:`, error);

  // Extract validation errors if using Zod or similar
  const validationErrors = error?.errors || [];
  const formattedErrors = validationErrors.map((err: any) => ({
    label: err.path?.join(".") || "Field",
    value: err.message || "Invalid value",
  }));

  // Show toast with validation errors
  if (showToast) {
    toast({
      title: toastTitle,
      description: toastDescription,
      variant: toastVariant,
      details: [...details, ...formattedErrors],
    });
  }
};

// Handle authentication errors
export const handleAuthError = (
  error: any,
  options: ErrorOptions = {},
): void => {
  const {
    context = "Authentication",
    showToast = true,
    toastTitle = "Authentication Error",
    toastDescription = "There was a problem with your authentication. Please sign in again.",
    toastVariant = "destructive",
    details = [],
    action,
    actionLabel = "Sign In",
  } = options;

  // Log auth error to console
  console.error(`Error in ${context}:`, error);

  // Show toast notification
  if (showToast) {
    toast({
      title: toastTitle,
      description: toastDescription,
      variant: toastVariant,
      details,
      action: action
        ? {
            label: actionLabel,
            onClick: action,
          }
        : undefined,
    });
  }
};

// Handle network errors
export const handleNetworkError = (
  error: any,
  options: ErrorOptions = {},
): void => {
  const {
    context = "Network Request",
    showToast = true,
    toastTitle = "Connection Error",
    toastDescription = "Unable to connect to the server. Please check your internet connection and try again.",
    toastVariant = "warning",
    details = [],
    action,
    actionLabel = "Retry",
  } = options;

  // Log network error to console
  console.error(`Error in ${context}:`, error);

  // Show toast notification
  if (showToast) {
    toast({
      title: toastTitle,
      description: toastDescription,
      variant: toastVariant,
      details,
      action: action
        ? {
            label: actionLabel,
            onClick: action,
          }
        : undefined,
    });
  }
};

// Generic success notification
export const showSuccess = (
  title: string,
  description: string,
  details: Array<{ label: string; value: string }> = [],
): void => {
  toast({
    title,
    description,
    variant: "success",
    details,
  });
};

// Generic info notification
export const showInfo = (
  title: string,
  description: string,
  details: Array<{ label: string; value: string }> = [],
): void => {
  toast({
    title,
    description,
    variant: "info",
    details,
  });
};

// Generic warning notification
export const showWarning = (
  title: string,
  description: string,
  details: Array<{ label: string; value: string }> = [],
): void => {
  toast({
    title,
    description,
    variant: "warning",
    details,
  });
};
