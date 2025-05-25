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
  type: 'verification_approved' | 'verification_rejected' | 'role_changed';
  title: string;
  message: string;
  data?: any;
}

/**
 * Send a notification to a user
 */
export const sendNotification = async (notification: NotificationData) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: notification.user_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        read: false,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to send notification:', error);
      return false;
    }

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
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};
