/**
 * IP Address Utilities
 * Handles client IP address detection and validation
 */

/**
 * Get client IP address
 * In a production environment, this should be handled by the server
 * For now, we return a placeholder as IP detection from client-side is limited
 */
export const getClientIpAddress = async (): Promise<string> => {
  try {
    // In a real implementation, you would:
    // 1. Use a server-side endpoint to get the real IP
    // 2. Use a third-party service like ipify.org
    // 3. Get it from request headers on the server
    
    // For development/demo purposes, return a placeholder
    return 'unknown';
  } catch (error) {
    console.warn('Failed to get client IP address:', error);
    return 'unknown';
  }
};

/**
 * Validate IP address format
 */
export const validateIpAddress = (ip: string): {
  isValid: boolean;
  isPrivate: boolean;
  version: 4 | 6 | null;
} => {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.').map(Number);
    const isValid = parts.every(part => part >= 0 && part <= 255);
    const isPrivate =
      parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      parts[0] === 127; // localhost

    return { isValid, isPrivate, version: 4 };
  }

  if (ipv6Regex.test(ip)) {
    const isPrivate = ip.startsWith('::1') || ip.startsWith('fc') || ip.startsWith('fd');
    return { isValid: true, isPrivate, version: 6 };
  }

  return { isValid: false, isPrivate: false, version: null };
};

/**
 * Get user agent string
 */
export const getUserAgent = (): string => {
  return navigator.userAgent || 'unknown';
};

/**
 * Get browser metadata for consent recording
 */
export const getBrowserMetadata = () => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
    },
  };
};
