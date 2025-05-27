/**
 * Legal Consent Service
 * Handles storage and retrieval of user legal consent records
 */

import { supabase } from '@/lib/supabase';

// Get client IP address (fallback for development)
const getClientIpAddress = async (): Promise<string> => {
  try {
    // In development, return localhost
    if (process.env.NODE_ENV === 'development') {
      return '127.0.0.1';
    }

    // In production, you would get this from headers or a service
    return 'unknown';
  } catch (error) {
    console.error('Failed to get client IP:', error);
    return 'unknown';
  }
};

export interface LegalConsentRecord {
  id?: string;
  user_id: string;
  terms_accepted: boolean;
  terms_version: string;
  terms_accepted_at?: string;
  privacy_accepted: boolean;
  privacy_version: string;
  privacy_accepted_at?: string;
  data_processing_consent: boolean;
  data_processing_version: string;
  data_processing_accepted_at?: string;
  marketing_opt_in?: boolean;
  consent_timestamp: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface ConsentData {
  termsAccepted: boolean;
  termsAcceptedAt?: Date;
  privacyAccepted: boolean;
  privacyAcceptedAt?: Date;
  dataProcessingConsent: boolean;
  dataProcessingAcceptedAt?: Date;
  marketingOptIn?: boolean;
  timestamp: Date;
  versions: {
    terms: string;
    privacy: string;
    dataProcessing: string;
  };
  ipAddress?: string;
  userAgent?: string;
  allowPartialConsent?: boolean; // Allow storing partial consent for tracking
}

export interface ConsentValidationResult {
  isValid: boolean;
  missingConsents: string[];
  canProceed: boolean;
  requiresAction: 'complete_signup' | 'accept_required' | 'none';
}

/**
 * Store user legal consent record
 */
export async function storeLegalConsent(
  userId: string,
  consentData: ConsentData
): Promise<{ success: boolean; error?: string; data?: LegalConsentRecord }> {
  try {
    // Validate required fields
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Check if all required consents are accepted, unless partial consent is allowed
    if (!consentData.allowPartialConsent && (!consentData.termsAccepted || !consentData.privacyAccepted || !consentData.dataProcessingConsent)) {
      const missingConsents = [];
      if (!consentData.termsAccepted) missingConsents.push('Terms of Service');
      if (!consentData.privacyAccepted) missingConsents.push('Privacy Policy');
      if (!consentData.dataProcessingConsent) missingConsents.push('Data Processing Agreement');

      throw new Error(`The following required consents must be accepted: ${missingConsents.join(', ')}`);
    }

    // Prepare consent record
    const consentRecord: Omit<LegalConsentRecord, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      terms_accepted: consentData.termsAccepted,
      terms_version: consentData.versions.terms,
      terms_accepted_at: consentData.termsAcceptedAt?.toISOString() || (consentData.termsAccepted ? consentData.timestamp.toISOString() : undefined),
      privacy_accepted: consentData.privacyAccepted,
      privacy_version: consentData.versions.privacy,
      privacy_accepted_at: consentData.privacyAcceptedAt?.toISOString() || (consentData.privacyAccepted ? consentData.timestamp.toISOString() : undefined),
      data_processing_consent: consentData.dataProcessingConsent,
      data_processing_version: consentData.versions.dataProcessing,
      data_processing_accepted_at: consentData.dataProcessingAcceptedAt?.toISOString() || (consentData.dataProcessingConsent ? consentData.timestamp.toISOString() : undefined),
      marketing_opt_in: consentData.marketingOptIn || false,
      consent_timestamp: consentData.timestamp.toISOString(),
      ip_address: consentData.ipAddress || await getClientIpAddress(),
      user_agent: consentData.userAgent || navigator.userAgent,
      metadata: {
        browser: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        individualTimestamps: {
          termsAcceptedAt: consentData.termsAcceptedAt?.toISOString(),
          privacyAcceptedAt: consentData.privacyAcceptedAt?.toISOString(),
          dataProcessingAcceptedAt: consentData.dataProcessingAcceptedAt?.toISOString(),
        },
      },
    };

    // Log the consent record being stored (without sensitive data)
    console.log('Storing legal consent record:', {
      userId,
      termsAccepted: consentRecord.terms_accepted,
      privacyAccepted: consentRecord.privacy_accepted,
      dataProcessingConsent: consentRecord.data_processing_consent,
      hasIndividualTimestamps: !!(consentRecord.terms_accepted_at || consentRecord.privacy_accepted_at || consentRecord.data_processing_accepted_at),
    });

    // Insert consent record
    const { data, error } = await supabase
      .from('legal_consents')
      .insert(consentRecord)
      .select()
      .single();

    if (error) {
      console.error('Error storing legal consent:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      // Provide more specific error messages
      if (error.code === '23505') {
        throw new Error('Legal consent record already exists for this user');
      } else if (error.code === '23503') {
        throw new Error('Invalid user ID provided');
      } else if (error.code === '42501') {
        throw new Error('Permission denied - unable to store legal consent');
      } else {
        throw new Error(`Failed to store legal consent: ${error.message}`);
      }
    }

    console.log('Legal consent stored successfully:', {
      id: data.id,
      userId: data.user_id,
      timestamp: data.consent_timestamp,
    });

    // Also update the profiles table with consent information
    try {
      const profileUpdateData: any = {
        terms_accepted: consentRecord.terms_accepted,
        privacy_accepted: consentRecord.privacy_accepted,
        data_processing_accepted: consentRecord.data_processing_consent,
        legal_consent_version: consentRecord.terms_version,
        consent_ip_address: consentRecord.ip_address,
      };

      if (consentRecord.terms_accepted_at) {
        profileUpdateData.terms_accepted_at = consentRecord.terms_accepted_at;
      }

      if (consentRecord.privacy_accepted_at) {
        profileUpdateData.privacy_accepted_at = consentRecord.privacy_accepted_at;
      }

      if (consentRecord.data_processing_accepted_at) {
        profileUpdateData.data_processing_accepted_at = consentRecord.data_processing_accepted_at;
      }

      // Set account status based on consent completeness
      const allConsentsAccepted = consentRecord.terms_accepted &&
                                 consentRecord.privacy_accepted &&
                                 consentRecord.data_processing_consent;

      profileUpdateData.account_status = allConsentsAccepted ? 'active' : 'pending_consent';

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', userId);

      if (profileError) {
        console.error('Error updating profile consent information:', profileError);
        // Don't fail the entire operation for profile update issues
      } else {
        console.log('Profile consent information updated successfully:', {
          userId,
          accountStatus: profileUpdateData.account_status,
          consentsAccepted: {
            terms: consentRecord.terms_accepted,
            privacy: consentRecord.privacy_accepted,
            dataProcessing: consentRecord.data_processing_consent,
          }
        });
      }
    } catch (profileError) {
      console.error('Error updating profile consent information:', profileError);
      // Don't fail the entire operation for profile update issues
    }

    return {
      success: true,
      data: data as LegalConsentRecord,
    };
  } catch (error: any) {
    console.error('Failed to store legal consent:', error);
    return {
      success: false,
      error: error.message || 'Failed to store legal consent',
    };
  }
}

/**
 * Get user's latest legal consent record
 */
export async function getUserLegalConsent(
  userId: string
): Promise<{ success: boolean; error?: string; data?: LegalConsentRecord }> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabase
      .from('legal_consents')
      .select('*')
      .eq('user_id', userId)
      .order('consent_timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is acceptable
      console.error('Error fetching legal consent:', error);
      throw error;
    }

