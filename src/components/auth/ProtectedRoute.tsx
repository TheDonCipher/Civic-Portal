import React, { useEffect } from "react";
import { Navigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireOwnership?: boolean; // New prop to check if user owns the resource
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireOwnership = false,
}) => {
  const { user, profile, isLoading } = useAuth();
  const { toast } = useToast();
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();

  // Show loading state while auth state is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to home with signin param
  if (!user) {
    toast({
      title: "Authentication Required",
      description: "Please sign in to access this page",
      variant: "destructive",
    });
    return <Navigate to="/?signin=true" replace />;
  }

  // If specific roles are required, check if user has one of them
  if (
    allowedRoles.length > 0 &&
    (!profile?.role || !allowedRoles.includes(profile.role))
  ) {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access this page",
      variant: "destructive",
    });
    return <Navigate to="/" replace />;
  }

  // If ownership is required (for user-specific routes), check if the user owns the resource
  if (requireOwnership && userId && userId !== user.id) {
    // Allow admins to access any user's resources
    if (profile?.role !== "admin") {
      return <Navigate to={`/user/${user.id}`} replace />;
    }
  }

  // For user-specific routes, ensure the userId matches the authenticated user
  // unless they're an admin
  if (
    location.pathname.startsWith("/user/") &&
    userId &&
    userId !== user.id &&
    profile?.role !== "admin"
  ) {
    return <Navigate to={`/user/${user.id}`} replace />;
  }

  // User is authenticated and has required permissions, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
