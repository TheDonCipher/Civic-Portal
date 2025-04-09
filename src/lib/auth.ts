import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  constituency?: string | null;
  role?: "citizen" | "official" | "admin" | null;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: false,
});

export const useAuth = () => {
  return useContext(AuthContext);
};
