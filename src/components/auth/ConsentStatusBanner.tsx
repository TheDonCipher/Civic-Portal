import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useConsentStatus } from '@/hooks/useConsentStatus';
import { ConsentPendingDialog } from './ConsentPendingDialog';
import { ConsentCompletionWizard } from './ConsentCompletionWizard';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Info,
  RefreshCw,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface ConsentStatusBannerProps {
  className?: string;
  showOnlyIfNeeded?: boolean;
  variant?: 'banner' | 'card' | 'compact';
  showProgress?: boolean;
  showWizard?: boolean;
}

/**
 * Banner component that shows user's consent status and provides actions
 */
export function ConsentStatusBanner({
  className = '',
  showOnlyIfNeeded = true,
  variant = 'banner',
  showProgress = true,
  showWizard = false,
}: ConsentStatusBannerProps) {
  const {
    consentStatus,
    needsConsent,
    canProceed,
    showConsentDialog,
    setShowConsentDialog,
    checkConsentStatus,
    consentProgress,
    error,
    isRecovering,
    startRecovery,
    lastChecked,
  } = useConsentStatus();

  const [showWizardDialog, setShowWizardDialog] = useState(false);

  // Don't show banner if user doesn't need consent and showOnlyIfNeeded is true
  if (showOnlyIfNeeded && !needsConsent) {
    return null;
  }

  // Don't show if no consent status available
  if (!consentStatus) {
    return null;
  }

  const getStatusInfo = () => {
    if (canProceed) {
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        variant: 'default' as const,
        title: 'Account Active',
        description: 'All legal agreements have been accepted.',
        badgeText: 'Active',
        badgeVariant: 'default' as const,
        showAction: false,
      };
    }

    if (needsConsent) {
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        variant: 'destructive' as const,
        title: 'Legal Consent Required',
        description: `Please accept the following agreements: ${consentStatus.missingConsents.join(
          ', '
        )}`,
        badgeText: 'Pending Consent',
        badgeVariant: 'secondary' as const,
        showAction: true,
      };
    }

    return {
      icon: <Info className="h-4 w-4" />,
      variant: 'default' as const,
      title: 'Account Status',
      description: 'Your account status is being verified.',
      badgeText: 'Checking',
      badgeVariant: 'outline' as const,
      showAction: false,
    };
  };

  const statusInfo = getStatusInfo();

  const handleCompleteConsent = () => {
    if (showWizard) {
      setShowWizardDialog(true);
    } else {
      setShowConsentDialog(true);
    }
  };

  const handleConsentComplete = async () => {
    // Refresh consent status after completion
    await checkConsentStatus();
  };

  const handleRetry = () => {
    startRecovery();
  };

  // Render different variants
  if (variant === 'card') {
    return (
      <>
        <Card className={className}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {statusInfo.icon}
                  <h4 className="font-medium">{statusInfo.title}</h4>
                  <Badge variant={statusInfo.badgeVariant}>
                    {statusInfo.badgeText}
                  </Badge>
                </div>
                {error && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={isRecovering}
                  >
                    <RefreshCw
                      className={`h-3 w-3 mr-1 ${
                        isRecovering ? 'animate-spin' : ''
                      }`}
                    />
                    Retry
                  </Button>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                {statusInfo.description}
              </p>

              {showProgress && consentProgress && needsConsent && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500" />
                      Progress
                    </span>
                    <span>{consentProgress.progressPercentage}%</span>
                  </div>
                  <Progress
                    value={consentProgress.progressPercentage}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {consentProgress.completedSteps} of{' '}
                    {consentProgress.totalSteps} agreements completed
                  </p>
                </div>
              )}

              {needsConsent &&
                consentStatus &&
                consentStatus.missingConsents.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Missing agreements:</p>
                    <div className="flex flex-wrap gap-1">
                      {consentStatus.missingConsents.map((consent) => (
                        <Badge
                          key={consent}
                          variant="outline"
                          className="text-xs"
                        >
                          {consent}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {lastChecked && (
                <p className="text-xs text-muted-foreground">
                  Last checked: {lastChecked.toLocaleTimeString()}
                </p>
              )}

              {statusInfo.showAction && (
                <Button onClick={handleCompleteConsent} className="w-full">
                  {showWizard ? (
                    <>
                      Start Setup Wizard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    'Complete Consent'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {showWizard ? (
          <ConsentCompletionWizard
            open={showWizardDialog}
            onOpenChange={setShowWizardDialog}
            onComplete={handleConsentComplete}
          />
        ) : (
          <ConsentPendingDialog
            open={showConsentDialog}
            onOpenChange={setShowConsentDialog}
            onConsentComplete={handleConsentComplete}
          />
        )}
      </>
    );
  }

  if (variant === 'compact') {
    return (
      <>
        <div
          className={`flex items-center justify-between p-3 border rounded-lg ${className}`}
        >
          <div className="flex items-center gap-2">
            {statusInfo.icon}
            <span className="text-sm font-medium">{statusInfo.title}</span>
            <Badge variant={statusInfo.badgeVariant} className="text-xs">
              {statusInfo.badgeText}
            </Badge>
          </div>
          {statusInfo.showAction && (
            <Button size="sm" onClick={handleCompleteConsent}>
              {showWizard ? 'Setup' : 'Complete'}
            </Button>
          )}
        </div>

        {showWizard ? (
          <ConsentCompletionWizard
            open={showWizardDialog}
            onOpenChange={setShowWizardDialog}
            onComplete={handleConsentComplete}
          />
        ) : (
          <ConsentPendingDialog
            open={showConsentDialog}
            onOpenChange={setShowConsentDialog}
            onConsentComplete={handleConsentComplete}
          />
        )}
      </>
    );
  }

  // Default banner variant
  return (
    <>
      <Alert variant={statusInfo.variant} className={className}>
        <div className="flex items-start justify-between w-full">
          <div className="flex items-start space-x-3">
            {statusInfo.icon}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">{statusInfo.title}</h4>
                <Badge variant={statusInfo.badgeVariant} className="text-xs">
                  {statusInfo.badgeText}
                </Badge>
              </div>
              <AlertDescription className="text-sm">
                {statusInfo.description}
              </AlertDescription>

              {showProgress && consentProgress && needsConsent && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500" />
                      {consentProgress.progressPercentage}% Complete
                    </span>
                    <span>
                      {consentProgress.completedSteps}/
                      {consentProgress.totalSteps}
                    </span>
                  </div>
                  <Progress
                    value={consentProgress.progressPercentage}
                    className="h-1"
                  />
                </div>
              )}

              {needsConsent &&
                consentStatus &&
                consentStatus.missingConsents.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">
                      Missing agreements:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {consentStatus.missingConsents.map((consent) => (
                        <Badge
                          key={consent}
                          variant="outline"
                          className="text-xs"
                        >
                          {consent}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {error && (
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-xs text-destructive">Error: {error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={isRecovering}
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${
                        isRecovering ? 'animate-spin' : ''
                      }`}
                    />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {statusInfo.showAction && (
            <div className="flex-shrink-0 ml-4">
              <Button
                size="sm"
                onClick={handleCompleteConsent}
                className="whitespace-nowrap"
              >
                {showWizard ? (
                  <>
                    Setup Wizard
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </>
                ) : (
                  'Complete Consent'
                )}
              </Button>
            </div>
          )}
        </div>
      </Alert>

      {showWizard ? (
        <ConsentCompletionWizard
          open={showWizardDialog}
          onOpenChange={setShowWizardDialog}
          onComplete={handleConsentComplete}
        />
      ) : (
        <ConsentPendingDialog
          open={showConsentDialog}
          onOpenChange={setShowConsentDialog}
          onConsentComplete={handleConsentComplete}
        />
      )}
    </>
  );
}

/**
 * Compact version for headers/navigation
 */
export function ConsentStatusIndicator({
  className = '',
}: {
  className?: string;
}) {
  const { needsConsent, canProceed, setShowConsentDialog } = useConsentStatus();

  if (canProceed) {
    return null; // Don't show anything if user can proceed
  }

  if (needsConsent) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowConsentDialog(true)}
        className={`text-amber-600 border-amber-200 hover:bg-amber-50 ${className}`}
      >
        <AlertTriangle className="h-3 w-3 mr-1" />
        Complete Consent
      </Button>
    );
  }

  return null;
}

/**
 * Simple badge for showing consent status
 */
export function ConsentStatusBadge({ className = '' }: { className?: string }) {
  const { consentStatus, needsConsent, canProceed } = useConsentStatus();

  if (!consentStatus) {
    return null;
  }

  const getStatusBadge = () => {
    if (canProceed) {
      return (
        <Badge variant="default" className={`${className}`}>
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }

    if (needsConsent) {
      return (
        <Badge variant="secondary" className={`${className}`}>
          <Clock className="h-3 w-3 mr-1" />
          Pending Consent
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className={`${className}`}>
        <Info className="h-3 w-3 mr-1" />
        Checking
      </Badge>
    );
  };

  return getStatusBadge();
}

export default ConsentStatusBanner;
