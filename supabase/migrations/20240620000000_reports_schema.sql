-- Migration for Reports Schema
-- This migration adds tables and functions needed for the Reports page

-- Department table to track different government departments
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add department_id to issues table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'issues' AND column_name = 'department_id') THEN
    ALTER TABLE issues ADD COLUMN department_id UUID REFERENCES departments(id);
  END IF;
END $$;

-- Department performance statistics
CREATE TABLE IF NOT EXISTS department_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID REFERENCES departments(id),
  department_name TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  issues_count INTEGER NOT NULL DEFAULT 0,
  resolved_count INTEGER NOT NULL DEFAULT 0,
  resolution_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  avg_response_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Budget allocation and spending
CREATE TABLE IF NOT EXISTS budget_allocation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID REFERENCES departments(id),
  category TEXT NOT NULL,
  allocated_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  spent_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  period TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Funding statistics
CREATE TABLE IF NOT EXISTS funding_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_raised NUMERIC(12,2) NOT NULL DEFAULT 0,
  target_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Donations for crowdfunding
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount NUMERIC(12,2) NOT NULL,
  project TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  provider_avatar TEXT,
  issue_id UUID REFERENCES issues(id),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Constituency statistics
CREATE TABLE IF NOT EXISTS constituency_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  issues INTEGER NOT NULL DEFAULT 0,
  resolved INTEGER NOT NULL DEFAULT 0,
  resolution_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Citizen satisfaction ratings
CREATE TABLE IF NOT EXISTS satisfaction_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID REFERENCES issues(id),
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Function to get average response time
CREATE OR REPLACE FUNCTION get_average_response_time()
RETURNS NUMERIC AS $$
DECLARE
  avg_days NUMERIC;