    return {
      success: true,
      data: data as LegalConsentRecord || undefined,
    };
  } catch (error: any) {
    console.error('Failed to fetch legal consent:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch legal consent',
    };
  }
}

/**
 * Check if user has valid consent for current versions
 */
export async function hasValidConsent(
  userId: string,
  requiredVersions: {
    terms: string;
    privacy: string;
    dataProcessing: string;
  }
): Promise<{ success: boolean; error?: string; hasValidConsent?: boolean }> {
  try {
    const result = await getUserLegalConsent(userId);

    if (!result.success || !result.data) {
      return {
        success: true,
        hasValidConsent: false,
      };
    }

    const consent = result.data;
    const hasValidConsent =
      consent.terms_accepted &&
      consent.privacy_accepted &&
      consent.data_processing_consent &&
      consent.terms_version === requiredVersions.terms &&
      consent.privacy_version === requiredVersions.privacy &&
      consent.data_processing_version === requiredVersions.dataProcessing;

    return {
      success: true,
      hasValidConsent,
    };
  } catch (error: any) {
    console.error('Failed to check consent validity:', error);
    return {
      success: false,
      error: error.message || 'Failed to check consent validity',
    };
  }
}

/**
 * Get all consent records for a user (for admin/audit purposes)
 */
export async function getUserConsentHistory(
  userId: string
): Promise<{ success: boolean; error?: string; data?: LegalConsentRecord[] }> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabase
      .from('legal_consents')
      .select('*')
      .eq('user_id', userId)
      .order('consent_timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching consent history:', error);
      throw error;
    }

    return {
      success: true,
      data: data as LegalConsentRecord[],
    };
  } catch (error: any) {
    console.error('Failed to fetch consent history:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch consent history',
    };
  }
}

