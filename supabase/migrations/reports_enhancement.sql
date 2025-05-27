-- Reports Enhancement Migration
-- This migration adds all missing database structures needed for comprehensive reporting
-- Run this in Supabase SQL Editor to enhance your database for reports functionality

-- Add missing columns to existing tables
DO $$ 
BEGIN
  -- Add constituency column to issues table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'issues' AND column_name = 'constituency') THEN
    ALTER TABLE issues ADD COLUMN constituency TEXT;
  END IF;
  
  -- Add first_response_at column to issues table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'issues' AND column_name = 'first_response_at') THEN
    ALTER TABLE issues ADD COLUMN first_response_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Create updates table for official stakeholder updates
CREATE TABLE IF NOT EXISTS updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status_change TEXT, -- Previous status if this update changes status
  is_official BOOLEAN DEFAULT FALSE,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table for storing generated reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual', 'custom')),
  period TEXT NOT NULL,
  department_id UUID REFERENCES departments(id),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  data JSONB DEFAULT '{}', -- JSON data containing report content
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create budget_allocations table for financial tracking
CREATE TABLE IF NOT EXISTS budget_allocations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id UUID REFERENCES departments(id),
  category TEXT NOT NULL,
  fiscal_year INTEGER NOT NULL,
  allocated_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  spent_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(department_id, category, fiscal_year)
);

-- Create satisfaction_ratings table for citizen feedback
CREATE TABLE IF NOT EXISTS satisfaction_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, issue_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_issues_constituency ON issues(constituency);
CREATE INDEX IF NOT EXISTS idx_issues_first_response ON issues(first_response_at);
CREATE INDEX IF NOT EXISTS idx_updates_issue ON updates(issue_id);
CREATE INDEX IF NOT EXISTS idx_updates_author ON updates(author_id);
CREATE INDEX IF NOT EXISTS idx_updates_created_at ON updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_department ON reports(department_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_budget_department_year ON budget_allocations(department_id, fiscal_year);
CREATE INDEX IF NOT EXISTS idx_budget_category ON budget_allocations(category);
CREATE INDEX IF NOT EXISTS idx_satisfaction_issue ON satisfaction_ratings(issue_id);
CREATE INDEX IF NOT EXISTS idx_satisfaction_rating ON satisfaction_ratings(rating);

-- Add update triggers for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_updates_updated_at ON updates;
CREATE TRIGGER update_updates_updated_at BEFORE UPDATE ON updates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_budget_allocations_updated_at ON budget_allocations;
CREATE TRIGGER update_budget_allocations_updated_at BEFORE UPDATE ON budget_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RPC Functions for Reports and Analytics

-- Function to get monthly issue statistics
CREATE OR REPLACE FUNCTION get_monthly_issue_stats(months_back INTEGER DEFAULT 6)
RETURNS TABLE (
  month TEXT,
  created INTEGER,
  resolved INTEGER,
  response_time NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH monthly_data AS (
    SELECT 
      TO_CHAR(date_trunc('month', generate_series(
        date_trunc('month', CURRENT_DATE) - (months_back || ' months')::INTERVAL,
        date_trunc('month', CURRENT_DATE),
        '1 month'::INTERVAL
      )), 'Mon YYYY') as month_name,
      date_trunc('month', generate_series(
        date_trunc('month', CURRENT_DATE) - (months_back || ' months')::INTERVAL,
        date_trunc('month', CURRENT_DATE),
        '1 month'::INTERVAL
      )) as month_start
  ),
  issue_stats AS (
    SELECT 
      TO_CHAR(date_trunc('month', i.created_at), 'Mon YYYY') as month_name,
      COUNT(*) as created_count,
      COUNT(CASE WHEN i.status = 'resolved' THEN 1 END) as resolved_count,
      AVG(CASE 
        WHEN i.first_response_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (i.first_response_at - i.created_at)) / 86400 
        ELSE NULL 
      END) as avg_response_days
    FROM issues i
    WHERE i.created_at >= date_trunc('month', CURRENT_DATE) - (months_back || ' months')::INTERVAL
    GROUP BY date_trunc('month', i.created_at)
  )
  SELECT 
    md.month_name,
    COALESCE(ist.created_count, 0)::INTEGER,
    COALESCE(ist.resolved_count, 0)::INTEGER,
    COALESCE(ist.avg_response_days, 0)::NUMERIC
  FROM monthly_data md
  LEFT JOIN issue_stats ist ON md.month_name = ist.month_name
  ORDER BY md.month_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_issues', (SELECT COUNT(*) FROM issues),
    'open_issues', (SELECT COUNT(*) FROM issues WHERE status = 'open'),
    'in_progress_issues', (SELECT COUNT(*) FROM issues WHERE status = 'in_progress'),
    'resolved_issues', (SELECT COUNT(*) FROM issues WHERE status = 'resolved'),
    'closed_issues', (SELECT COUNT(*) FROM issues WHERE status = 'closed'),
    'total_users', (SELECT COUNT(*) FROM profiles),
    'issues_by_category', (
      SELECT json_agg(
        json_build_object(
          'category', category,
          'count', count
        )
      )
      FROM (
        SELECT category, COUNT(*) as count
        FROM issues
        GROUP BY category
        ORDER BY count DESC
      ) cat_stats
    ),
    'issues_by_status', (
      SELECT json_agg(
        json_build_object(
          'status', status,
          'count', count
        )
      )
      FROM (
        SELECT status, COUNT(*) as count
        FROM issues
        GROUP BY status
        ORDER BY count DESC
      ) status_stats
    ),
    'department_performance', (
      SELECT json_agg(
        json_build_object(
          'department', d.name,
          'total_issues', COALESCE(dept_stats.total, 0),
          'resolved_issues', COALESCE(dept_stats.resolved, 0),
          'resolution_rate', COALESCE(dept_stats.resolution_rate, 0)
        )
      )
      FROM departments d
      LEFT JOIN (
        SELECT 
          department_id,
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
          ROUND(
            (COUNT(CASE WHEN status = 'resolved' THEN 1 END)::NUMERIC / COUNT(*)) * 100, 2
          ) as resolution_rate
        FROM issues
        WHERE department_id IS NOT NULL
        GROUP BY department_id
      ) dept_stats ON d.id = dept_stats.department_id
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add table comments for documentation
COMMENT ON TABLE updates IS 'Official updates from stakeholders on issues';
COMMENT ON TABLE reports IS 'Generated reports for analytics and performance tracking';
COMMENT ON TABLE budget_allocations IS 'Budget allocation and spending tracking by department';
COMMENT ON TABLE satisfaction_ratings IS 'Citizen satisfaction ratings for resolved issues';

-- Success message
SELECT 'Reports enhancement migration completed successfully!' AS result;
