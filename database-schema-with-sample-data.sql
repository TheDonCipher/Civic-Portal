-- Civic Portal Database Schema with Sample Data
-- Complete database setup for Botswana Government Issue Tracking System

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create departments table with all 18 Botswana departments
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  head_of_department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert all 18 Botswana government departments
INSERT INTO departments (name, description, category, contact_email, head_of_department) VALUES
  ('Finance', 'Financial management and economic policy', 'Economic Affairs', 'finance@gov.bw', 'Dr. Thabo Masalila'),
  ('International Relations', 'Foreign affairs and diplomatic relations', 'External Affairs', 'international@gov.bw', 'Dr. Lemogang Kwape'),
  ('Health', 'Public health services and medical care', 'Social Services', 'health@gov.bw', 'Dr. Edwin Dikoloti'),
  ('Child Welfare and Basic Education', 'Primary education and child protection services', 'Education & Welfare', 'education@gov.bw', 'Dr. Douglas Letsholathebe'),
  ('Higher Education', 'Tertiary education and research institutions', 'Education & Welfare', 'higher.education@gov.bw', 'Dr. Dumisani Ndebele'),
  ('Lands and Agriculture', 'Land management and agricultural development', 'Economic Affairs', 'agriculture@gov.bw', 'Dr. Fidelis Molao'),
  ('Youth and Gender Affairs', 'Youth development and gender equality programs', 'Social Services', 'youth@gov.bw', 'Bogolo Kenewendo'),
  ('State Presidency', 'Executive office and state administration', 'Government Administration', 'presidency@gov.bw', 'Dr. Mokgweetsi Masisi'),
  ('Justice and Correctional Services', 'Legal system and correctional facilities', 'Justice & Security', 'justice@gov.bw', 'Macheng Sechele'),
  ('Local Government and Traditional Affairs', 'Local governance and traditional leadership', 'Government Administration', 'local.gov@gov.bw', 'Kgotla Autlwetse'),
  ('Minerals and Energy', 'Mining sector and energy resources', 'Economic Affairs', 'minerals@gov.bw', 'Lefoko Moagi'),
  ('Communications and Innovation', 'Telecommunications and technology innovation', 'Technology & Innovation', 'communications@gov.bw', 'Thulagano Segokgo'),
  ('Environment and Tourism', 'Environmental protection and tourism development', 'Environment & Tourism', 'environment@gov.bw', 'Philda Kereng'),
  ('Labour and Home Affairs', 'Employment relations and internal affairs', 'Government Administration', 'labour@gov.bw', 'Anna Mokgethi'),
  ('Sports and Arts', 'Sports development and cultural affairs', 'Social Services', 'sports@gov.bw', 'Tumiso Rakgare'),
  ('Trade and Entrepreneurship', 'Trade promotion and business development', 'Economic Affairs', 'trade@gov.bw', 'Mmusi Kgafela'),
  ('Transport and Infrastructure', 'Transportation systems and infrastructure development', 'Infrastructure', 'transport@gov.bw', 'Joe Ralotsia'),
  ('Water and Human Settlement', 'Water resources and housing development', 'Infrastructure', 'water@gov.bw', 'Kefentse Mzwinila')
ON CONFLICT (name) DO NOTHING;

-- Create enhanced profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT DEFAULT 'citizen' CHECK (role IN ('citizen', 'official', 'admin')),
  constituency TEXT,
  department_id UUID REFERENCES departments(id),
  verification_status TEXT DEFAULT 'verified' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  phone_number TEXT,
  bio TEXT,
  location TEXT,
  date_of_birth DATE,
  government_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create issues table with enhanced fields
