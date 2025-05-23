import React, { useEffect, useState } from "react";
import { AuthContext } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { User, AuthError } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/auth";
import { Toaster } from "@/components/ui/toaster-enhanced";
import { useToast } from "@/components/ui/use-toast-enhanced";
import {
  handleApiError,
  handleAuthError,
  showSuccess,
} from "@/lib/utils/errorHandler";
import { sanitizeInput } from "@/lib/utils/securityUtils";

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
          "Initial session check:",
          session?.user?.id ? "Logged in" : "Not logged in",
        );

        setUser(session?.user ?? null);
        if (session?.user) {
          getProfile(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);

      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id);

        // Redirect to user dashboard after successful sign in
        if (event === "SIGNED_IN" && window.location.pathname === "/") {
          const params = new URLSearchParams(window.location.search);
          if (!params.get("demo")) {
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
          event === "SIGNED_OUT" &&
          window.location.pathname.startsWith("/user/")
        ) {
          window.location.href = "/";
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getProfile = async (userId: string) => {
    try {
      let profileData = null;

      // First try to get the profile from the database
      let { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Profile doesn't exist yet, this can happen if the trigger failed
          const session = await supabase.auth.getSession();
          const metadata = session?.data?.session?.user?.user_metadata;

          if (metadata) {
            // Create a default profile for the user
            const defaultProfile = {
              id: userId,
              username: metadata.username || userId.substring(0, 8),
              full_name: metadata.full_name || "John Doe",
              constituency: metadata.constituency || "Gaborone central",
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
              role: "citizen",
            };

            // Enable RLS for this operation
            const { error: insertError } =
              await supabase.auth.admin.updateUserById(userId, {
                app_metadata: { role: "citizen" },
              });

            if (insertError) {
              console.error("Error updating user role:", insertError);
            }

            // Insert the profile using service role if available
            const { error: profileInsertError } = await supabase
              .from("profiles")
              .insert([defaultProfile]);

            if (profileInsertError) {
              console.error("Error inserting profile:", profileInsertError);
              // Use the default profile even if we couldn't save it
              profileData = defaultProfile;
            } else {
              // Successfully inserted, now try to get it back
              const { data: newData, error: newError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

              if (newError) {
                console.error("Error fetching new profile:", newError);
                profileData = defaultProfile;
              } else {
                profileData = newData;
              }
            }
          }
        } else {
          console.error("Error fetching profile:", error);
          // Create a default profile in memory if we can't get it from the database
          profileData = {
            id: userId,
            username: "user_" + userId.substring(0, 5),
            full_name: "John Doe",
            constituency: "Gaborone central",
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
            role: "citizen",
          };
        }
      } else {
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
            (profileData.role as "citizen" | "official" | "admin" | null) ||
            "citizen",
        });
      }
    } catch (error: any) {
      console.error("Error loading user profile:", error);
      toast({
        title: "Profile Error",
        description:
          "There was an error loading your profile. Please try refreshing the page.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error: error as AuthError };
    }
  };

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    userData: Partial<UserProfile>,
  ) => {
    try {
      // Sanitize user inputs
      const sanitizedData = {
        ...userData,
        full_name: userData.full_name
          ? sanitizeInput(userData.full_name)
          : null,
        username: userData.username ? sanitizeInput(userData.username) : null,
        constituency: userData.constituency
          ? sanitizeInput(userData.constituency)
          : null,
      };

      // Create the user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: sanitizedData.full_name,
            username: sanitizedData.username || email.split("@")[0],
            constituency: sanitizedData.constituency,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
          },
        },
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Sign up error:", error);
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
      console.error("Sign out error:", error);
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
      console.error("Reset password error:", error);
      return { error: error as AuthError };
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error("User not authenticated");

      // Sanitize user inputs
      const sanitizedData = {
        ...data,
        full_name: data.full_name ? sanitizeInput(data.full_name) : undefined,
        username: data.username ? sanitizeInput(data.username) : undefined,
        constituency: data.constituency
          ? sanitizeInput(data.constituency)
          : undefined,
      };

      // Update auth metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          full_name: sanitizedData.full_name,
          username: sanitizedData.username,
          constituency: sanitizedData.constituency,
          avatar_url: sanitizedData.avatar_url,
        },
      });

      if (metadataError) throw metadataError;

      // Update profile in database
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: sanitizedData.full_name,
          username: sanitizedData.username,
          constituency: sanitizedData.constituency,
          avatar_url: sanitizedData.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

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
      console.error("Update profile error:", error);
      return { error: error as Error };
    }
  };

  // Refresh the session periodically to keep the user logged in
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      console.log("Session refreshed successfully");
    } catch (error) {
      console.error("Error refreshing session:", error);
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
      }}
    >
      {children}
      <Toaster />
    </AuthContext.Provider>
  );
};
