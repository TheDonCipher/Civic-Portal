import { createContext, useContext } from 'react';
import type { User, AuthError } from '@supabase/supabase-js';
import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
  constituency?: string | null;
  role?: 'citizen' | 'official' | 'admin' | null;
  department_id?: string | null;
  verification_status?: 'pending' | 'verified' | 'rejected' | null;
  bio?: string | null;
  is_verified?: boolean;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    userData: Partial<UserProfile>
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (
    data: Partial<UserProfile>
  ) => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  updateProfile: async () => ({ error: null }),
  refreshSession: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};
