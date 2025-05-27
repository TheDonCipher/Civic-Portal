import { supabase } from '@/lib/supabase';

/**
 * Notification utilities for user verification and role changes
 */

/**
 * Get department ID by name
 */
export const getDepartmentIdByName = async (departmentName: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('id')
      .eq('name', departmentName)
      .single();

    if (error) {
      console.error('Error fetching department ID:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error in getDepartmentIdByName:', error);
    return null;
  }
};

/**
 * Get department name by ID
 */
export const getDepartmentNameById = async (departmentId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('name')
      .eq('id', departmentId)
      .single();

    if (error) {
      console.error('Error fetching department name:', error);
      return null;
    }

    return data?.name || null;
  } catch (error) {
    console.error('Error in getDepartmentNameById:', error);
    return null;
  }
};

export interface NotificationData {
  user_id: string;
  type: 'verification_approved' | 'verification_rejected' | 'role_changed' | 'status_change' |
        'issue_update' | 'comment' | 'solution' | 'system' | 'general' | 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  data?: any;
  related_issue_id?: string;
  related_comment_id?: string;
  related_solution_id?: string;
  action_url?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  expires_at?: string;
}

/**
 * Send a notification to a user
 */
export const sendNotification = async (notification: NotificationData) => {
  try {
    // Check if user is authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session error when sending notification:', sessionError);
      return false;
    }

    if (!session) {
      console.error('No active session when trying to send notification');
      return false;
    }

    console.log('Sending notification with authenticated session:', {
      user_id: notification.user_id,
      type: notification.type,
      title: notification.title,
      session_user: session.user.id
    });

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: notification.user_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
        related_issue_id: notification.related_issue_id,
        related_comment_id: notification.related_comment_id,
        related_solution_id: notification.related_solution_id,
        action_url: notification.action_url,
        priority: notification.priority || 'normal',
        expires_at: notification.expires_at,
        read: false,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to send notification:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return false;
    }

    console.log('Notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

/**
 * Send verification approved notification
 */
export const sendVerificationApprovedNotification = async (
  userId: string,
  userName: string,
  departmentName?: string
) => {
  return sendNotification({
    user_id: userId,
    type: 'verification_approved',
    title: 'Account Verified! 🎉',
    message: `Congratulations ${userName}! Your government official account has been verified. You now have access to the stakeholder dashboard${departmentName ? ` for ${departmentName}` : ''}.`,
    data: {
      department: departmentName,
      verified_at: new Date().toISOString()
    }
  });
};

/**
 * Send verification rejected notification
 */
export const sendVerificationRejectedNotification = async (
  userId: string,
  userName: string,
  reason?: string
) => {
  return sendNotification({
    user_id: userId,
    type: 'verification_rejected',
    title: 'Verification Update',
    message: `Hello ${userName}, your government official account verification was not approved.${reason ? ` Reason: ${reason}` : ''} Please contact support for more information.`,
    data: {
      reason: reason || null,
      rejected_at: new Date().toISOString()
    }
  });
};

/**
 * Send role changed notification
 */
export const sendRoleChangedNotification = async (
  userId: string,
  userName: string,
  oldRole: string,
  newRole: string,
  departmentName?: string
) => {
  const roleMessages = {
    citizen: 'You now have citizen access to the platform.',
    official: `You have been assigned as a government official${departmentName ? ` for ${departmentName}` : ''}. Your account is pending verification.`,
    admin: 'You now have administrative access to the platform.'
  };

  return sendNotification({
    user_id: userId,
    type: 'role_changed',
    title: 'Account Role Updated',
    message: `Hello ${userName}, your account role has been updated from ${oldRole} to ${newRole}. ${roleMessages[newRole as keyof typeof roleMessages] || ''}`,
    data: {
      old_role: oldRole,
      new_role: newRole,
      department: departmentName,
      changed_at: new Date().toISOString()
    }
  });
};

/**
 * Get unread notifications for a user
 */
export const getUserNotifications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

/**
 * Mark notification as read using database function
 */
export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('mark_notification_read', {
        p_notification_id: notificationId,
        p_user_id: userId
      });

    if (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

/**
 * Mark all notifications as read for a user using database function
 */
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('mark_all_notifications_read', {
        p_user_id: userId
      });

    if (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }

    return typeof data === 'number' ? data : 0;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return 0;
  }
};

/**
 * Get notification statistics for admin dashboard
 */
export const getNotificationStats = async () => {
  try {
    const { data, error } = await supabase
      .rpc('get_notification_stats');

    if (error) {
      console.error('Failed to get notification stats:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting notification stats:', error);
    return null;
  }
};

/**
 * Clean up expired notifications
 */
export const cleanupExpiredNotifications = async () => {
  try {
    const { data, error } = await supabase
      .rpc('cleanup_expired_notifications');

    if (error) {
      console.error('Failed to cleanup expired notifications:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Error cleaning up expired notifications:', error);
    return 0;
  }
};

/**
 * Send bulk notifications (admin only)
 */
export const sendBulkNotification = async (
  userIds: string[],
  type: string,
  title: string,
  message: string,
  data: any = {},
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
  expiresAt?: string
) => {
  try {
    const { data: result, error } = await supabase
      .rpc('send_bulk_notification', {
        p_user_ids: userIds,
        p_type: type,
        p_title: title,
        p_message: message,
        p_data: data,
        p_priority: priority,
        p_expires_at: expiresAt
      });

    if (error) {
      console.error('Failed to send bulk notification:', error);
      return 0;
    }

    return result || 0;
  } catch (error) {
    console.error('Error sending bulk notification:', error);
    return 0;
  }
};

/**
 * Create enhanced notification with all options
 */
export const createEnhancedNotification = async (notification: NotificationData) => {
  try {
    const { data, error } = await supabase
      .rpc('create_notification', {
        p_user_id: notification.user_id,
        p_type: notification.type,
        p_title: notification.title,
        p_message: notification.message,
        p_data: notification.data || {},
        p_related_issue_id: notification.related_issue_id,
        p_related_comment_id: notification.related_comment_id,
        p_related_solution_id: notification.related_solution_id,
        p_action_url: notification.action_url,
        p_priority: notification.priority || 'normal',
        p_expires_at: notification.expires_at
      });

    if (error) {
      console.error('Failed to create enhanced notification:', error);
      return null;
    }

    return data; // Returns the notification ID
  } catch (error) {
    console.error('Error creating enhanced notification:', error);
    return null;
  }
};