/**
 * Validate that legal consent was stored correctly
 */
export async function validateLegalConsentStorage(
  userId: string
): Promise<{ success: boolean; error?: string; isValid?: boolean }> {
  try {
    const result = await getUserLegalConsent(userId);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to retrieve consent record',
      };
    }

    if (!result.data) {
      return {
        success: true,
        isValid: false,
      };
    }

    const consent = result.data;
    const isValid =
      consent.terms_accepted &&
      consent.privacy_accepted &&
      consent.data_processing_consent &&
      consent.terms_version === CURRENT_LEGAL_VERSIONS.terms &&
      consent.privacy_version === CURRENT_LEGAL_VERSIONS.privacy &&
      consent.data_processing_version === CURRENT_LEGAL_VERSIONS.dataProcessing;

    console.log('Legal consent validation result:', {
      userId,
      isValid,
      hasTimestamps: !!(consent.terms_accepted_at || consent.privacy_accepted_at || consent.data_processing_accepted_at),
      consentTimestamp: consent.consent_timestamp,
    });

    return {
      success: true,
      isValid,
    };
  } catch (error: any) {
    console.error('Failed to validate legal consent storage:', error);
    return {
      success: false,
      error: error.message || 'Failed to validate consent storage',
    };
  }
}

/**
 * Fix existing users who have legal consent records but NULL timestamps in profiles
 */
export async function fixExistingUserConsentTimestamps(): Promise<{
  success: boolean;
  error?: string;
  updatedCount?: number;
}> {
  try {
    console.log('Starting to fix existing user consent timestamps...');

    // Get all users who have legal consent records but NULL timestamps in profiles
    const { data: usersToFix, error: queryError } = await supabase
      .from('profiles')
      .select(`
        id,
        terms_accepted_at,
        privacy_accepted_at
      `)
      .or('terms_accepted_at.is.null,privacy_accepted_at.is.null');

    if (queryError) {
      console.error('Error querying users to fix:', queryError);
      throw queryError;
    }

    if (!usersToFix || usersToFix.length === 0) {
      console.log('No users found with missing consent timestamps');
      return { success: true, updatedCount: 0 };
    }

    console.log(`Found ${usersToFix.length} users with missing consent timestamps`);

    let updatedCount = 0;

    // Process each user
    for (const user of usersToFix) {
      try {
        // Get their latest legal consent record
        const consentResult = await getUserLegalConsent(user.id);

        if (consentResult.success && consentResult.data) {
          const consent = consentResult.data;
          const updateData: any = {};

          // Update terms timestamp if missing
          if (!user.terms_accepted_at && consent.terms_accepted_at) {
            updateData.terms_accepted_at = consent.terms_accepted_at;
          }

          // Update privacy timestamp if missing
          if (!user.privacy_accepted_at && consent.privacy_accepted_at) {
            updateData.privacy_accepted_at = consent.privacy_accepted_at;
          }

          // Update profile if we have data to update
          if (Object.keys(updateData).length > 0) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update(updateData)
              .eq('id', user.id);

            if (updateError) {
              console.error(`Error updating user ${user.id}:`, updateError);
            } else {
              console.log(`Updated consent timestamps for user ${user.id}:`, updateData);
              updatedCount++;
            }
          }
        }
      } catch (userError) {
        console.error(`Error processing user ${user.id}:`, userError);
        // Continue with next user
      }
    }

    console.log(`Successfully updated ${updatedCount} users`);

    return {
      success: true,
      updatedCount,
    };
  } catch (error: any) {
    console.error('Failed to fix existing user consent timestamps:', error);
    return {
      success: false,
      error: error.message || 'Failed to fix existing user consent timestamps',
    };
  }
}

/**
 * Validate user consent status and determine required actions
 */
