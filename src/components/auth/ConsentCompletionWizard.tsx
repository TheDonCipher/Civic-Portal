import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast-enhanced';
import { EnhancedLegalConsent } from './EnhancedLegalConsent';
import { useConsentStatus } from '@/hooks/useConsentStatus';
import { 
  storeLegalConsent, 
  CURRENT_LEGAL_VERSIONS,
  type ConsentValidationResult 
} from '@/lib/services/legalConsentService';
import { useAuth } from '@/lib/auth';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  ArrowLeft,
  RefreshCw,
  Shield,
  FileText,
  Users,
  Zap
} from 'lucide-react';

interface ConsentCompletionWizardProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onComplete?: () => void;
  userId?: string;
  showProgress?: boolean;
}

interface ConsentTimestamps {
  termsAcceptedAt?: Date;
  privacyAcceptedAt?: Date;
  dataProcessingAcceptedAt?: Date;
}

const CONSENT_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome',
    description: 'Complete your registration',
    icon: Users,
  },
  {
    id: 'legal',
    title: 'Legal Agreements',
    description: 'Accept required terms',
    icon: FileText,
  },
  {
    id: 'confirmation',
    title: 'Confirmation',
    description: 'Review and confirm',
    icon: CheckCircle,
  },
];

export function ConsentCompletionWizard({
  open = false,
  onOpenChange = () => {},
  onComplete = () => {},
  userId,
  showProgress = true,
}: ConsentCompletionWizardProps) {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { 
    consentStatus, 
    consentProgress, 
    checkConsentStatus, 
    isLoading: statusLoading,
    error: statusError,
    startRecovery 
  } = useConsentStatus();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [legalConsentsAccepted, setLegalConsentsAccepted] = useState(false);
  const [consentTimestamps, setConsentTimestamps] = useState<ConsentTimestamps>({});
  const [completionError, setCompletionError] = useState<string | null>(null);

  const targetUserId = userId || user?.id;

  // Check consent status when dialog opens
  useEffect(() => {
    if (open && targetUserId) {
      checkConsentStatus();
    }
  }, [open, targetUserId, checkConsentStatus]);

  // Auto-advance to legal step if user has missing consents
  useEffect(() => {
    if (consentStatus && consentStatus.missingConsents.length > 0) {
      setCurrentStep(1); // Go to legal agreements step
    }
  }, [consentStatus]);

  const handleNext = () => {
    if (currentStep < CONSENT_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteConsent = async () => {
    if (!targetUserId || !legalConsentsAccepted) {
      toast({
        title: 'Incomplete Information',
        description: 'Please accept all required legal agreements to continue.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setCompletionError(null);

    try {
      const consentResult = await storeLegalConsent(targetUserId, {
        termsAccepted: true,
        termsAcceptedAt: consentTimestamps.termsAcceptedAt,
        privacyAccepted: true,
        privacyAcceptedAt: consentTimestamps.privacyAcceptedAt,
        dataProcessingConsent: true,
        dataProcessingAcceptedAt: consentTimestamps.dataProcessingAcceptedAt,
        marketingOptIn: false,
        timestamp: new Date(),
        versions: CURRENT_LEGAL_VERSIONS,
      });

      if (!consentResult.success) {
        throw new Error(consentResult.error || 'Failed to store legal consent');
      }

      // Refresh profile and consent status
      await Promise.all([
        refreshProfile(),
        checkConsentStatus(),
      ]);

      toast({
        title: 'Legal Consent Completed!',
        description: 'Your account is now fully activated. Welcome to Civic Portal!',
        variant: 'success',
      });

      // Move to confirmation step
      setCurrentStep(2);
      
      // Auto-close after showing confirmation
      setTimeout(() => {
        onComplete();
        onOpenChange(false);
      }, 3000);

    } catch (error: any) {
      console.error('Error completing consent:', error);
      setCompletionError(error.message || 'Failed to complete consent process');
      
      toast({
        title: 'Consent Completion Failed',
        description: 'There was an error completing your consent. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderWelcomeStep = () => (
    <div className="space-y-6 text-center">
      <div className="space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Complete Your Registration</h3>
          <p className="text-muted-foreground mt-2">
            You're almost done! Just a few more steps to activate your account.
          </p>
        </div>
      </div>

      {consentProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completion Progress</span>
                <span>{consentProgress.progressPercentage}%</span>
              </div>
              <Progress value={consentProgress.progressPercentage} className="h-2" />
            </div>
            
            <div className="text-sm space-y-1">
              <p><strong>Completed:</strong> {consentProgress.completedSteps} of {consentProgress.totalSteps} agreements</p>
              {consentProgress.nextStep && (
                <p><strong>Next:</strong> {consentProgress.nextStep}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3 text-left">
        <h4 className="font-medium">What you'll need to do:</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <FileText className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium">Accept Legal Agreements</p>
              <p className="text-sm text-muted-foreground">Terms of Service, Privacy Policy, and Data Processing Agreement</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Shield className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">Account Activation</p>
              <p className="text-sm text-muted-foreground">Your account will be fully activated for all features</p>
            </div>
          </div>
        </div>
      </div>

      <Button onClick={handleNext} size="lg" className="w-full">
        Get Started
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  const renderLegalStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Legal Agreements</h3>
        <p className="text-muted-foreground">
          Please review and accept the required legal agreements to continue.
        </p>
      </div>

      {statusError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Error loading consent status: {statusError}</span>
            <Button variant="outline" size="sm" onClick={startRecovery}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {completionError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {completionError}
          </AlertDescription>
        </Alert>
      )}

      {consentStatus && consentStatus.missingConsents.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Missing Agreements:</p>
              <div className="flex flex-wrap gap-1">
                {consentStatus.missingConsents.map((consent) => (
                  <Badge key={consent} variant="outline">
                    {consent}
                  </Badge>
                ))}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <EnhancedLegalConsent
        onAccept={setLegalConsentsAccepted}
        onTimestampsChange={setConsentTimestamps}
        className="border rounded-lg p-4 bg-muted/20"
        disabled={isLoading || statusLoading}
      />

      <div className="flex gap-3">
        <Button variant="outline" onClick={handlePrevious} disabled={isLoading}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          onClick={handleCompleteConsent} 
          disabled={!legalConsentsAccepted || isLoading || statusLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Completing...
            </>
          ) : (
            <>
              Complete Registration
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-6 text-center">
      <div className="space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-green-600">Registration Complete!</h3>
          <p className="text-muted-foreground mt-2">
            Your account has been fully activated. You now have access to all Civic Portal features.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3 text-left">
            <h4 className="font-medium">What's next?</h4>
            <div className="space-y-2 text-sm">
              <p>• Explore civic issues in your area</p>
              <p>• Report problems in your community</p>
              <p>• Vote and comment on issues that matter to you</p>
              <p>• Propose solutions to help your community</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        This dialog will close automatically in a few seconds...
      </p>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderWelcomeStep();
      case 1:
        return renderLegalStep();
      case 2:
        return renderConfirmationStep();
      default:
        return renderWelcomeStep();
    }
  };

  const currentStepData = CONSENT_STEPS[currentStep];
  const progress = ((currentStep + 1) / CONSENT_STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <currentStepData.icon className="h-5 w-5 text-primary" />
            {currentStepData.title}
          </DialogTitle>
          <DialogDescription>
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep + 1} of {CONSENT_STEPS.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="space-y-6">
          {renderCurrentStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ConsentCompletionWizard;
