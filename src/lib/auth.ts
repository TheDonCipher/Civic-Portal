import { createContext, useContext } from "react";
import { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  role: string;
  updated_at: string;
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
  refreshSession?: () => Promise<any>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);
