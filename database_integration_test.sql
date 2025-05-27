-- Database Integration Test for Enhanced Notification Bell Component
-- Run this in Supabase SQL Editor to verify compatibility

-- Step 1: Check current notifications table structure
SELECT 'CHECKING NOTIFICATIONS TABLE STRUCTURE' AS test_step;

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- Step 2: Verify all required columns exist
SELECT 'VERIFYING REQUIRED COLUMNS' AS test_step;

DO $$
DECLARE
  missing_columns TEXT[] := ARRAY[]::TEXT[];
  required_columns TEXT[] := ARRAY[
    'id', 'user_id', 'type', 'title', 'message', 'read', 'read_at',
    'created_at', 'data', 'related_issue_id', 'related_comment_id',
    'related_solution_id', 'action_url', 'priority', 'expires_at'
  ];
  col TEXT;
BEGIN
  FOREACH col IN ARRAY required_columns
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'notifications' AND column_name = col
    ) THEN
      missing_columns := array_append(missing_columns, col);
    END IF;
  END LOOP;

  IF array_length(missing_columns, 1) > 0 THEN
    RAISE NOTICE 'MISSING COLUMNS: %', array_to_string(missing_columns, ', ');
  ELSE
    RAISE NOTICE 'ALL REQUIRED COLUMNS PRESENT ✓';
  END IF;
END $$;

-- Step 3: Check database functions
SELECT 'CHECKING DATABASE FUNCTIONS' AS test_step;

SELECT
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_name IN (
  'mark_notification_read',
  'mark_all_notifications_read',
  'create_notification',
  'get_notification_stats',
  'cleanup_expired_notifications',
  'send_bulk_notification'
)
ORDER BY routine_name;

-- Step 4: Check RLS policies
SELECT 'CHECKING RLS POLICIES' AS test_step;

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'notifications';

-- Step 5: Test notification creation (if user exists)
SELECT 'TESTING NOTIFICATION CREATION' AS test_step;

DO $$
DECLARE
  test_user_id UUID;
  notification_id UUID;
BEGIN
  -- Get a test user (first user in auth.users)
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;

  IF test_user_id IS NOT NULL THEN
    -- Test direct insert
    INSERT INTO notifications (
      user_id, type, title, message, data, priority, read
    ) VALUES (
      test_user_id,
      'system',
      'Database Integration Test',
      'Testing enhanced notification bell compatibility',
      '{"test": true, "component": "NotificationBell"}',
      'normal',
      false
    ) RETURNING id INTO notification_id;

    RAISE NOTICE 'Test notification created with ID: %', notification_id;

    -- Clean up test notification
    DELETE FROM notifications WHERE id = notification_id;
    RAISE NOTICE 'Test notification cleaned up ✓';
  ELSE
    RAISE NOTICE 'No users found for testing';
  END IF;
END $$;

-- Step 6: Test notification functions (if they exist)
SELECT 'TESTING NOTIFICATION FUNCTIONS' AS test_step;

DO $$
DECLARE
  test_user_id UUID;
  notification_id UUID;
  mark_result BOOLEAN;
  mark_all_result INTEGER;
BEGIN
  -- Get a test user
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;

  IF test_user_id IS NOT NULL THEN
    -- Test create_notification function if it exists
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'create_notification') THEN
      SELECT create_notification(
        test_user_id,
        'info',
        'Function Test',
        'Testing create_notification function',
        '{"test": true}',
        NULL, NULL, NULL, NULL,
        'normal',
        NULL
      ) INTO notification_id;

      RAISE NOTICE 'create_notification function works ✓ (ID: %)', notification_id;

      -- Test mark_notification_read function
      IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'mark_notification_read') THEN
        SELECT mark_notification_read(notification_id, test_user_id) INTO mark_result;
        RAISE NOTICE 'mark_notification_read function works ✓ (Result: %)', mark_result;
      END IF;

      -- Clean up
      DELETE FROM notifications WHERE id = notification_id;
    ELSE
      RAISE NOTICE 'create_notification function not found';
    END IF;

    -- Test mark_all_notifications_read function
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'mark_all_notifications_read') THEN
      SELECT mark_all_notifications_read(test_user_id) INTO mark_all_result;
      RAISE NOTICE 'mark_all_notifications_read function works ✓ (Result: %)', mark_all_result;
    ELSE
      RAISE NOTICE 'mark_all_notifications_read function not found';
    END IF;
  END IF;
END $$;

-- Step 7: Check notification types compatibility
SELECT 'CHECKING NOTIFICATION TYPES' AS test_step;

SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.check_constraints
      WHERE constraint_name LIKE '%notifications%type%'
    ) THEN 'Type constraints found'
    ELSE 'No type constraints (flexible types allowed)'
  END AS type_constraint_status;

-- Step 8: Test real-time subscription setup
SELECT 'CHECKING REAL-TIME CAPABILITIES' AS test_step;

SELECT
  CASE
    WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE tablename = 'notifications'
    ) THEN 'Real-time enabled ✓'
    ELSE 'Real-time not configured'
  END AS realtime_status;

-- Step 9: Performance check - indexes
SELECT 'CHECKING PERFORMANCE INDEXES' AS test_step;

SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'notifications'
ORDER BY indexname;

-- Step 10: Final compatibility summary
SELECT 'COMPATIBILITY SUMMARY' AS test_step;

SELECT
  json_build_object(
    'table_exists', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications'),
    'required_columns_present', (
      SELECT COUNT(*) = 15 FROM information_schema.columns
      WHERE table_name = 'notifications'
      AND column_name IN (
        'id', 'user_id', 'type', 'title', 'message', 'read', 'read_at',
        'created_at', 'data', 'related_issue_id', 'related_comment_id',
        'related_solution_id', 'action_url', 'priority', 'expires_at'
      )
    ),
    'rls_enabled', (
      SELECT relrowsecurity FROM pg_class
      WHERE relname = 'notifications'
    ),
    'functions_available', (
      SELECT COUNT(*) FROM information_schema.routines
      WHERE routine_name IN (
        'mark_notification_read', 'mark_all_notifications_read', 'create_notification'
      )
    ),
    'indexes_present', (
      SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'notifications'
    )
  ) AS compatibility_report;

SELECT 'DATABASE INTEGRATION TEST COMPLETED' AS result;
