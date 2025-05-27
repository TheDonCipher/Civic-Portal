import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useConsentStatus } from '@/hooks/useConsentStatus';
import { ConsentRecoveryFlow } from './ConsentRecoveryFlow';
import { useToast } from '@/components/ui/use-toast-enhanced';

interface SessionTimeoutHandlerProps {
  children: React.ReactNode;
  timeoutMinutes?: number;
  warningMinutes?: number;
  checkInterval?: number;
}

interface SessionState {
  lastActivity: Date;
  warningShown: boolean;
  timeoutTriggered: boolean;
  consentInProgress: boolean;
}

export function SessionTimeoutHandler({
  children,
  timeoutMinutes = 30,
  warningMinutes = 5,
  checkInterval = 60000, // Check every minute
}: SessionTimeoutHandlerProps) {
  const { user, signOut } = useAuth();
  const { needsConsent, consentStatus } = useConsentStatus();
  const { toast } = useToast();
  
  const [sessionState, setSessionState] = useState<SessionState>({
    lastActivity: new Date(),
    warningShown: false,
    timeoutTriggered: false,
    consentInProgress: false,
  });
  
  const [showRecovery, setShowRecovery] = useState(false);

  // Update last activity time
  const updateActivity = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      lastActivity: new Date(),
      warningShown: false,
    }));
  }, []);

  // Check if user is in consent process
  useEffect(() => {
    if (needsConsent && user) {
      setSessionState(prev => ({
        ...prev,
        consentInProgress: true,
      }));
    } else {
      setSessionState(prev => ({
        ...prev,
        consentInProgress: false,
      }));
    }
  }, [needsConsent, user]);

  // Activity listeners
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateActivity();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [updateActivity]);

  // Session timeout checker
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeSinceActivity = now.getTime() - sessionState.lastActivity.getTime();
      const timeoutMs = timeoutMinutes * 60 * 1000;
      const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;

      // Show warning
      if (timeSinceActivity >= warningMs && !sessionState.warningShown && !sessionState.timeoutTriggered) {
        setSessionState(prev => ({ ...prev, warningShown: true }));
        
        toast({
          title: 'Session Expiring Soon',
          description: `Your session will expire in ${warningMinutes} minutes due to inactivity.`,
          variant: 'warning',
          duration: 10000,
        });
      }

      // Trigger timeout
      if (timeSinceActivity >= timeoutMs && !sessionState.timeoutTriggered) {
        setSessionState(prev => ({ ...prev, timeoutTriggered: true }));
        
        // If user was in consent process, show recovery flow
        if (sessionState.consentInProgress) {
          setShowRecovery(true);
          toast({
            title: 'Session Expired During Setup',
            description: 'Your session expired while completing registration. You can continue where you left off.',
            variant: 'destructive',
            duration: 0, // Don't auto-dismiss
          });
        } else {
          // Normal session timeout
          signOut();
          toast({
            title: 'Session Expired',
            description: 'You have been signed out due to inactivity.',
            variant: 'destructive',
          });
        }
      }
    }, checkInterval);

    return () => clearInterval(interval);
  }, [
    user,
    sessionState.lastActivity,
    sessionState.warningShown,
    sessionState.timeoutTriggered,
    sessionState.consentInProgress,
    timeoutMinutes,
    warningMinutes,
    checkInterval,
    signOut,
    toast,
  ]);

  // Reset timeout state when user changes
  useEffect(() => {
    setSessionState({
      lastActivity: new Date(),
      warningShown: false,
      timeoutTriggered: false,
      consentInProgress: false,
    });
  }, [user?.id]);

  const handleRecoveryComplete = () => {
    setShowRecovery(false);
    setSessionState(prev => ({
      ...prev,
      timeoutTriggered: false,
      consentInProgress: false,
      lastActivity: new Date(),
    }));
  };

  return (
    <>
      {children}
      
      <ConsentRecoveryFlow
        open={showRecovery}
        onOpenChange={setShowRecovery}
        scenario="session_timeout"
        onComplete={handleRecoveryComplete}
      />
    </>
  );
}

/**
 * Hook for components that need to be aware of session timeout
 */
export function useSessionTimeout() {
  const [isNearTimeout, setIsNearTimeout] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // This would be implemented to work with the SessionTimeoutHandler
  // For now, returning basic state
  return {
    isNearTimeout,
    timeRemaining,
    extendSession: () => {
      // Trigger activity update
      document.dispatchEvent(new Event('mousedown'));
    },
  };
}

export default SessionTimeoutHandler;
