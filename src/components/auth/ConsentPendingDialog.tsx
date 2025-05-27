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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast-enhanced';
import { EnhancedLegalConsent } from './EnhancedLegalConsent';
import { 
  validateUserConsentStatus, 
  storeLegalConsent, 
  CURRENT_LEGAL_VERSIONS,
  type ConsentValidationResult 
} from '@/lib/services/legalConsentService';
import { useAuth } from '@/lib/auth';
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface ConsentPendingDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConsentComplete?: () => void;
  userId?: string;
}

interface ConsentTimestamps {
  termsAcceptedAt?: Date;
  privacyAcceptedAt?: Date;
  dataProcessingAcceptedAt?: Date;
}

export function ConsentPendingDialog({
  open = false,
  onOpenChange = () => {},
  onConsentComplete = () => {},
  userId,
}: ConsentPendingDialogProps) {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [consentStatus, setConsentStatus] = useState<ConsentValidationResult | null>(null);
  const [legalConsentsAccepted, setLegalConsentsAccepted] = useState(false);
  const [consentTimestamps, setConsentTimestamps] = useState<ConsentTimestamps>({});

  const targetUserId = userId || user?.id;

  // Check consent status when dialog opens
  useEffect(() => {
    if (open && targetUserId) {
      checkConsentStatus();
    }
  }, [open, targetUserId]);

  const checkConsentStatus = async () => {
    if (!targetUserId) return;

    try {
      const result = await validateUserConsentStatus(targetUserId);
      if (result.success && result.result) {
        setConsentStatus(result.result);
      }
    } catch (error) {
      console.error('Error checking consent status:', error);
    }
  };

  const handleCompleteConsent = async () => {
    if (!targetUserId || !legalConsentsAccepted) {
      toast({
        title: 'Consent Required',
        description: 'Please accept all required legal agreements to continue.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

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

      if (consentResult.success) {
        toast({
          title: 'Consent Completed',
          description: 'Your legal consent has been recorded. Your account is now active.',
          variant: 'default',
        });

        // Refresh user profile to update consent status
        if (refreshProfile) {
          await refreshProfile();
        }

        onConsentComplete();
        onOpenChange(false);
      } else {
        throw new Error(consentResult.error || 'Failed to store consent');
      }
    } catch (error: any) {
      console.error('Error completing consent:', error);
      toast({
        title: 'Consent Error',
        description: error.message || 'Failed to complete consent process',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_consent':
        return <Clock className="h-4 w-4" />;
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'suspended':
      case 'deactivated':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending_consent':
        return 'secondary';
      case 'active':
        return 'default';
      case 'suspended':
      case 'deactivated':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Legal Consent Required
          </DialogTitle>
          <DialogDescription>
            Your account requires completion of legal consent agreements to access all features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          {consentStatus && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Account Status:</span>
                    <Badge variant={getStatusVariant('pending_consent')} className="flex items-center gap-1">
                      {getStatusIcon('pending_consent')}
                      Pending Consent
                    </Badge>
                  </div>
                  
                  {consentStatus.missingConsents.length > 0 && (
                    <div>
                      <span className="font-medium">Missing Agreements:</span>
                      <ul className="list-disc list-inside mt-1 text-sm">
                        {consentStatus.missingConsents.map((consent) => (
                          <li key={consent}>{consent}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Explanation */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Why is this required?</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Legal compliance with Botswana data protection laws</li>
              <li>• Ensures you understand how your data is used</li>
              <li>• Required for full access to civic engagement features</li>
              <li>• Protects both you and the platform</li>
            </ul>
          </div>

          {/* Legal Consent Component */}
          <div className="space-y-4">
            <h4 className="font-medium">Complete Required Agreements</h4>
            <EnhancedLegalConsent
              onAccept={setLegalConsentsAccepted}
              onTimestampsChange={setConsentTimestamps}
              className="border rounded-lg p-4 bg-muted/20"
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleCompleteConsent}
              disabled={!legalConsentsAccepted || isLoading}
              className="flex-1"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Completing Consent...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Consent & Activate Account
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="sm:w-auto"
            >
              Cancel
            </Button>
          </div>

          {/* Warning */}
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Without completing these agreements, your account will remain in 
              "pending consent" status and you will have limited access to platform features.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ConsentPendingDialog;
