-- NOTIFICATION SYSTEM TEST SCRIPT
-- ================================
--
-- This script tests the enhanced notification system functionality
-- Run this AFTER applying the SCHEMA_ENHANCEMENTS.sql migration
--
-- WARNING: This script creates test data. Only run in development/testing environments!

-- Test 1: Basic notification creation
SELECT 'Testing basic notification creation...' AS test_step;

-- First, let's check what notification types are currently allowed
SELECT 'Checking current notification type constraints...' AS test_step;

-- Check existing constraint
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname = 'notifications_type_check';

-- Create a test notification using the enhanced function
SELECT create_notification(
  (SELECT id FROM auth.users LIMIT 1), -- Use first available user
  'info', -- Use a basic type that should be supported
  'Test Notification',
  'This is a test notification to verify the system is working correctly.',
  '{"test": true, "created_by": "test_script"}',
  NULL, -- related_issue_id
  NULL, -- related_comment_id
  NULL, -- related_solution_id
  '/dashboard', -- action_url
  'normal', -- priority
  NOW() + INTERVAL '1 day' -- expires_at
) AS test_notification_id;

-- Test 2: Verify notification was created
SELECT 'Verifying notification creation...' AS test_step;
SELECT COUNT(*) AS notification_count FROM notifications WHERE type = 'info';

-- Test 3: Test notification statistics
SELECT 'Testing notification statistics...' AS test_step;
SELECT get_notification_stats() AS notification_stats;

-- Test 4: Test marking notification as read
SELECT 'Testing mark notification as read...' AS test_step;
SELECT mark_notification_read(
  (SELECT id FROM notifications WHERE type = 'info' LIMIT 1),
  (SELECT user_id FROM notifications WHERE type = 'info' LIMIT 1)
) AS mark_read_result;

-- Test 5: Test bulk notification creation
SELECT 'Testing bulk notification creation...' AS test_step;
SELECT send_bulk_notification(
  ARRAY(SELECT id FROM auth.users LIMIT 3), -- Send to first 3 users
  'general',
  'System Announcement',
  'This is a test bulk notification sent to multiple users.',
  '{"bulk_test": true}',
  'high',
  NOW() + INTERVAL '7 days'
) AS bulk_notification_count;

-- Test 6: Test notification cleanup
SELECT 'Testing notification cleanup...' AS test_step;

-- Create an expired notification for testing
INSERT INTO notifications (
  user_id, type, title, message, data, expires_at, created_at
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'warning', -- Use a valid type instead of 'test'
  'Expired Test Notification',
  'This notification should be cleaned up.',
  '{"expired": true}',
  NOW() - INTERVAL '1 hour', -- Already expired
  NOW() - INTERVAL '2 hours'
);

-- Run cleanup and check results
SELECT cleanup_expired_notifications() AS cleaned_up_count;

-- Test 7: Verify RLS policies work correctly
SELECT 'Testing RLS policies...' AS test_step;

-- This should only return notifications for the current user
SELECT COUNT(*) AS user_notifications_count
FROM notifications
WHERE user_id = auth.uid();

-- Test 8: Test notification views
SELECT 'Testing notification views...' AS test_step;

-- Test user notification counts view
SELECT * FROM user_notification_counts LIMIT 3;

-- Test recent notifications with details view
SELECT * FROM recent_notifications_with_details LIMIT 5;

-- Test 9: Test automatic triggers (if issues table exists)
SELECT 'Testing automatic notification triggers...' AS test_step;

-- Check if we can test issue-related triggers
DO $$
DECLARE
  test_issue_id UUID;
  test_user_id UUID;
BEGIN
  -- Get a test user
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;

  IF test_user_id IS NOT NULL THEN
    -- Check if issues table exists and has data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'issues') THEN
      -- Get or create a test issue
      SELECT id INTO test_issue_id FROM issues LIMIT 1;

      IF test_issue_id IS NOT NULL THEN
        RAISE NOTICE 'Found test issue: %', test_issue_id;

        -- Test comment notification trigger
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
          INSERT INTO comments (issue_id, author_id, content, is_official)
          VALUES (test_issue_id, test_user_id, 'Test comment for notification trigger', false);
          RAISE NOTICE 'Created test comment to trigger notifications';
        END IF;

      ELSE
        RAISE NOTICE 'No test issues found - skipping trigger tests';
      END IF;
    ELSE
      RAISE NOTICE 'Issues table not found - skipping trigger tests';
    END IF;
  ELSE
    RAISE NOTICE 'No test users found - skipping trigger tests';
  END IF;
END $$;

-- Test 10: Performance test
SELECT 'Testing notification system performance...' AS test_step;

-- Test query performance with indexes
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM notifications
WHERE user_id = (SELECT id FROM auth.users LIMIT 1)
AND read = false
ORDER BY created_at DESC
LIMIT 10;

-- Final summary
SELECT 'NOTIFICATION SYSTEM TESTS COMPLETED!' AS result,
       json_build_object(
         'total_notifications', (SELECT COUNT(*) FROM notifications),
         'unread_notifications', (SELECT COUNT(*) FROM notifications WHERE read = false),
         'notification_types', (
           SELECT json_object_agg(type, count)
           FROM (
             SELECT type, COUNT(*) as count
             FROM notifications
             GROUP BY type
           ) type_counts
         ),
         'functions_available', ARRAY[
           'create_notification',
           'mark_notification_read',
           'mark_all_notifications_read',
           'get_notification_stats',
           'cleanup_expired_notifications',
           'send_bulk_notification'
         ],
         'triggers_active', ARRAY[
           'trigger_notify_issue_status_change',
           'trigger_notify_new_comment',
           'trigger_notify_new_solution'
         ]
       ) AS test_summary;

-- Cleanup test data (optional - comment out if you want to keep test data)
-- DELETE FROM notifications WHERE data->>'test' = 'true';
-- DELETE FROM notifications WHERE data->>'bulk_test' = 'true';
-- DELETE FROM notifications WHERE data->>'expired' = 'true';

SELECT 'Test cleanup completed (test data preserved for inspection)' AS cleanup_status;
