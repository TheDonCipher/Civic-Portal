/**
 * Comprehensive error type definitions for the Civic Portal
 * Provides standardized error handling across the application
 */

// Base error interface
export interface BaseError {
  message: string;
  code?: string;
  timestamp: string;
  context?: Record<string, any>;
}

// Error severity levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// Error categories
export type ErrorCategory = 
  | 'authentication'
  | 'authorization' 
  | 'validation'
  | 'network'
  | 'database'
  | 'file_upload'
  | 'rate_limit'
  | 'system'
  | 'user_input'
  | 'external_service'
  | 'unknown';

// Standardized error interface
export interface CivicPortalError extends BaseError {
  id: string;
  type: ErrorCategory;
  severity: ErrorSeverity;
  stack?: string;
  name: string;
  retryable: boolean;
  userMessage: string;
  technicalMessage: string;
  component?: string;
  action?: string;
  userId?: string;
}

// Authentication errors
export interface AuthenticationError extends CivicPortalError {
  type: 'authentication';
  authMethod?: 'email' | 'oauth' | 'token';
  attemptCount?: number;
}

// Authorization errors
export interface AuthorizationError extends CivicPortalError {
  type: 'authorization';
  requiredRole?: string;
  userRole?: string;
  resource?: string;
}

// Validation errors
export interface ValidationError extends CivicPortalError {
  type: 'validation';
  field?: string;
  value?: any;
  constraint?: string;
  validationRule?: string;
}

// Network errors
export interface NetworkError extends CivicPortalError {
  type: 'network';
  statusCode?: number;
  endpoint?: string;
  method?: string;
  timeout?: boolean;
}

// Database errors
export interface DatabaseError extends CivicPortalError {
  type: 'database';
  table?: string;
  operation?: 'select' | 'insert' | 'update' | 'delete';
  constraint?: string;
}

// File upload errors
export interface FileUploadError extends CivicPortalError {
  type: 'file_upload';
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  maxSize?: number;
  allowedTypes?: string[];
}

// Rate limiting errors
export interface RateLimitError extends CivicPortalError {
  type: 'rate_limit';
  limit: number;
  window: number;
  retryAfter: number;
  endpoint?: string;
}

// System errors
export interface SystemError extends CivicPortalError {
  type: 'system';
  subsystem?: string;
  errorCode?: string;
}

// User input errors
export interface UserInputError extends CivicPortalError {
  type: 'user_input';
  inputType?: string;
  sanitized?: boolean;
}

// External service errors
export interface ExternalServiceError extends CivicPortalError {
  type: 'external_service';
  service: string;
  serviceError?: any;
}

// Union type for all error types
export type AppError = 
  | AuthenticationError
  | AuthorizationError
  | ValidationError
  | NetworkError
  | DatabaseError
  | FileUploadError
  | RateLimitError
  | SystemError
  | UserInputError
  | ExternalServiceError
  | CivicPortalError;

// Error factory functions
export class ErrorFactory {
  private static createBaseError(
    type: ErrorCategory,
    message: string,
    options: Partial<CivicPortalError> = {}
  ): CivicPortalError {
    return {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity: options.severity || 'medium',
      message,
      userMessage: options.userMessage || message,
      technicalMessage: options.technicalMessage || message,
      name: options.name || `${type}Error`,
      code: options.code,
      timestamp: new Date().toISOString(),
      stack: options.stack || new Error().stack,
      retryable: options.retryable ?? false,
      context: options.context,
      component: options.component,
      action: options.action,
      userId: options.userId,
    };
  }

  static authentication(
    message: string,
    options: Partial<AuthenticationError> = {}
  ): AuthenticationError {
    return {
      ...this.createBaseError('authentication', message, options),
      type: 'authentication',
      authMethod: options.authMethod,
      attemptCount: options.attemptCount,
    } as AuthenticationError;
  }

  static authorization(
    message: string,
    options: Partial<AuthorizationError> = {}
  ): AuthorizationError {
    return {
      ...this.createBaseError('authorization', message, options),
      type: 'authorization',
      requiredRole: options.requiredRole,
      userRole: options.userRole,
      resource: options.resource,
    } as AuthorizationError;
  }