CREATE TABLE IF NOT EXISTS issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('draft', 'open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  location TEXT,
  constituency TEXT, -- Added for location-based reporting
  department_id UUID REFERENCES departments(id),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id),
  vote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  tags TEXT[],
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  resolved_at TIMESTAMP WITH TIME ZONE,
  first_response_at TIMESTAMP WITH TIME ZONE, -- Added for response time tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_official BOOLEAN DEFAULT FALSE,
  parent_id UUID REFERENCES comments(id),
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create solutions table
CREATE TABLE IF NOT EXISTS solutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  implementation_plan TEXT,
  estimated_cost DECIMAL,
  estimated_timeline TEXT,
  vote_count INTEGER DEFAULT 0,
  is_official BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'under_review', 'approved', 'rejected', 'implemented')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  solution_id UUID REFERENCES solutions(id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, issue_id),
  UNIQUE(user_id, solution_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('issue_update', 'comment', 'solution', 'verification', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  related_issue_id UUID REFERENCES issues(id),
  related_comment_id UUID REFERENCES comments(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create watchers table (for issue following)
CREATE TABLE IF NOT EXISTS watchers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, issue_id)
);

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
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_profiles_verification ON profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_constituency ON issues(constituency);
CREATE INDEX IF NOT EXISTS idx_issues_department ON issues(department_id);
CREATE INDEX IF NOT EXISTS idx_issues_author ON issues(author_id);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issues_resolved_at ON issues(resolved_at);
CREATE INDEX IF NOT EXISTS idx_issues_first_response ON issues(first_response_at);
CREATE INDEX IF NOT EXISTS idx_comments_issue ON comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_solutions_issue ON solutions(issue_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_issue ON votes(user_id, issue_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_watchers_user ON watchers(user_id);
CREATE INDEX IF NOT EXISTS idx_watchers_issue ON watchers(issue_id);
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

-- Sample data for development and testing

-- Sample admin user profile
INSERT INTO profiles (id, email, full_name, username, role, verification_status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@civic.gov.bw', 'System Administrator', 'admin', 'admin', 'verified')
ON CONFLICT (id) DO NOTHING;

-- Sample department officials
INSERT INTO profiles (id, email, full_name, username, role, department_id, verification_status) VALUES
  ('00000000-0000-0000-0000-000000000002', 'health.official@gov.bw', 'Dr. Keabetswe Moeti', 'health_official', 'official',
   (SELECT id FROM departments WHERE name = 'Health'), 'verified'),
  ('00000000-0000-0000-0000-000000000003', 'transport.official@gov.bw', 'Eng. Thabo Matlhare', 'transport_official', 'official',
   (SELECT id FROM departments WHERE name = 'Transport and Infrastructure'), 'verified'),
  ('00000000-0000-0000-0000-000000000004', 'education.official@gov.bw', 'Mrs. Boitumelo Setlhabi', 'education_official', 'official',
   (SELECT id FROM departments WHERE name = 'Child Welfare and Basic Education'), 'verified')
ON CONFLICT (id) DO NOTHING;

-- Sample citizen users
INSERT INTO profiles (id, email, full_name, username, role, constituency, verification_status) VALUES
  ('00000000-0000-0000-0000-000000000005', 'citizen1@example.com', 'Thabo Mogami', 'thabo_mogami', 'citizen', 'Gaborone Central', 'verified'),
  ('00000000-0000-0000-0000-000000000006', 'citizen2@example.com', 'Kefilwe Sebego', 'kefilwe_sebego', 'citizen', 'Francistown East', 'verified'),
  ('00000000-0000-0000-0000-000000000007', 'citizen3@example.com', 'Mpho Kgosana', 'mpho_kgosana', 'citizen', 'Maun West', 'verified')
ON CONFLICT (id) DO NOTHING;

-- Sample issues across different departments and categories
INSERT INTO issues (id, title, description, category, status, priority, location, constituency, department_id, author_id, vote_count, comment_count, first_response_at) VALUES
  ('10000000-0000-0000-0000-000000000001',
   'Broken Street Lights on Independence Avenue',
   'Multiple street lights have been non-functional for over two weeks, creating safety concerns for pedestrians and drivers.',
   'infrastructure', 'open', 'high', 'Independence Avenue, Gaborone', 'Gaborone Central',
   (SELECT id FROM departments WHERE name = 'Transport and Infrastructure'),
   '00000000-0000-0000-0000-000000000005', 15, 3, NOW() - INTERVAL '2 days'),

  ('10000000-0000-0000-0000-000000000002',
   'Water Shortage in Extension 12',
   'Residents have been without water for 5 days. The borehole appears to be malfunctioning.',
   'utilities', 'in_progress', 'urgent', 'Extension 12, Gaborone', 'Gaborone Central',
   (SELECT id FROM departments WHERE name = 'Water and Human Settlement'),
   '00000000-0000-0000-0000-000000000006', 28, 7, NOW() - INTERVAL '1 day'),

  ('10000000-0000-0000-0000-000000000003',
   'Shortage of Textbooks at Legae Primary School',
   'Grade 4 students have been sharing textbooks due to insufficient supply for the new academic year.',
   'education', 'open', 'medium', 'Legae Primary School, Francistown', 'Francistown East',
   (SELECT id FROM departments WHERE name = 'Child Welfare and Basic Education'),
   '00000000-0000-0000-0000-000000000007', 12, 5, NOW() - INTERVAL '3 days'),

  ('10000000-0000-0000-0000-000000000004',
   'Clinic Operating Hours Need Extension',
   'The local clinic closes at 4 PM, but many working residents cannot access services during these hours.',
   'health', 'resolved', 'medium', 'Maun Clinic, Maun', 'Maun West',
   (SELECT id FROM departments WHERE name = 'Health'),
   '00000000-0000-0000-0000-000000000005', 22, 8, NOW() - INTERVAL '5 days'),

  ('10000000-0000-0000-0000-000000000005',
   'Pothole Repairs Needed on A1 Highway',
   'Large potholes are causing vehicle damage and safety hazards.',
   'infrastructure', 'resolved', 'high', 'A1 Highway, Palapye', 'Palapye',
   (SELECT id FROM departments WHERE name = 'Transport and Infrastructure'),
   '00000000-0000-0000-0000-000000000006', 35, 12, NOW() - INTERVAL '7 days'),

  ('10000000-0000-0000-0000-000000000006',
   'Internet Connectivity Issues at Government Offices',
   'Slow internet affecting service delivery to citizens.',
   'technology', 'in_progress', 'medium', 'Government Enclave, Gaborone', 'Gaborone Central',
   (SELECT id FROM departments WHERE name = 'Communications and Knowledge Management'),
   '00000000-0000-0000-0000-000000000007', 18, 6, NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

-- Sample comments
INSERT INTO comments (issue_id, author_id, content, is_official) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003',
   'We have received this report and our maintenance team will assess the situation within 48 hours.', true),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006',
   'This is a serious safety issue. I nearly had an accident last night due to poor visibility.', false),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002',
   'Our technical team is currently working on repairing the borehole. Water tankers have been dispatched as a temporary solution.', true)
ON CONFLICT DO NOTHING;

-- Sample solutions
INSERT INTO solutions (issue_id, author_id, title, description, implementation_plan, estimated_cost, is_official) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003',
   'LED Street Light Upgrade Program',
   'Replace all faulty street lights with energy-efficient LED lights and implement a preventive maintenance schedule.',
   '1. Conduct full assessment of all street lights\n2. Procure LED replacement units\n3. Install new lights\n4. Establish maintenance schedule',
   150000.00, true),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000007',
   'Digital Learning Resources Initiative',
   'Supplement physical textbooks with digital learning materials accessible via tablets.',
   'Provide tablets loaded with curriculum-aligned digital content to reduce dependency on physical textbooks.',
   75000.00, false)
