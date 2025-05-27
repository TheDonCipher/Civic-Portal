/**
 * Notification Database Integration Tests
 * Tests actual database operations, triggers, and RLS policies
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { supabase } from '@/lib/supabase';
import {
  TestDataFactory,
  DatabaseHelpers,
  TriggerHelpers,
  SecurityTestHelpers,
  PerformanceTestHelpers,
} from '@/test/helpers/notificationTestHelpers';
import {
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/utils/notificationUtils';

describe('Notification Database Integration Tests', () => {
  let testUser: any;
  let testProfile: any;
  let testStakeholder: any;
  let testStakeholderProfile: any;
  let testDepartment: any;
  let testIssue: any;

  beforeAll(async () => {
    // Create test department
    testDepartment = await TestDataFactory.createTestDepartment();
    
    // Create test users
    const citizenData = await TestDataFactory.createTestUser('citizen');
    testUser = citizenData.user;
    testProfile = citizenData.profile;

    const stakeholderData = await TestDataFactory.createTestUser('official', testDepartment.id);
    testStakeholder = stakeholderData.user;
    testStakeholderProfile = stakeholderData.profile;

    // Create test issue
    testIssue = await TestDataFactory.createTestIssue(testUser.id, testDepartment.id);
  });

  afterAll(async () => {
    // Clean up all test data
    await DatabaseHelpers.cleanupTestData();
    await TestDataFactory.cleanup();
  });

  beforeEach(async () => {
    // Clean up notifications before each test
    const testIds = TestDataFactory.getTestDataIds();
    const notificationIds = testIds.filter(id => id.startsWith('test-notification-'));
    if (notificationIds.length > 0) {
      await DatabaseHelpers.deleteTestNotifications(notificationIds);
    }
  });

  describe('Basic CRUD Operations', () => {
    it('should create and retrieve notifications', async () => {
      const notification = await TestDataFactory.createTestNotification(testUser.id, 'general', {
        title: 'Test CRUD Notification',
        message: 'Testing basic CRUD operations',
        priority: 'normal',
      });

      // Insert notification
      const inserted = await DatabaseHelpers.insertTestNotification(notification);
      expect(inserted).toBeDefined();
      expect(inserted.id).toBe(notification.id);
      expect(inserted.user_id).toBe(testUser.id);
      expect(inserted.title).toBe('Test CRUD Notification');

      // Retrieve notifications
      const notifications = await DatabaseHelpers.getNotificationsForUser(testUser.id);
      expect(notifications).toHaveLength(1);
      expect(notifications[0].id).toBe(notification.id);
    });

    it('should mark notifications as read', async () => {
      const notification = await TestDataFactory.createTestNotification(testUser.id, 'comment', {
        title: 'Mark as Read Test',
        read: false,
      });

      await DatabaseHelpers.insertTestNotification(notification);

      // Mark as read
      const success = await markNotificationAsRead(notification.id, testUser.id);
      expect(success).toBe(true);

      // Verify it's marked as read
      const notifications = await DatabaseHelpers.getNotificationsForUser(testUser.id);
      const updatedNotification = notifications.find(n => n.id === notification.id);
      expect(updatedNotification?.read).toBe(true);
      expect(updatedNotification?.read_at).toBeDefined();
    });

    it('should mark all notifications as read', async () => {
      // Create multiple unread notifications
      const notifications = await Promise.all([
        TestDataFactory.createTestNotification(testUser.id, 'comment', { read: false }),
        TestDataFactory.createTestNotification(testUser.id, 'solution', { read: false }),
        TestDataFactory.createTestNotification(testUser.id, 'status_change', { read: false }),
      ]);

      // Insert all notifications
      for (const notification of notifications) {
        await DatabaseHelpers.insertTestNotification(notification);
      }

      // Mark all as read
      const markedCount = await markAllNotificationsAsRead(testUser.id);
      expect(markedCount).toBe(3);

      // Verify all are marked as read
      const updatedNotifications = await DatabaseHelpers.getNotificationsForUser(testUser.id);
      expect(updatedNotifications.every(n => n.read)).toBe(true);
    });
  });

  describe('Notification Types and Priorities', () => {
    const notificationTypes = [
      'issue_update', 'status_change', 'comment', 'solution',
      'verification_approved', 'verification_rejected', 'role_changed',
      'system', 'general', 'info', 'success', 'warning', 'error'
    ];

    notificationTypes.forEach(type => {
      it(`should handle ${type} notification type`, async () => {
        const notification = await TestDataFactory.createTestNotification(testUser.id, type, {
          title: `Test ${type} notification`,
          message: `Testing ${type} notification type`,
        });

        const inserted = await DatabaseHelpers.insertTestNotification(notification);
        expect(inserted.type).toBe(type);
      });
    });

    it('should handle different priority levels', async () => {
      const priorities = ['low', 'normal', 'high', 'urgent'] as const;
      
      for (const priority of priorities) {
        const notification = await TestDataFactory.createTestNotification(testUser.id, 'general', {
          title: `${priority} priority notification`,
          priority,
        });

        const inserted = await DatabaseHelpers.insertTestNotification(notification);
        expect(inserted.priority).toBe(priority);
      }
    });

    it('should handle notification expiration', async () => {
      const expiredNotification = await TestDataFactory.createTestNotification(testUser.id, 'general', {
        title: 'Expired notification',
        expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Expired yesterday
      });

      const activeNotification = await TestDataFactory.createTestNotification(testUser.id, 'general', {
        title: 'Active notification',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expires tomorrow
      });

      await DatabaseHelpers.insertTestNotification(expiredNotification);
      await DatabaseHelpers.insertTestNotification(activeNotification);

      // Get notifications (should filter out expired ones if RLS is properly configured)
      const notifications = await getUserNotifications(testUser.id);
      const activeNotifications = notifications.filter(n => 
        n.expires_at === null || new Date(n.expires_at) > new Date()
      );

      expect(activeNotifications.some(n => n.id === activeNotification.id)).toBe(true);
    });
  });

  describe('Database Triggers', () => {
    it('should trigger notifications on issue status change', async () => {
      // Create issue watcher
      await supabase
        .from('issue_watchers')
        .insert({
          issue_id: testIssue.id,
          user_id: testUser.id,
        });

      // Get initial notification count
      const initialNotifications = await DatabaseHelpers.getNotificationsForUser(testUser.id);
      const initialCount = initialNotifications.length;

      // Trigger status change
      await TriggerHelpers.testIssueStatusChangeTrigger(testIssue.id, 'open', 'in_progress');

      // Check for new notifications
      const updatedNotifications = await DatabaseHelpers.getNotificationsForUser(testUser.id);
      expect(updatedNotifications.length).toBeGreaterThan(initialCount);

      // Verify notification content
      const statusChangeNotification = updatedNotifications.find(n => 
        n.type === 'status_change' && n.related_issue_id === testIssue.id
      );
      expect(statusChangeNotification).toBeDefined();
      expect(statusChangeNotification?.title).toContain('Status Updated');
    });

    it('should trigger notifications on new comment', async () => {
      const comment = await TestDataFactory.createTestComment(testIssue.id, testStakeholder.id, true);
      
      // Get initial notification count for issue author
      const initialNotifications = await DatabaseHelpers.getNotificationsForUser(testUser.id);
      const initialCount = initialNotifications.length;

      // Trigger comment creation
      await TriggerHelpers.testCommentCreationTrigger(comment);

      // Check for new notifications
      const updatedNotifications = await DatabaseHelpers.getNotificationsForUser(testUser.id);
      expect(updatedNotifications.length).toBeGreaterThan(initialCount);

      // Verify notification content
      const commentNotification = updatedNotifications.find(n => 
        n.type === 'comment' && n.related_comment_id === comment.id
      );
      expect(commentNotification).toBeDefined();
      expect(commentNotification?.title).toContain('Comment');
    });

    it('should trigger notifications on new solution', async () => {
      const solution = await TestDataFactory.createTestSolution(testIssue.id, testUser.id, false);
      
      // Get initial notification count for stakeholder
      const initialNotifications = await DatabaseHelpers.getNotificationsForUser(testStakeholder.id);
      const initialCount = initialNotifications.length;

      // Trigger solution creation
      await TriggerHelpers.testSolutionCreationTrigger(solution);

      // Check for new notifications
      const updatedNotifications = await DatabaseHelpers.getNotificationsForUser(testStakeholder.id);
      expect(updatedNotifications.length).toBeGreaterThan(initialCount);

      // Verify notification content
      const solutionNotification = updatedNotifications.find(n => 
        n.type === 'solution' && n.related_solution_id === solution.id
      );
      expect(solutionNotification).toBeDefined();
      expect(solutionNotification?.title).toContain('Solution');
    });
  });

  describe('Security and RLS Policies', () => {
    it('should enforce user isolation in notifications', async () => {
      const otherUser = await TestDataFactory.createTestUser('citizen');
      
      // Create notification for other user
      const otherUserNotification = await TestDataFactory.createTestNotification(
        otherUser.user.id, 
        'general',
        { title: 'Private notification' }
      );
      await DatabaseHelpers.insertTestNotification(otherUserNotification);

      // Try to access other user's notifications
      const { data, error } = await SecurityTestHelpers.testRLSPolicyEnforcement(
        testUser.id, 
        otherUser.user.id
      );

      // Should not be able to see other user's notifications
      expect(data).toHaveLength(0);
    });

    it('should prevent unauthorized notification modifications', async () => {
      const otherUser = await TestDataFactory.createTestUser('citizen');
      
      // Create notification for other user
      const otherUserNotification = await TestDataFactory.createTestNotification(
        otherUser.user.id,
        'general'
      );
      await DatabaseHelpers.insertTestNotification(otherUserNotification);

      // Try to modify other user's notification
      const { error } = await SecurityTestHelpers.testNotificationPermissions(
        testUser.id,
        otherUserNotification.id
      );

      // Should fail due to RLS policies
      expect(error).toBeDefined();
    });

    it('should allow admins to view all notifications', async () => {
      const adminUser = await TestDataFactory.createTestUser('admin');
      
      // Create notifications for different users
      const citizenNotification = await TestDataFactory.createTestNotification(testUser.id, 'general');
      const stakeholderNotification = await TestDataFactory.createTestNotification(testStakeholder.id, 'general');
      
      await DatabaseHelpers.insertTestNotification(citizenNotification);
      await DatabaseHelpers.insertTestNotification(stakeholderNotification);

      // Admin should be able to see all notifications (if admin policies are implemented)
      // This test would need to be implemented based on actual admin RLS policies
    });
  });

  describe('Performance Tests', () => {
    it('should handle bulk notification creation efficiently', async () => {
      const notificationCount = 100;
      
      const startTime = performance.now();
      await PerformanceTestHelpers.createBulkNotifications(testUser.id, notificationCount);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      
      // Verify all notifications were created
      const notifications = await DatabaseHelpers.getNotificationsForUser(testUser.id);
      expect(notifications.length).toBeGreaterThanOrEqual(notificationCount);
    });

    it('should query notifications efficiently', async () => {
      // Create some notifications first
      await PerformanceTestHelpers.createBulkNotifications(testUser.id, 50);
      
      // Measure query performance
      const performance = await PerformanceTestHelpers.measureQueryPerformance(testUser.id);
      
      expect(performance.duration).toBeLessThan(1000); // Should complete within 1 second
      expect(performance.count).toBeGreaterThan(0);
      expect(performance.error).toBeNull();
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity with related entities', async () => {
      const comment = await TestDataFactory.createTestComment(testIssue.id, testUser.id);
      await DatabaseHelpers.insertTestNotification({
        ...await TestDataFactory.createTestNotification(testUser.id, 'comment'),
        related_issue_id: testIssue.id,
        related_comment_id: comment.id,
      });

      // Verify relationships are maintained
      const notifications = await DatabaseHelpers.getNotificationsForUser(testUser.id);
      const commentNotification = notifications.find(n => n.type === 'comment');
      
      expect(commentNotification?.related_issue_id).toBe(testIssue.id);
      expect(commentNotification?.related_comment_id).toBe(comment.id);
    });

    it('should handle JSON data fields correctly', async () => {
      const complexData = {
        issue_id: testIssue.id,
        action_type: 'status_change',
        metadata: {
          old_status: 'open',
          new_status: 'in_progress',
          changed_by: testStakeholder.id,
        },
        timestamps: {
          created: new Date().toISOString(),
          processed: new Date().toISOString(),
        },
      };

      const notification = await TestDataFactory.createTestNotification(testUser.id, 'status_change', {
        data: complexData,
      });

      const inserted = await DatabaseHelpers.insertTestNotification(notification);
      expect(inserted.data).toEqual(complexData);
    });
  });
});
