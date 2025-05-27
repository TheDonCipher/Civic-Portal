import { toast } from "@/components/ui/use-toast-enhanced";

/**
 * Enhanced centralized error handling system for the Civic Portal
 * Provides consistent error handling with security considerations and proper categorization
 */

export interface ErrorContext {
  component: string;
  action: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  reportToService?: boolean;
  fallbackMessage?: string;
  retryAction?: () => void;
  retryLabel?: string;
}

interface ParsedError {
  type: ErrorType;
  message: string;
  stack?: string;
  name: string;
  code?: string;
  statusCode?: number;
}

type ErrorType = 'network' | 'authentication' | 'authorization' | 'validation' | 'application' | 'unknown';

class ErrorHandler {
  private static instance: ErrorHandler;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handle(
    error: unknown,
    context: ErrorContext,
    options: ErrorHandlerOptions = {}
  ): void {
    const {
      showToast = true,
      logToConsole = true,
      reportToService = false, // Disabled by default for now
      fallbackMessage = "An unexpected error occurred",
      retryAction,
      retryLabel = "Retry"
    } = options;

    const errorInfo = this.parseError(error);
    const errorId = this.generateErrorId();

    // Log to console with context (only in development)
    if (logToConsole && process.env.NODE_ENV === 'development') {
      console.error(`[${errorId}] Error in ${context.component}.${context.action}:`, {
        error: errorInfo,
        context,
        timestamp: new Date().toISOString()
      });
    }

    // Show user-friendly toast
    if (showToast) {
      toast({
        title: this.getErrorTitle(errorInfo.type),
        description: this.getUserFriendlyMessage(errorInfo, fallbackMessage),
        variant: this.getToastVariant(errorInfo.type),
        action: retryAction ? {
          label: retryLabel,
          onClick: retryAction
        } as any : undefined
      });
    }

    // Report to error tracking service (only in production)
    if (reportToService && process.env.NODE_ENV === 'production') {
      this.reportError(errorId, errorInfo, context);
    }
  }

  private parseError(error: unknown): ParsedError {
    if (error instanceof Error) {
      return {
        type: this.categorizeError(error),
        message: error.message,
        stack: error.stack || '',
        name: error.name,
        code: (error as any).code,
        statusCode: (error as any).status || (error as any).statusCode
      };
    }

    if (typeof error === 'string') {
      return {
        type: 'unknown',
        message: error,
        stack: '',
        name: 'StringError'
      };
    }

    if (error && typeof error === 'object') {
      const errorObj = error as any;
      return {
        type: this.categorizeError(errorObj),
        message: errorObj.message || errorObj.error?.message || 'Unknown error occurred',
        stack: errorObj.stack,
        name: errorObj.name || 'ObjectError',
        code: errorObj.code || errorObj.error?.code,
        statusCode: errorObj.status || errorObj.statusCode
      };
    }

    return {
      type: 'unknown',
      message: 'An unknown error occurred',
      stack: '',
      name: 'UnknownError'
    };
  }

  private categorizeError(error: any): ErrorType {
    const message = error.message || error.error?.message || '';
    const code = error.code || error.error?.code || '';
    const status = error.status || error.statusCode || 0;

    // Network errors
    if (message.includes('fetch') || message.includes('network') || message.includes('connection')) {
      return 'network';
    }

    // Authentication errors
    if (message.includes('auth') || code.includes('auth') || status === 401) {
      return 'authentication';
    }

    // Authorization errors
    if (message.includes('permission') || message.includes('unauthorized') || status === 403) {
      return 'authorization';
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid') || status === 400) {
      return 'validation';
    }

    // Supabase specific errors
    if (code === 'PGRST116' || code === '23505' || code === '42501') {
      return 'authorization';
    }

    return 'application';
  }

  private getErrorTitle(type: ErrorType): string {
    const titles: Record<ErrorType, string> = {
      network: "Connection Error",
      authentication: "Authentication Required",
      authorization: "Access Denied",
      validation: "Invalid Input",
      application: "Application Error",
      unknown: "Unexpected Error"
    };

    return titles[type] || "Error";
  }

  private getUserFriendlyMessage(errorInfo: ParsedError, fallback: string): string {
    const messages: Record<ErrorType, string> = {
      network: "Unable to connect to the server. Please check your internet connection and try again.",
      authentication: "Your session has expired. Please sign in again to continue.",
      authorization: "You don't have permission to perform this action. Please contact an administrator if you believe this is an error.",
      validation: "Please check your input and try again. Make sure all required fields are filled correctly.",
      application: fallback,
      unknown: fallback
    };

    return messages[errorInfo.type] || fallback;
  }

  private getToastVariant(type: ErrorType): "default" | "destructive" | "warning" | "success" {
    const variants: Record<ErrorType, "default" | "destructive" | "warning" | "success"> = {
      network: "warning",
      authentication: "destructive",
      authorization: "destructive",
      validation: "warning",
      application: "destructive",
      unknown: "destructive"
    };

    return variants[type] || "destructive";
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async reportError(errorId: string, errorInfo: ParsedError, context: ErrorContext): Promise<void> {
    try {
      // In a real application, this would send to an error tracking service like Sentry
      console.warn(`Error ${errorId} would be reported to error tracking service:`, {
        errorInfo,
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }
}

export const errorHandler = ErrorHandler.getInstance();

// ✅ Enhanced convenience functions
export const handleApiError = (
  error: unknown,
  component: string,
  action: string,
  retryAction?: () => void
) => {
  errorHandler.handle(error, { component, action }, { retryAction });
};

export const handleValidationError = (
  error: unknown,
  component: string,
  action: string
) => {
  errorHandler.handle(error, { component, action }, {
    fallbackMessage: "Please check your input and try again."
  });
};

export const handleNetworkError = (
  error: unknown,
  component: string,
  action: string,
  retryAction?: () => void
) => {
  errorHandler.handle(error, { component, action }, {
    fallbackMessage: "Network connection failed. Please check your internet connection.",
    retryAction: retryAction || undefined
  });
};

// ✅ Legacy error handling functions for backward compatibility
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

// ✅ Legacy API error handler for backward compatibility
export const handleLegacyApiError = (
  error: any,
  options: ErrorOptions = {},
): void => {
  const {
    context = "API Request",
    action,
    actionLabel = "Retry",
  } = options;

  // Use the new enhanced error handler
  errorHandler.handle(error, {
    component: context,
    action: "legacy_api_error"
  }, {
    retryAction: action || undefined,
    retryLabel: actionLabel
  });
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
          } as any
        : undefined,
    });
  }
};

// Handle network errors (legacy)
export const handleLegacyNetworkError = (
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
          } as any
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
