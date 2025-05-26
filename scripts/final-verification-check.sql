-- Final verification check - run these queries to confirm everything is working

-- 0. CRITICAL: Add missing department_id column to issues table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'issues' AND column_name = 'department_id'
  ) THEN
    -- Add the department_id column to issues table
    ALTER TABLE issues ADD COLUMN department_id UUID REFERENCES departments(id);

    -- Create an index for better query performance
    CREATE INDEX idx_issues_department_id ON issues(department_id);

    -- Add a comment to document the column
    COMMENT ON COLUMN issues.department_id IS 'Department responsible for handling this issue';

    RAISE NOTICE 'Added department_id column to issues table';
  ELSE
    RAISE NOTICE 'department_id column already exists in issues table';
  END IF;
END $$;

-- 1. Check user verification status distribution
SELECT
  'Current user verification status:' as info,
  COALESCE(role, 'NULL') as role,
  COALESCE(verification_status, 'NULL') as verification_status,
  COUNT(*) as count
FROM profiles
GROUP BY role, verification_status
ORDER BY role, verification_status;

-- 2. Check if verification_notes column exists and works
SELECT
  'Verification notes column check:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'verification_notes';

-- 3. Check notification system setup
SELECT
  'Notification system check:' as info,
  COUNT(*) as total_notifications,
  COUNT(CASE WHEN read = false THEN 1 END) as unread_notifications,
  COUNT(CASE WHEN type = 'verification_approved' THEN 1 END) as verification_approved,
  COUNT(CASE WHEN type = 'verification_rejected' THEN 1 END) as verification_rejected
FROM notifications;

-- 4. Check if we have any pending officials to test with
SELECT
  'Pending officials for testing:' as info,
  id,
  username,
  full_name,
  verification_status,
  department_id,
  created_at
FROM profiles
WHERE role = 'official' AND verification_status = 'pending'
ORDER BY created_at DESC
LIMIT 5;

-- 5. Check admin users who can perform verifications
SELECT
  'Admin users available:' as info,
  id,
  username,
  full_name,
  role,
  verification_status
FROM profiles
WHERE role = 'admin'
ORDER BY created_at DESC
LIMIT 5;

-- 6. Test notification type constraint
SELECT
  'Notification type constraint test:' as info,
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%notifications_type%';

-- 7. Check RLS policies are active
SELECT
  'Active RLS policies:' as info,
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('notifications', 'audit_logs')
ORDER BY tablename, policyname;

-- 8. Summary report for verification workflow readiness
DO $$
DECLARE
  total_users INTEGER;
  admin_users INTEGER;
  pending_officials INTEGER;
  verified_officials INTEGER;
  rejected_officials INTEGER;
  notification_policies INTEGER;
  audit_policies INTEGER;
  has_verification_notes BOOLEAN;
BEGIN
  -- Count users
  SELECT COUNT(*) INTO total_users FROM profiles;
  SELECT COUNT(*) INTO admin_users FROM profiles WHERE role = 'admin';
  SELECT COUNT(*) INTO pending_officials FROM profiles WHERE role = 'official' AND verification_status = 'pending';
  SELECT COUNT(*) INTO verified_officials FROM profiles WHERE role = 'official' AND verification_status = 'verified';
  SELECT COUNT(*) INTO rejected_officials FROM profiles WHERE role = 'official' AND verification_status = 'rejected';

  -- Count policies
  SELECT COUNT(*) INTO notification_policies FROM pg_policies WHERE tablename = 'notifications';
  SELECT COUNT(*) INTO audit_policies FROM pg_policies WHERE tablename = 'audit_logs';

  -- Check if verification_notes exists
  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'verification_notes'
  ) INTO has_verification_notes;

  RAISE NOTICE '';
  RAISE NOTICE '=== VERIFICATION WORKFLOW READINESS REPORT ===';
  RAISE NOTICE 'Total users: %', total_users;
  RAISE NOTICE 'Admin users: %', admin_users;
  RAISE NOTICE 'Officials pending verification: %', pending_officials;
  RAISE NOTICE 'Officials verified: %', verified_officials;
  RAISE NOTICE 'Officials rejected: %', rejected_officials;
  RAISE NOTICE 'Notification RLS policies: %', notification_policies;
  RAISE NOTICE 'Audit log RLS policies: %', audit_policies;
  RAISE NOTICE 'Verification notes column: %', CASE WHEN has_verification_notes THEN 'EXISTS' ELSE 'MISSING' END;
  RAISE NOTICE '';

  -- Readiness check
  IF admin_users > 0 AND notification_policies >= 4 AND audit_policies >= 2 AND has_verification_notes THEN
    RAISE NOTICE '✅ VERIFICATION WORKFLOW IS READY FOR TESTING!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Create a test official account (or use existing pending official)';
    RAISE NOTICE '2. Log in as admin and verify the official';
    RAISE NOTICE '3. Check that notifications are sent and received';
    RAISE NOTICE '4. Verify that the official can access stakeholder dashboard';
  ELSE
    RAISE NOTICE '⚠️  VERIFICATION WORKFLOW NEEDS ATTENTION:';
    IF admin_users = 0 THEN
      RAISE NOTICE '   - No admin users found. Create an admin account first.';
    END IF;
    IF notification_policies < 4 THEN
      RAISE NOTICE '   - Missing notification RLS policies (found %, need 4)', notification_policies;
    END IF;
    IF audit_policies < 2 THEN
      RAISE NOTICE '   - Missing audit log RLS policies (found %, need 2)', audit_policies;
    END IF;
    IF NOT has_verification_notes THEN
      RAISE NOTICE '   - Missing verification_notes column in profiles table';
    END IF;
  END IF;

  RAISE NOTICE '================================================';
  RAISE NOTICE '';
END $$;
