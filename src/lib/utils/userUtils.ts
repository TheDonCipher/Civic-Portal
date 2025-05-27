/**
 * Utility functions for consistent user data handling across components
 */

import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  constituency?: string | null;
  role?: 'citizen' | 'official' | 'admin' | null;
  department_id?: string | null;
  verification_status?: string | null;
  bio?: string | null;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get a consistent display name for a user
 */
export const getUserDisplayName = (
  profile?: UserProfile | null,
  user?: User | null,
  fallback: string = 'Anonymous User'
): string => {
  if (profile?.full_name) return profile.full_name;
  if (profile?.username) return profile.username;
  if (user?.email) return user.email.split('@')[0];
  if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
  if (user?.user_metadata?.username) return user.user_metadata.username;
  return fallback;
};

/**
 * Get a consistent avatar URL for a user
 */
export const getUserAvatarUrl = (
  profile?: UserProfile | null,
  user?: User | null,
  fallback?: string
): string => {
  if (profile?.avatar_url) return profile.avatar_url;
  if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
  
  // Generate a consistent avatar based on user ID
  const seed = profile?.id || user?.id || 'default';
  return fallback || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

/**
 * Get user initials for avatar fallback
 */
export const getUserInitials = (
  profile?: UserProfile | null,
  user?: User | null,
  fallback: string = 'U'
): string => {
  const displayName = getUserDisplayName(profile, user, '');
  if (displayName) {
    const words = displayName.split(' ');
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return displayName.charAt(0).toUpperCase();
  }
  return fallback.toUpperCase();
};

/**
 * Get user role display text
 */
export const getUserRoleDisplay = (
  profile?: UserProfile | null,
  fallback: string = 'Citizen'
): string => {
  switch (profile?.role) {
    case 'citizen':
      return 'Citizen';
    case 'official':
      return 'Official';
    case 'admin':
      return 'Admin';
    default:
      return fallback;
  }
};

/**
 * Get user email with fallback
 */
export const getUserEmail = (
  user?: User | null,
  fallback: string = 'No email provided'
): string => {
  return user?.email || user?.user_metadata?.email || fallback;
};

/**
 * Check if user has a specific role
 */
export const hasRole = (
  profile?: UserProfile | null,
  role: 'citizen' | 'official' | 'admin'
): boolean => {
  return profile?.role === role;
};

/**
 * Check if user is verified
 */
export const isUserVerified = (profile?: UserProfile | null): boolean => {
  return profile?.is_verified === true || profile?.verification_status === 'verified';
};

/**
 * Format user data for consistent display across components
 */
export const formatUserForDisplay = (
  profile?: UserProfile | null,
  user?: User | null
) => {
  return {
    name: getUserDisplayName(profile, user),
    avatar: getUserAvatarUrl(profile, user),
    initials: getUserInitials(profile, user),
    email: getUserEmail(user),
    role: getUserRoleDisplay(profile),
    isVerified: isUserVerified(profile),
  };
};

/**
 * Create author object for issue/comment display
 */
export const createAuthorObject = (
  profile?: UserProfile | null,
  user?: User | null,
  authorId?: string
) => {
  const formatted = formatUserForDisplay(profile, user);
  return {
    id: authorId || profile?.id || user?.id || '',
    name: formatted.name,
    avatar: formatted.avatar,
    role: profile?.role || 'citizen',
  };
};
