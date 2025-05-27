/**
 * Notification Test Cleanup Utility
 * Cleans up test data after notification system tests
 */

import { supabase } from '@/lib/supabase';

interface CleanupResult {
  success: boolean;
  message: string;
  deletedCounts: {
    notifications: number;
    issues: number;
    comments: number;
    solutions: number;
    profiles: number;
    departments: number;
    watchers: number;
  };
  errors: string[];
}

/**
 * Clean up all test data from the database
 */
export async function cleanupNotificationTestData(): Promise<CleanupResult> {
  const result: CleanupResult = {
    success: true,
    message: '',
    deletedCounts: {
      notifications: 0,
      issues: 0,
      comments: 0,
      solutions: 0,
      profiles: 0,
      departments: 0,
      watchers: 0,
    },
    errors: [],
  };

  try {
    console.log('🧹 Starting notification test data cleanup...');

    // Clean up notifications first (to avoid foreign key constraints)
    console.log('Cleaning up test notifications...');
    const { data: deletedNotifications, error: notificationError } = await supabase
      .from('notifications')
      .delete()
      .or('id.like.test-%,id.like.perf-test-%,title.like.%Test%,message.like.%test%')
      .select('id');

    if (notificationError) {
      result.errors.push(`Notification cleanup error: ${notificationError.message}`);
    } else {
      result.deletedCounts.notifications = deletedNotifications?.length || 0;
      console.log(`✅ Deleted ${result.deletedCounts.notifications} test notifications`);
    }

    // Clean up issue watchers
    console.log('Cleaning up test issue watchers...');
    const { data: deletedWatchers, error: watcherError } = await supabase
      .from('issue_watchers')
      .delete()
      .or('issue_id.like.test-%,user_id.like.test-%')
      .select('issue_id, user_id');

    if (watcherError) {
      result.errors.push(`Watcher cleanup error: ${watcherError.message}`);
    } else {
      result.deletedCounts.watchers = deletedWatchers?.length || 0;
      console.log(`✅ Deleted ${result.deletedCounts.watchers} test watchers`);
    }

    // Clean up solutions
    console.log('Cleaning up test solutions...');
    const { data: deletedSolutions, error: solutionError } = await supabase
      .from('solutions')
      .delete()
      .or('id.like.test-%,title.like.%Test%')
      .select('id');

    if (solutionError) {
      result.errors.push(`Solution cleanup error: ${solutionError.message}`);
    } else {
      result.deletedCounts.solutions = deletedSolutions?.length || 0;
      console.log(`✅ Deleted ${result.deletedCounts.solutions} test solutions`);
    }

    // Clean up comments
    console.log('Cleaning up test comments...');
    const { data: deletedComments, error: commentError } = await supabase
      .from('comments')
      .delete()
      .or('id.like.test-%,content.like.%test%')
      .select('id');

    if (commentError) {
      result.errors.push(`Comment cleanup error: ${commentError.message}`);
    } else {
      result.deletedCounts.comments = deletedComments?.length || 0;
      console.log(`✅ Deleted ${result.deletedCounts.comments} test comments`);
    }

    // Clean up issues
    console.log('Cleaning up test issues...');
    const { data: deletedIssues, error: issueError } = await supabase
      .from('issues')
      .delete()
      .or('id.like.test-%,title.like.%Test%')
      .select('id');

    if (issueError) {
      result.errors.push(`Issue cleanup error: ${issueError.message}`);
    } else {
      result.deletedCounts.issues = deletedIssues?.length || 0;
      console.log(`✅ Deleted ${result.deletedCounts.issues} test issues`);
    }

    // Clean up profiles
    console.log('Cleaning up test profiles...');
    const { data: deletedProfiles, error: profileError } = await supabase
      .from('profiles')
      .delete()
      .or('id.like.test-%,full_name.like.%Test%')
      .select('id');

    if (profileError) {
      result.errors.push(`Profile cleanup error: ${profileError.message}`);
    } else {
      result.deletedCounts.profiles = deletedProfiles?.length || 0;
      console.log(`✅ Deleted ${result.deletedCounts.profiles} test profiles`);
    }

    // Clean up departments
    console.log('Cleaning up test departments...');
    const { data: deletedDepartments, error: departmentError } = await supabase
      .from('departments')
      .delete()
      .or('id.like.test-%,name.like.%Test%')
      .select('id');

    if (departmentError) {
      result.errors.push(`Department cleanup error: ${departmentError.message}`);
    } else {
      result.deletedCounts.departments = deletedDepartments?.length || 0;
      console.log(`✅ Deleted ${result.deletedCounts.departments} test departments`);
    }

    // Calculate total deleted items
    const totalDeleted = Object.values(result.deletedCounts).reduce((sum, count) => sum + count, 0);

    if (result.errors.length === 0) {
      result.message = `✅ Cleanup completed successfully! Deleted ${totalDeleted} test items.`;
      console.log(result.message);
    } else {
      result.success = false;
      result.message = `⚠️ Cleanup completed with ${result.errors.length} errors. Deleted ${totalDeleted} test items.`;
      console.warn(result.message);
      result.errors.forEach(error => console.error(`❌ ${error}`));
    }

  } catch (error) {
    result.success = false;
    result.message = `❌ Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    result.errors.push(result.message);
    console.error(result.message);
  }

  return result;
}

/**
 * Clean up specific test data by IDs
 */
export async function cleanupSpecificTestData(testIds: string[]): Promise<CleanupResult> {
  const result: CleanupResult = {
    success: true,
    message: '',
    deletedCounts: {
      notifications: 0,
      issues: 0,
      comments: 0,
      solutions: 0,
      profiles: 0,
      departments: 0,
      watchers: 0,
    },
    errors: [],
  };

  if (testIds.length === 0) {
    result.message = 'No test IDs provided for cleanup';
    return result;
  }

  try {
    console.log(`🧹 Cleaning up specific test data for ${testIds.length} items...`);

    // Clean up notifications
    const notificationIds = testIds.filter(id => id.includes('notification'));
    if (notificationIds.length > 0) {
      const { data: deletedNotifications, error: notificationError } = await supabase
        .from('notifications')
        .delete()
        .in('id', notificationIds)
        .select('id');

      if (notificationError) {
        result.errors.push(`Notification cleanup error: ${notificationError.message}`);
      } else {
        result.deletedCounts.notifications = deletedNotifications?.length || 0;
      }
    }

    // Clean up other entities similarly...
    const issueIds = testIds.filter(id => id.includes('issue'));
    if (issueIds.length > 0) {
      const { data: deletedIssues, error: issueError } = await supabase
        .from('issues')
        .delete()
        .in('id', issueIds)
        .select('id');

      if (issueError) {
        result.errors.push(`Issue cleanup error: ${issueError.message}`);
      } else {
        result.deletedCounts.issues = deletedIssues?.length || 0;
      }
    }

    // Continue for other entity types...

    const totalDeleted = Object.values(result.deletedCounts).reduce((sum, count) => sum + count, 0);
    
    if (result.errors.length === 0) {
      result.message = `✅ Specific cleanup completed! Deleted ${totalDeleted} items.`;
    } else {
      result.success = false;
      result.message = `⚠️ Specific cleanup completed with errors. Deleted ${totalDeleted} items.`;
    }

  } catch (error) {
    result.success = false;
    result.message = `❌ Specific cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    result.errors.push(result.message);
  }

  return result;
}

