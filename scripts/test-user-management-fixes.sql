-- Test script for user management system fixes
-- Run this in your Supabase SQL Editor to test the fixes

-- 1. Check if the new verification trigger exists and is working
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_set_verification_status';

-- 2. Test the trigger function by simulating profile creation
-- Note: We'll test with existing user IDs since we can't create auth.users directly
DO $$
DECLARE
  existing_user_id UUID;
  test_dept_id UUID;
  actual_status TEXT;
BEGIN
  -- Get an existing user ID from auth.users (if any exists)
  SELECT id INTO existing_user_id FROM auth.users LIMIT 1;

  IF existing_user_id IS NULL THEN
    RAISE NOTICE 'No existing users found in auth.users table. Skipping trigger test.';
    RAISE NOTICE 'To test the trigger, create a user through the application signup process.';
  ELSE
    -- Get a department ID for testing
    SELECT id INTO test_dept_id FROM departments LIMIT 1;

    IF test_dept_id IS NULL THEN
      RAISE NOTICE 'No departments found. Creating a test department.';
      INSERT INTO departments (id, name, description, category)
      VALUES (gen_random_uuid(), 'Test Department', 'Test Description', 'Test Category')
      RETURNING id INTO test_dept_id;
    END IF;

    -- Check if this user already has a profile
    IF EXISTS (SELECT 1 FROM profiles WHERE id = existing_user_id) THEN
      RAISE NOTICE 'User already has a profile. Testing trigger by updating role to official.';

      -- Update role to official to test trigger
      UPDATE profiles
      SET role = 'official', department_id = test_dept_id
      WHERE id = existing_user_id;

      -- Check verification status
      SELECT verification_status INTO actual_status
      FROM profiles
      WHERE id = existing_user_id;

      RAISE NOTICE 'User role updated to official with verification_status: %', actual_status;

      IF actual_status = 'pending' THEN
        RAISE NOTICE 'SUCCESS: Trigger is working correctly for role updates';
      ELSE
        RAISE NOTICE 'FAILURE: Expected pending, got %', actual_status;
      END IF;

      -- Restore original role (assuming it was citizen)
      UPDATE profiles
      SET role = 'citizen', department_id = NULL, verification_status = 'verified'
      WHERE id = existing_user_id;

    ELSE
      RAISE NOTICE 'User has no profile. This suggests the trigger should work for new profile creation.';
      RAISE NOTICE 'Test the trigger by registering a new government official through the application.';
    END IF;
  END IF;
END $$;

-- 3. Check existing official users and their verification status
SELECT
  id,
  email,
  full_name,
  role,
  department_id,
  verification_status,
  created_at
FROM profiles
WHERE role = 'official'
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check if departments are properly linked to officials
SELECT
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.department_id,
  d.name as department_name,
  p.verification_status
FROM profiles p
LEFT JOIN departments d ON p.department_id = d.id
WHERE p.role = 'official'
ORDER BY p.created_at DESC
LIMIT 10;

-- 5. Check legal consent records and their timestamps
SELECT
  lc.id,
  lc.user_id,
  p.email,
  p.role,
  lc.terms_accepted,
  lc.terms_accepted_at,
  lc.privacy_accepted,
  lc.privacy_accepted_at,
  lc.data_processing_consent,
  lc.data_processing_accepted_at,
  lc.consent_timestamp,
  lc.created_at
FROM legal_consents lc
JOIN profiles p ON lc.user_id = p.id
ORDER BY lc.created_at DESC
LIMIT 10;

-- 6. Check for officials without legal consent records
SELECT
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at
FROM profiles p
LEFT JOIN legal_consents lc ON p.id = lc.user_id
WHERE p.role = 'official'
  AND lc.id IS NULL
ORDER BY p.created_at DESC;

-- 7. Check for legal consent records with NULL individual timestamps
SELECT
  lc.id,
  lc.user_id,
  p.email,
  lc.terms_accepted,
  lc.terms_accepted_at,
  lc.privacy_accepted,
  lc.privacy_accepted_at,
  lc.data_processing_consent,
  lc.data_processing_accepted_at,
  lc.consent_timestamp
FROM legal_consents lc
JOIN profiles p ON lc.user_id = p.id
WHERE (lc.terms_accepted_at IS NULL AND lc.terms_accepted = true)
   OR (lc.privacy_accepted_at IS NULL AND lc.privacy_accepted = true)
   OR (lc.data_processing_accepted_at IS NULL AND lc.data_processing_consent = true)
ORDER BY lc.created_at DESC;

-- 8. Test department lookup functionality
SELECT
  d.id,
  d.name,
  d.category,
  COUNT(p.id) as official_count
FROM departments d
LEFT JOIN profiles p ON d.id = p.department_id AND p.role = 'official'
GROUP BY d.id, d.name, d.category
ORDER BY official_count DESC, d.name;

-- 9. Check for any data integrity issues
-- Officials without departments
SELECT
  COUNT(*) as officials_without_department
FROM profiles
WHERE role = 'official' AND department_id IS NULL;

-- Officials with invalid department references
SELECT
  p.id,
  p.email,
  p.department_id
FROM profiles p
LEFT JOIN departments d ON p.department_id = d.id
WHERE p.role = 'official'
  AND p.department_id IS NOT NULL
  AND d.id IS NULL;

-- 10. Summary statistics
SELECT
  'Total Officials' as metric,
  COUNT(*) as count
FROM profiles
WHERE role = 'official'

UNION ALL

SELECT
  'Officials with Pending Status' as metric,
  COUNT(*) as count
FROM profiles
WHERE role = 'official' AND verification_status = 'pending'

UNION ALL

SELECT
  'Officials with Verified Status' as metric,
  COUNT(*) as count
FROM profiles
WHERE role = 'official' AND verification_status = 'verified'

UNION ALL

SELECT
  'Officials with Department Assigned' as metric,
  COUNT(*) as count
FROM profiles
WHERE role = 'official' AND department_id IS NOT NULL

UNION ALL

SELECT
  'Officials with Legal Consent' as metric,
  COUNT(DISTINCT p.id) as count
FROM profiles p
JOIN legal_consents lc ON p.id = lc.user_id
WHERE p.role = 'official'

UNION ALL

SELECT
  'Legal Consents with Individual Timestamps' as metric,
  COUNT(*) as count
FROM legal_consents
WHERE terms_accepted_at IS NOT NULL
   OR privacy_accepted_at IS NOT NULL
   OR data_processing_accepted_at IS NOT NULL;

-- 11. Check trigger function definition
SELECT
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'set_verification_status_on_insert_or_update';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'User management system test completed. Review the results above to verify fixes are working correctly.';
END $$;
