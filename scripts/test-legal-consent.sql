-- Test script for legal consent functionality
-- Run this in your Supabase SQL Editor to test the legal consent system

-- 1. Check if legal_consents table exists and has the correct structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'legal_consents'
ORDER BY ordinal_position;

-- 2. Check if the new timestamp columns exist
SELECT 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'legal_consents' 
  AND column_name IN ('terms_accepted_at', 'privacy_accepted_at', 'data_processing_accepted_at');

-- 3. Check existing legal consent records
SELECT 
  id,
  user_id,
  terms_accepted,
  terms_accepted_at,
  privacy_accepted,
  privacy_accepted_at,
  data_processing_consent,
  data_processing_accepted_at,
  consent_timestamp,
  created_at
FROM legal_consents
ORDER BY created_at DESC
LIMIT 10;

-- 4. Test inserting a sample legal consent record (replace with actual user ID)
-- Note: This is just for testing - in production, records are created through the application
/*
INSERT INTO legal_consents (
  user_id,
  terms_accepted,
  terms_version,
  terms_accepted_at,
  privacy_accepted,
  privacy_version,
  privacy_accepted_at,
  data_processing_consent,
  data_processing_version,
  data_processing_accepted_at,
  marketing_opt_in,
  consent_timestamp,
  ip_address,
  user_agent,
  metadata
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- Replace with actual user ID
  true,
  '2024.1',
  NOW(),
  true,
  '2024.1',
  NOW() + INTERVAL '1 second',
  true,
  '2024.1',
  NOW() + INTERVAL '2 seconds',
  false,
  NOW(),
  '127.0.0.1'::inet,
  'Test User Agent',
  '{"test": true}'::jsonb
);
*/

-- 5. Check RLS policies are working
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'legal_consents';

-- 6. Verify indexes exist
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'legal_consents'
ORDER BY indexname;

-- 7. Check for any constraint violations or issues
SELECT 
  conname,
  contype,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'legal_consents'::regclass;

-- 8. Test query performance for common operations
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM legal_consents 
WHERE user_id = '00000000-0000-0000-0000-000000000001'
ORDER BY consent_timestamp DESC 
LIMIT 1;

-- 9. Check for any orphaned records (users that don't exist)
SELECT lc.user_id, lc.consent_timestamp
FROM legal_consents lc
LEFT JOIN auth.users au ON lc.user_id = au.id
WHERE au.id IS NULL;

-- 10. Summary statistics
SELECT 
  COUNT(*) as total_consent_records,
  COUNT(DISTINCT user_id) as unique_users_with_consent,
  COUNT(CASE WHEN terms_accepted_at IS NOT NULL THEN 1 END) as records_with_terms_timestamp,
  COUNT(CASE WHEN privacy_accepted_at IS NOT NULL THEN 1 END) as records_with_privacy_timestamp,
  COUNT(CASE WHEN data_processing_accepted_at IS NOT NULL THEN 1 END) as records_with_data_processing_timestamp,
  MIN(consent_timestamp) as earliest_consent,
  MAX(consent_timestamp) as latest_consent
FROM legal_consents;
