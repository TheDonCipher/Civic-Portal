import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  AlertTriangle,
  Home,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface VerificationPendingProps {
  status: 'pending' | 'verified' | 'rejected';
  userRole: string;
  fullName?: string;
  email?: string;
  department?: string;
  onContactSupport?: () => void;
  onReturnHome?: () => void;
}

export const VerificationPending: React.FC<VerificationPendingProps> = ({
  status,
  userRole,
  fullName,
  email,
  department,
  onContactSupport,
  onReturnHome,
}) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          title: 'Verification Pending',
          description:
            'Your government official account is awaiting admin verification.',
          color: 'amber',
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
          iconColor: 'text-amber-600 dark:text-amber-400',
          badgeVariant: 'secondary' as const,
        };
      case 'verified':
        return {
          icon: CheckCircle,
          title: 'Account Verified',
          description:
            'Your government official account has been verified and approved.',
          color: 'green',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          iconColor: 'text-green-600 dark:text-green-400',
          badgeVariant: 'default' as const,
        };
      case 'rejected':
        return {
          icon: XCircle,
          title: 'Verification Rejected',
          description:
            'Your government official account verification was not approved.',
          color: 'red',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          iconColor: 'text-red-600 dark:text-red-400',
          badgeVariant: 'destructive' as const,
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Unknown Status',
          description: 'Unable to determine verification status.',
          color: 'gray',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          iconColor: 'text-gray-600 dark:text-gray-400',
          badgeVariant: 'outline' as const,
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div
              className={cn(
                'p-3 rounded-full',
                config.bgColor,
                config.borderColor,
                'border-2'
              )}
            >
              <StatusIcon className={cn('h-8 w-8', config.iconColor)} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {config.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            Civic Portal Botswana - Government Official Access
          </p>
        </div>

        {/* Main Status Card */}
        <Card
          className={cn(
            config.bgColor,
            config.borderColor,
            'border-2 shadow-lg'
          )}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Status
              </span>
              <Badge variant={config.badgeVariant}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">{config.description}</p>

            {/* User Information */}
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                Account Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {fullName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{fullName}</span>
                  </div>
                )}
                {email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{email}</span>
                  </div>
                )}
                {department && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>{department}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {userRole}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Status-specific content */}
            {status === 'pending' && (
              <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-lg p-4">
                <h4 className="font-medium text-sm text-amber-800 dark:text-amber-200 mb-2">
                  What happens next?
                </h4>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• An administrator will review your account details</li>
                  <li>• You'll receive an email notification once verified</li>
                  <li>• Verification typically takes 1-3 business days</li>
                  <li>
                    • You can browse the portal as a citizen in the meantime
                  </li>
                </ul>
              </div>
            )}

            {status === 'rejected' && (
              <div className="bg-red-50/50 dark:bg-red-900/10 rounded-lg p-4">
                <h4 className="font-medium text-sm text-red-800 dark:text-red-200 mb-2">
                  Next Steps
                </h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• Contact support for more information</li>
                  <li>• Ensure all provided information is accurate</li>
                  <li>• You may reapply with correct documentation</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={onReturnHome || (() => navigate('/'))}
            variant="default"
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Browse as Citizen
          </Button>

          {(status === 'rejected' || status === 'pending') &&
            onContactSupport && (
              <Button
                onClick={onContactSupport}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                Contact Support
              </Button>
            )}

          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="flex items-center gap-2"
          >
            Sign Out
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Need help? Contact the Civic Portal support team at{' '}
            <a
              href="mailto:support@civicportal.gov.bw"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              support@civicportal.gov.bw
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;
