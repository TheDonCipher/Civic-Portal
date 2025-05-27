-- Minimal Data Setup for Reports Testing
-- This creates the absolute minimum data needed to test reports functionality
-- Run this if you want to test reports without existing user data

-- Create basic budget allocations (this works without any existing data)
INSERT INTO budget_allocations (department_id, category, fiscal_year, allocated_amount, spent_amount, description) VALUES
  -- Use department IDs if they exist, otherwise create generic entries
  (
    COALESCE((SELECT id FROM departments WHERE name ILIKE '%health%' LIMIT 1), gen_random_uuid()),
    'Healthcare Services', 
    2024, 
    8000000.00, 
    6500000.00, 
    'Healthcare and medical services'
  ),
  (
    COALESCE((SELECT id FROM departments WHERE name ILIKE '%transport%' OR name ILIKE '%infrastructure%' LIMIT 1), gen_random_uuid()),
    'Infrastructure Maintenance', 
    2024, 
    5000000.00, 
    3200000.00, 
    'Road and infrastructure maintenance'
  ),
  (
    COALESCE((SELECT id FROM departments WHERE name ILIKE '%education%' LIMIT 1), gen_random_uuid()),
    'Educational Resources', 
    2024, 
    4500000.00, 
    3800000.00, 
    'Educational materials and resources'
  ),
  (
    COALESCE((SELECT id FROM departments WHERE name ILIKE '%water%' LIMIT 1), gen_random_uuid()),
    'Water Services', 
    2024, 
    12000000.00, 
    8500000.00, 
    'Water supply and sanitation'
  ),
  (
    COALESCE((SELECT id FROM departments WHERE name ILIKE '%environment%' LIMIT 1), gen_random_uuid()),
    'Environmental Programs', 
    2024, 
    6500000.00, 
    4100000.00, 
    'Environmental conservation and tourism'
  )
ON CONFLICT DO NOTHING;

-- Create a basic report entry for testing
INSERT INTO reports (title, description, type, period, status, data) VALUES
  (
    'Test Report - ' || TO_CHAR(CURRENT_DATE, 'Month YYYY'),
    'Sample report for testing reports functionality',
    'monthly',
    TO_CHAR(CURRENT_DATE, 'YYYY-MM'),
    'published',
    jsonb_build_object(
      'summary', jsonb_build_object(
        'total_issues', 25,
        'resolved_issues', 18,
        'resolution_rate', 72.0,
        'departments_active', 5
      ),
      'categories', jsonb_build_array(
        jsonb_build_object('name', 'infrastructure', 'count', 8),
        jsonb_build_object('name', 'health', 'count', 6),
        jsonb_build_object('name', 'education', 'count', 5),
        jsonb_build_object('name', 'utilities', 'count', 4),
        jsonb_build_object('name', 'environment', 'count', 2)
      ),
      'generated_at', CURRENT_TIMESTAMP
    )
  )
ON CONFLICT DO NOTHING;

-- Test the RPC functions to make sure they work
DO $$
DECLARE
    monthly_stats_result RECORD;
    dashboard_stats_result JSON;
BEGIN
    -- Test monthly stats function
    BEGIN
        SELECT * INTO monthly_stats_result FROM get_monthly_issue_stats(3) LIMIT 1;
        RAISE NOTICE 'Monthly stats function working: %', monthly_stats_result;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Monthly stats function error: %', SQLERRM;
    END;
    
    -- Test dashboard stats function
    BEGIN
        SELECT get_dashboard_stats() INTO dashboard_stats_result;
        RAISE NOTICE 'Dashboard stats function working: %', dashboard_stats_result::TEXT;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Dashboard stats function error: %', SQLERRM;
    END;
END $$;

-- Create some mock data for testing if no real data exists
DO $$
BEGIN
    -- Only create mock data if we have very little existing data
    IF (SELECT COUNT(*) FROM issues) < 5 THEN
        -- Insert some basic test data that doesn't require existing users
        INSERT INTO issues (title, description, category, status, priority, location, constituency, vote_count, comment_count, created_at, first_response_at)
        VALUES 
        ('Test Infrastructure Issue', 'Sample infrastructure issue for testing', 'infrastructure', 'open', 'medium', 'Test Location', 'Test Constituency', 15, 3, NOW() - INTERVAL '5 days', NULL),
        ('Test Health Issue', 'Sample health issue for testing', 'health', 'in_progress', 'high', 'Test Clinic', 'Test Constituency', 28, 7, NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days'),
        ('Test Education Issue', 'Sample education issue for testing', 'education', 'resolved', 'medium', 'Test School', 'Test Constituency', 12, 5, NOW() - INTERVAL '15 days', NOW() - INTERVAL '12 days'),
        ('Test Utilities Issue', 'Sample utilities issue for testing', 'utilities', 'resolved', 'urgent', 'Test Area', 'Test Constituency', 35, 12, NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days'),
        ('Test Environment Issue', 'Sample environment issue for testing', 'environment', 'open', 'low', 'Test Park', 'Test Constituency', 8, 2, NOW() - INTERVAL '3 days', NULL)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Created sample issues for testing';
    END IF;
END $$;

-- Verify everything is working
SELECT 
    'Minimal data setup completed!' AS status,
    (SELECT COUNT(*) FROM budget_allocations) AS budget_entries,
    (SELECT COUNT(*) FROM reports) AS report_entries,
    (SELECT COUNT(*) FROM issues) AS issue_entries,
    CASE 
        WHEN (SELECT COUNT(*) FROM budget_allocations) > 0 THEN 'Budget data available for financial reports'
        ELSE 'No budget data - financial reports will be empty'
    END AS budget_status,
    CASE 
        WHEN (SELECT COUNT(*) FROM issues) > 0 THEN 'Issue data available for analytics'
        ELSE 'No issue data - create some issues to see full reports'
    END AS issue_status;
