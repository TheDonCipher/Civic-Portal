import React, { ReactNode, useState } from 'react';
import { useConsentGuard } from '@/hooks/useConsentStatus';
import { ConsentPendingDialog } from './ConsentPendingDialog';
import { ConsentStatusBanner } from './ConsentStatusBanner';
import { ConsentCompletionWizard } from './ConsentCompletionWizard';
import { ConsentRecoveryFlow } from './ConsentRecoveryFlow';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Lock, Zap, ArrowRight, RefreshCw } from 'lucide-react';

interface ConsentProtectedRouteProps {
  children: ReactNode;
  requiredAction?:
    | 'create_issue'
    | 'comment'
    | 'vote'
    | 'watch'
    | 'full_access';
  fallback?: ReactNode;
  showBanner?: boolean;
  blockAccess?: boolean; // If true, completely blocks access until consent is given
  enhancedUX?: boolean; // Use enhanced UX with wizard and recovery flows
  showProgress?: boolean; // Show progress indicators
  recoveryScenario?:
    | 'session_timeout'
    | 'partial_signup'
    | 'verification_pending'
    | 'consent_failed'
    | 'account_locked';
}

/**
 * Component that protects routes/actions based on user consent status
 */
export function ConsentProtectedRoute({
  children,
  requiredAction = 'full_access',
  fallback,
  showBanner = true,
  blockAccess = false,
  enhancedUX = false,
  showProgress = true,
  recoveryScenario = 'partial_signup',
}: ConsentProtectedRouteProps) {
  const {
    needsConsent,
    canProceed,
    showConsentDialog,
    setShowConsentDialog,
    requireConsent,
    consentProgress,
    error,
    isRecovering,
    startRecovery,
  } = useConsentGuard();

  const [showWizard, setShowWizard] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  // If user can proceed normally, render children
  if (canProceed) {
    return <>{children}</>;
  }

  // If blocking access and user needs consent, show blocked state
  if (blockAccess && needsConsent) {
    if (enhancedUX) {
      return (
        <>
          <div className="min-h-[400px] flex items-center justify-center p-8">
            <Card className="max-w-lg w-full">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <Lock className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle className="text-xl">
                  Legal Consent Required
                </CardTitle>
                <p className="text-muted-foreground">
                  Complete your registration to access all features
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {showProgress && consentProgress && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-amber-500" />
                        Registration Progress
                      </span>
                      <span>{consentProgress.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${consentProgress.progressPercentage}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {consentProgress.completedSteps} of{' '}
                      {consentProgress.totalSteps} steps completed
                    </p>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>Error: {error}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={startRecovery}
                        disabled={isRecovering}
                      >
                        <RefreshCw
                          className={`h-3 w-3 ${
                            isRecovering ? 'animate-spin' : ''
                          }`}
                        />
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-3">
                  <Button
                    onClick={() => setShowWizard(true)}
                    size="lg"
                    className="w-full"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Start Setup Wizard
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowRecovery(true)}
                    >
                      Need Help?
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowConsentDialog(true)}
                    >
                      Quick Setup
                    </Button>
                  </div>
                </div>

                {fallback && <div className="pt-4 border-t">{fallback}</div>}
              </CardContent>
            </Card>
          </div>

          <ConsentCompletionWizard
            open={showWizard}
            onOpenChange={setShowWizard}
            onComplete={() => {
              setShowWizard(false);
            }}
          />

          <ConsentRecoveryFlow
            open={showRecovery}
            onOpenChange={setShowRecovery}
            scenario={recoveryScenario}
            onComplete={() => {
              setShowRecovery(false);
            }}
          />

          <ConsentPendingDialog
            open={showConsentDialog}
            onOpenChange={setShowConsentDialog}
            onConsentComplete={() => {
              // Component will re-render and show children after consent completion
            }}
          />
        </>
      );
    }

    // Default blocked state
    return (
      <>
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-amber-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Legal Consent Required</h2>
              <p className="text-muted-foreground">
                You need to accept the required legal agreements to access this
                feature.
              </p>
            </div>

            <Button onClick={() => setShowConsentDialog(true)} size="lg">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Complete Legal Consent
            </Button>

            {fallback && <div className="pt-4 border-t">{fallback}</div>}
          </div>
        </div>

        <ConsentPendingDialog
          open={showConsentDialog}
          onOpenChange={setShowConsentDialog}
          onConsentComplete={() => {
            // Component will re-render and show children after consent completion
          }}
        />
      </>
    );
  }

  // If not blocking access but showing banner, render children with banner
  if (showBanner && needsConsent) {
    return (
      <>
        <ConsentStatusBanner
          className="mb-4"
          variant={enhancedUX ? 'card' : 'banner'}
          showProgress={showProgress}
          showWizard={enhancedUX}
        />
        {children}

        {enhancedUX ? (
          <>
            <ConsentCompletionWizard
              open={showWizard}
              onOpenChange={setShowWizard}
              onComplete={() => {
                setShowWizard(false);
              }}
            />
            <ConsentRecoveryFlow
              open={showRecovery}
              onOpenChange={setShowRecovery}
              scenario={recoveryScenario}
              onComplete={() => {
                setShowRecovery(false);
              }}
            />
          </>
        ) : (
          <ConsentPendingDialog
            open={showConsentDialog}
            onOpenChange={setShowConsentDialog}
            onConsentComplete={() => {
              // Component will re-render after consent completion
            }}
          />
        )}
      </>
    );
  }

  // Default: render children (for cases where consent is not strictly required)
  return <>{children}</>;
}

