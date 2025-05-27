-- Reports Setup Verification Script
-- Run this in Supabase SQL Editor to verify all reports functionality is working

-- Check 1: Verify new tables exist
SELECT
  'Table Check' AS test_category,
  CASE
    WHEN COUNT(*) = 4 THEN '✅ PASS - All new tables created'
    ELSE '❌ FAIL - Missing tables: ' || (4 - COUNT(*))::TEXT
  END AS result
FROM information_schema.tables
WHERE table_name IN ('updates', 'reports', 'budget_allocations', 'satisfaction_ratings');

-- Check 2: Verify new columns in issues table
SELECT
  'Column Check' AS test_category,
  CASE
    WHEN COUNT(*) = 2 THEN '✅ PASS - New columns added to issues table'
    ELSE '❌ FAIL - Missing columns in issues table'
  END AS result
FROM information_schema.columns
WHERE table_name = 'issues' AND column_name IN ('constituency', 'first_response_at');

-- Check 3: Verify RPC functions exist
SELECT
  'RPC Functions Check' AS test_category,
  CASE
    WHEN COUNT(*) = 2 THEN '✅ PASS - All RPC functions created'
    ELSE '❌ FAIL - Missing RPC functions'
  END AS result
FROM pg_proc
WHERE proname IN ('get_monthly_issue_stats', 'get_dashboard_stats');

-- Check 4: Verify indexes exist
SELECT
  'Index Check' AS test_category,
  CASE
    WHEN COUNT(*) >= 8 THEN '✅ PASS - Performance indexes created'
    ELSE '❌ FAIL - Missing performance indexes'
  END AS result
FROM pg_indexes
WHERE indexname LIKE 'idx_%'
AND tablename IN ('issues', 'updates', 'reports', 'budget_allocations', 'satisfaction_ratings');

-- Check 5: Test RPC function execution (safe version)
DO $$
DECLARE
    monthly_test_result TEXT;
    dashboard_test_result TEXT;
BEGIN
    -- Test monthly stats function
    BEGIN
        PERFORM get_monthly_issue_stats(3);
        monthly_test_result := '✅ PASS - Monthly stats function working';
    EXCEPTION WHEN OTHERS THEN
        monthly_test_result := '❌ FAIL - Monthly stats function error: ' || SQLERRM;
    END;

    -- Test dashboard stats function
    BEGIN
        PERFORM get_dashboard_stats();
        dashboard_test_result := '✅ PASS - Dashboard stats function working';
    EXCEPTION WHEN OTHERS THEN
        dashboard_test_result := '❌ FAIL - Dashboard stats function error: ' || SQLERRM;
    END;

    -- Output results
    RAISE NOTICE 'RPC Function Test: %', monthly_test_result;
    RAISE NOTICE 'Dashboard Stats Test: %', dashboard_test_result;
END $$;

-- Alternative simple check for RPC functions
SELECT
  'RPC Functions Available' AS test_category,
  CASE
    WHEN COUNT(*) = 2 THEN '✅ PASS - Both RPC functions exist'
    ELSE '❌ FAIL - Missing RPC functions (' || COUNT(*) || '/2 found)'
  END AS result
FROM pg_proc
WHERE proname IN ('get_monthly_issue_stats', 'get_dashboard_stats');

-- Check 7: Verify sample data (if loaded)
SELECT
  'Sample Data Check' AS test_category,
  CASE
    WHEN (SELECT COUNT(*) FROM issues) > 0 THEN '✅ PASS - Issues data available (' || (SELECT COUNT(*) FROM issues)::TEXT || ' issues)'
    ELSE '❌ FAIL - No issues data found'
  END AS result;

-- Check 8: Verify budget data
SELECT
  'Budget Data Check' AS test_category,
  CASE
    WHEN (SELECT COUNT(*) FROM budget_allocations) > 0 THEN '✅ PASS - Budget data available (' || (SELECT COUNT(*) FROM budget_allocations)::TEXT || ' allocations)'
    ELSE '⚠️  WARNING - No budget data (run reports_sample_data.sql)'
  END AS result;

-- Check 9: Verify updates data
SELECT
  'Updates Data Check' AS test_category,
  CASE
    WHEN (SELECT COUNT(*) FROM updates) > 0 THEN '✅ PASS - Updates data available (' || (SELECT COUNT(*) FROM updates)::TEXT || ' updates)'
    ELSE '⚠️  WARNING - No updates data (run reports_sample_data.sql)'
  END AS result;

