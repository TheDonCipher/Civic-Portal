import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth as useAuthContext } from "@/lib/auth";
import { handleAuthError } from "@/lib/utils/errorHandler";

/**
 * Custom hook for protected routes and authentication state management
 */
export const useAuth = (
  requireAuth: boolean = false,
  redirectTo: string = "/?signin=true",
) => {
  const auth = useAuthContext();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for the auth state to be loaded
      if (auth.isLoading) return;

      // If authentication is required but user is not logged in
      if (requireAuth && !auth.user) {
        handleAuthError(new Error("Authentication required"), {
          toastTitle: "Authentication Required",
          toastDescription: "Please sign in to access this page",
          toastVariant: "warning",
          showToast: true,
        });
        navigate(redirectTo);
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [auth.isLoading, auth.user, requireAuth, navigate, redirectTo]);

  return {
    ...auth,
    isCheckingAuth,
    isAuthenticated: !!auth.user,
  };
};

/**
 * Custom hook for role-based access control
 */
export const useAuthRole = (
  allowedRoles: string[],
  redirectTo: string = "/",
) => {
  const auth = useAuthContext();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      // Wait for the auth state to be loaded
      if (auth.isLoading) return;

      // If user is not logged in
      if (!auth.user || !auth.profile) {
        handleAuthError(new Error("Authentication required"), {
          toastTitle: "Authentication Required",
          toastDescription: "Please sign in to access this page",
          toastVariant: "warning",
          showToast: true,
        });
        navigate("/?signin=true");
        setHasAccess(false);
        setIsCheckingRole(false);
        return;
      }

      // Check if user has the required role
      const userRole = auth.profile.role || "citizen";
      const hasRequiredRole = allowedRoles.includes(userRole);

      if (!hasRequiredRole) {
        handleAuthError(new Error("Insufficient permissions"), {
          toastTitle: "Access Denied",
          toastDescription: "You do not have permission to access this page",
          toastVariant: "destructive",
          showToast: true,
        });
        navigate(redirectTo);
        setHasAccess(false);
      } else {
        setHasAccess(true);
      }

      setIsCheckingRole(false);
    };

    checkRole();
  }, [
    auth.isLoading,
    auth.user,
    auth.profile,
    allowedRoles,
    navigate,
    redirectTo,
  ]);

  return {
    ...auth,
    hasAccess,
    isCheckingRole,
  };
};
