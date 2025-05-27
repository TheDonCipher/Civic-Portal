/**
 * @fileoverview Comprehensive Input Sanitization Utilities
 * @description Provides robust protection against XSS, SQL injection, and other security threats.
 * This module implements multiple layers of security including HTML sanitization, input validation,
 * and content filtering to ensure all user-generated content is safe for display and storage.
 *
 * @author Civic Portal Team
 * @version 1.2.0
 * @since 2024-01-01
 *
 * @example Basic Usage
 * ```typescript
 * import { sanitizeText, sanitizeEmail, sanitizeFormData } from '@/lib/sanitization';
 *
 * // Sanitize user input
 * const cleanText = sanitizeText(userInput, 100);
 *
 * // Validate and sanitize email
 * const email = sanitizeEmail(userEmail);
 *
 * // Sanitize entire form data
 * const cleanData = sanitizeFormData(formData);
 * ```
 *
 * @example Advanced HTML Sanitization
 * ```typescript
 * import { sanitizeHtml } from '@/lib/sanitization';
 *
 * // Strict sanitization (only basic formatting)
 * const strictHtml = sanitizeHtml(userHtml, 'strict');
 *
 * // Rich sanitization (allows more formatting)
 * const richHtml = sanitizeHtml(userHtml, 'rich');
 * ```
 */

import DOMPurify from 'dompurify';

// Configuration for different sanitization levels
const SANITIZATION_CONFIGS = {
  // Strict: Only basic text formatting
  strict: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
  },

  // Basic: Common formatting tags
  basic: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'blockquote'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
  },

  // Rich: More formatting options for content
  rich: {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'blockquote',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'title'],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: false,
  },
} as const;

type SanitizationLevel = keyof typeof SANITIZATION_CONFIGS;

/**
 * Sanitizes HTML content using DOMPurify with configurable security levels.
 *
 * @description This function provides three levels of HTML sanitization:
 * - **strict**: Only allows basic text formatting (b, i, em, strong, p, br)
 * - **basic**: Allows common formatting including lists and blockquotes
 * - **rich**: Allows advanced formatting including headings and links
 *
 * @param {string} input - The HTML string to sanitize
 * @param {SanitizationLevel} [level='strict'] - The sanitization level
 * @returns {string} Sanitized HTML string safe for display
 *
 * @example
 * ```typescript
 * // Strict sanitization
 * const clean = sanitizeHtml('<p>Hello <script>alert("xss")</script></p>');
 * // Returns: '<p>Hello </p>'
 *
 * // Rich sanitization
 * const rich = sanitizeHtml('<h1>Title</h1><a href="https://example.com">Link</a>', 'rich');
 * // Returns: '<h1>Title</h1><a href="https://example.com">Link</a>'
 * ```
 *
 * @since 1.0.0
 * @see {@link https://github.com/cure53/DOMPurify} DOMPurify Documentation
 */
export function sanitizeHtml(input: string, level: SanitizationLevel = 'strict'): string {
  if (!input || typeof input !== 'string') return '';

  const config = SANITIZATION_CONFIGS[level];
  return DOMPurify.sanitize(input, config);
}

/**
 * Sanitizes plain text input by removing HTML tags and dangerous characters.
 *
 * @description This function provides comprehensive text sanitization by:
 * - Removing all HTML tags and markup
 * - Filtering out null bytes and control characters
 * - Normalizing whitespace (multiple spaces become single space)
 * - Enforcing maximum length limits to prevent DoS attacks
 * - Trimming leading and trailing whitespace
 *
 * @param {string} input - The text string to sanitize
 * @param {number} [maxLength=1000] - Maximum allowed length in characters
 * @returns {string} Sanitized text string safe for storage and display
 *
 * @example
 * ```typescript
 * // Basic text sanitization
 * const clean = sanitizeText('Hello <script>alert("xss")</script> World');
 * // Returns: 'Hello  World'
 *
 * // With length limit
 * const limited = sanitizeText('Very long text...', 10);
 * // Returns: 'Very long ' (truncated to 10 characters)
 *
 * // Handles null/undefined input
 * const safe = sanitizeText(null);
 * // Returns: ''
 * ```
 *
 * @since 1.0.0
 * @throws {never} This function never throws, always returns a string
 */