  static validation(
    message: string,
    options: Partial<ValidationError> = {}
  ): ValidationError {
    return {
      ...this.createBaseError('validation', message, options),
      type: 'validation',
      field: options.field,
      value: options.value,
      constraint: options.constraint,
      validationRule: options.validationRule,
    } as ValidationError;
  }

  static network(
    message: string,
    options: Partial<NetworkError> = {}
  ): NetworkError {
    return {
      ...this.createBaseError('network', message, options),
      type: 'network',
      statusCode: options.statusCode,
      endpoint: options.endpoint,
      method: options.method,
      timeout: options.timeout,
      retryable: options.retryable ?? true,
    } as NetworkError;
  }

  static database(
    message: string,
    options: Partial<DatabaseError> = {}
  ): DatabaseError {
    return {
      ...this.createBaseError('database', message, options),
      type: 'database',
      table: options.table,
      operation: options.operation,
      constraint: options.constraint,
    } as DatabaseError;
  }

  static fileUpload(
    message: string,
    options: Partial<FileUploadError> = {}
  ): FileUploadError {
    return {
      ...this.createBaseError('file_upload', message, options),
      type: 'file_upload',
      fileName: options.fileName,
      fileSize: options.fileSize,
      fileType: options.fileType,
      maxSize: options.maxSize,
      allowedTypes: options.allowedTypes,
    } as FileUploadError;
  }

  static rateLimit(
    message: string,
    options: Partial<RateLimitError> = {}
  ): RateLimitError {
    return {
      ...this.createBaseError('rate_limit', message, options),
      type: 'rate_limit',
      limit: options.limit || 0,
      window: options.window || 0,
      retryAfter: options.retryAfter || 0,
      endpoint: options.endpoint,
      retryable: true,
    } as RateLimitError;
  }

  static system(
    message: string,
    options: Partial<SystemError> = {}
  ): SystemError {
    return {
      ...this.createBaseError('system', message, options),
      type: 'system',
      subsystem: options.subsystem,
      errorCode: options.errorCode,
      severity: options.severity || 'high',
    } as SystemError;
  }

  static userInput(
    message: string,
    options: Partial<UserInputError> = {}
  ): UserInputError {
    return {
      ...this.createBaseError('user_input', message, options),
      type: 'user_input',
      inputType: options.inputType,
      sanitized: options.sanitized,
    } as UserInputError;
  }

  static externalService(
    message: string,
    service: string,
    options: Partial<ExternalServiceError> = {}
  ): ExternalServiceError {
    return {
      ...this.createBaseError('external_service', message, options),
      type: 'external_service',
      service,
      serviceError: options.serviceError,
      retryable: options.retryable ?? true,
    } as ExternalServiceError;
  }

  static fromError(error: Error, type: ErrorCategory = 'unknown'): CivicPortalError {
    return this.createBaseError(type, error.message, {
      name: error.name,
      stack: error.stack,
      technicalMessage: error.message,
      userMessage: 'An unexpected error occurred. Please try again.',
    });
  }
}

// Error type guards
export function isAuthenticationError(error: AppError): error is AuthenticationError {
  return error.type === 'authentication';
}

export function isAuthorizationError(error: AppError): error is AuthorizationError {
  return error.type === 'authorization';
}

export function isValidationError(error: AppError): error is ValidationError {
  return error.type === 'validation';
}

export function isNetworkError(error: AppError): error is NetworkError {
  return error.type === 'network';
}

export function isDatabaseError(error: AppError): error is DatabaseError {
  return error.type === 'database';
}

export function isFileUploadError(error: AppError): error is FileUploadError {
  return error.type === 'file_upload';
}

export function isRateLimitError(error: AppError): error is RateLimitError {
  return error.type === 'rate_limit';
}

export function isSystemError(error: AppError): error is SystemError {
  return error.type === 'system';
}

export function isRetryableError(error: AppError): boolean {
  return error.retryable;
}
