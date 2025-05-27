/**
 * @fileoverview Enhanced Security Implementation for Civic Portal
 * @description Production-ready security utilities with comprehensive protection
 * against XSS, CSRF, injection attacks, and other security threats.
 *
 * @author Civic Portal Security Team
 * @version 2.0.0
 * @since 2024-01-01
 */

import DOMPurify from 'dompurify';
import { supabase } from '@/lib/supabase';

// Enhanced rate limiting configuration
const RATE_LIMITS = {
  'sign-in': { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  'sign-up': { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  'password-reset': { maxAttempts: 3, windowMs: 60 * 60 * 1000 },
  'email-verification': { maxAttempts: 5, windowMs: 60 * 60 * 1000 },
  'api-call': { maxAttempts: 100, windowMs: 60 * 1000 }, // 100 per minute
  'file-upload': { maxAttempts: 10, windowMs: 60 * 1000 }, // 10 per minute
} as const;

type RateLimitAction = keyof typeof RATE_LIMITS;

interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  resetTime: Date;
  message?: string;
}

// Content Security Policy configuration
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "https://api.dicebear.com"],
  'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  'font-src': ["'self'", "https://fonts.gstatic.com"],
  'img-src': ["'self'", "data:", "https:", "blob:"],
  'connect-src': ["'self'", "https://*.supabase.co", "wss://*.supabase.co"],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

// Enhanced input sanitization with DOMPurify
export const sanitizeInput = (input: string, options?: {
  allowedTags?: string[];
  allowedAttributes?: string[];
  maxLength?: number;
}): string => {
  if (!input) return '';

  const {
    allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br'],
    allowedAttributes = [],
    maxLength = 10000
  } = options || {};

  // Configure DOMPurify
  const cleanHtml = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
  });

  // Additional security measures
  return cleanHtml
    .trim()
    .substring(0, maxLength)
    // Remove null bytes and control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ');
};

// Advanced XSS protection for rich text content
export const sanitizeRichText = (html: string): string => {
  if (!html) return '';

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'b', 'i', 'u', 'ol', 'ul', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['class'],
    KEEP_CONTENT: true,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'iframe'],
    FORBID_ATTR: ['style', 'on*'],
  });
};

// SQL injection protection for search queries
export const sanitizeSearchQuery = (query: string): string => {
  if (!query) return '';

  return query
    .replace(/['"`;\\]/g, '') // Remove dangerous characters
    .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b/gi, '') // Remove SQL keywords
    .trim()
    .substring(0, 100); // Limit length
};

// Enhanced rate limiting with Redis-like functionality
export const checkRateLimit = async (
  action: RateLimitAction,
  identifier: string
): Promise<RateLimitResult> => {
  const limit = RATE_LIMITS[action];
  const windowStart = new Date(Date.now() - limit.windowMs);

  try {
    // Check if rate_limits table exists, create if not
    const { data: attempts, error } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('action', action)
      .eq('identifier', identifier)
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: false });

    if (error && error.code === 'PGRST116') {
      // Table doesn't exist, create it
      await createRateLimitTable();
      return { allowed: true, remainingAttempts: limit.maxAttempts - 1, resetTime: new Date(Date.now() + limit.windowMs) };
    }

    if (error) {
      console.error('Rate limit check error:', error);
      // Fail open but log the error
      await logSecurityEvent('rate_limit_check_failed', undefined, { error: error.message, action, identifier });
      return { allowed: true, remainingAttempts: limit.maxAttempts - 1, resetTime: new Date(Date.now() + limit.windowMs) };
    }

    const attemptCount = attempts?.length || 0;
    const remainingAttempts = Math.max(0, limit.maxAttempts - attemptCount);
    const allowed = attemptCount < limit.maxAttempts;

    if (!allowed) {
      await logSecurityEvent('rate_limit_exceeded', undefined, { action, identifier, attemptCount });
    }

    return {
      allowed,
      remainingAttempts,
      resetTime: new Date(Date.now() + limit.windowMs),
      message: allowed ? undefined : `Too many ${action} attempts. Please try again later.`,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    await logSecurityEvent('rate_limit_system_error', undefined, { error: String(error), action, identifier });
    return { allowed: true, remainingAttempts: limit.maxAttempts - 1, resetTime: new Date(Date.now() + limit.windowMs) };
  }
};

// Record rate limit attempt
export const recordRateLimitAttempt = async (
  action: RateLimitAction,
  identifier: string,
  success: boolean = false,
  metadata?: Record<string, any>
): Promise<void> => {
  try {
    await supabase.from('rate_limits').insert({
      action,
      identifier,
      success,
      metadata,
      ip_address: await getClientIpAddress(),
      user_agent: navigator.userAgent,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to record rate limit attempt:', error);
    await logSecurityEvent('rate_limit_record_failed', undefined, { error: String(error), action, identifier });
  }
};

// Enhanced password validation
export const validatePasswordSecurity = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length checks
  if (password.length >= 8) score += 20;
  else feedback.push('Password must be at least 8 characters long');

  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // Character variety
  if (/[A-Z]/.test(password)) score += 20;
  else feedback.push('Add at least one uppercase letter');

  if (/[a-z]/.test(password)) score += 20;
  else feedback.push('Add at least one lowercase letter');

  if (/[0-9]/.test(password)) score += 20;
  else feedback.push('Add at least one number');

  if (/[^A-Za-z0-9]/.test(password)) score += 20;
  else feedback.push('Add at least one special character');

  // Pattern checks
  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    feedback.push('Avoid repeating characters');
  }

  if (/123|abc|qwe|password|admin/i.test(password)) {
    score -= 20;
    feedback.push('Avoid common patterns and words');
  }

  // Determine strength
  let strength: 'weak' | 'fair' | 'good' | 'strong';
  if (score < 40) strength = 'weak';
  else if (score < 60) strength = 'fair';
  else if (score < 80) strength = 'good';
  else strength = 'strong';

  return {
    isValid: score >= 60 && feedback.length === 0,
    score: Math.max(0, Math.min(100, score)),
    feedback,
    strength,
  };
};

// File upload security validation
export const validateFileUpload = (file: File): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  // Size validation
  if (file.size > maxSize) {
    errors.push('File size must be less than 10MB');
  }

  // Type validation
  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not allowed');
  }

  // Name validation
  if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
    errors.push('File name contains invalid characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Security event logging
export const logSecurityEvent = async (
  event: string,
  userId?: string,
  details?: Record<string, any>
): Promise<void> => {
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
};

// Helper function to create rate limit table
const createRateLimitTable = async (): Promise<void> => {
  const { error } = await supabase.rpc('create_rate_limit_table');
  if (error) {
    console.error('Failed to create rate limit table:', error);
  }
};

// Get client IP address (simplified for browser environment)
const getClientIpAddress = async (): Promise<string> => {
  try {
    // In a real implementation, this would be handled by the server
    return 'client-ip';
  } catch {
    return 'unknown';
  }
};

// Generate CSP header string
export const generateCSPHeader = (): string => {
  return Object.entries(CSP_CONFIG)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};

// CSRF token management
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token: string, expectedToken: string): boolean => {
  return token === expectedToken && token.length === 64;
};