/**
 * Verify cleanup was successful
 */
export async function verifyCleanup(): Promise<{
  success: boolean;
  remainingTestData: {
    notifications: number;
    issues: number;
    comments: number;
    solutions: number;
    profiles: number;
    departments: number;
  };
}> {
  try {
    console.log('🔍 Verifying cleanup...');

    const checks = await Promise.all([
      supabase.from('notifications').select('id', { count: 'exact' }).like('id', 'test-%'),
      supabase.from('issues').select('id', { count: 'exact' }).like('id', 'test-%'),
      supabase.from('comments').select('id', { count: 'exact' }).like('id', 'test-%'),
      supabase.from('solutions').select('id', { count: 'exact' }).like('id', 'test-%'),
      supabase.from('profiles').select('id', { count: 'exact' }).like('id', 'test-%'),
      supabase.from('departments').select('id', { count: 'exact' }).like('id', 'test-%'),
    ]);

    const remainingTestData = {
      notifications: checks[0].count || 0,
      issues: checks[1].count || 0,
      comments: checks[2].count || 0,
      solutions: checks[3].count || 0,
      profiles: checks[4].count || 0,
      departments: checks[5].count || 0,
    };

    const totalRemaining = Object.values(remainingTestData).reduce((sum, count) => sum + count, 0);
    const success = totalRemaining === 0;

    if (success) {
      console.log('✅ Cleanup verification passed - no test data remaining');
    } else {
      console.warn(`⚠️ Cleanup verification found ${totalRemaining} remaining test items`);
      Object.entries(remainingTestData).forEach(([table, count]) => {
        if (count > 0) {
          console.warn(`  - ${table}: ${count} items`);
        }
      });
    }

    return { success, remainingTestData };

  } catch (error) {
    console.error('❌ Cleanup verification failed:', error);
    return {
      success: false,
      remainingTestData: {
        notifications: -1,
        issues: -1,
        comments: -1,
        solutions: -1,
        profiles: -1,
        departments: -1,
      },
    };
  }
}

// Export main cleanup function as default
export default cleanupNotificationTestData;
