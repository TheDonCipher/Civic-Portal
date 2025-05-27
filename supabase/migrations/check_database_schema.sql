-- Database Schema Check for Reports Enhancement
-- Run this to see what's missing from your database schema

-- Check 1: What tables exist
SELECT
    'EXISTING TABLES' AS check_type,
    STRING_AGG(table_name, ', ') AS result
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
AND table_name IN ('issues', 'profiles', 'departments', 'comments', 'solutions', 'votes', 'notifications', 'watchers', 'updates', 'reports', 'budget_allocations', 'satisfaction_ratings');

-- Check 2: Issues table columns
SELECT
    'ISSUES TABLE COLUMNS' AS check_type,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) AS result
FROM information_schema.columns
WHERE table_name = 'issues';

-- Check 3: Missing columns in issues table
SELECT
    'MISSING ISSUES COLUMNS' AS check_type,
    STRING_AGG(missing_column, ', ') AS result
FROM (
    SELECT unnest(ARRAY['vote_count', 'comment_count', 'constituency', 'first_response_at']) AS missing_column
    EXCEPT
    SELECT column_name FROM information_schema.columns WHERE table_name = 'issues'
) missing;

-- Check 4: Missing tables for reports
SELECT
    'MISSING TABLES' AS check_type,
    STRING_AGG(missing_table, ', ') AS result
FROM (
    SELECT unnest(ARRAY['updates', 'reports', 'budget_allocations', 'satisfaction_ratings']) AS missing_table
    EXCEPT
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
) missing;

-- Check 5: RPC Functions
SELECT
    'EXISTING RPC FUNCTIONS' AS check_type,
    STRING_AGG(proname, ', ') AS result
FROM pg_proc
WHERE proname IN ('get_monthly_issue_stats', 'get_dashboard_stats');

-- Check 6: Sample data counts
SELECT
    'DATA COUNTS' AS check_type,
    'Issues: ' || (SELECT COUNT(*) FROM issues) ||
    ', Profiles: ' || (SELECT COUNT(*) FROM profiles) ||
    ', Departments: ' || (SELECT COUNT(*) FROM departments) AS result;

-- Check 7: What needs to be done
SELECT
    'RECOMMENDATIONS' AS check_type,
    CASE
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'issues' AND column_name = 'vote_count')
        THEN 'RUN reports_enhancement.sql first to add missing columns and tables'
        WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'budget_allocations')
        THEN 'RUN reports_enhancement.sql to add missing tables'
        WHEN (SELECT COUNT(*) FROM issues) = 0
        THEN 'Database schema is ready - run reports_sample_data_safe.sql for sample data'
        ELSE 'Database appears ready for reports functionality'
    END AS result;

-- Detailed column analysis for issues table
SELECT
    '=== ISSUES TABLE ANALYSIS ===' AS section,
    '' AS column_name,
    '' AS data_type,
    '' AS is_nullable,
    0 AS sort_order
UNION ALL
SELECT
    'Column Details:' AS section,
    column_name,
    data_type,
    is_nullable,
    ordinal_position AS sort_order
FROM information_schema.columns
WHERE table_name = 'issues'
ORDER BY sort_order, section DESC;

-- Check if reports enhancement was run
SELECT
    'ENHANCEMENT STATUS' AS check_type,
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'issues' AND column_name = 'constituency')
        AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'budget_allocations')
        AND EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_monthly_issue_stats')
        THEN '✅ Reports enhancement appears to be installed'
        ELSE '❌ Reports enhancement NOT installed - run reports_enhancement.sql first'
    END AS result;