ON CONFLICT DO NOTHING;

-- Sample votes
INSERT INTO votes (user_id, issue_id, vote_type) VALUES
  ('00000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'up'),
  ('00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 'up'),
  ('00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'up')
ON CONFLICT DO NOTHING;

-- Sample notifications
INSERT INTO notifications (user_id, title, message, type, related_issue_id) VALUES
  ('00000000-0000-0000-0000-000000000005', 'Issue Update',
   'Your reported issue about street lights has been assigned to the Transport department.',
   'issue_update', '10000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000006', 'New Comment',
   'An official has commented on the water shortage issue you are watching.',
   'comment', '10000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- Sample watchers
INSERT INTO watchers (user_id, issue_id) VALUES
  ('00000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004')
ON CONFLICT DO NOTHING;

-- Sample updates
INSERT INTO updates (issue_id, author_id, title, content, is_official) VALUES
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002',
   'Water Tanker Deployment Update',
   'Water tankers have been deployed to Extension 12. Repair work on the borehole is scheduled to begin tomorrow morning.',
   true),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002',
   'Extended Clinic Hours Approved',
   'The Ministry of Health has approved extended operating hours for Maun Clinic. New hours will be 7 AM to 7 PM starting next month.',
   true),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003',
   'Pothole Repairs Completed',
   'All potholes on the A1 Highway near Palapye have been repaired. Road surface has been resurfaced for improved durability.',
   true)
ON CONFLICT DO NOTHING;

-- Sample budget allocations
INSERT INTO budget_allocations (department_id, category, fiscal_year, allocated_amount, spent_amount, description) VALUES
  ((SELECT id FROM departments WHERE name = 'Transport and Infrastructure'), 'Road Maintenance', 2024, 5000000.00, 3200000.00, 'Annual road maintenance and repairs'),
  ((SELECT id FROM departments WHERE name = 'Transport and Infrastructure'), 'Street Lighting', 2024, 1500000.00, 800000.00, 'Street light installation and maintenance'),
  ((SELECT id FROM departments WHERE name = 'Health'), 'Clinic Operations', 2024, 8000000.00, 6500000.00, 'Clinic operational expenses and equipment'),
  ((SELECT id FROM departments WHERE name = 'Health'), 'Medical Supplies', 2024, 3000000.00, 2100000.00, 'Medical supplies and pharmaceuticals'),
  ((SELECT id FROM departments WHERE name = 'Child Welfare and Basic Education'), 'Educational Materials', 2024, 4500000.00, 3800000.00, 'Textbooks and learning materials'),
  ((SELECT id FROM departments WHERE name = 'Water and Human Settlement'), 'Water Infrastructure', 2024, 12000000.00, 8500000.00, 'Water supply infrastructure and maintenance')
ON CONFLICT DO NOTHING;

-- Sample satisfaction ratings
INSERT INTO satisfaction_ratings (issue_id, user_id, rating, feedback) VALUES
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', 5, 'Excellent response time and solution. Very satisfied with the extended clinic hours.'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006', 4, 'Good repair work, but took longer than expected to complete.'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', 5, 'Great improvement to healthcare access in our community.')
ON CONFLICT DO NOTHING;

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_issues_updated_at ON issues;
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_solutions_updated_at ON solutions;
CREATE TRIGGER update_solutions_updated_at BEFORE UPDATE ON solutions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
COMMENT ON TABLE departments IS 'Government departments in Botswana with contact information';
COMMENT ON TABLE profiles IS 'User profiles with role-based access and verification status';
COMMENT ON TABLE issues IS 'Civic issues reported by citizens with department assignment';
COMMENT ON TABLE comments IS 'Comments on issues with official/citizen distinction';
COMMENT ON TABLE solutions IS 'Proposed solutions to issues with voting and official status';
COMMENT ON TABLE votes IS 'User votes on issues and solutions';
COMMENT ON TABLE notifications IS 'User notifications for various platform events';
COMMENT ON TABLE watchers IS 'Users following specific issues for updates';
COMMENT ON TABLE updates IS 'Official updates from stakeholders on issues';
COMMENT ON TABLE reports IS 'Generated reports for analytics and performance tracking';
COMMENT ON TABLE budget_allocations IS 'Budget allocation and spending tracking by department';
COMMENT ON TABLE satisfaction_ratings IS 'Citizen satisfaction ratings for resolved issues';
