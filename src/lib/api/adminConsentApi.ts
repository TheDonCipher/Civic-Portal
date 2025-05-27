import { supabase } from '@/lib/supabase';
import {
  getUserLegalConsent,
  validateUserConsentStatus,
  getUserConsentHistory,
  type ConsentValidationResult,
  type LegalConsentRecord
} from '@/lib/services/legalConsentService';

export interface UserConsentStatus {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  consentStatus: 'complete' | 'pending' | 'incomplete' | 'failed' | 'unknown';
  consentProgress: number;
  lastConsentCheck: Date | null;
  consentDetails: ConsentValidationResult | null;
  latestConsent: LegalConsentRecord | null;
  errorMessage?: string;
}

export interface ConsentMetrics {
  totalUsers: number;
  completeConsent: number;
  pendingConsent: number;
  incompleteConsent: number;
  failedConsent: number;
  completionRate: number;
  commonFailureReasons: string[];
  recentActivity: {
    date: string;
    completions: number;
    failures: number;
  }[];
}

export interface BulkConsentOperation {
  userIds: string[];
  operation: 'send_reminder' | 'refresh_status' | 'reset_consent';
  results: {
    successful: string[];
    failed: { userId: string; error: string }[];
  };
}

/**
 * Get all users with their consent status for admin dashboard
 */
export async function getAllUsersConsentStatus(): Promise<{
  success: boolean;
  error?: string;
  data?: UserConsentStatus[];
}> {
  try {
    // First get all users with their basic profile info
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        email,
        role,
        created_at,
        terms_accepted,
        privacy_accepted,
        data_processing_accepted,
        account_status
      `)
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Process each user to get detailed consent status
    const userConsentStatuses: UserConsentStatus[] = [];

    for (const profile of profiles) {
      try {
        // Get consent validation result
        const validationResult = await validateUserConsentStatus(profile.id);

        // Get latest consent record
        const consentResult = await getUserLegalConsent(profile.id);

        // Calculate consent status and progress
        let consentStatus: UserConsentStatus['consentStatus'] = 'unknown';
        let consentProgress = 0;

        if (validationResult.success && validationResult.result) {
          const validation = validationResult.result;

          if (validation.isValid && validation.canProceed) {
            consentStatus = 'complete';
            consentProgress = 100;
          } else if (validation.requiresAction === 'accept_required') {
            consentStatus = 'pending';
            // Calculate progress based on what's accepted
            const totalRequired = 3; // terms, privacy, data processing
            let completed = 0;
            if (profile.terms_accepted) completed++;
            if (profile.privacy_accepted) completed++;
            if (profile.data_processing_accepted) completed++;
            consentProgress = (completed / totalRequired) * 100;
          } else if (validation.requiresAction === 'complete_signup') {
            consentStatus = 'incomplete';
            consentProgress = 0;
          } else {
            consentStatus = 'failed';
            consentProgress = 0;
          }
        } else {
          consentStatus = 'failed';
          consentProgress = 0;
        }

        userConsentStatuses.push({
          userId: profile.id,
          username: profile.username || 'No username',
          fullName: profile.full_name || 'No name',
          email: profile.email || 'No email',
          role: profile.role || 'citizen',
          consentStatus,
          consentProgress,
          lastConsentCheck: new Date(),
          consentDetails: validationResult.result || null,
          latestConsent: consentResult.data || null,
          errorMessage: validationResult.error || consentResult.error,
        });

      } catch (error: any) {
        console.error(`Error processing consent for user ${profile.id}:`, error);

        userConsentStatuses.push({
          userId: profile.id,
          username: profile.username || 'No username',
          fullName: profile.full_name || 'No name',
          email: profile.email || 'No email',
          role: profile.role || 'citizen',
          consentStatus: 'failed',
          consentProgress: 0,
          lastConsentCheck: new Date(),
          consentDetails: null,
          latestConsent: null,
          errorMessage: error.message || 'Unknown error',
        });
      }
    }

    return {
      success: true,
      data: userConsentStatuses,
    };

  } catch (error: any) {
    console.error('Error fetching users consent status:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch users consent status',
    };
  }
}

/**
 * Get consent completion metrics for admin dashboard
 */
export async function getConsentMetrics(): Promise<{
  success: boolean;
  error?: string;
  data?: ConsentMetrics;
}> {
  try {
    const usersResult = await getAllUsersConsentStatus();

    if (!usersResult.success || !usersResult.data) {
      throw new Error(usersResult.error || 'Failed to get users data');
    }

    const users = usersResult.data;
    const totalUsers = users.length;

    const completeConsent = users.filter(u => u.consentStatus === 'complete').length;
    const pendingConsent = users.filter(u => u.consentStatus === 'pending').length;
    const incompleteConsent = users.filter(u => u.consentStatus === 'incomplete').length;
    const failedConsent = users.filter(u => u.consentStatus === 'failed').length;

    const completionRate = totalUsers > 0 ? (completeConsent / totalUsers) * 100 : 0;

    // Get common failure reasons
    const commonFailureReasons = users
      .filter(u => u.errorMessage)
      .map(u => u.errorMessage!)
      .reduce((acc, reason) => {
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const sortedFailureReasons = Object.entries(commonFailureReasons)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([reason]) => reason);

    // Get recent activity (last 7 days)
    const recentActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // For now, we'll use mock data since we don't have historical tracking
      // In a real implementation, you'd query historical consent completion data
      recentActivity.push({
        date: dateStr,
        completions: Math.floor(Math.random() * 10),
        failures: Math.floor(Math.random() * 3),
      });
    }

    return {
      success: true,
      data: {
        totalUsers,
        completeConsent,
        pendingConsent,
        incompleteConsent,
        failedConsent,
        completionRate,
        commonFailureReasons: sortedFailureReasons,
        recentActivity,
      },
    };

  } catch (error: any) {
    console.error('Error calculating consent metrics:', error);
    return {
      success: false,
      error: error.message || 'Failed to calculate consent metrics',
    };
  }
}

/**
 * Refresh consent status for a specific user
 */
export async function refreshUserConsentStatus(userId: string): Promise<{
  success: boolean;
  error?: string;
  data?: UserConsentStatus;
}> {
  try {
    // Get updated user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        email,
        role,
        terms_accepted,
        privacy_accepted,
        data_processing_accepted,
        account_status
      `)
      .eq('id', userId)
      .single();

    if (profileError) {
      throw profileError;
    }

    // Get fresh consent validation
    const validationResult = await validateUserConsentStatus(userId);
    const consentResult = await getUserLegalConsent(userId);

    // Calculate status and progress
    let consentStatus: UserConsentStatus['consentStatus'] = 'unknown';
    let consentProgress = 0;

    if (validationResult.success && validationResult.result) {
      const validation = validationResult.result;

      if (validation.isValid && validation.canProceed) {
        consentStatus = 'complete';
        consentProgress = 100;
      } else if (validation.requiresAction === 'accept_required') {
        consentStatus = 'pending';
        const totalRequired = 3;
        let completed = 0;
        if (profile.terms_accepted) completed++;
        if (profile.privacy_accepted) completed++;
        if (profile.data_processing_accepted) completed++;
        consentProgress = (completed / totalRequired) * 100;
      } else if (validation.requiresAction === 'complete_signup') {
        consentStatus = 'incomplete';
        consentProgress = 0;
      } else {
        consentStatus = 'failed';
        consentProgress = 0;
      }
    }

    const userConsentStatus: UserConsentStatus = {
      userId: profile.id,
      username: profile.username || 'No username',
      fullName: profile.full_name || 'No name',
      email: profile.email || 'No email',
      role: profile.role || 'citizen',
      consentStatus,
      consentProgress,
      lastConsentCheck: new Date(),
      consentDetails: validationResult.result || null,
      latestConsent: consentResult.data || null,
      errorMessage: validationResult.error || consentResult.error,
    };

    return {
      success: true,
      data: userConsentStatus,
    };

  } catch (error: any) {
    console.error('Error refreshing user consent status:', error);
    return {
      success: false,
      error: error.message || 'Failed to refresh user consent status',
    };
  }
}