-- Check 10: Verify satisfaction ratings
SELECT
  'Satisfaction Data Check' AS test_category,
  CASE
    WHEN (SELECT COUNT(*) FROM satisfaction_ratings) > 0 THEN '✅ PASS - Satisfaction data available (' || (SELECT COUNT(*) FROM satisfaction_ratings)::TEXT || ' ratings)'
    ELSE '⚠️  WARNING - No satisfaction data (run reports_sample_data.sql)'
  END AS result;

-- Detailed Data Summary
SELECT
  '=== DATA SUMMARY ===' AS section,
  '' AS details
UNION ALL
SELECT
  'Total Issues' AS section,
  (SELECT COUNT(*)::TEXT FROM issues) AS details
UNION ALL
SELECT
  'Issues by Status' AS section,
  (SELECT STRING_AGG(status || ': ' || count::TEXT, ', ')
   FROM (SELECT status, COUNT(*) as count FROM issues GROUP BY status) s) AS details
UNION ALL
SELECT
  'Issues by Category' AS section,
  (SELECT STRING_AGG(category || ': ' || count::TEXT, ', ')
   FROM (SELECT category, COUNT(*) as count FROM issues GROUP BY category) c) AS details
UNION ALL
SELECT
  'Departments with Issues' AS section,
  (SELECT COUNT(DISTINCT department_id)::TEXT || ' departments' FROM issues WHERE department_id IS NOT NULL) AS details
UNION ALL
SELECT
  'Budget Categories' AS section,
  (SELECT COUNT(DISTINCT category)::TEXT || ' categories' FROM budget_allocations) AS details
UNION ALL
SELECT
  'Total Budget Allocated' AS section,
  'P ' || (SELECT TO_CHAR(SUM(allocated_amount), 'FM999,999,999.00') FROM budget_allocations) AS details
UNION ALL
SELECT
  'Total Budget Spent' AS section,
  'P ' || (SELECT TO_CHAR(SUM(spent_amount), 'FM999,999,999.00') FROM budget_allocations) AS details;

-- Test Monthly Stats Function Output (safe version)
DO $$
DECLARE
    stats_record RECORD;
    stats_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== MONTHLY STATS TEST ===';

    BEGIN
        FOR stats_record IN SELECT * FROM get_monthly_issue_stats(3) LOOP
            RAISE NOTICE 'Month: %, Created: %, Resolved: %, Response Time: % days',
                         stats_record.month,
                         stats_record.created,
                         stats_record.resolved,
                         ROUND(stats_record.response_time, 2);
            stats_count := stats_count + 1;
        END LOOP;

        IF stats_count = 0 THEN
            RAISE NOTICE 'No monthly stats data returned (this is normal if no issues exist)';
        ELSE
            RAISE NOTICE 'Successfully retrieved % months of statistics', stats_count;
        END IF;

    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error testing monthly stats function: %', SQLERRM;
    END;
END $$;

-- Test Dashboard Stats Function Output (safe version)
DO $$
DECLARE
    dashboard_stats JSON;
BEGIN
    RAISE NOTICE '=== DASHBOARD STATS TEST ===';

    BEGIN
        SELECT get_dashboard_stats() INTO dashboard_stats;
        RAISE NOTICE 'Dashboard stats JSON: %', dashboard_stats::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error testing dashboard stats function: %', SQLERRM;
    END;
END $$;

-- Final Status Summary
SELECT
  '=== FINAL STATUS ===' AS summary,
  CASE
    WHEN (
      (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('updates', 'reports', 'budget_allocations', 'satisfaction_ratings')) = 4
      AND (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'issues' AND column_name IN ('constituency', 'first_response_at')) = 2
      AND (SELECT COUNT(*) FROM pg_proc WHERE proname IN ('get_monthly_issue_stats', 'get_dashboard_stats')) = 2
    ) THEN '🎉 SUCCESS - Reports database enhancement is fully functional!'
    ELSE '⚠️  INCOMPLETE - Some components may not be working properly'
  END AS status;

-- Recommendations
SELECT
  '=== RECOMMENDATIONS ===' AS section,
  CASE
    WHEN (SELECT COUNT(*) FROM budget_allocations) = 0 THEN 'Run reports_sample_data.sql to add sample data for testing'
    WHEN (SELECT COUNT(*) FROM issues) < 10 THEN 'Consider adding more sample issues for better report visualization'
    WHEN (SELECT COUNT(*) FROM updates) = 0 THEN 'Add sample updates to test stakeholder communication features'
    ELSE 'Database is ready for production use!'
  END AS recommendation;
