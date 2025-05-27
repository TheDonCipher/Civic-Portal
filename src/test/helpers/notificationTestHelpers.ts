/**
 * Notification System Test Helpers
 * Utilities for creating test data, database operations, and cleanup
 */

import { supabase } from '@/lib/supabase';
import { 
  createMockNotification,
  createMockUser,
  createMockProfile,
  createMockIssue,
  createMockComment,
  createMockSolution,
  createMockDepartment
} from '@/test/utils';

// Test data creation helpers
export class NotificationTestDataFactory {
  private static testDataIds: string[] = [];

  /**
   * Create a test user with profile
   */
  static async createTestUser(role: 'citizen' | 'official' | 'admin' = 'citizen', departmentId?: string) {
    const user = createMockUser({
      id: `test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_metadata: { role },
    });

    const profile = createMockProfile({
      id: user.id,
      role,
      department_id: departmentId || null,
    });

    // In a real test environment, you would insert these into the database
    // For now, we'll just track the IDs for cleanup
    this.testDataIds.push(user.id);

    return { user, profile };
  }

  /**
   * Create a test issue
   */
  static async createTestIssue(authorId: string, departmentId?: string) {
    const issue = createMockIssue({
      id: `test-issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      author_id: authorId,
      department_id: departmentId || null,
    });

    this.testDataIds.push(issue.id);
    return issue;
  }

  /**
   * Create a test comment
   */
  static async createTestComment(issueId: string, authorId: string, isOfficial = false) {
    const comment = createMockComment({
      id: `test-comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      issue_id: issueId,
      author_id: authorId,
      is_official: isOfficial,
    });

    this.testDataIds.push(comment.id);
    return comment;
  }

  /**
   * Create a test solution
   */
  static async createTestSolution(issueId: string, authorId: string, isOfficial = false) {
    const solution = createMockSolution({
      id: `test-solution-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      issue_id: issueId,
      author_id: authorId,
      is_official: isOfficial,
    });

    this.testDataIds.push(solution.id);
    return solution;
  }

  /**
   * Create a test notification
   */
  static async createTestNotification(userId: string, type: string, overrides: any = {}) {
    const notification = createMockNotification({
      id: `test-notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      type,
      ...overrides,
    });

    this.testDataIds.push(notification.id);
    return notification;
  }

  /**
   * Create a test department
   */
  static async createTestDepartment() {
    const department = createMockDepartment({
      id: `test-dept-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });

    this.testDataIds.push(department.id);
    return department;
  }

  /**
   * Clean up all test data
   */
  static async cleanup() {
    // In a real test environment, you would delete all test data from the database
    // For now, we'll just clear the tracking array
    this.testDataIds = [];
  }

  /**
   * Get all test data IDs for manual cleanup
   */
  static getTestDataIds() {
    return [...this.testDataIds];
  }
}

