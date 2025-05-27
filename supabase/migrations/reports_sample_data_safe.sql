-- Safe Sample Data for Reports Enhancement
-- This version handles missing data gracefully and creates minimal required data
-- Run this AFTER running reports_enhancement.sql

-- First, let's check what data we have and create basic data if needed
DO $$
DECLARE
    dept_count INTEGER;
    profile_count INTEGER;
    issue_count INTEGER;
BEGIN
    -- Check if we have departments
    SELECT COUNT(*) INTO dept_count FROM departments;
    IF dept_count = 0 THEN
        -- Create basic departments if none exist
        INSERT INTO departments (name, description) VALUES
        ('Health', 'Ministry of Health and Wellness'),
        ('Transport and Infrastructure', 'Ministry of Transport and Infrastructure'),
        ('Child Welfare and Basic Education', 'Ministry of Education'),
        ('Water and Human Settlement', 'Ministry of Water and Human Settlement')
        ON CONFLICT (name) DO NOTHING;
    END IF;

    -- Check if we have profiles
    SELECT COUNT(*) INTO profile_count FROM profiles;
    IF profile_count = 0 THEN
        -- Create basic profiles if none exist (these will need to be linked to auth.users)
        RAISE NOTICE 'No profiles found. You may need to create user accounts first.';
    END IF;

    -- Check if we have issues
    SELECT COUNT(*) INTO issue_count FROM issues;
    IF issue_count = 0 THEN
        RAISE NOTICE 'No issues found. Creating sample issues requires user profiles.';
    END IF;

    RAISE NOTICE 'Data check complete: % departments, % profiles, % issues', dept_count, profile_count, issue_count;
END $$;

-- Update existing issues with constituency and response time data (if any exist)
DO $$
BEGIN
    -- Only update constituency if the column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'issues' AND column_name = 'constituency') THEN
        UPDATE issues SET
          constituency = CASE
            WHEN location LIKE '%Gaborone%' THEN 'Gaborone Central'
            WHEN location LIKE '%Francistown%' THEN 'Francistown East'
            WHEN location LIKE '%Maun%' THEN 'Maun West'
            WHEN location LIKE '%Palapye%' THEN 'Palapye'
            ELSE 'Central District'
          END
        WHERE constituency IS NULL;
    END IF;

    -- Only update first_response_at if the column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'issues' AND column_name = 'first_response_at') THEN
        UPDATE issues SET
          first_response_at = CASE
            WHEN status != 'open' THEN created_at + INTERVAL '1 day' + (RANDOM() * INTERVAL '3 days')
            ELSE NULL
          END
        WHERE first_response_at IS NULL;
    END IF;
END $$;

-- Sample budget allocations (safe - uses department names that should exist)
INSERT INTO budget_allocations (department_id, category, fiscal_year, allocated_amount, spent_amount, description) VALUES
  ((SELECT id FROM departments WHERE name = 'Health' LIMIT 1), 'Clinic Operations', 2024, 8000000.00, 6500000.00, 'Clinic operational expenses and equipment'),
  ((SELECT id FROM departments WHERE name = 'Health' LIMIT 1), 'Medical Supplies', 2024, 3000000.00, 2100000.00, 'Medical supplies and pharmaceuticals'),
  ((SELECT id FROM departments WHERE name = 'Transport and Infrastructure' LIMIT 1), 'Road Maintenance', 2024, 5000000.00, 3200000.00, 'Annual road maintenance and repairs'),
  ((SELECT id FROM departments WHERE name = 'Transport and Infrastructure' LIMIT 1), 'Street Lighting', 2024, 1500000.00, 800000.00, 'Street light installation and maintenance'),
  ((SELECT id FROM departments WHERE name = 'Child Welfare and Basic Education' LIMIT 1), 'Educational Materials', 2024, 4500000.00, 3800000.00, 'Textbooks and learning materials'),
  ((SELECT id FROM departments WHERE name = 'Water and Human Settlement' LIMIT 1), 'Water Infrastructure', 2024, 12000000.00, 8500000.00, 'Water supply infrastructure and maintenance')
ON CONFLICT DO NOTHING;

-- Only add updates if we have both issues and officials
INSERT INTO updates (issue_id, author_id, title, content, is_official)
SELECT
    i.id,
    p.id,
    'Department Status Update',
    'Thank you for reporting this issue. Our department has been notified and is reviewing the situation.',
    true
FROM issues i
CROSS JOIN profiles p
WHERE p.role = 'official'
LIMIT 3
ON CONFLICT DO NOTHING;

-- Only add satisfaction ratings if we have resolved issues and citizens
INSERT INTO satisfaction_ratings (issue_id, user_id, rating, feedback)
SELECT
    i.id,
    p.id,
    4 + (RANDOM() * 1)::INTEGER, -- Random rating between 4-5
    CASE
        WHEN RANDOM() > 0.5 THEN 'Good response from the department. Thank you for addressing this issue.'
        ELSE 'Satisfied with the resolution. The department handled this well.'
    END
FROM issues i
CROSS JOIN profiles p
WHERE i.status = 'resolved' AND p.role = 'citizen'
LIMIT 5
ON CONFLICT DO NOTHING;

