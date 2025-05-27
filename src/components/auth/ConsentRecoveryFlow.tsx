import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast-enhanced';
import { useAuth } from '@/lib/auth';
import { useConsentStatus } from '@/hooks/useConsentStatus';
import { ConsentCompletionWizard } from './ConsentCompletionWizard';
import { 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Home,
  LogOut,
  Mail,
  Phone
} from 'lucide-react';

interface ConsentRecoveryFlowProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onComplete?: () => void;
  scenario?: 'session_timeout' | 'partial_signup' | 'verification_pending' | 'consent_failed' | 'account_locked';
}

const RECOVERY_SCENARIOS = {
  session_timeout: {
    title: 'Session Expired',
    description: 'Your session expired during the consent process',
    icon: Clock,
    color: 'amber',
  },
  partial_signup: {
    title: 'Incomplete Registration',
    description: 'Your account registration was not completed',
    icon: AlertTriangle,
    color: 'orange',
  },
  verification_pending: {
    title: 'Email Verification Pending',
    description: 'Please verify your email to continue',
    icon: Mail,
    color: 'blue',
  },
  consent_failed: {
    title: 'Consent Process Failed',
    description: 'There was an error processing your legal consent',
    icon: XCircle,
    color: 'red',
  },
  account_locked: {
    title: 'Account Access Restricted',
    description: 'Your account access is temporarily restricted',
    icon: AlertTriangle,
    color: 'red',
  },
};

export function ConsentRecoveryFlow({
  open = false,
  onOpenChange = () => {},
  onComplete = () => {},
  scenario = 'partial_signup',
}: ConsentRecoveryFlowProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { 
    consentStatus, 
    checkConsentStatus, 
    startRecovery, 
    isRecovering,
    error 
  } = useConsentStatus();
  
  const [showWizard, setShowWizard] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const scenarioInfo = RECOVERY_SCENARIOS[scenario];

  useEffect(() => {
    if (open && user?.id) {
      checkConsentStatus();
    }
  }, [open, user?.id, checkConsentStatus]);

  const handleRetryConsent = async () => {
    setIsRetrying(true);
    try {
      await startRecovery();
      toast({
        title: 'Status Refreshed',
        description: 'Your consent status has been updated.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Retry Failed',
        description: 'Unable to refresh consent status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleStartWizard = () => {
    setShowWizard(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onOpenChange(false);
      toast({
        title: 'Signed Out',
        description: 'You have been signed out successfully.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Sign Out Failed',
        description: 'There was an error signing out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleGoHome = () => {
    onOpenChange(false);
    window.location.href = '/';
  };

  const renderRecoveryOptions = () => {
    switch (scenario) {
      case 'session_timeout':
        return (
          <div className="space-y-4">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Your session expired while completing the consent process. You can continue where you left off.
              </AlertDescription>
            </Alert>
            
            <div className="grid gap-3">
              <Button onClick={handleStartWizard} className="w-full">
                <ArrowRight className="mr-2 h-4 w-4" />
                Continue Consent Process
              </Button>
              <Button variant="outline" onClick={handleRetryConsent} disabled={isRetrying}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                Refresh Status
              </Button>
            </div>
          </div>
        );

      case 'partial_signup':
        return (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your account was created but the registration process wasn't completed. Complete the remaining steps to activate your account.
              </AlertDescription>
            </Alert>

            {consentStatus && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Registration Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Account Created</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Legal Consent</span>
                    {consentStatus.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  {consentStatus.missingConsents.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground mb-1">Missing:</p>
                      <div className="flex flex-wrap gap-1">
                        {consentStatus.missingConsents.map((consent) => (
                          <Badge key={consent} variant="outline" className="text-xs">
                            {consent}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            <div className="grid gap-3">
              <Button onClick={handleStartWizard} className="w-full">
                <ArrowRight className="mr-2 h-4 w-4" />
                Complete Registration
              </Button>
              <Button variant="outline" onClick={handleRetryConsent} disabled={isRetrying}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                Check Status
              </Button>
            </div>
          </div>
        );

      case 'verification_pending':
        return (
          <div className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Please check your email and click the verification link to activate your account.
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <Mail className="h-8 w-8 mx-auto text-blue-500" />
                  <div>
                    <h4 className="font-medium">Check Your Email</h4>
                    <p className="text-sm text-muted-foreground">
                      We sent a verification link to {user?.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-3">
              <Button variant="outline" onClick={handleRetryConsent} disabled={isRetrying}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                I've Verified My Email
              </Button>
              <Button variant="outline" onClick={handleGoHome}>
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
            </div>
          </div>
        );

      case 'consent_failed':
        return (
          <div className="space-y-4">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                There was an error processing your legal consent. This may be due to a network issue or server problem.
              </AlertDescription>
            </Alert>

            {error && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Error Details</h4>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid gap-3">
              <Button onClick={handleStartWizard} className="w-full">
                <ArrowRight className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={handleRetryConsent} disabled={isRetrying}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                Refresh Status
              </Button>
            </div>
          </div>
        );

      case 'account_locked':
        return (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your account access is temporarily restricted. Please contact support for assistance.
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">WhatsApp: +267 72977535</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Email: support@civicportal.bw</span>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid gap-3">
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
              <Button variant="outline" onClick={handleGoHome}>
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                There seems to be an issue with your account. Please try the recovery options below.
              </AlertDescription>
            </Alert>
            
            <div className="grid gap-3">
              <Button onClick={handleStartWizard} className="w-full">
                <ArrowRight className="mr-2 h-4 w-4" />
                Complete Setup
              </Button>
              <Button variant="outline" onClick={handleRetryConsent} disabled={isRetrying}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                Refresh Status
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <scenarioInfo.icon className={`h-5 w-5 text-${scenarioInfo.color}-500`} />
              {scenarioInfo.title}
            </DialogTitle>
            <DialogDescription>
              {scenarioInfo.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {renderRecoveryOptions()}
          </div>
        </DialogContent>
      </Dialog>

      <ConsentCompletionWizard
        open={showWizard}
        onOpenChange={setShowWizard}
        onComplete={() => {
          setShowWizard(false);
          onComplete();
          onOpenChange(false);
        }}
      />
    </>
  );
}

export default ConsentRecoveryFlow;
