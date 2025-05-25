import React, { useEffect, useState, useMemo } from 'react';
import { Navigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';

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
  // Always call all hooks at the top level
  const { user, profile, isLoading } = useAuth();
  const { toast } = useToast();
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const [hasShownToast, setHasShownToast] = useState(false);

  // Calculate authentication and authorization status
  const authStatus = useMemo(() => {
    if (isLoading) return 'loading';
    if (!user) return 'unauthenticated';

    if (
      allowedRoles.length > 0 &&
      (!profile?.role || !allowedRoles.includes(profile.role))
    ) {
      return 'unauthorized';
    }

    if (
      requireOwnership &&
      userId &&
      userId !== user.id &&
      profile?.role !== 'admin'
    ) {
      return 'ownership_denied';
    }

    if (
      location.pathname.startsWith('/user/') &&
      userId &&
      userId !== user.id &&
      profile?.role !== 'admin'
    ) {
      return 'user_mismatch';
    }

    return 'authorized';
  }, [
    isLoading,
    user,
    profile,
    allowedRoles,
    requireOwnership,
    userId,
    location.pathname,
  ]);

  // Handle toast notifications
  useEffect(() => {
    if (!hasShownToast && !isLoading) {
      if (authStatus === 'unauthenticated') {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to access this page',
          variant: 'destructive',
        });
        setHasShownToast(true);
      } else if (authStatus === 'unauthorized') {
        toast({
          title: 'Access Denied',
          description: "You don't have permission to access this page",
          variant: 'destructive',
        });
        setHasShownToast(true);
      }
    }
  }, [authStatus, hasShownToast, isLoading, toast]);

  // Reset toast state when auth status changes
  useEffect(() => {
    setHasShownToast(false);
  }, [user?.id, profile?.role]);

  // Render based on auth status
  switch (authStatus) {
    case 'loading':
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );

    case 'unauthenticated':
      return <Navigate to="/?signin=true" replace />;

    case 'unauthorized':
      return <Navigate to="/" replace />;

    case 'ownership_denied':
      return <Navigate to={`/user/${user?.id}`} replace />;

    case 'user_mismatch':
      return <Navigate to={`/user/${user?.id}`} replace />;

    case 'authorized':
      return <>{children}</>;

    default:
      return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;
