-- VERIFICATION SCRIPT FOR DATABASE FIXES
-- Run this to verify that all critical fixes have been applied
-- This will show you what's working and what still needs attention

-- Check 1: Verify critical functions exist
SELECT 
  'CRITICAL FUNCTIONS CHECK' AS test_category,
  CASE 
    WHEN COUNT(*) = 6 THEN '✅ PASS - All critical functions exist'
    ELSE '❌ FAIL - Missing functions: ' || (6 - COUNT(*))::text
  END AS result,
  string_agg(proname, ', ') AS functions_found
FROM pg_proc 
WHERE proname IN (
  'increment_issue_votes', 
  'decrement_issue_votes',
  'increment_issue_watchers',
  'decrement_issue_watchers', 
  'increment_solution_votes',
  'decrement_solution_votes'
);

-- Check 2: Verify critical columns exist in issues table
SELECT 
  'ISSUES TABLE COLUMNS CHECK' AS test_category,
  CASE 
    WHEN COUNT(*) = 3 THEN '✅ PASS - All critical columns exist in issues table'
    ELSE '❌ FAIL - Missing columns in issues table'
  END AS result,
  string_agg(column_name, ', ') AS columns_found
FROM information_schema.columns 
WHERE table_name = 'issues' 
AND column_name IN ('vote_count', 'watchers_count', 'comment_count');

-- Check 3: Verify solutions table has vote_count column
SELECT 
  'SOLUTIONS TABLE COLUMNS CHECK' AS test_category,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ PASS - Solutions table has vote_count column'
    ELSE '❌ FAIL - Solutions table missing vote_count column'
  END AS result
FROM information_schema.columns 
WHERE table_name = 'solutions' 
AND column_name = 'vote_count';

-- Check 4: Verify voting tables structure is fixed
SELECT 
  'VOTING TABLES STRUCTURE CHECK' AS test_category,
  CASE 
    WHEN issue_votes_ok AND solution_votes_ok THEN '✅ PASS - Voting tables structure fixed'
    ELSE '❌ FAIL - Voting tables still have issues'
  END AS result
FROM (
  SELECT 
    (SELECT is_nullable = 'YES' FROM information_schema.columns 
     WHERE table_name = 'issue_votes' AND column_name = 'vote_type') AS issue_votes_ok,
    (SELECT is_nullable = 'YES' FROM information_schema.columns 
     WHERE table_name = 'solution_votes' AND column_name = 'vote_type') AS solution_votes_ok
) AS checks;

-- Check 5: Verify enhanced indexes exist
SELECT 
  'PERFORMANCE INDEXES CHECK' AS test_category,
  CASE 
    WHEN COUNT(*) >= 10 THEN '✅ PASS - Performance indexes created'
    ELSE '⚠️ PARTIAL - Some indexes may be missing'
  END AS result,
  COUNT(*) || ' indexes found' AS details
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%';

-- Check 6: Verify RLS policies are in place
SELECT 
  'RLS POLICIES CHECK' AS test_category,
  CASE 
    WHEN COUNT(*) >= 15 THEN '✅ PASS - RLS policies in place'
    ELSE '⚠️ PARTIAL - Some RLS policies may be missing'
  END AS result,
  COUNT(*) || ' policies found' AS details
FROM pg_policies 
WHERE schemaname = 'public';

-- Check 7: Test critical functions work
DO $$
DECLARE
  test_issue_id UUID;
  test_solution_id UUID;
  initial_count INTEGER;
  updated_count INTEGER;
BEGIN
  -- Get a test issue ID
  SELECT id INTO test_issue_id FROM issues LIMIT 1;
  
  IF test_issue_id IS NOT NULL THEN
    -- Test increment function
    SELECT vote_count INTO initial_count FROM issues WHERE id = test_issue_id;
    PERFORM increment_issue_votes(test_issue_id);
    SELECT vote_count INTO updated_count FROM issues WHERE id = test_issue_id;
    
    IF updated_count = COALESCE(initial_count, 0) + 1 THEN
      RAISE NOTICE '✅ FUNCTION TEST PASS - increment_issue_votes works';
    ELSE
      RAISE NOTICE '❌ FUNCTION TEST FAIL - increment_issue_votes not working';
    END IF;
    
    -- Reset the count
    PERFORM decrement_issue_votes(test_issue_id);
  ELSE
    RAISE NOTICE '⚠️ FUNCTION TEST SKIPPED - No issues found for testing';
  END IF;
END $$;

-- Check 8: Verify legal consent table exists and is properly structured
SELECT 
  'LEGAL CONSENT TABLE CHECK' AS test_category,
  CASE 
    WHEN COUNT(*) >= 8 THEN '✅ PASS - Legal consent table properly structured'
    ELSE '❌ FAIL - Legal consent table issues'
  END AS result,
  COUNT(*) || ' columns found' AS details
FROM information_schema.columns 
WHERE table_name = 'legal_consents';

-- Check 9: Verify all core tables exist
SELECT 
  'CORE TABLES CHECK' AS test_category,
  CASE 
    WHEN COUNT(*) = 12 THEN '✅ PASS - All core tables exist'
    ELSE '❌ FAIL - Missing core tables'
  END AS result,
  string_agg(table_name, ', ') AS tables_found
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'departments', 'profiles', 'issues', 'comments', 'solutions', 
  'issue_votes', 'solution_votes', 'issue_watchers', 'notifications',
  'legal_consents', 'audit_logs', 'rate_limits'
);

-- Check 10: Verify triggers are in place
SELECT 
  'TRIGGERS CHECK' AS test_category,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ PASS - Essential triggers in place'
    ELSE '⚠️ PARTIAL - Some triggers may be missing'
  END AS result,
  COUNT(*) || ' triggers found' AS details
FROM information_schema.triggers 
WHERE event_object_schema = 'public';

-- Summary Report
SELECT 
  '🎯 DATABASE AUDIT SUMMARY' AS summary,
  'Run the checks above to see detailed status' AS instruction,
  'If any checks fail, review the specific migration files' AS next_steps;

-- Show current database statistics
SELECT 
  'DATABASE STATISTICS' AS category,
  (SELECT COUNT(*) FROM issues) AS total_issues,
  (SELECT COUNT(*) FROM profiles) AS total_users,
  (SELECT COUNT(*) FROM comments) AS total_comments,
  (SELECT COUNT(*) FROM solutions) AS total_solutions,
  (SELECT COUNT(*) FROM issue_votes) AS total_issue_votes,
  (SELECT COUNT(*) FROM solution_votes) AS total_solution_votes,
  (SELECT COUNT(*) FROM issue_watchers) AS total_watchers;
