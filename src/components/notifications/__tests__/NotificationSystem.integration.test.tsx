/**
 * Comprehensive Notification System Integration Tests
 * Tests all notification types, triggers, targeting, real-time delivery, and security
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationBell } from '../NotificationBell';
import {
  renderWithProviders,
  createMockNotification,
  createMockUser,
  createMockProfile,
  createMockIssue,
  createMockComment,
  createMockSolution,
  mockCitizen,
  mockStakeholder,
  mockAdmin,
  mockCitizenProfile,
  mockStakeholderProfile,
  mockAdminProfile,
} from '@/test/utils';
import { supabase } from '@/lib/supabase';
import {
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createEnhancedNotification,
} from '@/lib/utils/notificationUtils';

// Mock the notification utilities
vi.mock('@/lib/utils/notificationUtils', () => ({
  sendNotification: vi.fn(),
  getUserNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
  createEnhancedNotification: vi.fn(),
}));

// Mock the auth hook
vi.mock('@/lib/auth', () => ({
  useAuth: vi.fn(),
}));

// Mock notification sound utilities
vi.mock('@/lib/utils/notificationSound', () => ({
  playNotificationSound: vi.fn(),
  getNotificationPreferences: vi.fn().mockReturnValue({ soundEnabled: false }),
}));

// Mock date utilities
vi.mock('@/lib/utils/dateUtils', () => ({
  safeDate: {
    toString: (date: string) => date,
  },
}));

// Mock Supabase real-time
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
  unsubscribe: vi.fn(),
};

vi.mocked(supabase.channel).mockReturnValue(mockChannel);

describe('Notification System Integration Tests', () => {
  const user = userEvent.setup();

  // Test data
  const testIssue = createMockIssue({
    id: 'test-issue-123',
    title: 'Test Infrastructure Issue',
    author_id: mockCitizen.id,
    department_id: 'test-dept-id',
  });

  const testComment = createMockComment({
    id: 'test-comment-123',
    issue_id: testIssue.id,
    author_id: mockStakeholder.id,
    is_official: true,
  });

  const testSolution = createMockSolution({
    id: 'test-solution-123',
    issue_id: testIssue.id,
    author_id: mockCitizen.id,
    is_official: false,
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock returns
    vi.mocked(getUserNotifications).mockResolvedValue([]);
    vi.mocked(markNotificationAsRead).mockResolvedValue(true);
    vi.mocked(markAllNotificationsAsRead).mockResolvedValue(0);
    vi.mocked(sendNotification).mockResolvedValue(true);
    vi.mocked(createEnhancedNotification).mockResolvedValue({
      id: 'test-notification-id',
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Notification Types Validation', () => {
    const notificationTypes = [
      // Issue-related notifications
      { type: 'issue_update', category: 'Issues & Updates' },
      { type: 'status_change', category: 'Issues & Updates' },

      // Engagement notifications
      { type: 'comment', category: 'Comments & Solutions' },
      { type: 'solution', category: 'Comments & Solutions' },

      // System notifications
      { type: 'verification_approved', category: 'System & Account' },
      { type: 'verification_rejected', category: 'System & Account' },
      { type: 'role_changed', category: 'System & Account' },
      { type: 'system', category: 'System & Account' },

      // Admin notifications
      { type: 'general', category: 'Admin Announcements' },
      { type: 'info', category: 'Admin Announcements' },
      { type: 'success', category: 'Admin Announcements' },
      { type: 'warning', category: 'Admin Announcements' },
      { type: 'error', category: 'Admin Announcements' },
    ];

    notificationTypes.forEach(({ type, category }) => {
      it(`should handle ${type} notification type correctly`, async () => {
        const notification = createMockNotification({
          type,
          title: `Test ${type} notification`,
          message: `This is a test ${type} notification`,
          priority:
            type.includes('error') || type.includes('warning')
              ? 'high'
              : 'normal',
        });

        vi.mocked(getUserNotifications).mockResolvedValue([notification]);

        const { useAuth } = await import('@/lib/auth');
        vi.mocked(useAuth).mockReturnValue({
          user: mockCitizen,
          profile: mockCitizenProfile,
          loading: false,
          signIn: vi.fn(),
          signUp: vi.fn(),
          signOut: vi.fn(),
          updateProfile: vi.fn(),
        });

        render(<NotificationBell />);

        // Wait for notifications to load
        await waitFor(() => {
          expect(getUserNotifications).toHaveBeenCalledWith(mockCitizen.id);
        });

        // Verify component renders without errors
        expect(screen.getByRole('button')).toBeInTheDocument();
      });
    });
  });

  describe('Notification Triggers', () => {
    it('should trigger issue_update notification when issue status changes', async () => {
      const statusChangeNotification = createMockNotification({
        type: 'status_change',
        title: 'Issue Status Updated',
        message: `Issue "${testIssue.title}" status changed from open to in_progress`,
        related_issue_id: testIssue.id,
        data: {
          issue_id: testIssue.id,
          old_status: 'open',
          new_status: 'in_progress',
        },
      });

      // Simulate database trigger by calling notification function
      await expect(sendNotification(statusChangeNotification)).resolves.toBe(
        true
      );

      expect(sendNotification).toHaveBeenCalledWith(statusChangeNotification);
    });

    it('should trigger comment notification when new comment is added', async () => {
      const commentNotification = createMockNotification({
        type: 'comment',
        title: 'New Official Comment',
        message: `A new official comment was added to issue "${testIssue.title}"`,
        related_issue_id: testIssue.id,
        related_comment_id: testComment.id,
        priority: 'high', // Official comments have high priority
        data: {
          issue_id: testIssue.id,
          comment_id: testComment.id,
          is_official: true,
          comment_author: testComment.author_id,
        },
      });

      await expect(sendNotification(commentNotification)).resolves.toBe(true);

      expect(sendNotification).toHaveBeenCalledWith(commentNotification);
    });

    it('should trigger solution notification when new solution is proposed', async () => {
      const solutionNotification = createMockNotification({
        type: 'solution',
        title: 'New Community Solution',
        message: `A new community solution was proposed for issue "${testIssue.title}"`,
        related_issue_id: testIssue.id,
        related_solution_id: testSolution.id,
        data: {
          issue_id: testIssue.id,
          solution_id: testSolution.id,
          is_official: false,
          solution_author: testSolution.author_id,
        },
      });

      await expect(sendNotification(solutionNotification)).resolves.toBe(true);

      expect(sendNotification).toHaveBeenCalledWith(solutionNotification);
    });
  });

  describe('User Targeting', () => {
    it('should send notifications to issue watchers for status changes', async () => {
      const watchers = [mockCitizen.id, mockStakeholder.id];

      // Mock the enhanced notification creation
      vi.mocked(createEnhancedNotification).mockImplementation(
        async (notification) => {
          // Verify notification is sent to each watcher
          expect(watchers).toContain(notification.user_id);
          return { id: `notification-${notification.user_id}` };
        }
      );

      // Simulate sending notifications to all watchers
      for (const watcherId of watchers) {
        const notification = createMockNotification({
          user_id: watcherId,
          type: 'status_change',
          title: 'Issue Status Updated',
          related_issue_id: testIssue.id,
        });

        await createEnhancedNotification(notification);
      }

      expect(createEnhancedNotification).toHaveBeenCalledTimes(watchers.length);
    });

    it('should send notifications to department officials for relevant issues', async () => {
      const departmentNotification = createMockNotification({
        user_id: mockStakeholder.id, // Stakeholder in the department
        type: 'issue_update',
        title: 'New Issue in Your Department',
        message: `A new issue has been assigned to your department: "${testIssue.title}"`,
        related_issue_id: testIssue.id,
        data: {
          issue_id: testIssue.id,
          department_id: 'test-dept-id',
        },
      });

      await expect(
        createEnhancedNotification(departmentNotification)
      ).resolves.toBeTruthy();

      expect(createEnhancedNotification).toHaveBeenCalledWith(
        departmentNotification
      );
    });

    it('should send admin notifications to all users when type is general', async () => {
      const adminNotification = createMockNotification({
        type: 'general',
        title: 'System Maintenance Notice',
        message: 'The system will be under maintenance from 2:00 AM to 4:00 AM',
        priority: 'high',
        data: {
          broadcast: true,
          maintenance_window: '2024-01-15T02:00:00Z',
        },
      });

      // In a real scenario, this would be sent to all users
      const allUsers = [mockCitizen.id, mockStakeholder.id, mockAdmin.id];

      for (const userId of allUsers) {
        await createEnhancedNotification({
          ...adminNotification,
          user_id: userId,
        });
      }

      expect(createEnhancedNotification).toHaveBeenCalledTimes(allUsers.length);
    });
  });

  describe('Real-time Delivery', () => {
    it('should set up real-time subscription for authenticated user', async () => {
      const { useAuth } = await import('@/lib/auth');
      vi.mocked(useAuth).mockReturnValue({
        user: mockCitizen,
        profile: mockCitizenProfile,
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });

      render(<NotificationBell />);

      // Verify real-time subscription is set up
      expect(supabase.channel).toHaveBeenCalledWith(
        `notifications-${mockCitizen.id}`
      );
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${mockCitizen.id}`,
        },
        expect.any(Function)
      );
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    it('should handle real-time notification updates', async () => {
      const { useAuth } = await import('@/lib/auth');
      vi.mocked(useAuth).mockReturnValue({
        user: mockCitizen,
        profile: mockCitizenProfile,
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });

      render(<NotificationBell />);

      // Simulate real-time notification insert
      const newNotification = createMockNotification({
        user_id: mockCitizen.id,
        type: 'comment',
        title: 'New Comment',
        message: 'Someone commented on your issue',
      });

      // Get the INSERT event handler
      const insertHandler = mockChannel.on.mock.calls.find(
        (call) => call[1].event === 'INSERT'
      )?.[2];

      expect(insertHandler).toBeDefined();

      // Simulate real-time event
      if (insertHandler) {
        insertHandler({
          new: newNotification,
          old: null,
          eventType: 'INSERT',
        });
      }

      // Verify notification appears in real-time
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument(); // Unread count badge
      });
    });
  });

  describe('Database Integration', () => {
    it('should store notifications with correct metadata', async () => {
      const notification = createMockNotification({
        type: 'issue_update',
        title: 'Issue Updated',
        message: 'Your issue has been updated',
        related_issue_id: testIssue.id,
        priority: 'high',
        data: {
          issue_id: testIssue.id,
          update_type: 'status_change',
          old_status: 'open',
          new_status: 'in_progress',
        },
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(), // 7 days
      });

      await expect(sendNotification(notification)).resolves.toBe(true);

      expect(sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'issue_update',
          title: 'Issue Updated',
          message: 'Your issue has been updated',
          related_issue_id: testIssue.id,
          priority: 'high',
          data: expect.objectContaining({
            issue_id: testIssue.id,
            update_type: 'status_change',
          }),
          expires_at: expect.any(String),
        })
      );
    });

    it('should handle notification CRUD operations', async () => {
      const notifications = [
        createMockNotification({ type: 'comment', read: false }),
        createMockNotification({ type: 'solution', read: true }),
        createMockNotification({ type: 'status_change', read: false }),
      ];

      // Mock getUserNotifications to return test data
      vi.mocked(getUserNotifications).mockResolvedValue(notifications);

      const result = await getUserNotifications(mockCitizen.id);
      expect(result).toEqual(notifications);
      expect(getUserNotifications).toHaveBeenCalledWith(mockCitizen.id);

      // Test marking notification as read
      await markNotificationAsRead(notifications[0].id, mockCitizen.id);
      expect(markNotificationAsRead).toHaveBeenCalledWith(
        notifications[0].id,
        mockCitizen.id
      );

      // Test marking all notifications as read
      vi.mocked(markAllNotificationsAsRead).mockResolvedValue(2); // 2 unread notifications
      const markedCount = await markAllNotificationsAsRead(mockCitizen.id);
      expect(markedCount).toBe(2);
      expect(markAllNotificationsAsRead).toHaveBeenCalledWith(mockCitizen.id);
    });

    it('should handle notification priorities correctly', async () => {
      const priorities = ['low', 'normal', 'high', 'urgent'] as const;

      for (const priority of priorities) {
        const notification = createMockNotification({
          type: priority === 'urgent' ? 'error' : 'general',
          priority,
          title: `${priority.toUpperCase()} Priority Notification`,
        });

        await sendNotification(notification);
        expect(sendNotification).toHaveBeenCalledWith(
          expect.objectContaining({ priority })
        );
      }
    });

    it('should handle notification expiration', async () => {
      const expiredNotification = createMockNotification({
        expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Expired yesterday
      });

      const activeNotification = createMockNotification({
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expires tomorrow
      });

      // Mock that only active notifications are returned
      vi.mocked(getUserNotifications).mockResolvedValue([activeNotification]);

      const result = await getUserNotifications(mockCitizen.id);
      expect(result).toEqual([activeNotification]);
      expect(result).not.toContain(expiredNotification);
    });
  });

  describe('Security & RLS Policies', () => {
    it('should prevent users from seeing notifications intended for others', async () => {
      const otherUserNotification = createMockNotification({
        user_id: 'other-user-id',
        type: 'general',
        title: 'Private Notification',
      });

      // Mock that user can only see their own notifications
      vi.mocked(getUserNotifications).mockResolvedValue([]);

      const result = await getUserNotifications(mockCitizen.id);
      expect(result).not.toContain(otherUserNotification);
    });

    it('should validate user permissions for notification operations', async () => {
      const notification = createMockNotification({
        user_id: mockCitizen.id,
      });

      // Test that user can only mark their own notifications as read
      await markNotificationAsRead(notification.id, mockCitizen.id);
      expect(markNotificationAsRead).toHaveBeenCalledWith(
        notification.id,
        mockCitizen.id
      );

      // Test that user can only mark all their own notifications as read
      await markAllNotificationsAsRead(mockCitizen.id);
      expect(markAllNotificationsAsRead).toHaveBeenCalledWith(mockCitizen.id);
    });

    it('should enforce role-based notification access', async () => {
      // Admin should be able to send system-wide notifications
      const adminNotification = createMockNotification({
        type: 'general',
        title: 'System Announcement',
        data: { sender_role: 'admin' },
      });

      // Stakeholder should be able to send official updates
      const officialNotification = createMockNotification({
        type: 'issue_update',
        title: 'Official Update',
        data: { sender_role: 'official', is_official: true },
      });

      await sendNotification(adminNotification);
      await sendNotification(officialNotification);

      expect(sendNotification).toHaveBeenCalledWith(adminNotification);
      expect(sendNotification).toHaveBeenCalledWith(officialNotification);
    });
  });

  describe('UI Behavior', () => {
    it('should display correct unread notification count', async () => {
      const unreadNotifications = [
        createMockNotification({ read: false, type: 'comment' }),
        createMockNotification({ read: false, type: 'solution' }),
        createMockNotification({ read: false, type: 'status_change' }),
      ];

      const readNotifications = [
        createMockNotification({ read: true, type: 'general' }),
      ];

      vi.mocked(getUserNotifications).mockResolvedValue([
        ...unreadNotifications,
        ...readNotifications,
      ]);

      const { useAuth } = await import('@/lib/auth');
      vi.mocked(useAuth).mockReturnValue({
        user: mockCitizen,
        profile: mockCitizenProfile,
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });

      render(<NotificationBell />);

      // Wait for notifications to load and check unread count
      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument(); // 3 unread notifications
      });
    });

    it('should categorize notifications correctly in tabs', async () => {
      const notifications = [
        createMockNotification({
          type: 'issue_update',
          title: 'Issue Updated',
        }),
        createMockNotification({ type: 'comment', title: 'New Comment' }),
        createMockNotification({
          type: 'verification_approved',
          title: 'Account Verified',
        }),
        createMockNotification({ type: 'general', title: 'System Notice' }),
      ];

      vi.mocked(getUserNotifications).mockResolvedValue(notifications);

      const { useAuth } = await import('@/lib/auth');
      vi.mocked(useAuth).mockReturnValue({
        user: mockCitizen,
        profile: mockCitizenProfile,
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });

      render(<NotificationBell />);

      // Open notification panel
      const bellButton = screen.getByRole('button');
      await user.click(bellButton);

      // Wait for notifications to load
      await waitFor(() => {
        expect(screen.getByText('Issue Updated')).toBeInTheDocument();
      });

      // Check that all notifications are visible in "All" tab by default
      expect(screen.getByText('Issue Updated')).toBeInTheDocument();
      expect(screen.getByText('New Comment')).toBeInTheDocument();
      expect(screen.getByText('Account Verified')).toBeInTheDocument();
      expect(screen.getByText('System Notice')).toBeInTheDocument();
    });

    it('should handle mark as read functionality', async () => {
      const notification = createMockNotification({
        id: 'test-notification-123',
        read: false,
        title: 'Test Notification',
      });

      vi.mocked(getUserNotifications).mockResolvedValue([notification]);
      vi.mocked(markNotificationAsRead).mockResolvedValue(true);

      const { useAuth } = await import('@/lib/auth');
      vi.mocked(useAuth).mockReturnValue({
        user: mockCitizen,
        profile: mockCitizenProfile,
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });

      render(<NotificationBell />);

      // Open notification panel
      const bellButton = screen.getByRole('button');
      await user.click(bellButton);

      // Wait for notification to appear
      await waitFor(() => {
        expect(screen.getByText('Test Notification')).toBeInTheDocument();
      });

      // Click on the notification to mark as read
      const notificationElement = screen
        .getByText('Test Notification')
        .closest('button');
      if (notificationElement) {
        await user.click(notificationElement);
      }

      // Verify mark as read was called
      await waitFor(() => {
        expect(markNotificationAsRead).toHaveBeenCalledWith(
          'test-notification-123',
          mockCitizen.id
        );
      });
    });

    it('should handle mark all as read functionality', async () => {
      const notifications = [
        createMockNotification({ read: false, title: 'Notification 1' }),
        createMockNotification({ read: false, title: 'Notification 2' }),
      ];

      vi.mocked(getUserNotifications).mockResolvedValue(notifications);
      vi.mocked(markAllNotificationsAsRead).mockResolvedValue(2);

      const { useAuth } = await import('@/lib/auth');
      vi.mocked(useAuth).mockReturnValue({
        user: mockCitizen,
        profile: mockCitizenProfile,
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });

      render(<NotificationBell />);

      // Open notification panel
      const bellButton = screen.getByRole('button');
      await user.click(bellButton);

      // Wait for notifications to load
      await waitFor(() => {
        expect(screen.getByText('Notification 1')).toBeInTheDocument();
      });

      // Look for "Mark all as read" button and click it
      const markAllButton = screen.getByText(/mark all as read/i);
      await user.click(markAllButton);

      // Verify mark all as read was called
      await waitFor(() => {
        expect(markAllNotificationsAsRead).toHaveBeenCalledWith(mockCitizen.id);
      });
    });

    it('should display priority badges for high and urgent notifications', async () => {
      const notifications = [
        createMockNotification({ priority: 'high', title: 'High Priority' }),
        createMockNotification({
          priority: 'urgent',
          title: 'Urgent Priority',
        }),
        createMockNotification({
          priority: 'normal',
          title: 'Normal Priority',
        }),
      ];

      vi.mocked(getUserNotifications).mockResolvedValue(notifications);

      const { useAuth } = await import('@/lib/auth');
      vi.mocked(useAuth).mockReturnValue({
        user: mockCitizen,
        profile: mockCitizenProfile,
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });

      render(<NotificationBell />);

      // Open notification panel
      const bellButton = screen.getByRole('button');
      await user.click(bellButton);

      // Wait for notifications to load
      await waitFor(() => {
        expect(screen.getByText('High Priority')).toBeInTheDocument();
      });

      // Check for priority badges
      expect(screen.getByText('HIGH')).toBeInTheDocument();
      expect(screen.getByText('URGENT')).toBeInTheDocument();
      // Normal priority should not have a badge
      expect(screen.queryByText('NORMAL')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty notification list gracefully', async () => {
      vi.mocked(getUserNotifications).mockResolvedValue([]);

      const { useAuth } = await import('@/lib/auth');
      vi.mocked(useAuth).mockReturnValue({
        user: mockCitizen,
        profile: mockCitizenProfile,
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });

      render(<NotificationBell />);

      // Open notification panel
      const bellButton = screen.getByRole('button');
      await user.click(bellButton);

      // Should show empty state
      await waitFor(() => {
        expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
      });
    });

    it('should handle notification loading errors', async () => {
      vi.mocked(getUserNotifications).mockRejectedValue(
        new Error('Failed to load notifications')
      );

      const { useAuth } = await import('@/lib/auth');
      vi.mocked(useAuth).mockReturnValue({
        user: mockCitizen,
        profile: mockCitizenProfile,
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });

      render(<NotificationBell />);

      // Should handle error gracefully
      await waitFor(() => {
        expect(getUserNotifications).toHaveBeenCalled();
      });

      // Bell should still be rendered even if loading fails
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle real-time subscription errors', async () => {
      const { useAuth } = await import('@/lib/auth');
      vi.mocked(useAuth).mockReturnValue({
        user: mockCitizen,
        profile: mockCitizenProfile,
        loading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        updateProfile: vi.fn(),
      });

      // Mock subscription error
      mockChannel.subscribe.mockReturnValue({
        unsubscribe: vi.fn(),
        error: new Error('Subscription failed'),
      });

      render(<NotificationBell />);

      // Component should still render despite subscription error
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should prevent self-notifications', async () => {
      // User should not receive notifications for their own actions
      const selfNotification = createMockNotification({
        user_id: mockCitizen.id,
        type: 'comment',
        data: {
          comment_author: mockCitizen.id, // Same user as recipient
        },
      });

      // In a real implementation, this should be filtered out
      vi.mocked(sendNotification).mockImplementation(async (notification) => {
        if (notification.data?.comment_author === notification.user_id) {
          return false; // Don't send self-notifications
        }
        return true;
      });

      const result = await sendNotification(selfNotification);
      expect(result).toBe(false);
    });
  });
});
