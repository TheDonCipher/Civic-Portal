import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { getUserAvatarUrl } from '@/lib/utils/userUtils';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/supabase-extensions';

/**
 * Centralized hook for managing user avatar state with real-time updates
 * Ensures consistent avatar display across all components
 */
export const useUserAvatar = (userId?: string) => {
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine which user's avatar to fetch
  const targetUserId = userId || user?.id;
  const isCurrentUser = targetUserId === user?.id;

  // Use auth profile for current user, fetched profile for others
  const activeProfile = isCurrentUser ? authProfile : profile;

  // Get consistent avatar URL
  const avatarUrl = getUserAvatarUrl(activeProfile, isCurrentUser ? user : null);

  // Fetch profile data for non-current users
  useEffect(() => {
    if (!targetUserId || isCurrentUser) {
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, role')
          .eq('id', targetUserId)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('User not found');
          } else {
            throw fetchError;
          }
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [targetUserId, isCurrentUser]);

  // Set up real-time subscription for profile updates
  useEffect(() => {
    if (!targetUserId) return;

    const subscription = supabase
      .channel(`profile-${targetUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${targetUserId}`,
        },
        (payload) => {
          console.log('Profile update detected:', payload);
          
          if (isCurrentUser) {
            // For current user, trigger auth profile refresh
            // This will be handled by the AuthProvider
          } else {
            // For other users, update local profile state
            setProfile(prev => prev ? { ...prev, ...payload.new } : null);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [targetUserId, isCurrentUser]);

  return {
    avatarUrl,
    profile: activeProfile,
    isLoading: isCurrentUser ? false : isLoading,
    error,
    refresh: () => {
      if (isCurrentUser) {
        // Trigger auth profile refresh - will be implemented in AuthProvider
        window.dispatchEvent(new CustomEvent('refreshProfile'));
      } else if (targetUserId) {
        // Re-fetch profile for other users
        setProfile(null);
      }
    }
  };
};

/**
 * Hook for getting avatar URL only (lightweight version)
 */
export const useAvatarUrl = (userId?: string) => {
  const { avatarUrl } = useUserAvatar(userId);
  return avatarUrl;
};