/**
 * Higher-order component for protecting specific actions
 */
interface ConsentProtectedActionProps {
  children: (props: {
    canPerformAction: boolean;
    requestConsent: () => void;
    needsConsent: boolean;
  }) => ReactNode;
  action: 'create_issue' | 'comment' | 'vote' | 'watch' | 'full_access';
}

export function ConsentProtectedAction({
  children,
  action,
}: ConsentProtectedActionProps) {
  const { requireConsent, needsConsent, setShowConsentDialog } =
    useConsentGuard();

  const canPerformAction = requireConsent(action);
  const requestConsent = () => setShowConsentDialog(true);

  return (
    <>
      {children({ canPerformAction, requestConsent, needsConsent })}
      <ConsentPendingDialog
        open={false} // Controlled by the hook
        onOpenChange={setShowConsentDialog}
        onConsentComplete={() => {
          // Action can be retried after consent completion
        }}
      />
    </>
  );
}

/**
 * Simple wrapper for buttons that require consent
 */
interface ConsentProtectedButtonProps {
  children: ReactNode;
  action: 'create_issue' | 'comment' | 'vote' | 'watch' | 'full_access';
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  [key: string]: any; // Allow other button props
}

export function ConsentProtectedButton({
  children,
  action,
  onClick,
  disabled = false,
  ...buttonProps
}: ConsentProtectedButtonProps) {
  return (
    <ConsentProtectedAction action={action}>
      {({ canPerformAction, requestConsent }) => (
        <Button
          {...buttonProps}
          disabled={disabled}
          onClick={() => {
            if (canPerformAction) {
              onClick();
            } else {
              requestConsent();
            }
          }}
        >
          {children}
        </Button>
      )}
    </ConsentProtectedAction>
  );
}

/**
 * Alert component for showing consent requirements
 */
export function ConsentRequiredAlert({
  action,
  className = '',
}: {
  action: string;
  className?: string;
}) {
  const { setShowConsentDialog } = useConsentGuard();

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <span>
            Legal consent is required to {action}. Please complete the required
            agreements.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConsentDialog(true)}
            className="ml-4"
          >
            Complete Consent
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default ConsentProtectedRoute;
