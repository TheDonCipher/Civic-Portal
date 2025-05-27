-- Quick Database Check for Notification Bell Compatibility
-- Run this first to see what's missing before applying the migration

-- Step 1: Check if notifications table exists
SELECT 'CHECKING NOTIFICATIONS TABLE' AS step;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') 
    THEN '✓ Notifications table exists'
    ELSE '❌ Notifications table missing'
  END AS table_status;

-- Step 2: Check current table structure
SELECT 'CURRENT TABLE STRUCTURE' AS step;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- Step 3: Check for missing columns required by enhanced NotificationBell
SELECT 'MISSING COLUMNS CHECK' AS step;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read_at')
    THEN '✓ read_at column exists'
    ELSE '❌ read_at column missing'
  END AS read_at_status,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'data')
    THEN '✓ data column exists'
    ELSE CASE 
      WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'metadata')
      THEN '⚠ metadata column exists (needs migration to data)'
      ELSE '❌ data/metadata column missing'
    END
  END AS data_status,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_issue_id')
    THEN '✓ related_issue_id column exists'
    ELSE '❌ related_issue_id column missing'
  END AS related_issue_status,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'action_url')
    THEN '✓ action_url column exists'
    ELSE '❌ action_url column missing'
  END AS action_url_status,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'priority')
    THEN '✓ priority column exists'
    ELSE '❌ priority column missing'
  END AS priority_status;

-- Step 4: Check for required database functions
SELECT 'DATABASE FUNCTIONS CHECK' AS step;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'mark_notification_read')
    THEN '✓ mark_notification_read function exists'
    ELSE '❌ mark_notification_read function missing'
  END AS mark_read_function,
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'mark_all_notifications_read')
    THEN '✓ mark_all_notifications_read function exists'
    ELSE '❌ mark_all_notifications_read function missing'
  END AS mark_all_function;

-- Step 5: Check RLS status
SELECT 'RLS STATUS CHECK' AS step;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_class WHERE relname = 'notifications' AND relrowsecurity = true)
    THEN '✓ RLS enabled on notifications table'
    ELSE '❌ RLS not enabled on notifications table'
  END AS rls_status;

-- Step 6: Check RLS policies
SELECT 'RLS POLICIES CHECK' AS step;

SELECT 
  COUNT(*) AS policy_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✓ RLS policies exist'
    ELSE '❌ No RLS policies found'
  END AS policies_status
FROM pg_policies 
WHERE tablename = 'notifications';

-- Step 7: Check indexes
SELECT 'INDEXES CHECK' AS step;

SELECT 
  COUNT(*) AS index_count,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✓ Basic indexes exist'
    WHEN COUNT(*) > 0 THEN '⚠ Some indexes exist'
    ELSE '❌ No indexes found'
  END AS indexes_status
FROM pg_indexes 
WHERE tablename = 'notifications';

-- Step 8: Check real-time publication
SELECT 'REAL-TIME CHECK' AS step;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_publication_tables WHERE tablename = 'notifications')
    THEN '✓ Notifications table in real-time publication'
    ELSE '❌ Notifications table not in real-time publication'
  END AS realtime_status;

-- Step 9: Sample data check
SELECT 'SAMPLE DATA CHECK' AS step;

SELECT 
  COUNT(*) AS total_notifications,
  COUNT(*) FILTER (WHERE read = false) AS unread_notifications,
  COUNT(DISTINCT user_id) AS users_with_notifications,
  COUNT(DISTINCT type) AS notification_types
FROM notifications;

-- Step 10: Final compatibility summary
SELECT 'COMPATIBILITY SUMMARY' AS step;

WITH compatibility_check AS (
  SELECT 
    -- Check required columns
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'notifications' 
     AND column_name IN ('id', 'user_id', 'type', 'title', 'message', 'read', 'created_at')) AS basic_columns,
    
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'notifications' 
     AND column_name IN ('read_at', 'data', 'related_issue_id', 'action_url', 'priority')) AS enhanced_columns,
    
    -- Check functions
    (SELECT COUNT(*) FROM information_schema.routines 
     WHERE routine_name IN ('mark_notification_read', 'mark_all_notifications_read')) AS functions,
    
    -- Check RLS
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'notifications') AS policies
)
SELECT 
  basic_columns || '/7 basic columns present' AS basic_compatibility,
  enhanced_columns || '/5 enhanced columns present' AS enhanced_compatibility,
  functions || '/2 required functions present' AS function_compatibility,
  policies || ' RLS policies present' AS security_compatibility,
  
  CASE 
    WHEN basic_columns = 7 AND enhanced_columns = 5 AND functions = 2 AND policies > 0 
    THEN '✅ FULLY COMPATIBLE - Enhanced NotificationBell ready!'
    WHEN basic_columns = 7 AND enhanced_columns >= 3 
    THEN '⚠ MOSTLY COMPATIBLE - Run migration for full functionality'
    WHEN basic_columns >= 5 
    THEN '❌ PARTIALLY COMPATIBLE - Migration required'
    ELSE '❌ NOT COMPATIBLE - Major migration needed'
  END AS overall_status
FROM compatibility_check;

SELECT 'QUICK DATABASE CHECK COMPLETED' AS result;
