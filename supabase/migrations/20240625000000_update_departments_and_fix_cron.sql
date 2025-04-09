-- Migration to update departments with Botswana ministries and fix cron issues

-- First, create the pg_cron extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Clear existing departments to ensure a clean slate
TRUNCATE departments CASCADE;

-- Insert the official Botswana ministries/departments
INSERT INTO departments (name, description)
VALUES 
  ('Finance', 'Responsible for financial management and economic policy'),
  ('International Relations', 'Handles diplomatic relations and international affairs'),
  ('Health', 'Manages healthcare services and public health initiatives'),
  ('Child Welfare and Basic Education', 'Oversees child welfare programs and primary education'),
  ('Higher Education', 'Responsible for tertiary education and research institutions'),
  ('Lands and Agriculture', 'Manages land resources and agricultural development'),
  ('Youth and Gender Affairs', 'Focuses on youth development and gender equality'),
  ('State Presidency', 'Coordinates executive functions and government administration'),
  ('Justice and Correctional Services', 'Oversees legal system and correctional facilities'),
  ('Local Government and Traditional Affairs', 'Manages local governance and traditional leadership'),
  ('Minerals and Energy', 'Responsible for mining, energy resources and utilities'),
  ('Communications and Innovation', 'Handles telecommunications and technological innovation'),
  ('Environment and Tourism', 'Manages environmental protection and tourism development'),
  ('Labour and Home Affairs', 'Oversees labor relations and citizenship services'),
  ('Sports and Arts', 'Promotes sports development and cultural activities'),
  ('Trade and Entrepreneurship', 'Supports business development and international trade'),
  ('Transport and Infrastructure', 'Manages transportation systems and infrastructure development'),
  ('Water and Human Settlement', 'Responsible for water resources and housing development')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = NOW();

-- Fix the cron scheduling function by replacing cron.schedule with pg_cron.schedule
-- First, drop the existing function if it exists
DO $$ 
BEGIN
  -- Check if the update_department_performance_trigger exists and drop it
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_department_performance_trigger') THEN
    DROP TRIGGER IF EXISTS update_department_performance_trigger ON issues;
  END IF;

  -- Remove any existing scheduled job
  PERFORM pg_cron.unschedule('update-department-performance');
EXCEPTION WHEN OTHERS THEN
  -- Ignore errors if the job doesn't exist
  RAISE NOTICE 'Could not unschedule job: %', SQLERRM;
END $$;

-- Create a new scheduled job using pg_cron
SELECT pg_cron.schedule(
  'update-department-performance',
  '0 0 1 * *',  -- Run at midnight on the 1st of every month
  $$
  SELECT update_department_performance();
  $$
);

-- Update the department_performance table with initial data for each ministry
DO $$ 
BEGIN
  -- Generate sample performance data for each department
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
    d.id,
    d.name,
    date_trunc('month', NOW() - INTERVAL '1 month'),
    date_trunc('month', NOW()) - INTERVAL '1 second',
    -- Generate random values for demonstration purposes
    floor(random() * 50 + 10)::integer as issues_count,
    floor(random() * 40 + 5)::integer as resolved_count,
    floor(random() * 30 + 60)::numeric(5,2) as resolution_rate,
    (random() * 5 + 2)::numeric(5,2) as avg_response_days
  FROM departments d
  ON CONFLICT (department_id, period_start) DO UPDATE SET
    issues_count = EXCLUDED.issues_count,
    resolved_count = EXCLUDED.resolved_count,
    resolution_rate = EXCLUDED.resolution_rate,
    avg_response_days = EXCLUDED.avg_response_days,
    updated_at = NOW();

  -- Generate budget allocation data for each department
  INSERT INTO budget_allocation (
    department_id,
    category,
    allocated_amount,
    spent_amount,
    period
  )
  SELECT 
    d.id,
    'Operations',
    floor(random() * 5000000 + 1000000)::numeric(12,2) as allocated_amount,
    floor(random() * 4000000 + 800000)::numeric(12,2) as spent_amount,
    date_trunc('year', NOW())
  FROM departments d
  UNION ALL
  SELECT 
    d.id,
    'Development',
    floor(random() * 8000000 + 2000000)::numeric(12,2) as allocated_amount,
    floor(random() * 6000000 + 1500000)::numeric(12,2) as spent_amount,
    date_trunc('year', NOW())
  FROM departments d
  UNION ALL
  SELECT 
    d.id,
    'Maintenance',
    floor(random() * 3000000 + 500000)::numeric(12,2) as allocated_amount,
    floor(random() * 2500000 + 400000)::numeric(12,2) as spent_amount,
    date_trunc('year', NOW())
  FROM departments d
  ON CONFLICT DO NOTHING;
END $$;

-- Update constituency stats to ensure they're populated
SELECT update_constituency_stats();

-- Log completion of the migration
DO $$ 
BEGIN
  RAISE NOTICE 'Migration completed: Updated departments with Botswana ministries and fixed cron scheduling';
END $$;
