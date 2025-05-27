-- Basic Tables Setup for Civic Portal
-- Run this FIRST in Supabase SQL Editor to create essential tables

-- 1. Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for departments
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);
CREATE INDEX IF NOT EXISTS idx_departments_category ON departments(category);

-- Enable RLS for departments
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- RLS policies for departments
CREATE POLICY "Allow authenticated users to read departments" ON departments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow anonymous users to read departments" ON departments
  FOR SELECT TO anon USING (true);

-- Insert Botswana government departments
INSERT INTO departments (name, description, category) VALUES
  ('Finance', 'Financial management and economic policy', 'Economic Affairs'),
  ('International Relations', 'Foreign affairs and diplomatic relations', 'External Affairs'),
  ('Health', 'Public health services and medical care', 'Social Services'),
  ('Child Welfare and Basic Education', 'Primary education and child protection services', 'Education & Welfare'),
  ('Higher Education', 'Tertiary education and research institutions', 'Education & Welfare'),
  ('Lands and Agriculture', 'Land management and agricultural development', 'Economic Affairs'),
  ('Youth and Gender Affairs', 'Youth development and gender equality programs', 'Social Services'),
  ('State Presidency', 'Executive office and state administration', 'Government Administration'),
  ('Justice and Correctional Services', 'Legal system and correctional facilities', 'Justice & Security'),
  ('Local Government and Traditional Affairs', 'Local governance and traditional leadership', 'Government Administration'),
  ('Minerals and Energy', 'Mining sector and energy resources', 'Economic Affairs'),
  ('Communications and Innovation', 'Telecommunications and technology innovation', 'Technology & Innovation'),
  ('Environment and Tourism', 'Environmental protection and tourism development', 'Environment & Tourism'),
  ('Labour and Home Affairs', 'Employment relations and internal affairs', 'Government Administration'),
  ('Sports and Arts', 'Sports development and cultural affairs', 'Social Services'),
  ('Trade and Entrepreneurship', 'Trade promotion and business development', 'Economic Affairs'),
  ('Transport and Infrastructure', 'Transportation systems and infrastructure development', 'Infrastructure'),
  ('Water and Human Settlement', 'Water resources and housing development', 'Infrastructure')
ON CONFLICT (name) DO NOTHING;

-- 2. Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'citizen' CHECK (role IN ('citizen', 'official', 'admin')),
  constituency TEXT,
  department_id UUID REFERENCES departments(id),
  verification_status TEXT DEFAULT 'verified' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_constituency ON profiles(constituency);
CREATE INDEX IF NOT EXISTS idx_profiles_department_id ON profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Create basic issues table
CREATE TABLE IF NOT EXISTS issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  location TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for issues
CREATE INDEX IF NOT EXISTS idx_issues_author_id ON issues(author_id);
CREATE INDEX IF NOT EXISTS idx_issues_department_id ON issues(department_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at);

-- Enable RLS for issues
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- RLS policies for issues
CREATE POLICY "Anyone can view issues" ON issues
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create issues" ON issues
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own issues" ON issues
  FOR UPDATE USING (auth.uid() = author_id);

-- Add table comments
COMMENT ON TABLE departments IS 'Government departments in Botswana';
COMMENT ON TABLE profiles IS 'User profiles extending auth.users';
COMMENT ON TABLE issues IS 'Civic issues reported by users';

-- Success message
SELECT 'Basic tables created successfully' AS result;