export async function validateUserConsentStatus(
  userId: string
): Promise<{ success: boolean; error?: string; result?: ConsentValidationResult }> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get user's profile to check consent status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('terms_accepted, privacy_accepted, data_processing_accepted, account_status, legal_consent_version')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile for consent validation:', profileError);
      throw profileError;
    }

    if (!profile) {
      return {
        success: true,
        result: {
          isValid: false,
          missingConsents: ['Terms of Service', 'Privacy Policy', 'Data Processing Agreement'],
          canProceed: false,
          requiresAction: 'complete_signup',
        },
      };
    }

    const missingConsents = [];
    if (!profile.terms_accepted) missingConsents.push('Terms of Service');
    if (!profile.privacy_accepted) missingConsents.push('Privacy Policy');
    if (!profile.data_processing_accepted) missingConsents.push('Data Processing Agreement');

    const isValid = missingConsents.length === 0;
    const canProceed = profile.account_status === 'active';

    let requiresAction: 'complete_signup' | 'accept_required' | 'none' = 'none';
    if (!isValid) {
      requiresAction = profile.account_status === 'pending_consent' ? 'accept_required' : 'complete_signup';
    }

    return {
      success: true,
      result: {
        isValid,
        missingConsents,
        canProceed,
        requiresAction,
      },
    };
  } catch (error: any) {
    console.error('Failed to validate user consent status:', error);
    return {
      success: false,
      error: error.message || 'Failed to validate consent status',
    };
  }
}

/**
 * Store partial consent for users who don't accept all agreements
 */
export async function storePartialConsent(
  userId: string,
  partialConsentData: Partial<ConsentData> & { timestamp: Date; versions: ConsentData['versions'] }
): Promise<{ success: boolean; error?: string; data?: LegalConsentRecord }> {
  try {
    const consentData: ConsentData = {
      termsAccepted: partialConsentData.termsAccepted || false,
      termsAcceptedAt: partialConsentData.termsAcceptedAt,
      privacyAccepted: partialConsentData.privacyAccepted || false,
      privacyAcceptedAt: partialConsentData.privacyAcceptedAt,
      dataProcessingConsent: partialConsentData.dataProcessingConsent || false,
      dataProcessingAcceptedAt: partialConsentData.dataProcessingAcceptedAt,
      marketingOptIn: partialConsentData.marketingOptIn || false,
      timestamp: partialConsentData.timestamp,
      versions: partialConsentData.versions,
      ipAddress: partialConsentData.ipAddress,
      userAgent: partialConsentData.userAgent,
      allowPartialConsent: true, // Allow partial consent storage
    };

    return await storeLegalConsent(userId, consentData);
  } catch (error: any) {
    console.error('Failed to store partial consent:', error);
    return {
      success: false,
      error: error.message || 'Failed to store partial consent',
    };
  }
}

/**
 * Send consent reminder to user
 */
export async function sendConsentReminder(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Update reminder count and timestamp
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        consent_reminder_count: supabase.sql`COALESCE(consent_reminder_count, 0) + 1`,
        last_consent_reminder: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating consent reminder count:', updateError);
      throw updateError;
    }

    // Here you would typically send an email or notification
    // For now, we'll just log it
    console.log(`Consent reminder sent to user ${userId}`);

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send consent reminder:', error);
    return {
      success: false,
      error: error.message || 'Failed to send consent reminder',
    };
  }
}

/**
 * Get users who need consent reminders
 */
export async function getUsersNeedingConsentReminders(): Promise<{
  success: boolean;
  error?: string;
  data?: Array<{ id: string; email: string; consent_reminder_count: number; last_consent_reminder: string | null }>;
}> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, consent_reminder_count, last_consent_reminder')
      .eq('account_status', 'pending_consent')
      .lt('consent_reminder_count', 3) // Don't spam users
      .or('last_consent_reminder.is.null,last_consent_reminder.lt.' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // No reminder in last 7 days

    if (error) {
      console.error('Error fetching users needing consent reminders:', error);
      throw error;
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    console.error('Failed to get users needing consent reminders:', error);
    return {
      success: false,
      error: error.message || 'Failed to get users needing consent reminders',
    };
  }
}

/**
 * Current legal document versions
 */
export const CURRENT_LEGAL_VERSIONS = {
  terms: '2024.1',
  privacy: '2024.1',
  dataProcessing: '2024.1',
} as const;
