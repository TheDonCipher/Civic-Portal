import { supabase } from "@/lib/supabase";
import DOMPurify from 'dompurify';

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

  // Configure DOMPurify for basic text input
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

// Advanced XSS protection for rich text content with DOMPurify
export const sanitizeHtml = (html: string): string => {
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

// SQL injection protection for dynamic queries
export const sanitizeSqlInput = (input: string): string => {
  if (!input) return "";

  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/;/g, "") // Remove semicolons
    .replace(/--/g, "") // Remove SQL comments
    .replace(/\/\*/g, "") // Remove block comment start
    .replace(/\*\//g, "") // Remove block comment end
    .replace(/xp_/gi, "") // Remove extended procedures
    .replace(/sp_/gi, "") // Remove stored procedures
    .trim();
};

// Rate limiting implementation
export const checkRateLimit = async (
  action: RateLimitAction,
  identifier: string // email or IP address
): Promise<RateLimitResult> => {
  const limit = RATE_LIMITS[action];
  const windowStart = new Date(Date.now() - limit.windowMs);

  try {
    // Get recent attempts from database
    const { data: attempts, error } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("action", action)
      .eq("identifier", identifier)
      .gte("created_at", windowStart.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Rate limit check error:", error);
      // Fail open - allow the request if we can't check rate limits
      return {
        allowed: true,
        remainingAttempts: limit.maxAttempts - 1,
        resetTime: new Date(Date.now() + limit.windowMs),
      };
    }

    const attemptCount = attempts?.length || 0;
    const remainingAttempts = Math.max(0, limit.maxAttempts - attemptCount);
    const allowed = attemptCount < limit.maxAttempts;

    return {
      allowed,
      remainingAttempts,
      resetTime: new Date(Date.now() + limit.windowMs),
      message: allowed
        ? undefined
        : `Too many ${action} attempts. Please try again later.`,
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // Fail open
    return {
      allowed: true,
      remainingAttempts: limit.maxAttempts - 1,
      resetTime: new Date(Date.now() + limit.windowMs),
    };
  }
};

// Record rate limit attempt
export const recordRateLimitAttempt = async (
  action: RateLimitAction,
  identifier: string,
  success: boolean = false
): Promise<void> => {
  try {
    await supabase.from("rate_limits").insert({
      action,
      identifier,
      success,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to record rate limit attempt:", error);
  }
};

// Password validation with detailed feedback
export const validatePasswordSecurity = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 20;
  } else {
    feedback.push("Password must be at least 8 characters long");
  }

  // Character variety checks
  if (/[A-Z]/.test(password)) {
    score += 20;
  } else {
    feedback.push("Add at least one uppercase letter");
  }

  if (/[a-z]/.test(password)) {
    score += 20;
  } else {
    feedback.push("Add at least one lowercase letter");
  }

  if (/[0-9]/.test(password)) {
    score += 20;
  } else {
    feedback.push("Add at least one number");
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 20;
  } else {
    feedback.push("Add at least one special character");
  }

  // Bonus points
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // Common password checks
  const commonPasswords = [
    "password", "123456", "password123", "admin", "qwerty",
    "letmein", "welcome", "monkey", "dragon", "master"
  ];

  if (commonPasswords.some(common =>
    password.toLowerCase().includes(common.toLowerCase())
  )) {
    score -= 30;
    feedback.push("Avoid common passwords");
  }

  // Sequential characters check
  if (/123|abc|qwe/i.test(password)) {
    score -= 10;
    feedback.push("Avoid sequential characters");
  }

  return {
    isValid: score >= 80 && feedback.length === 0,
    score: Math.max(0, Math.min(100, score)),
    feedback,
  };
};

// Email validation with domain checks
export const validateEmailSecurity = (email: string): {
  isValid: boolean;
  isDisposable: boolean;
  domain: string;
  feedback: string[];
} => {
  const feedback: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    feedback.push("Invalid email format");
    return {
      isValid: false,
      isDisposable: false,
      domain: "",
      feedback,
    };
  }

  const domain = email.split("@")[1].toLowerCase();

  // Common disposable email domains
  const disposableDomains = [
    "10minutemail.com", "tempmail.org", "guerrillamail.com",
    "mailinator.com", "throwaway.email", "temp-mail.org"
  ];

  const isDisposable = disposableDomains.includes(domain);

  if (isDisposable) {
    feedback.push("Disposable email addresses are not allowed");
  }

  return {
    isValid: !isDisposable && feedback.length === 0,
    isDisposable,
    domain,
    feedback,
  };
};

// Session security validation
export const validateSession = async (sessionToken: string): Promise<{
  isValid: boolean;
  userId?: string;
  expiresAt?: Date;
}> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(sessionToken);

    if (error || !user) {
      return { isValid: false };
    }

    // Additional session validation can be added here
    return {
      isValid: true,
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  } catch (error) {
    console.error("Session validation error:", error);
    return { isValid: false };
  }
};

// IP address validation and geolocation
export const validateIpAddress = (ip: string): {
  isValid: boolean;
  isPrivate: boolean;
  version: 4 | 6 | null;
} => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  if (ipv4Regex.test(ip)) {
    const parts = ip.split(".").map(Number);
    const isValid = parts.every(part => part >= 0 && part <= 255);
    const isPrivate =
      parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168);

    return { isValid, isPrivate, version: 4 };
  }

  if (ipv6Regex.test(ip)) {
    return { isValid: true, isPrivate: false, version: 6 };
  }

  return { isValid: false, isPrivate: false, version: null };
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

// Generate secure random tokens
export const generateSecureToken = (length: number = 32): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

// Hash sensitive data (for logging/storage)
export const hashSensitiveData = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};

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

// Generate CSP header string
export const generateCSPHeader = (): string => {
  return Object.entries(CSP_CONFIG)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};

// Content Security Policy helpers
export const generateCSPNonce = (): string => {
  return generateSecureToken(16);
};

// Audit logging for security events
export const logSecurityEvent = async (
  event: string,
  userId?: string,
  details?: Record<string, any>
): Promise<void> => {
  try {
    await supabase.from("security_logs").insert({
      event,
      user_id: userId,
      details,
      ip_address: await getClientIpAddress(),
      user_agent: navigator.userAgent,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
};

// Get client IP address (simplified - in production use proper IP detection)
const getClientIpAddress = async (): Promise<string> => {
  try {
    // This is a simplified implementation
    // In production, you'd want to use a proper IP detection service
    return "unknown";
  } catch {
    return "unknown";
  }
};
