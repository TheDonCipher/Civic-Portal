import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast-enhanced';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  XCircle, 
  RefreshCw, 
  Eye,
  Mail,
  HelpCircle
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { type UserConsentStatus } from '@/lib/api/adminConsentApi';
import { refreshUserConsentStatus } from '@/lib/api/adminConsentApi';

interface ConsentStatusColumnProps {
  userConsentStatus: UserConsentStatus | null;
  onRefresh?: (userId: string) => void;
  onViewDetails?: (userId: string) => void;
  onSendReminder?: (userId: string) => void;
  isLoading?: boolean;
}

export function ConsentStatusColumn({
  userConsentStatus,
  onRefresh,
  onViewDetails,
  onSendReminder,
  isLoading = false,
}: ConsentStatusColumnProps) {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!userConsentStatus) {
    return (
      <div className="flex items-center gap-2">
        <HelpCircle className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Unknown</span>
      </div>
    );
  }

  const getStatusInfo = () => {
    switch (userConsentStatus.consentStatus) {
      case 'complete':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          badge: <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Complete</Badge>,
          description: 'All legal agreements completed',
          color: 'green',
        };
      case 'pending':
        return {
          icon: <Clock className="h-4 w-4 text-amber-500" />,
          badge: <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>,
          description: 'Some agreements still pending',
          color: 'amber',
        };
      case 'incomplete':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
          badge: <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Incomplete</Badge>,
          description: 'Registration not completed',
          color: 'orange',
        };
      case 'failed':
        return {
          icon: <XCircle className="h-4 w-4 text-red-500" />,
          badge: <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Failed</Badge>,
          description: userConsentStatus.errorMessage || 'Consent validation failed',
          color: 'red',
        };
      default:
        return {
          icon: <HelpCircle className="h-4 w-4 text-muted-foreground" />,
          badge: <Badge variant="outline">Unknown</Badge>,
          description: 'Status could not be determined',
          color: 'gray',
        };
    }
  };

  const statusInfo = getStatusInfo();

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const result = await refreshUserConsentStatus(userConsentStatus.userId);
      
      if (result.success) {
        toast({
          title: 'Status Refreshed',
          description: 'User consent status has been updated.',
          variant: 'success',
        });
        onRefresh?.(userConsentStatus.userId);
      } else {
        throw new Error(result.error || 'Failed to refresh status');
      }
    } catch (error: any) {
      console.error('Error refreshing consent status:', error);
      toast({
        title: 'Refresh Failed',
        description: error.message || 'Failed to refresh consent status.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewDetails = () => {
    onViewDetails?.(userConsentStatus.userId);
  };

  const handleSendReminder = () => {
    onSendReminder?.(userConsentStatus.userId);
  };

  const showProgress = userConsentStatus.consentStatus !== 'complete' && userConsentStatus.consentProgress > 0;
  const showActions = userConsentStatus.consentStatus !== 'complete';

  return (
    <div className="space-y-2">
      {/* Status Badge and Icon */}
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                {statusInfo.icon}
                {statusInfo.badge}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{statusInfo.description}</p>
              {userConsentStatus.lastConsentCheck && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last checked: {userConsentStatus.lastConsentCheck.toLocaleString()}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-1">
          <Progress 
            value={userConsentStatus.consentProgress} 
            className="h-2"
          />
          <div className="text-xs text-muted-foreground">
            {Math.round(userConsentStatus.consentProgress)}% complete
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleViewDetails}
                  disabled={isLoading}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View consent details</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleRefresh}
                  disabled={isLoading || isRefreshing}
                >
                  <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh status</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {userConsentStatus.consentStatus === 'pending' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={handleSendReminder}
                    disabled={isLoading}
                  >
                    <Mail className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send reminder</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}

      {/* Complete Status Actions */}
      {userConsentStatus.consentStatus === 'complete' && (
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleViewDetails}
                  disabled={isLoading}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View consent history</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleRefresh}
                  disabled={isLoading || isRefreshing}
                >
                  <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh status</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}

export default ConsentStatusColumn;
