import { z } from 'zod';

// Common validation patterns
const emailPattern = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(254, 'Email is too long')
  .transform((email) => email.toLowerCase().trim());

const passwordPattern = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must contain at least one special character'
  );

const fullNamePattern = z
  .string()
  .min(2, 'Full name must be at least 2 characters')
  .max(100, 'Full name is too long')
  .regex(
    /^[a-zA-Z\s'-]+$/,
    'Full name can only contain letters, spaces, hyphens, and apostrophes'
  )
  .transform((name) => name.trim());

// Government ID validation for Botswana
const botswanaIdPattern = z
  .string()
  .min(1, 'Government ID is required')
  .regex(/^[0-9]{9}$/, 'Botswana ID must be exactly 9 digits');

// Enhanced sign-in schema
export const signInSchema = z.object({
  email: emailPattern,
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password is too long'),
});

// Enhanced sign-up schema with multi-step validation
export const signUpStep1Schema = z
  .object({
    email: emailPattern,
    password: passwordPattern,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const signUpStep2Schema = z.object({
  fullName: fullNamePattern,
  role: z.enum(['citizen', 'official'], {
    required_error: 'Please select your role',
  }),
  constituency: z.string().min(1, 'Please select your constituency'),
});

// Government official additional validation
export const officialVerificationSchema = z.object({
  governmentId: botswanaIdPattern,
  department: z.string().min(1, 'Please select your department'),
  workEmail: z
    .string()
    .email('Please enter a valid government email')
    .refine((email) => {
      // Check for common government email domains in Botswana
      const govDomains = [
        '@gov.bw',
        '@parliament.gov.bw',
        '@statehouse.gov.bw',
        '@mfed.gov.bw',
        '@mlha.gov.bw',
        '@miti.gov.bw',
      ];
      return govDomains.some((domain) => email.toLowerCase().endsWith(domain));
    }, 'Please use your official government email address'),
  jobTitle: z
    .string()
    .min(2, 'Job title must be at least 2 characters')
    .max(100, 'Job title is too long'),
});

// Complete sign-up schema
export const signUpCompleteSchema = signUpStep1Schema
  .and(signUpStep2Schema)
  .and(
    z.object({
      termsAccepted: z.boolean().refine((val) => val === true, {
        message: 'You must accept the Terms of Service',
      }),
      privacyAccepted: z.boolean().refine((val) => val === true, {
        message: 'You must accept the Privacy Policy',
      }),
      marketingOptIn: z.boolean().optional(),
    })
  );

// Password reset schema
export const passwordResetSchema = z.object({
  email: emailPattern,
});

// New password schema (for reset flow)
export const newPasswordSchema = z
  .object({
    password: passwordPattern,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Profile update schema
export const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username is too long')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens'
    )
    .optional(),
  fullName: fullNamePattern.optional(),
  constituency: z.string().min(1, 'Please select your constituency').optional(),
  bio: z.string().max(500, 'Bio is too long').optional(),
});

// Legal consent schema
export const legalConsentSchema = z.object({
  termsVersion: z.string().min(1, 'Terms version is required'),
  privacyVersion: z.string().min(1, 'Privacy version is required'),
  consentDate: z.date(),
  ipAddress: z.string().ip('Invalid IP address'),
  userAgent: z.string().min(1, 'User agent is required'),
});

// Rate limiting validation
export const rateLimitSchema = z.object({
  action: z.enum([
    'sign-in',
    'sign-up',
    'password-reset',
    'email-verification',
  ]),
  identifier: z.string().min(1, 'Identifier is required'), // email or IP
  timestamp: z.date(),
  count: z.number().min(0),
});

// Email verification schema
export const emailVerificationSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
  email: emailPattern,
});

// Two-factor authentication schema (for future use)
export const twoFactorSchema = z.object({
  code: z
    .string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^[0-9]+$/, 'Verification code must contain only numbers'),
  backupCode: z
    .string()
    .length(8, 'Backup code must be 8 characters')
    .optional(),
});

// Session validation schema
export const sessionSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  sessionId: z.string().min(1, 'Session ID is required'),
  expiresAt: z.date(),
  ipAddress: z.string().ip('Invalid IP address'),
  userAgent: z.string().min(1, 'User agent is required'),
});

// Export types for TypeScript
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpStep1Data = z.infer<typeof signUpStep1Schema>;
export type SignUpStep2Data = z.infer<typeof signUpStep2Schema>;
export type SignUpCompleteData = z.infer<typeof signUpCompleteSchema>;
export type OfficialVerificationData = z.infer<
  typeof officialVerificationSchema
>;
export type PasswordResetData = z.infer<typeof passwordResetSchema>;
export type NewPasswordData = z.infer<typeof newPasswordSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
export type LegalConsentData = z.infer<typeof legalConsentSchema>;
export type RateLimitData = z.infer<typeof rateLimitSchema>;
export type EmailVerificationData = z.infer<typeof emailVerificationSchema>;
export type TwoFactorData = z.infer<typeof twoFactorSchema>;
export type SessionData = z.infer<typeof sessionSchema>;

// Validation helper functions
export const validateEmail = (email: string): boolean => {
  try {
    emailPattern.parse(email);
    return true;
  } catch {
    return false;
  }
};

export const validatePassword = (password: string): boolean => {
  try {
    passwordPattern.parse(password);
    return true;
  } catch {
    return false;
  }
};

export const validateBotswanaId = (id: string): boolean => {
  try {
    botswanaIdPattern.parse(id);
    return true;
  } catch {
    return false;
  }
};

// Password strength calculator
export const calculatePasswordStrength = (
  password: string
): {
  score: number;
  level: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 20;
  else feedback.push('Use at least 8 characters');

  if (/[A-Z]/.test(password)) score += 20;
  else feedback.push('Add uppercase letters');

  if (/[a-z]/.test(password)) score += 20;
  else feedback.push('Add lowercase letters');

  if (/[0-9]/.test(password)) score += 20;
  else feedback.push('Add numbers');

  if (/[^A-Za-z0-9]/.test(password)) score += 20;
  else feedback.push('Add special characters');

  // Bonus points for length
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  let level: 'weak' | 'fair' | 'good' | 'strong';
  if (score < 40) level = 'weak';
  else if (score < 60) level = 'fair';
  else if (score < 80) level = 'good';
  else level = 'strong';

  return { score: Math.min(score, 100), level, feedback };
};