// Database operation helpers
export class NotificationDatabaseHelpers {
  /**
   * Insert test notification directly into database
   */
  static async insertTestNotification(notification: any) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to insert test notification: ${error.message}`);
    }

    return data;
  }

  /**
   * Get notifications for a user
   */
  static async getNotificationsForUser(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get notifications: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Delete test notifications
   */
  static async deleteTestNotifications(notificationIds: string[]) {
    if (notificationIds.length === 0) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .in('id', notificationIds);

    if (error) {
      throw new Error(`Failed to delete test notifications: ${error.message}`);
    }
  }

  /**
   * Clean up all test data from database
   */
  static async cleanupTestData() {
    // Delete test notifications (those with test- prefix in ID)
    await supabase
      .from('notifications')
      .delete()
      .like('id', 'test-%');

    // Delete test issues
    await supabase
      .from('issues')
      .delete()
      .like('id', 'test-%');

    // Delete test comments
    await supabase
      .from('comments')
      .delete()
      .like('id', 'test-%');

    // Delete test solutions
    await supabase
      .from('solutions')
      .delete()
      .like('id', 'test-%');

    // Delete test profiles
    await supabase
      .from('profiles')
      .delete()
      .like('id', 'test-%');

    // Delete test departments
    await supabase
      .from('departments')
      .delete()
      .like('id', 'test-%');
  }
}

// Notification trigger testing helpers
export class NotificationTriggerHelpers {
  /**
   * Test issue status change trigger
   */
  static async testIssueStatusChangeTrigger(issueId: string, oldStatus: string, newStatus: string) {
    // In a real test, this would update the issue status and verify notifications are created
    const { error } = await supabase
      .from('issues')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', issueId);

    if (error) {
      throw new Error(`Failed to update issue status: ${error.message}`);
    }

    // Wait a bit for triggers to fire
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Test comment creation trigger
   */
  static async testCommentCreationTrigger(comment: any) {
    const { error } = await supabase
      .from('comments')
      .insert(comment);

    if (error) {
      throw new Error(`Failed to insert comment: ${error.message}`);
    }

    // Wait a bit for triggers to fire
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Test solution creation trigger
   */
  static async testSolutionCreationTrigger(solution: any) {
    const { error } = await supabase
      .from('solutions')
      .insert(solution);

    if (error) {
      throw new Error(`Failed to insert solution: ${error.message}`);
    }

    // Wait a bit for triggers to fire
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Real-time subscription testing helpers
export class RealTimeTestHelpers {
  /**
   * Mock real-time notification event
   */
  static createMockRealTimeEvent(eventType: 'INSERT' | 'UPDATE' | 'DELETE', notification: any) {
    return {
      eventType,
      new: eventType === 'DELETE' ? null : notification,
      old: eventType === 'INSERT' ? null : notification,
      schema: 'public',
      table: 'notifications',
      commit_timestamp: new Date().toISOString(),
    };
  }

  /**
   * Simulate real-time notification delivery
   */
  static async simulateRealTimeNotification(channel: any, notification: any) {
    const event = this.createMockRealTimeEvent('INSERT', notification);
    
    // Find the INSERT handler
    const insertHandler = channel.on.mock.calls.find(
      (call: any) => call[1].event === 'INSERT'
    )?.[2];

    if (insertHandler) {
      insertHandler(event);
    }
  }
}

// Security testing helpers
export class SecurityTestHelpers {
  /**
   * Test RLS policy enforcement
   */
  static async testRLSPolicyEnforcement(userId: string, otherUserId: string) {
    // Try to access another user's notifications
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', otherUserId);

    // Should return empty array or error due to RLS
    return { data: data || [], error };
  }

  /**
   * Test notification permission validation
   */
  static async testNotificationPermissions(userId: string, notificationId: string) {
    // Try to mark another user's notification as read
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .neq('user_id', userId); // Notification belongs to different user

    return { error };
  }
}

// Performance testing helpers
export class PerformanceTestHelpers {
  /**
   * Create bulk notifications for performance testing
   */
  static async createBulkNotifications(userId: string, count: number) {
    const notifications = Array.from({ length: count }, (_, index) => 
      createMockNotification({
        id: `perf-test-${Date.now()}-${index}`,
        user_id: userId,
        title: `Performance Test Notification ${index + 1}`,
      })
    );

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) {
      throw new Error(`Failed to create bulk notifications: ${error.message}`);
    }

    return notifications;
  }

  /**
   * Measure notification query performance
   */
  static async measureQueryPerformance(userId: string) {
    const startTime = performance.now();
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    const endTime = performance.now();
    const duration = endTime - startTime;

    return {
      duration,
      count: data?.length || 0,
      error,
    };
  }
}

// Export all helpers
export {
  NotificationTestDataFactory as TestDataFactory,
  NotificationDatabaseHelpers as DatabaseHelpers,
  NotificationTriggerHelpers as TriggerHelpers,
  RealTimeTestHelpers,
  SecurityTestHelpers,
  PerformanceTestHelpers,
};