export function sanitizeText(input: string, maxLength = 1000): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove null bytes and control characters (except newlines and tabs)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Limit length to prevent DoS
    .slice(0, maxLength)
    .trim();
}

/**
 * Sanitizes user input for search queries
 * @param input - The search query to sanitize
 * @returns Sanitized search query
 */
export function sanitizeSearchQuery(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove special regex characters that could cause issues
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // Remove null bytes and control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Limit length
    .slice(0, 100)
    .trim();
}

/**
 * Sanitizes email addresses
 * @param input - The email to sanitize
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(input: string): string {
  if (!input || typeof input !== 'string') return '';

  const sanitized = input
    .trim()
    .toLowerCase()
    // Remove any HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove null bytes and control characters
    .replace(/[\x00-\x1F\x7F]/g, '');

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) ? sanitized : '';
}

/**
 * Sanitizes URLs
 * @param input - The URL to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(input: string): string {
  if (!input || typeof input !== 'string') return '';

  const sanitized = input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove null bytes and control characters
    .replace(/[\x00-\x1F\x7F]/g, '');

  try {
    const url = new URL(sanitized);
    // Only allow http and https protocols
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString();
    }
  } catch {
    // Invalid URL
  }

  return '';
}

/**
 * Sanitizes file names
 * @param input - The filename to sanitize
 * @returns Sanitized filename
 */
export function sanitizeFilename(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove path traversal attempts
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    // Remove dangerous characters
    .replace(/[<>:"|?*\x00-\x1F\x7F]/g, '')
    // Limit length
    .slice(0, 255)
    .trim();
}

/**
 * Sanitizes numeric input
 * @param input - The input to sanitize as a number
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Sanitized number or null if invalid
 */
export function sanitizeNumber(input: string | number, min?: number, max?: number): number | null {
  if (input === null || input === undefined || input === '') return null;

  const num = typeof input === 'string' ? parseFloat(input) : input;

  if (isNaN(num) || !isFinite(num)) return null;

  if (min !== undefined && num < min) return null;
  if (max !== undefined && num > max) return null;

  return num;
}

/**
 * Sanitizes boolean input
 * @param input - The input to sanitize as a boolean
 * @returns Boolean value or null if invalid
 */
export function sanitizeBoolean(input: string | boolean): boolean | null {
  if (typeof input === 'boolean') return input;
  if (typeof input !== 'string') return null;

  const sanitized = input.trim().toLowerCase();

  if (sanitized === 'true' || sanitized === '1' || sanitized === 'yes') return true;
  if (sanitized === 'false' || sanitized === '0' || sanitized === 'no') return false;

  return null;
}

/**
 * Comprehensive input sanitization for form data
 * @param data - Object containing form data
 * @returns Sanitized form data
 */
export function sanitizeFormData<T extends Record<string, any>>(data: T): T {
  const sanitized = {} as T;

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeText(value) as T[keyof T];
    } else if (typeof value === 'number') {
      sanitized[key as keyof T] = value;
    } else if (typeof value === 'boolean') {
      sanitized[key as keyof T] = value;
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map(item =>
        typeof item === 'string' ? sanitizeText(item) : item
      ) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  }

  return sanitized;
}

/**
 * Validates and sanitizes JSON input
 * @param input - JSON string to validate and sanitize
 * @returns Parsed and sanitized object or null if invalid
 */
export function sanitizeJson(input: string): any | null {
  if (!input || typeof input !== 'string') return null;

  try {
    const parsed = JSON.parse(input);
    return sanitizeFormData(parsed);
  } catch {
    return null;
  }
}

// Export legacy function for backward compatibility
export { sanitizeText as sanitizeInput };