-- Create a sample report if we have admin users
INSERT INTO reports (title, description, type, period, author_id, status, data)
SELECT
    'Monthly Civic Issues Report - ' || TO_CHAR(CURRENT_DATE, 'Month YYYY'),
    'Comprehensive monthly report on civic issues, resolutions, and department performance',
    'monthly',
    TO_CHAR(CURRENT_DATE, 'YYYY-MM'),
    p.id,
    'published',
    jsonb_build_object(
        'summary', jsonb_build_object(
            'total_issues', (SELECT COUNT(*) FROM issues),
            'resolved_issues', (SELECT COUNT(*) FROM issues WHERE status = 'resolved'),
            'resolution_rate', CASE
                WHEN (SELECT COUNT(*) FROM issues) > 0
                THEN ROUND((SELECT COUNT(*) FROM issues WHERE status = 'resolved')::NUMERIC / (SELECT COUNT(*) FROM issues) * 100, 2)
                ELSE 0
            END
        ),
        'generated_at', CURRENT_TIMESTAMP
    )
FROM profiles p
WHERE p.role = 'admin'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Create some sample issues if we have profiles but no issues
-- Check which columns exist first
DO $$
DECLARE
    has_vote_count BOOLEAN;
    has_comment_count BOOLEAN;
    has_constituency BOOLEAN;
    has_first_response BOOLEAN;
    insert_sql TEXT;
BEGIN
    -- Check for column existence
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'issues' AND column_name = 'vote_count'
    ) INTO has_vote_count;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'issues' AND column_name = 'comment_count'
    ) INTO has_comment_count;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'issues' AND column_name = 'constituency'
    ) INTO has_constituency;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'issues' AND column_name = 'first_response_at'
    ) INTO has_first_response;

    -- Only create sample issues if we have profiles but no issues
    IF (SELECT COUNT(*) FROM profiles WHERE role = 'citizen') > 0 AND (SELECT COUNT(*) FROM issues) = 0 THEN
        -- Build dynamic INSERT statement based on available columns
        insert_sql := 'INSERT INTO issues (title, description, category, status, priority, location';

        IF has_constituency THEN
            insert_sql := insert_sql || ', constituency';
        END IF;

        insert_sql := insert_sql || ', department_id, author_id';

        IF has_vote_count THEN
            insert_sql := insert_sql || ', vote_count';
        END IF;

        IF has_comment_count THEN
            insert_sql := insert_sql || ', comment_count';
        END IF;

        IF has_first_response THEN
            insert_sql := insert_sql || ', first_response_at';
        END IF;

        insert_sql := insert_sql || ') SELECT ';
        insert_sql := insert_sql || '''Sample Issue: '' || (ROW_NUMBER() OVER ()), ';
        insert_sql := insert_sql || '''This is a sample issue created for testing the reports functionality.'', ';
        insert_sql := insert_sql || 'CASE (ROW_NUMBER() OVER ()) % 4 WHEN 1 THEN ''infrastructure'' WHEN 2 THEN ''health'' WHEN 3 THEN ''education'' ELSE ''utilities'' END, ';
        insert_sql := insert_sql || 'CASE (ROW_NUMBER() OVER ()) % 4 WHEN 1 THEN ''open'' WHEN 2 THEN ''in_progress'' WHEN 3 THEN ''resolved'' ELSE ''open'' END, ';
        insert_sql := insert_sql || '''medium'', ''Sample Location, Gaborone''';

        IF has_constituency THEN
            insert_sql := insert_sql || ', ''Gaborone Central''';
        END IF;

        insert_sql := insert_sql || ', d.id, p.id';

        IF has_vote_count THEN
            insert_sql := insert_sql || ', FLOOR(RANDOM() * 20) + 5';
        END IF;

        IF has_comment_count THEN
            insert_sql := insert_sql || ', FLOOR(RANDOM() * 10) + 1';
        END IF;

        IF has_first_response THEN
            insert_sql := insert_sql || ', CASE WHEN (ROW_NUMBER() OVER ()) % 4 != 1 THEN NOW() - INTERVAL ''1 day'' - (RANDOM() * INTERVAL ''5 days'') ELSE NULL END';
        END IF;

        insert_sql := insert_sql || ' FROM profiles p CROSS JOIN departments d WHERE p.role = ''citizen'' LIMIT 10';

        EXECUTE insert_sql;

        RAISE NOTICE 'Created sample issues with available columns';
    END IF;

    -- Update existing issues with available columns
    IF has_vote_count AND has_comment_count THEN
        UPDATE issues SET
          vote_count = CASE WHEN vote_count = 0 THEN FLOOR(RANDOM() * 30) + 5 ELSE vote_count END,
          comment_count = CASE WHEN comment_count = 0 THEN FLOOR(RANDOM() * 15) + 1 ELSE comment_count END;
    ELSIF has_vote_count THEN
        UPDATE issues SET
          vote_count = CASE WHEN vote_count = 0 THEN FLOOR(RANDOM() * 30) + 5 ELSE vote_count END;
    ELSIF has_comment_count THEN
        UPDATE issues SET
          comment_count = CASE WHEN comment_count = 0 THEN FLOOR(RANDOM() * 15) + 1 ELSE comment_count END;
    END IF;

    RAISE NOTICE 'Column availability: vote_count=%, comment_count=%, constituency=%, first_response_at=%',
                 has_vote_count, has_comment_count, has_constituency, has_first_response;
END $$;

-- Final summary
SELECT
    'Sample data loading completed!' AS result,
    (SELECT COUNT(*) FROM issues) AS total_issues,
    (SELECT COUNT(*) FROM updates) AS total_updates,
    (SELECT COUNT(*) FROM budget_allocations) AS total_budget_allocations,
    (SELECT COUNT(*) FROM satisfaction_ratings) AS total_satisfaction_ratings,
    (SELECT COUNT(*) FROM reports) AS total_reports;