BEGIN
  SELECT AVG(EXTRACT(EPOCH FROM (u.created_at - i.created_at)) / 86400) INTO avg_days
  FROM issues i
  JOIN updates u ON i.id = u.issue_id
  WHERE u.id IN (
    SELECT MIN(id) FROM updates WHERE issue_id = i.id GROUP BY issue_id
  );
  
  RETURN COALESCE(avg_days, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get average votes per issue
CREATE OR REPLACE FUNCTION get_average_votes_per_issue()
RETURNS NUMERIC AS $$
DECLARE
  avg_votes NUMERIC;
BEGIN
  SELECT AVG(votes) INTO avg_votes FROM issues WHERE votes > 0;
  RETURN COALESCE(avg_votes, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get average comments per issue
CREATE OR REPLACE FUNCTION get_average_comments_per_issue()
RETURNS NUMERIC AS $$
DECLARE
  avg_comments NUMERIC;
BEGIN
  SELECT AVG(comment_count) INTO avg_comments
  FROM (
    SELECT issue_id, COUNT(*) as comment_count
    FROM comments
    GROUP BY issue_id
  ) as comment_counts;
  
  RETURN COALESCE(avg_comments, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get monthly issue statistics
CREATE OR REPLACE FUNCTION get_monthly_issue_stats(months_back INTEGER DEFAULT 6)
RETURNS TABLE (
  month TIMESTAMPTZ,
  issues_count INTEGER,
  resolved_count INTEGER,
  avg_response_time NUMERIC
) AS $$
DECLARE
  current_date TIMESTAMPTZ := date_trunc('month', NOW());
  month_date TIMESTAMPTZ;
BEGIN
  FOR i IN 0..(months_back-1) LOOP
    month_date := current_date - (i * INTERVAL '1 month');
    
    RETURN QUERY
    SELECT 
      month_date as month,
      COUNT(i.id)::INTEGER as issues_count,
      COUNT(CASE WHEN i.status = 'resolved' THEN 1 ELSE NULL END)::INTEGER as resolved_count,
      COALESCE(AVG(
        CASE 
          WHEN u.created_at IS NOT NULL THEN 
            EXTRACT(EPOCH FROM (u.created_at - i.created_at)) / 86400
          ELSE NULL 
        END
      ), 0)::NUMERIC(5,2) as avg_response_time
    FROM issues i
    LEFT JOIN LATERAL (
      SELECT created_at 
      FROM updates 
      WHERE issue_id = i.id 
      ORDER BY created_at ASC 
      LIMIT 1
    ) u ON true
    WHERE 
      i.created_at >= date_trunc('month', month_date) AND
      i.created_at < date_trunc('month', month_date + INTERVAL '1 month');
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get monthly engagement statistics
CREATE OR REPLACE FUNCTION get_monthly_engagement_stats(months_back INTEGER DEFAULT 6)
RETURNS TABLE (
  month TIMESTAMPTZ,
  votes_count INTEGER,
  comments_count INTEGER,
  satisfaction_score INTEGER
) AS $$
DECLARE
  current_date TIMESTAMPTZ := date_trunc('month', NOW());
  month_date TIMESTAMPTZ;
BEGIN
  FOR i IN 0..(months_back-1) LOOP
    month_date := current_date - (i * INTERVAL '1 month');
    
    RETURN QUERY
    WITH monthly_votes AS (
      SELECT COUNT(iv.id) as vote_count
      FROM issue_votes iv
      WHERE 
        iv.created_at >= date_trunc('month', month_date) AND
        iv.created_at < date_trunc('month', month_date + INTERVAL '1 month')
    ),
    monthly_comments AS (
      SELECT COUNT(c.id) as comment_count
      FROM comments c
      WHERE 
        c.created_at >= date_trunc('month', month_date) AND
        c.created_at < date_trunc('month', month_date + INTERVAL '1 month')
    ),
    monthly_satisfaction AS (
      SELECT COALESCE(AVG(sr.rating) * 20, 0)::INTEGER as avg_satisfaction
      FROM satisfaction_ratings sr
      WHERE 
        sr.created_at >= date_trunc('month', month_date) AND
        sr.created_at < date_trunc('month', month_date + INTERVAL '1 month')
    )
    SELECT 
      month_date as month,
      COALESCE((SELECT vote_count FROM monthly_votes), 0)::INTEGER as votes_count,
      COALESCE((SELECT comment_count FROM monthly_comments), 0)::INTEGER as comments_count,
      COALESCE((SELECT avg_satisfaction FROM monthly_satisfaction), 85)::INTEGER as satisfaction_score;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update constituency statistics
CREATE OR REPLACE FUNCTION update_constituency_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update constituency stats
  INSERT INTO constituency_stats (name, issues, resolved, resolution_rate)
  SELECT 
    constituency, 
    COUNT(*)::INTEGER as issues_count,
    COUNT(CASE WHEN status = 'resolved' THEN 1 ELSE NULL END)::INTEGER as resolved_count,
    (COUNT(CASE WHEN status = 'resolved' THEN 1 ELSE NULL END)::NUMERIC / COUNT(*)::NUMERIC * 100)::NUMERIC(5,2) as resolution_rate
  FROM issues
  WHERE constituency IS NOT NULL
  GROUP BY constituency
  ON CONFLICT (name) DO UPDATE SET
    issues = EXCLUDED.issues,
    resolved = EXCLUDED.resolved,
    resolution_rate = EXCLUDED.resolution_rate,
    updated_at = NOW();
    
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update constituency stats when issues are created, updated, or deleted
CREATE OR REPLACE TRIGGER update_constituency_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON issues
FOR EACH STATEMENT
EXECUTE FUNCTION update_constituency_stats();

-- Function to update department performance statistics
CREATE OR REPLACE FUNCTION update_department_performance()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete old department performance records
  DELETE FROM department_performance 
  WHERE period_end < NOW() - INTERVAL '1 year';
  
  -- Insert or update department performance for the current month
  WITH dept_stats AS (
    SELECT 
      d.id as department_id,
      d.name as department_name,
      COUNT(i.id)::INTEGER as issues_count,
      COUNT(CASE WHEN i.status = 'resolved' THEN 1 ELSE NULL END)::INTEGER as resolved_count,
      (COUNT(CASE WHEN i.status = 'resolved' THEN 1 ELSE NULL END)::NUMERIC / NULLIF(COUNT(i.id)::NUMERIC, 0) * 100)::NUMERIC(5,2) as resolution_rate,
      COALESCE(AVG(
        CASE 
          WHEN u.created_at IS NOT NULL THEN 
            EXTRACT(EPOCH FROM (u.created_at - i.created_at)) / 86400
          ELSE NULL 
        END
      ), 0)::NUMERIC(5,2) as avg_response_days
    FROM departments d
    LEFT JOIN issues i ON d.id = i.department_id
    LEFT JOIN LATERAL (
      SELECT created_at 
      FROM updates 
      WHERE issue_id = i.id 
      ORDER BY created_at ASC 
      LIMIT 1
    ) u ON true
    WHERE i.created_at >= date_trunc('month', NOW() - INTERVAL '1 month')
    GROUP BY d.id, d.name
  )
  INSERT INTO department_performance (
    department_id, 
    department_name, 
    period_start, 
    period_end, 
    issues_count, 
    resolved_count, 
    resolution_rate, 
    avg_response_days
  )
  SELECT 
    department_id,
    department_name,
    date_trunc('month', NOW() - INTERVAL '1 month'),
    date_trunc('month', NOW()) - INTERVAL '1 second',
    issues_count,
    resolved_count,
    resolution_rate,
    avg_response_days
  FROM dept_stats
  ON CONFLICT (department_id, period_start) DO UPDATE SET
    issues_count = EXCLUDED.issues_count,
    resolved_count = EXCLUDED.resolved_count,
    resolution_rate = EXCLUDED.resolution_rate,
    avg_response_days = EXCLUDED.avg_response_days,
    updated_at = NOW();
    
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to update department performance monthly
SELECT cron.schedule(
  'update-department-performance',
  '0 0 1 * *',  -- Run at midnight on the 1st of every month
  $$
  SELECT update_department_performance();
  $$
);

-- Insert some initial departments if they don't exist
INSERT INTO departments (name, description)
VALUES 
  ('Public Works', 'Responsible for infrastructure maintenance and development'),
  ('Environmental', 'Handles environmental protection and conservation'),
  ('Public Safety', 'Manages public safety and emergency services'),
  ('Community Development', 'Focuses on community programs and social services')
ON CONFLICT (name) DO NOTHING;

-- Insert initial funding stats if they don't exist
INSERT INTO funding_stats (total_raised, target_amount)
VALUES (125000, 250000)
ON CONFLICT DO NOTHING;

-- Create RLS policies for the new tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_allocation ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE constituency_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE satisfaction_ratings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to statistics tables
CREATE POLICY "Allow public read access to departments" 
  ON departments FOR SELECT USING (true);

CREATE POLICY "Allow public read access to department_performance" 
  ON department_performance FOR SELECT USING (true);

CREATE POLICY "Allow public read access to budget_allocation" 
  ON budget_allocation FOR SELECT USING (true);

CREATE POLICY "Allow public read access to funding_stats" 
  ON funding_stats FOR SELECT USING (true);

CREATE POLICY "Allow public read access to constituency_stats" 
  ON constituency_stats FOR SELECT USING (true);

-- Allow authenticated users to read donations
CREATE POLICY "Allow authenticated users to read donations" 
  ON donations FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to insert their own donations
CREATE POLICY "Allow users to insert their own donations" 
  ON donations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to rate satisfaction only for themselves
CREATE POLICY "Allow users to rate satisfaction" 
  ON satisfaction_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to read their own satisfaction ratings" 
  ON satisfaction_ratings FOR SELECT USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_issues_department_id ON issues(department_id);
CREATE INDEX IF NOT EXISTS idx_issues_constituency ON issues(constituency);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at);
CREATE INDEX IF NOT EXISTS idx_department_performance_period ON department_performance(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_budget_allocation_period ON budget_allocation(period);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at);
CREATE INDEX IF NOT EXISTS idx_satisfaction_ratings_created_at ON satisfaction_ratings(created_at);

-- Run the initial update for constituency stats
SELECT update_constituency_stats();

-- Run the initial update for department performance
SELECT update_department_performance();
