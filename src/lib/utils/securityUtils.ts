import { supabase } from "@/lib/supabase";
import { z } from "zod";

/**
 * Enhanced security utility functions for the Civic Portal
 * Implements comprehensive input validation, XSS prevention, and security checks
 */

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Rate limiting configuration
const RATE_LIMITS = {
  "sign-in": { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  "sign-up": { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  "password-reset": { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  "email-verification": { maxAttempts: 5, windowMs: 60 * 60 * 1000 }, // 5 attempts per hour
} as const;

type RateLimitAction = keyof typeof RATE_LIMITS;

interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  resetTime: Date;
  message?: string;
}

// Get client IP address (fallback for development)
const getClientIpAddress = async (): Promise<string> => {
  try {
    // In development, return localhost
    if (process.env.NODE_ENV === 'development') {
      return '127.0.0.1';
    }

    // In production, you would get this from headers or a service
    return 'unknown';
  } catch (error) {
    console.error('Failed to get client IP:', error);
    return 'unknown';
  }
};

export class SecurityUtils {
  // ✅ Enhanced HTML sanitization with DOMPurify-like functionality
  static sanitizeHtml(input: string, options?: {
    allowedTags?: string[];
    allowedAttributes?: string[];
    forbiddenTags?: string[];
  }): string {
    if (!input) return "";

    const {
      allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br'],
      allowedAttributes = [],
      forbiddenTags = ['script', 'object', 'embed', 'link', 'style', 'iframe']
    } = options || {};

    // Remove forbidden tags completely
    let sanitized = input;
    forbiddenTags.forEach(tag => {
      const regex = new RegExp(`<${tag}[^>]*>.*?<\/${tag}>`, 'gi');
      sanitized = sanitized.replace(regex, '');
      const selfClosingRegex = new RegExp(`<${tag}[^>]*\/?>`, 'gi');
      sanitized = sanitized.replace(selfClosingRegex, '');
    });

    // Remove all tags except allowed ones
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/gi;
    sanitized = sanitized.replace(tagRegex, (match, tagName) => {
      if (allowedTags.includes(tagName.toLowerCase())) {
        // For allowed tags, remove all attributes except allowed ones
        if (allowedAttributes.length === 0) {
          return `<${tagName}>`;
        }
        // More complex attribute filtering would go here
        return match;
      }
      return ''; // Remove disallowed tags
    });

    return sanitized;
  }

  // ✅ SQL injection prevention
  static sanitizeForDatabase(input: string): string {
    if (!input) return "";

    return input
      .replace(/'/g, "''")  // Escape single quotes
      .replace(/;/g, '')    // Remove semicolons
      .replace(/--/g, '')   // Remove SQL comments
      .replace(/\/\*/g, '') // Remove block comments
      .replace(/\*\//g, '')
      .replace(/\bUNION\b/gi, '') // Remove UNION keywords
      .replace(/\bSELECT\b/gi, '') // Remove SELECT keywords
      .replace(/\bINSERT\b/gi, '') // Remove INSERT keywords
      .replace(/\bUPDATE\b/gi, '') // Remove UPDATE keywords
      .replace(/\bDELETE\b/gi, '') // Remove DELETE keywords
      .replace(/\bDROP\b/gi, '');   // Remove DROP keywords
  }

  // ✅ XSS prevention
  static escapeHtml(input: string): string {
    if (!input) return "";

    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  // ✅ File upload validation
  static validateFileUpload(file: File): ValidationResult {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain'
    ];

    const maxSize = 5 * 1024 * 1024; // 5MB
    const minSize = 1024; // 1KB minimum

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type '${file.type}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (5MB)`
      };
    }

    if (file.size < minSize) {
      return {
        isValid: false,
        error: 'File is too small (minimum 1KB required)'
      };
    }

    // Check for suspicious file names
    const suspiciousPatterns = [
      /\.exe$/i,
      /\.bat$/i,
      /\.cmd$/i,
      /\.scr$/i,
      /\.vbs$/i,
      /\.js$/i,
      /\.php$/i,
      /\.asp$/i,
      /\.jsp$/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
      return {
        isValid: false,
        error: 'File name contains suspicious extension'
      };
    }

    return { isValid: true };
  }

  // ✅ Enhanced rate limiting check
  static async checkRateLimit(
    action: RateLimitAction,
    identifier: string
  ): Promise<RateLimitResult> {
    const config = RATE_LIMITS[action];
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get existing attempts from localStorage (in production, use Redis)
    const storageKey = `rate_limit_${action}_${identifier}`;
    const attempts = JSON.parse(localStorage.getItem(storageKey) || '[]')
      .filter((timestamp: number) => timestamp > windowStart);

    const remainingAttempts = Math.max(0, config.maxAttempts - attempts.length);
    const resetTime = new Date(now + config.windowMs);

    if (attempts.length >= config.maxAttempts) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime,
        message: `Too many ${action} attempts. Please try again later.`
      };
    }

    return {
      allowed: true,
      remainingAttempts,
      resetTime
    };
  }

  // ✅ Record rate limit attempt
  static async recordRateLimitAttempt(
    action: RateLimitAction,
    identifier: string,
    success: boolean = false
  ): Promise<void> {
    try {
      const now = Date.now();
      const storageKey = `rate_limit_${action}_${identifier}`;
      const attempts = JSON.parse(localStorage.getItem(storageKey) || '[]');

      attempts.push(now);
      localStorage.setItem(storageKey, JSON.stringify(attempts));

      // Also try to record in database if available
      await supabase.from('rate_limits').insert({
        action,
        identifier,
        success,
        ip_address: await getClientIpAddress(),
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to record rate limit attempt:', error);
    }
  }

  // ✅ Security event logging
  static async logSecurityEvent(
    event: string,
    userId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      await supabase.from('security_logs').insert({
        event,
        user_id: userId,
        details,
        ip_address: await getClientIpAddress(),
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
      // Fallback to console logging in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Security Event:', { event, userId, details });
      }
    }
  }

  // ✅ Content Security Policy nonce generation
  static generateCSPNonce(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  // ✅ Validate URL to prevent open redirects
  static validateUrl(url: string, allowedDomains?: string[]): ValidationResult {
    try {
      const urlObj = new URL(url);

      // Check protocol
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return {
          isValid: false,
          error: 'Only HTTP and HTTPS protocols are allowed'
        };
      }

      // Check against allowed domains if provided
      if (allowedDomains && allowedDomains.length > 0) {
        const isAllowed = allowedDomains.some(domain =>
          urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
        );

        if (!isAllowed) {
          return {
            isValid: false,
            error: `Domain '${urlObj.hostname}' is not in the allowed list`
          };
        }
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid URL format'
      };
    }
  }
}

// Verify user authentication
export const verifyAuthentication = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) {
    console.error("Authentication error:", error);
    return false;
  }
  return !!session;
};