/**
 * Send consent reminder to multiple users
 */
export async function sendBulkConsentReminders(userIds: string[]): Promise<BulkConsentOperation> {
  const results: BulkConsentOperation = {
    userIds,
    operation: 'send_reminder',
    results: {
      successful: [],
      failed: [],
    },
  };

  for (const userId of userIds) {
    try {
      // Implementation for sending individual reminder
      // This would integrate with your email service
      console.log(`Sending consent reminder to user ${userId}`);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));

      results.results.successful.push(userId);
    } catch (error: any) {
      console.error(`Failed to send reminder to user ${userId}:`, error);
      results.results.failed.push({
        userId,
        error: error.message || 'Failed to send reminder',
      });
    }
  }

  return results;
}

/**
 * Refresh consent status for multiple users
 */
export async function refreshBulkConsentStatus(userIds: string[]): Promise<BulkConsentOperation> {
  const results: BulkConsentOperation = {
    userIds,
    operation: 'refresh_status',
    results: {
      successful: [],
      failed: [],
    },
  };

  for (const userId of userIds) {
    try {
      const refreshResult = await refreshUserConsentStatus(userId);

      if (refreshResult.success) {
        results.results.successful.push(userId);
      } else {
        throw new Error(refreshResult.error || 'Failed to refresh status');
      }
    } catch (error: any) {
      console.error(`Failed to refresh status for user ${userId}:`, error);
      results.results.failed.push({
        userId,
        error: error.message || 'Failed to refresh status',
      });
    }
  }

  return results;
}

/**
 * Reset consent status for multiple users (admin only)
 */
export async function resetBulkConsentStatus(userIds: string[]): Promise<BulkConsentOperation> {
  const results: BulkConsentOperation = {
    userIds,
    operation: 'reset_consent',
    results: {
      successful: [],
      failed: [],
    },
  };

  for (const userId of userIds) {
    try {
      // Implementation for resetting consent status
      // This would involve updating the user's profile and legal_consents records
      console.log(`Resetting consent status for user ${userId}`);

      // Update user profile to reset consent flags
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          terms_accepted: false,
          privacy_accepted: false,
          data_processing_accepted: false,
          account_status: 'pending_consent',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileError) {
        throw profileError;
      }

      results.results.successful.push(userId);
    } catch (error: any) {
      console.error(`Failed to reset consent for user ${userId}:`, error);
      results.results.failed.push({
        userId,
        error: error.message || 'Failed to reset consent',
      });
    }
  }

  return results;
}
