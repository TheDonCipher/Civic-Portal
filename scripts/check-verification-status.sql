-- Diagnostic script to check verification workflow setup
-- Run this to see the current state of your database

-- 1. Check if verification columns exist in profiles table
SELECT 
  'Profiles table columns:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name IN ('verification_status', 'verification_notes', 'department_id', 'role')
ORDER BY column_name;

-- 2. Check notifications table structure
SELECT 
  'Notifications table columns:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- 3. Check notification type constraint
SELECT 
  'Notification type constraint:' as info,
  constraint_name,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%notifications_type%';

-- 4. Check existing indexes
SELECT 
  'Existing indexes:' as info,
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('profiles', 'notifications', 'audit_logs')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 5. Check RLS policies for notifications
SELECT 
  'Notification RLS policies:' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'notifications'
ORDER BY policyname;

-- 6. Check current user verification status distribution
SELECT 
  'User verification status:' as info,
  COALESCE(role, 'NULL') as role,
  COALESCE(verification_status, 'NULL') as verification_status,
  COUNT(*) as count
FROM profiles 
GROUP BY role, verification_status
ORDER BY role, verification_status;

-- 7. Check for pending officials
SELECT 
  'Pending officials:' as info,
  id,
  username,
  full_name,
  role,
  verification_status,
  department_id,
  created_at
FROM profiles 
WHERE role = 'official' AND verification_status = 'pending'
ORDER BY created_at DESC
LIMIT 10;

-- 8. Check recent notifications
SELECT 
  'Recent notifications:' as info,
  n.id,
  n.type,
  n.title,
  n.read,
  n.created_at,
  p.username as recipient
FROM notifications n
LEFT JOIN profiles p ON n.user_id = p.id
ORDER BY n.created_at DESC
LIMIT 10;

-- 9. Check audit logs
SELECT 
  'Recent audit logs:' as info,
  action,
  resource_type,
  details->>'target_user_name' as target_user,
  details->>'verification_status' as status,
  created_at
FROM audit_logs 
WHERE action = 'verification_update'
ORDER BY created_at DESC
LIMIT 10;

-- 10. Check triggers
SELECT 
  'Triggers on profiles:' as info,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles'
ORDER BY trigger_name;

-- 11. Summary report
DO $$
DECLARE
  total_users INTEGER;
  total_officials INTEGER;
  pending_officials INTEGER;
  verified_officials INTEGER;
  rejected_officials INTEGER;
  total_notifications INTEGER;
  unread_notifications INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users FROM profiles;
  SELECT COUNT(*) INTO total_officials FROM profiles WHERE role = 'official';
  SELECT COUNT(*) INTO pending_officials FROM profiles WHERE role = 'official' AND verification_status = 'pending';
  SELECT COUNT(*) INTO verified_officials FROM profiles WHERE role = 'official' AND verification_status = 'verified';
  SELECT COUNT(*) INTO rejected_officials FROM profiles WHERE role = 'official' AND verification_status = 'rejected';
  SELECT COUNT(*) INTO total_notifications FROM notifications;
  SELECT COUNT(*) INTO unread_notifications FROM notifications WHERE read = false;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== VERIFICATION WORKFLOW STATUS REPORT ===';
  RAISE NOTICE 'Total users: %', total_users;
  RAISE NOTICE 'Total officials: %', total_officials;
  RAISE NOTICE '  - Pending: %', pending_officials;
  RAISE NOTICE '  - Verified: %', verified_officials;
  RAISE NOTICE '  - Rejected: %', rejected_officials;
  RAISE NOTICE 'Total notifications: %', total_notifications;
  RAISE NOTICE 'Unread notifications: %', unread_notifications;
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
END $$;
