import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useConsentStatus } from '@/hooks/useConsentStatus';
import { ConsentCompletionWizard } from './ConsentCompletionWizard';
import { ConsentRecoveryFlow } from './ConsentRecoveryFlow';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Zap, 
  ArrowRight, 
  RefreshCw,
  Shield,
  FileText,
  Users,
  Info
} from 'lucide-react';

interface ConsentStatusWidgetProps {
  className?: string;
  variant?: 'full' | 'compact' | 'minimal';
  showActions?: boolean;
  showProgress?: boolean;
  showLastChecked?: boolean;
}

export function ConsentStatusWidget({
  className = '',
  variant = 'full',
  showActions = true,
  showProgress = true,
  showLastChecked = false,
}: ConsentStatusWidgetProps) {
  const {
    consentStatus,
    needsConsent,
    canProceed,
    consentProgress,
    error,
    isRecovering,
    startRecovery,
    lastChecked,
    checkConsentStatus,
  } = useConsentStatus();

  const [showWizard, setShowWizard] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  if (!consentStatus && !error) {
    return null; // Don't show widget if no status available
  }

  const getStatusInfo = () => {
    if (canProceed) {
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        title: 'Account Active',
        description: 'All legal agreements completed',
        color: 'green',
        variant: 'default' as const,
      };
    }

    if (needsConsent) {
      return {
        icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        title: 'Setup Required',
        description: 'Complete your registration',
        color: 'amber',
        variant: 'secondary' as const,
      };
    }

    return {
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      title: 'Checking Status',
      description: 'Verifying your account',
      color: 'blue',
      variant: 'outline' as const,
    };
  };

  const statusInfo = getStatusInfo();

  const handleStartWizard = () => {
    setShowWizard(true);
  };

  const handleShowRecovery = () => {
    setShowRecovery(true);
  };

  const handleRefresh = async () => {
    await checkConsentStatus();
  };

  if (variant === 'minimal') {
    return (
      <>
        <div className={`flex items-center gap-2 ${className}`}>
          {statusInfo.icon}
          <span className="text-sm font-medium">{statusInfo.title}</span>
          <Badge variant={statusInfo.variant} className="text-xs">
            {canProceed ? 'Active' : needsConsent ? 'Pending' : 'Checking'}
          </Badge>
          {showActions && needsConsent && (
            <Button size="sm" variant="outline" onClick={handleStartWizard}>
              Complete
            </Button>
          )}
        </div>

        <ConsentCompletionWizard
          open={showWizard}
          onOpenChange={setShowWizard}
          onComplete={() => setShowWizard(false)}
        />
      </>
    );
  }

  if (variant === 'compact') {
    return (
      <>
        <Card className={className}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {statusInfo.icon}
                <div>
                  <h4 className="font-medium text-sm">{statusInfo.title}</h4>
                  <p className="text-xs text-muted-foreground">{statusInfo.description}</p>
                </div>
              </div>
              
              {showActions && needsConsent && (
                <Button size="sm" onClick={handleStartWizard}>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </div>

            {showProgress && consentProgress && needsConsent && (
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{consentProgress.progressPercentage}% Complete</span>
                  <span>{consentProgress.completedSteps}/{consentProgress.totalSteps}</span>
                </div>
                <Progress value={consentProgress.progressPercentage} className="h-1" />
              </div>
            )}
          </CardContent>
        </Card>

        <ConsentCompletionWizard
          open={showWizard}
          onOpenChange={setShowWizard}
          onComplete={() => setShowWizard(false)}
        />
      </>
    );
  }

  // Full variant
  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {statusInfo.icon}
            Registration Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{statusInfo.title}</h4>
              <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
            </div>
            <Badge variant={statusInfo.variant}>
              {canProceed ? 'Complete' : needsConsent ? 'In Progress' : 'Checking'}
            </Badge>
          </div>

          {showProgress && consentProgress && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-500" />
                  Progress
                </span>
                <span>{consentProgress.progressPercentage}%</span>
              </div>
              <Progress value={consentProgress.progressPercentage} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {consentProgress.completedSteps} of {consentProgress.totalSteps} steps completed
                {consentProgress.nextStep && (
                  <span className="block mt-1">Next: {consentProgress.nextStep}</span>
                )}
              </div>
            </div>
          )}

          {needsConsent && consentStatus && consentStatus.missingConsents.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Required Actions:</h5>
              <div className="grid gap-2">
                {consentStatus.missingConsents.map((consent, index) => (
                  <div key={consent} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                      <span className="text-xs font-medium text-amber-600">{index + 1}</span>
                    </div>
                    <span className="text-sm">{consent}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm">Error: {error}</span>
                <Button variant="outline" size="sm" onClick={startRecovery} disabled={isRecovering}>
                  <RefreshCw className={`h-3 w-3 ${isRecovering ? 'animate-spin' : ''}`} />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {showLastChecked && lastChecked && (
            <p className="text-xs text-muted-foreground">
              Last updated: {lastChecked.toLocaleString()}
            </p>
          )}

          {showActions && (
            <div className="space-y-2">
              {needsConsent ? (
                <div className="grid gap-2">
                  <Button onClick={handleStartWizard} className="w-full">
                    <Zap className="mr-2 h-4 w-4" />
                    Complete Registration
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={handleShowRecovery}>
                      Need Help?
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Refresh
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700">Your account is fully activated!</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ConsentCompletionWizard
        open={showWizard}
        onOpenChange={setShowWizard}
        onComplete={() => setShowWizard(false)}
      />

      <ConsentRecoveryFlow
        open={showRecovery}
        onOpenChange={setShowRecovery}
        scenario="partial_signup"
        onComplete={() => setShowRecovery(false)}
      />
    </>
  );
}

export default ConsentStatusWidget;
