import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  constituency?: string | null;
  role?: "citizen" | "official" | "admin" | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn?: (email: string, password: string) => Promise<any>;
  signUp?: (
    email: string,
    password: string,
    userData?: Partial<UserProfile>,
  ) => Promise<any>;
  signOut?: () => Promise<any>;
  updateProfile?: (data: Partial<UserProfile>) => Promise<any>;
  resetPassword?: (email: string) => Promise<any>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: false,
});

export const useAuth = () => {
  return useContext(AuthContext);
};