// Check if user has permission to modify content
export const hasPermission = async (
  resourceType: string,
  resourceId: string,
  action: "update" | "delete",
) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    // Get user profile to check role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Officials can modify any content
    if (profile?.role === "official") return true;

    // For regular users, check if they own the resource
    let query;
    switch (resourceType) {
      case "issue":
        query = supabase
          .from("issues")
          .select("author_id")
          .eq("id", resourceId)
          .single();
        break;
      case "comment":
        query = supabase
          .from("comments")
          .select("author_id")
          .eq("id", resourceId)
          .single();
        break;
      case "update":
        query = supabase
          .from("updates")
          .select("author_id")
          .eq("id", resourceId)
          .single();
        break;
      case "solution":
        query = supabase
          .from("solutions")
          .select("proposed_by")
          .eq("id", resourceId)
          .single();
        break;
      default:
        return false;
    }

    const { data: resource } = await query;

    // Check if user is the author/owner of the resource
    return resource?.author_id === user.id || resource?.proposed_by === user.id;
  } catch (error) {
    console.error(
      `Error checking permission for ${resourceType} ${resourceId}:`,
      error,
    );
    return false;
  }
};

// ✅ Enhanced validation schemas for secure input handling
export const secureIssueSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters')
    .refine(
      (val) => !/<script|javascript:|data:/i.test(val),
      'Title contains potentially dangerous content'
    )
    .transform((val) => SecurityUtils.escapeHtml(val.trim())),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must be less than 5000 characters')
    .transform((val) => SecurityUtils.sanitizeHtml(val.trim())),
  category: z.enum([
    'infrastructure',
    'health',
    'education',
    'environment',
    'safety',
    'transportation',
    'utilities',
    'governance',
    'social_services',
    'economic_development'
  ]),
  location: z
    .string()
    .max(500, 'Location must be less than 500 characters')
    .transform((val) => SecurityUtils.escapeHtml(val.trim())),
  constituency: z
    .string()
    .optional()
    .transform((val) => val ? SecurityUtils.escapeHtml(val.trim()) : undefined)
});

export const secureCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must be less than 2000 characters')
    .transform((val) => SecurityUtils.sanitizeHtml(val.trim())),
  issue_id: z.string().uuid('Invalid issue ID format')
});

export const secureUserProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .transform((val) => SecurityUtils.escapeHtml(val.trim().toLowerCase())),
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters')
    .transform((val) => SecurityUtils.escapeHtml(val.trim())),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .transform((val) => val ? SecurityUtils.sanitizeHtml(val.trim()) : undefined)
});

// ✅ Backward compatibility - enhanced sanitizeInput function
export const sanitizeInput = (input: string): string => {
  return SecurityUtils.escapeHtml(input);
};

// Validate storage access permissions
export const validateStorageAccess = async (
  bucket: string,
  path: string,
  operation: "read" | "write" | "delete",
) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    // For development, we're allowing all authenticated users to access storage
    // In production, you would implement more granular permissions
    return true;
  } catch (error) {
    console.error(
      `Error validating storage access for ${bucket}/${path}:`,
      error,
    );
    return false;
  }
};

// Create a secure audit log for sensitive operations
export const auditLog = async (
  action: string,
  resourceType: string,
  resourceId: string,
  userId: string,
  details?: any,
) => {
  try {
    await supabase.from("audit_logs").insert({
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      user_id: userId,
      details: details ? JSON.stringify(details) : null,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
};
