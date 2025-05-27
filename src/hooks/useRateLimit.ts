/**
 * Rate limiting hook for preventing abuse and DoS attacks
 * Tracks attempts within a time window and blocks when threshold is exceeded
 */

import { useState, useCallback, useMemo, useEffect } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitState {
  attempts: number[];
  isBlocked: boolean;
  blockUntil?: number;
}

interface RateLimitResult {
  isRateLimited: boolean;
  attemptsRemaining: number;
  timeUntilReset: number;
  recordAttempt: () => boolean;
  reset: () => void;
  getStatus: () => {
    attempts: number;
    maxAttempts: number;
    windowMs: number;
    isBlocked: boolean;
    timeUntilReset: number;
  };
}

/**
 * Custom hook for implementing rate limiting
 * @param config - Rate limiting configuration
 * @returns Rate limiting state and controls
 */
export function useRateLimit(config: RateLimitConfig): RateLimitResult {
  const { maxAttempts, windowMs, blockDurationMs = windowMs } = config;
  
  const [state, setState] = useState<RateLimitState>({
    attempts: [],
    isBlocked: false,
  });

  // Clean up old attempts and check if currently blocked
  const currentStatus = useMemo(() => {
    const now = Date.now();
    
    // Remove attempts outside the time window
    const recentAttempts = state.attempts.filter(time => now - time < windowMs);
    
    // Check if we're currently blocked
    const isCurrentlyBlocked = state.blockUntil ? now < state.blockUntil : false;
    
    // Calculate time until reset
    const oldestAttempt = recentAttempts[0];
    const timeUntilReset = oldestAttempt ? Math.max(0, windowMs - (now - oldestAttempt)) : 0;
    
    return {
      recentAttempts,
      isRateLimited: recentAttempts.length >= maxAttempts || isCurrentlyBlocked,
      attemptsRemaining: Math.max(0, maxAttempts - recentAttempts.length),
      timeUntilReset,
      isBlocked: isCurrentlyBlocked,
    };
  }, [state.attempts, state.blockUntil, maxAttempts, windowMs]);

  // Auto-cleanup effect
  useEffect(() => {
    if (currentStatus.recentAttempts.length !== state.attempts.length || 
        (state.blockUntil && Date.now() >= state.blockUntil)) {
      setState(prev => ({
        attempts: currentStatus.recentAttempts,
        isBlocked: currentStatus.isBlocked,
        blockUntil: currentStatus.isBlocked ? prev.blockUntil : undefined,
      }));
    }
  }, [currentStatus, state.attempts.length, state.blockUntil]);

  // Record a new attempt
  const recordAttempt = useCallback((): boolean => {
    const now = Date.now();
    
    // Don't record if currently blocked
    if (currentStatus.isRateLimited) {
      return false;
    }
    
    setState(prev => {
      const newAttempts = [...prev.attempts, now];
      const recentAttempts = newAttempts.filter(time => now - time < windowMs);
      
      // Check if this attempt puts us over the limit
      const shouldBlock = recentAttempts.length >= maxAttempts;
      
      return {
        attempts: recentAttempts,
        isBlocked: shouldBlock,
        blockUntil: shouldBlock ? now + blockDurationMs : undefined,
      };
    });
    
    return true;
  }, [currentStatus.isRateLimited, windowMs, maxAttempts, blockDurationMs]);

  // Reset the rate limiter
  const reset = useCallback(() => {
    setState({
      attempts: [],
      isBlocked: false,
      blockUntil: undefined,
    });
  }, []);

  // Get current status
  const getStatus = useCallback(() => ({
    attempts: currentStatus.recentAttempts.length,
    maxAttempts,
    windowMs,
    isBlocked: currentStatus.isBlocked,
    timeUntilReset: currentStatus.timeUntilReset,
  }), [currentStatus, maxAttempts, windowMs]);

  return {
    isRateLimited: currentStatus.isRateLimited,
    attemptsRemaining: currentStatus.attemptsRemaining,
    timeUntilReset: currentStatus.timeUntilReset,
    recordAttempt,
    reset,
    getStatus,
  };
}

/**
 * Predefined rate limiting configurations for common use cases
 */
export const RATE_LIMIT_CONFIGS = {
  // Authentication attempts: 5 attempts per 15 minutes
  auth: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes block
  },
  
  // Issue creation: 10 issues per hour
  issueCreation: {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour block
  },
  
  // Comments: 30 comments per 10 minutes
  comments: {
    maxAttempts: 30,
    windowMs: 10 * 60 * 1000, // 10 minutes
    blockDurationMs: 10 * 60 * 1000, // 10 minutes block
  },
  
  // Search queries: 100 searches per minute
  search: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 60 * 1000, // 1 minute block
  },
  
  // Password reset: 3 attempts per hour
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 hours block
  },
  
  // File uploads: 20 uploads per hour
  fileUpload: {
    maxAttempts: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000, // 1 hour block
  },
} as const;

/**
 * Convenience hooks for common rate limiting scenarios
 */
export const useAuthRateLimit = () => useRateLimit(RATE_LIMIT_CONFIGS.auth);
export const useIssueCreationRateLimit = () => useRateLimit(RATE_LIMIT_CONFIGS.issueCreation);
export const useCommentRateLimit = () => useRateLimit(RATE_LIMIT_CONFIGS.comments);
export const useSearchRateLimit = () => useRateLimit(RATE_LIMIT_CONFIGS.search);
export const usePasswordResetRateLimit = () => useRateLimit(RATE_LIMIT_CONFIGS.passwordReset);
export const useFileUploadRateLimit = () => useRateLimit(RATE_LIMIT_CONFIGS.fileUpload);

/**
 * Format time remaining in a human-readable format
 * @param ms - Milliseconds remaining
 * @returns Formatted time string
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return '0 seconds';
  
  const seconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds % 60} second${seconds % 60 !== 1 ? 's' : ''}`;
  } else {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
}
