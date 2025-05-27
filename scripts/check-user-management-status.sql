-- Simple status check script for user management system
-- Run this in your Supabase SQL Editor to check current state

-- 1. Check if the verification trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_set_verification_status';

-- 2. Check if the trigger function exists
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name IN ('set_verification_status_on_insert_or_update', 'set_verification_status_on_role_change');

-- 3. Check current official users and their verification status
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

-- 4. Check if departments table exists and has data
SELECT 
  COUNT(*) as department_count,
  MIN(created_at) as oldest_department,
  MAX(created_at) as newest_department
FROM departments;

-- 5. Check officials with their department names
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.department_id,
  d.name as department_name,
  p.verification_status,
  p.created_at
FROM profiles p
LEFT JOIN departments d ON p.department_id = d.id
WHERE p.role = 'official'
ORDER BY p.created_at DESC
LIMIT 10;

-- 6. Check legal_consents table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'legal_consents'
  AND column_name IN ('terms_accepted_at', 'privacy_accepted_at', 'data_processing_accepted_at')
ORDER BY ordinal_position;

-- 7. Check recent legal consent records
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

-- 8. Summary statistics
SELECT 
  'Total Users' as metric,
  COUNT(*) as count
FROM profiles

UNION ALL

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
  'Total Legal Consent Records' as metric,
  COUNT(*) as count
FROM legal_consents

UNION ALL

SELECT 
  'Legal Consents with Individual Timestamps' as metric,
  COUNT(*) as count
FROM legal_consents 
WHERE terms_accepted_at IS NOT NULL 
   OR privacy_accepted_at IS NOT NULL 
   OR data_processing_accepted_at IS NOT NULL;

-- 9. Check for data integrity issues
-- Officials without departments
SELECT 
  'Officials without Department' as issue,
  COUNT(*) as count
FROM profiles 
WHERE role = 'official' AND department_id IS NULL

UNION ALL

-- Officials with invalid department references
SELECT 
  'Officials with Invalid Department References' as issue,
  COUNT(*) as count
FROM profiles p
LEFT JOIN departments d ON p.department_id = d.id
WHERE p.role = 'official' 
  AND p.department_id IS NOT NULL 
  AND d.id IS NULL

UNION ALL

-- Officials without legal consent
SELECT 
  'Officials without Legal Consent' as issue,
  COUNT(*) as count
FROM profiles p
LEFT JOIN legal_consents lc ON p.id = lc.user_id
WHERE p.role = 'official' 
  AND lc.id IS NULL;

-- 10. Check recent activity (last 24 hours)
SELECT 
  'New Users (24h)' as metric,
  COUNT(*) as count
FROM profiles 
WHERE created_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
  'New Officials (24h)' as metric,
  COUNT(*) as count
FROM profiles 
WHERE role = 'official' 
  AND created_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
  'New Legal Consents (24h)' as metric,
  COUNT(*) as count
FROM legal_consents 
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'User management system status check completed. Review the results above.';
END $$;
