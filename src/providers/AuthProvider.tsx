import React, { useEffect, useState } from 'react';
import { AuthContext } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { User, AuthError } from '@supabase/supabase-js';
import type { UserProfile } from '@/lib/auth';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { SecurityUtils } from '@/lib/utils/securityUtils';
import { handleApiError } from '@/lib/utils/errorHandler';
import { SessionTimeoutHandler } from '@/components/auth/SessionTimeoutHandler';
import type { Profile } from '@/types/enhanced';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionRefreshTimer, setSessionRefreshTimer] =
    useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log(
          'Initial session check:',
          session?.user?.id ? 'Logged in' : 'Not logged in'
        );

        setUser(session?.user ?? null);
        if (session?.user) {
          getProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);

      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id);

        // Redirect to user dashboard after successful sign in
        if (event === 'SIGNED_IN' && window.location.pathname === '/') {
          const params = new URLSearchParams(window.location.search);
          if (!params.get('demo')) {
            // Add a small delay to ensure profile is loaded
            setTimeout(() => {
              window.location.href = `/user/${session.user.id}`;
            }, 100);
          }
        }
      } else {
        setProfile(null);
        setIsLoading(false);

        // Redirect to home after sign out
        if (
          event === 'SIGNED_OUT' &&
          window.location.pathname.startsWith('/user/')
        ) {
          window.location.href = '/';
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getProfile = async (userId: string): Promise<void> => {
    try {
      let profileData: Profile | null = null;

      // First try to get the profile from the database
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist yet, this can happen if the trigger failed
          console.log(
            'Profile not found for user:',
            userId,
            'attempting to create...'
          );

          const session = await supabase.auth.getSession();
          const metadata = session?.data?.session?.user?.user_metadata;

          console.log('User metadata for profile creation:', metadata);

          if (metadata || session?.data?.session?.user) {
            // Create a default profile for the user with more comprehensive data
            const userRole =
              (metadata?.role as 'citizen' | 'official' | 'admin') || 'citizen';
            const userEmail = session?.data?.session?.user?.email;

            const defaultProfile = {
              id: userId,
              email: userEmail,
              username: SecurityUtils.escapeHtml(
                metadata?.username ||
                  userEmail?.split('@')[0] ||
                  `user_${userId.substring(0, 8)}`
              ),
              full_name: SecurityUtils.escapeHtml(
                metadata?.full_name || 'User'
              ),
              constituency: metadata?.constituency
                ? SecurityUtils.escapeHtml(metadata.constituency)
                : null,
              department_id: metadata?.department_id || null,
              avatar_url:
                metadata?.avatar_url ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
              role: userRole,
              bio: null,
              is_verified: userRole !== 'official',
              verification_status:
                metadata?.verification_status ||
                (userRole === 'official' ? 'pending' : 'verified'),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            console.log('Attempting to create profile:', defaultProfile);

            // Try to insert the profile directly
            const { data: insertData, error: profileInsertError } =
              await supabase
                .from('profiles')
                .insert([defaultProfile])
                .select()
                .single();

            if (profileInsertError) {
              console.error('Error inserting profile:', profileInsertError);

              // Try calling the sync function as a fallback
              try {
                const { data: syncData, error: syncError } = await supabase.rpc(
                  'sync_missing_profiles'
                );

                if (syncError) {
                  console.error(
                    'Error calling sync_missing_profiles:',
                    syncError
                  );
                } else {
                  console.log('Sync function result:', syncData);
                }
              } catch (syncErr) {
                console.error('Sync function not available:', syncErr);
              }

              // Use the default profile even if we couldn't save it
              profileData = defaultProfile;
            } else {
              console.log('Profile created successfully:', insertData);
              profileData = insertData;
            }
          } else {
            console.error('No user metadata available for profile creation');
            // Create a minimal default profile
            profileData = {
              id: userId,
              username: 'user_' + userId.substring(0, 5),
              full_name: 'User',
              constituency: null,
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
              banner_url: null,
              role: 'citizen',
            };
          }
        } else {
          console.error('Error fetching profile:', error);
          handleApiError(error, 'AuthProvider', 'getProfile');
          // Create a default profile in memory if we can't get it from the database
          profileData = {
            id: userId,
            username: `user_${userId.substring(0, 5)}`,
            full_name: 'User',
            constituency: null,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
            role: 'citizen',
            department_id: null,
            bio: null,
            is_verified: true,
            verification_status: 'verified',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
      } else {
        console.log('Profile found successfully:', data);
        profileData = data;
      }

      if (profileData) {
        setProfile({
          id: profileData.id,
          username: profileData.username || null,
          full_name: profileData.full_name || null,
          avatar_url: profileData.avatar_url || null,
          constituency: profileData.constituency || null,
          role:
            (profileData.role as 'citizen' | 'official' | 'admin') || 'citizen',
          department_id: profileData.department_id || null,
          verification_status: profileData.verification_status || null,
          bio: profileData.bio || null,
          is_verified: profileData.is_verified || false,
        });
      }
    } catch (error: unknown) {
      console.error('Error loading user profile:', error);
      handleApiError(error, 'AuthProvider', 'getProfile');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      // Check rate limiting before attempting sign in
      const rateLimitCheck = await SecurityUtils.checkRateLimit(
        'sign-in',
        email
      );
      if (!rateLimitCheck.allowed) {
        await SecurityUtils.logSecurityEvent('rate_limit_exceeded', undefined, {
          action: 'sign-in',
          identifier: email,
          remainingAttempts: rateLimitCheck.remainingAttempts,
        });
        throw new Error(
          rateLimitCheck.message ||
            'Too many sign-in attempts. Please try again later.'
        );
      }

      // Record the attempt
      await SecurityUtils.recordRateLimitAttempt('sign-in', email, false);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Log failed sign-in attempt
        await SecurityUtils.logSecurityEvent('sign_in_failed', undefined, {
          email,
          error: error.message,
        });
        throw error;
      }

      // Record successful attempt
      await SecurityUtils.recordRateLimitAttempt('sign-in', email, true);
      await SecurityUtils.logSecurityEvent('sign_in_success', data.user?.id, {
        email,
      });

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as AuthError };
    }
  };

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    userData: Partial<UserProfile>
  ) => {
    try {
      // Check rate limiting before attempting sign up
      const rateLimitCheck = await SecurityUtils.checkRateLimit(
        'sign-up',
        email
      );
      if (!rateLimitCheck.allowed) {
        await SecurityUtils.logSecurityEvent('rate_limit_exceeded', undefined, {
          action: 'sign-up',
          identifier: email,
          remainingAttempts: rateLimitCheck.remainingAttempts,
        });
        throw new Error(
          rateLimitCheck.message ||
            'Too many sign-up attempts. Please try again later.'
        );
      }

      // Record the attempt
      await SecurityUtils.recordRateLimitAttempt('sign-up', email, false);

      // Sanitize user inputs
      const sanitizedData = {
        ...userData,
        full_name: userData.full_name
          ? SecurityUtils.escapeHtml(userData.full_name)
          : null,
        username: userData.username
          ? SecurityUtils.escapeHtml(userData.username)
          : null,
        constituency: userData.constituency
          ? SecurityUtils.escapeHtml(userData.constituency)
          : null,
        department_id: userData.department_id || null,
        role: userData.role || 'citizen',
      };

      // Create the user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: sanitizedData.full_name,
            username: sanitizedData.username || email.split('@')[0],
            constituency: sanitizedData.constituency,
            department_id: sanitizedData.department_id,
            role: sanitizedData.role,
            verification_status: sanitizedData.verification_status,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
          },
        },
      });

      if (error) {
        // Log failed sign-up attempt
        await SecurityUtils.logSecurityEvent('sign_up_failed', undefined, {
          email,
          error: error.message,
        });
        throw error;
      }

      // Record successful attempt
      await SecurityUtils.recordRateLimitAttempt('sign-up', email, true);
      await SecurityUtils.logSecurityEvent('sign_up_success', data.user?.id, {
        email,
      });

      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as AuthError };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error as Error };
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as AuthError };
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // Sanitize user inputs
      const sanitizedData = {
        ...data,
        full_name: data.full_name
          ? SecurityUtils.escapeHtml(data.full_name)
          : undefined,
        username: data.username
          ? SecurityUtils.escapeHtml(data.username)
          : undefined,
        constituency: data.constituency
          ? SecurityUtils.escapeHtml(data.constituency)
          : undefined,
        bio: data.bio ? SecurityUtils.sanitizeHtml(data.bio) : undefined,
      };

      // Update auth metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: sanitizedData.full_name,
          username: sanitizedData.username,
          constituency: sanitizedData.constituency,
          avatar_url: sanitizedData.avatar_url,
          banner_url: sanitizedData.banner_url,
        },
      });

      if (metadataError) throw metadataError;

      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: sanitizedData.full_name,
          username: sanitizedData.username,
          constituency: sanitizedData.constituency,
          avatar_url: sanitizedData.avatar_url,
          bio: sanitizedData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          ...sanitizedData,
        });
      }

      return { error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: error as Error };
    }
  };

  // Refresh the session periodically to keep the user logged in
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      console.log('Session refreshed successfully');
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  // Refresh the user profile from the database
  const refreshProfile = async () => {
    try {
      if (!user) {
        console.log('No user to refresh profile for');
        return;
      }

      console.log('Refreshing profile for user:', user.id);
      await getProfile(user.id);
      console.log('Profile refreshed successfully');
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  // Set up session refresh timer
  useEffect(() => {
    if (user && !sessionRefreshTimer) {
      // Refresh session every 30 minutes
      const timer = setInterval(refreshSession, 30 * 60 * 1000);
      setSessionRefreshTimer(timer);
    }

    return () => {
      if (sessionRefreshTimer) {
        clearInterval(sessionRefreshTimer);
        setSessionRefreshTimer(null);
      }
    };
  }, [user, sessionRefreshTimer]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        refreshSession,
        refreshProfile,
      }}
    >
      <SessionTimeoutHandler timeoutMinutes={30} warningMinutes={5}>
        {children}
      </SessionTimeoutHandler>
      <Toaster />
    </AuthContext.Provider>
  );
};
