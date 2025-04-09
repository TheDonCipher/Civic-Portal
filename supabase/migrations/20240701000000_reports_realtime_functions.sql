-- Drop existing functions first to avoid the return type error
DROP FUNCTION IF EXISTS get_monthly_issue_stats(integer);
DROP FUNCTION IF EXISTS get_report_data(text);

-- Create function to get monthly issue statistics
CREATE OR REPLACE FUNCTION get_monthly_issue_stats(months_back INTEGER)
RETURNS TABLE (
  month TEXT,
  issues INTEGER,
  resolved INTEGER,
  responseTime NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH months AS (
    SELECT to_char(date_trunc('month', current_date - (n || ' month')::interval), 'Mon YYYY') as month,
           date_trunc('month', current_date - (n || ' month')::interval) as month_start,
           date_trunc('month', current_date - (n || ' month')::interval) + interval '1 month' - interval '1 day' as month_end
    FROM generate_series(0, months_back - 1) n
  )
  SELECT 
    m.month,
    COUNT(i.id)::INTEGER as issues,
    COUNT(CASE WHEN i.status = 'resolved' THEN 1 ELSE NULL END)::INTEGER as resolved,
    COALESCE(AVG(EXTRACT(EPOCH FROM (COALESCE(i.first_response_time, current_timestamp) - i.created_at)) / 86400), 0)::NUMERIC as responseTime
  FROM months m
  LEFT JOIN issues i ON i.created_at BETWEEN m.month_start AND m.month_end
  GROUP BY m.month, m.month_start
  ORDER BY m.month_start DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get report data
CREATE OR REPLACE FUNCTION get_report_data(time_frame TEXT)
RETURNS JSONB AS $$
DECLARE
  months_back INTEGER;
  result JSONB;
  issues_by_category JSONB;
  issues_by_status JSONB;
  monthly_trends JSONB;
  department_performance JSONB;
  budget_allocation JSONB;
  citizen_engagement JSONB;
BEGIN
  -- Determine how many months to look back based on the time_frame parameter
  CASE
    WHEN time_frame = '1m' THEN months_back := 1;
    WHEN time_frame = '3m' THEN months_back := 3;
    WHEN time_frame = '6m' THEN months_back := 6;
    WHEN time_frame = '1y' THEN months_back := 12;
    ELSE months_back := 6; -- Default to 6 months
  END CASE;
  
  -- Get issues by category
  SELECT jsonb_agg(
    jsonb_build_object(
      'name', c.name,
      'value', COUNT(i.id),
      'previousValue', prev_counts.count
    )
  ) INTO issues_by_category
  FROM categories c
  LEFT JOIN issues i ON i.category_id = c.id AND i.created_at > (current_date - (months_back || ' month')::interval)
  LEFT JOIN (
    SELECT 
      i.category_id, 
      COUNT(i.id) as count
    FROM issues i
    WHERE i.created_at BETWEEN 
      (current_date - ((months_back * 2) || ' month')::interval) AND 
      (current_date - (months_back || ' month')::interval)
    GROUP BY i.category_id
  ) prev_counts ON c.id = prev_counts.category_id
  GROUP BY c.id, c.name, prev_counts.count
  ORDER BY COUNT(i.id) DESC;
  
  -- Get issues by status
  SELECT jsonb_agg(
    jsonb_build_object(
      'name', status,
      'value', COUNT(*),
      'previousValue', prev_counts.count
    )
  ) INTO issues_by_status
  FROM issues i
  LEFT JOIN (
    SELECT 
      status, 
      COUNT(*) as count
    FROM issues
    WHERE created_at BETWEEN 
      (current_date - ((months_back * 2) || ' month')::interval) AND 
      (current_date - (months_back || ' month')::interval)
    GROUP BY status
  ) prev_counts ON i.status = prev_counts.status
  WHERE i.created_at > (current_date - (months_back || ' month')::interval)
  GROUP BY i.status, prev_counts.count;
  
  -- Get monthly trends
  SELECT jsonb_agg(jsonb_build_object(
    'month', month,
    'issues', issues,
    'resolved', resolved,
    'responseTime', responseTime
  )) INTO monthly_trends
  FROM get_monthly_issue_stats(months_back);
  
  -- Get department performance
  SELECT jsonb_agg(
    jsonb_build_object(
      'name', d.name,
      'resolutionRate', COALESCE(ROUND((resolved_count.count * 100.0 / NULLIF(total_count.count, 0))::numeric, 1), 0),
      'avgResponseDays', COALESCE(ROUND(avg_response.days::numeric, 1), 0)
    )
  ) INTO department_performance
  FROM departments d
  LEFT JOIN (
    SELECT 
      department_id, 
      COUNT(*) as count
    FROM issues
    WHERE created_at > (current_date - (months_back || ' month')::interval)
    GROUP BY department_id
  ) total_count ON d.id = total_count.department_id
  LEFT JOIN (
    SELECT 
      department_id, 
      COUNT(*) as count
    FROM issues
    WHERE status = 'resolved' AND created_at > (current_date - (months_back || ' month')::interval)
    GROUP BY department_id
  ) resolved_count ON d.id = resolved_count.department_id
  LEFT JOIN (
    SELECT 
      department_id, 
      AVG(EXTRACT(EPOCH FROM (COALESCE(first_response_time, current_timestamp) - created_at)) / 86400) as days
    FROM issues
    WHERE created_at > (current_date - (months_back || ' month')::interval)
    GROUP BY department_id
  ) avg_response ON d.id = avg_response.department_id;
  
  -- Simulate budget allocation data (replace with actual data in production)
  SELECT jsonb_agg(
    jsonb_build_object(
      'category', c.name,
      'allocated', (random() * 1000000)::int,
      'spent', (random() * 900000)::int
    )
  ) INTO budget_allocation
  FROM categories c
  LIMIT 5;
  
  -- Simulate citizen engagement data (replace with actual data in production)
  WITH months AS (
    SELECT to_char(date_trunc('month', current_date - (n || ' month')::interval), 'Mon YYYY') as month,
           date_trunc('month', current_date - (n || ' month')::interval) as month_start,
           date_trunc('month', current_date - (n || ' month')::interval) + interval '1 month' - interval '1 day' as month_end
    FROM generate_series(0, months_back - 1) n
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'month', m.month,
      'votes', COALESCE(v.vote_count, 0) + (random() * 100)::int,
      'comments', COALESCE(c.comment_count, 0) + (random() * 50)::int,
      'satisfaction', (70 + (random() * 20))::int
    )
  ) INTO citizen_engagement
  FROM months m
  LEFT JOIN (
    SELECT 
      date_trunc('month', iv.created_at) as month,
      COUNT(*) as vote_count
    FROM issue_votes iv
    WHERE iv.created_at > (current_date - (months_back || ' month')::interval)
    GROUP BY date_trunc('month', iv.created_at)
  ) v ON m.month_start = v.month
  LEFT JOIN (
    SELECT 
      date_trunc('month', c.created_at) as month,
      COUNT(*) as comment_count
    FROM comments c
    WHERE c.created_at > (current_date - (months_back || ' month')::interval)
    GROUP BY date_trunc('month', c.created_at)
  ) c ON m.month_start = c.month
  ORDER BY m.month_start DESC;
  
  -- Combine all data into a single JSON result
  result := jsonb_build_object(
    'issuesByCategory', COALESCE(issues_by_category, '[]'::jsonb),
    'issuesByStatus', COALESCE(issues_by_status, '[]'::jsonb),
    'monthlyTrends', COALESCE(monthly_trends, '[]'::jsonb),
    'departmentPerformance', COALESCE(department_performance, '[]'::jsonb),
    'budgetAllocation', COALESCE(budget_allocation, '[]'::jsonb),
    'citizenEngagement', COALESCE(citizen_engagement, '[]'::jsonb)
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE issues;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE issue_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE departments;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
