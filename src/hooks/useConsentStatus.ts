import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import {
  validateUserConsentStatus,
  type ConsentValidationResult
} from '@/lib/services/legalConsentService';

interface ConsentProgress {
  totalSteps: number;
  completedSteps: number;
  currentStep: string;
  nextStep: string | null;
  progressPercentage: number;
}

interface UseConsentStatusReturn {
  consentStatus: ConsentValidationResult | null;
  isLoading: boolean;
  error: string | null;
  needsConsent: boolean;
  canProceed: boolean;
  checkConsentStatus: () => Promise<void>;
  showConsentDialog: boolean;
  setShowConsentDialog: (show: boolean) => void;
  consentProgress: ConsentProgress | null;
  retryCount: number;
  lastChecked: Date | null;
  isRecovering: boolean;
  startRecovery: () => void;
}

/**
 * Hook to manage user consent status and validation
 */
export function useConsentStatus(): UseConsentStatusReturn {
  const { user, profile } = useAuth();
  const [consentStatus, setConsentStatus] = useState<ConsentValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  // Calculate consent progress
  const calculateConsentProgress = useCallback((status: ConsentValidationResult | null): ConsentProgress | null => {
    if (!status) return null;

    const requiredConsents = ['Terms of Service', 'Privacy Policy', 'Data Processing Agreement'];
    const completedConsents = requiredConsents.filter(consent =>
      !status.missingConsents.includes(consent)
    );

    const totalSteps = requiredConsents.length;
    const completedSteps = completedConsents.length;
    const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

    let currentStep = 'Complete';
    let nextStep: string | null = null;

    if (status.missingConsents.length > 0) {
      currentStep = `Missing: ${status.missingConsents[0]}`;
      nextStep = status.missingConsents[0];
    }

    return {
      totalSteps,
      completedSteps,
      currentStep,
      nextStep,
      progressPercentage,
    };
  }, []);

  const checkConsentStatus = useCallback(async () => {
    if (!user?.id) {
      setConsentStatus(null);
      setLastChecked(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await validateUserConsentStatus(user.id);

      if (result.success && result.result) {
        setConsentStatus(result.result);
        setLastChecked(new Date());
        setRetryCount(0); // Reset retry count on success

        // Auto-show consent dialog if user needs to accept agreements
        if (result.result.requiresAction === 'accept_required' && !result.result.canProceed) {
          setShowConsentDialog(true);
        }
      } else {
        const errorMessage = result.error || 'Failed to validate consent status';
        setError(errorMessage);
        setRetryCount(prev => prev + 1);

        // If this is a recoverable error and we haven't retried too many times
        if (retryCount < 3 && !errorMessage.includes('not found')) {
          console.log(`Consent status check failed, will retry (attempt ${retryCount + 1}/3)`);
          setTimeout(() => {
            if (user?.id) {
              checkConsentStatus();
            }
          }, 2000 * (retryCount + 1)); // Exponential backoff
        }
      }
    } catch (err: any) {
      console.error('Error checking consent status:', err);
      const errorMessage = err.message || 'Failed to check consent status';
      setError(errorMessage);
      setRetryCount(prev => prev + 1);

      // Retry logic for network errors
      if (retryCount < 3 && (errorMessage.includes('network') || errorMessage.includes('timeout'))) {
        console.log(`Network error checking consent status, will retry (attempt ${retryCount + 1}/3)`);
        setTimeout(() => {
          if (user?.id) {
            checkConsentStatus();
          }
        }, 3000 * (retryCount + 1)); // Longer delay for network errors
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, retryCount]);

  // Check consent status when user changes or component mounts
  useEffect(() => {
    if (user?.id) {
      checkConsentStatus();
    }
  }, [user?.id, checkConsentStatus]);

  // Also check when profile changes (e.g., after consent completion)
  useEffect(() => {
    if (profile && user?.id) {
      // Small delay to ensure database updates are reflected
      const timeoutId = setTimeout(() => {
        checkConsentStatus();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [profile?.account_status, checkConsentStatus, user?.id]);

  // Recovery function for failed consent checks
  const startRecovery = useCallback(() => {
    setIsRecovering(true);
    setError(null);
    setRetryCount(0);

    // Clear any existing timeouts and retry immediately
    checkConsentStatus().finally(() => {
      setIsRecovering(false);
    });
  }, [checkConsentStatus]);

  const needsConsent = consentStatus ? !consentStatus.isValid : false;
  const canProceed = consentStatus ? consentStatus.canProceed : true; // Default to true for non-authenticated users
  const consentProgress = calculateConsentProgress(consentStatus);

  return {
    consentStatus,
    isLoading,
    error,
    needsConsent,
    canProceed,
    checkConsentStatus,
    showConsentDialog,
    setShowConsentDialog,
    consentProgress,
    retryCount,
    lastChecked,
    isRecovering,
    startRecovery,
  };
}

/**
 * Hook to check if a specific action requires consent
 */
export function useActionRequiresConsent() {
  const { consentStatus, canProceed } = useConsentStatus();

  const checkActionPermission = useCallback((action: 'create_issue' | 'comment' | 'vote' | 'watch' | 'full_access') => {
    // If no consent status available, allow basic actions
    if (!consentStatus) {
      return { allowed: true, reason: null };
    }

    // If user can proceed (active account), allow all actions
    if (canProceed) {
      return { allowed: true, reason: null };
    }

    // Define which actions require full consent
    const restrictedActions = ['create_issue', 'comment', 'vote', 'watch', 'full_access'];

    if (restrictedActions.includes(action)) {
      return {
        allowed: false,
        reason: `This action requires accepting all legal agreements. Missing: ${consentStatus.missingConsents.join(', ')}`,
      };
    }

    // Allow basic viewing actions
    return { allowed: true, reason: null };
  }, [consentStatus, canProceed]);

  return { checkActionPermission };
}

/**
 * Hook for components that need to enforce consent requirements
 */
export function useConsentGuard() {
  const { needsConsent, canProceed, showConsentDialog, setShowConsentDialog } = useConsentStatus();
  const { checkActionPermission } = useActionRequiresConsent();

  const requireConsent = useCallback((action?: 'create_issue' | 'comment' | 'vote' | 'watch' | 'full_access') => {
    if (action) {
      const permission = checkActionPermission(action);
      if (!permission.allowed) {
        setShowConsentDialog(true);
        return false;
      }
    } else if (needsConsent && !canProceed) {
      setShowConsentDialog(true);
      return false;
    }

    return true;
  }, [needsConsent, canProceed, checkActionPermission, setShowConsentDialog]);

  return {
    needsConsent,
    canProceed,
    showConsentDialog,
    setShowConsentDialog,
    requireConsent,
  };
}

export default useConsentStatus;
