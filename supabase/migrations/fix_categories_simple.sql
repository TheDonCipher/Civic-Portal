-- COMPREHENSIVE FIX FOR ISSUE CREATION WORKFLOW
-- This script fixes the database schema to support proper issue creation
-- Run this in Supabase SQL Editor

-- Step 1: Fix Issues Table - Add Missing Columns
-- Add columns that CreateIssueDialog expects but are missing from the database
ALTER TABLE issues
ADD COLUMN IF NOT EXISTS author_name TEXT,
ADD COLUMN IF NOT EXISTS author_avatar TEXT,
ADD COLUMN IF NOT EXISTS thumbnail TEXT,
ADD COLUMN IF NOT EXISTS watchers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Step 2: Ensure the issue_categories table exists with correct structure
CREATE TABLE IF NOT EXISTS issue_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES departments(id),
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_issue_categories_name ON issue_categories(name);
CREATE INDEX IF NOT EXISTS idx_issue_categories_department_id ON issue_categories(department_id);
CREATE INDEX IF NOT EXISTS idx_issue_categories_active ON issue_categories(is_active);

-- Step 3: Enable RLS (safe to run multiple times)
ALTER TABLE issue_categories ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Allow authenticated users to read issue categories" ON issue_categories;
DROP POLICY IF EXISTS "Allow admins to manage issue categories" ON issue_categories;

-- Create fresh policies
CREATE POLICY "Allow authenticated users to read issue categories" ON issue_categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admins to manage issue categories" ON issue_categories
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 5: Clear existing categories and insert fresh ones
DELETE FROM issue_categories;

-- Step 6: Insert categories with proper department associations
DO $$
DECLARE
    transport_dept_id UUID;
    health_dept_id UUID;
    education_dept_id UUID;
    environment_dept_id UUID;
    water_dept_id UUID;
    youth_dept_id UUID;
    agriculture_dept_id UUID;
    justice_dept_id UUID;
    local_govt_dept_id UUID;
    energy_dept_id UUID;
    communications_dept_id UUID;
    sports_dept_id UUID;
    trade_dept_id UUID;
    finance_dept_id UUID;
    international_dept_id UUID;
    higher_ed_dept_id UUID;
    labour_dept_id UUID;
    presidency_dept_id UUID;
BEGIN
    -- Get department IDs
    SELECT id INTO transport_dept_id FROM departments WHERE name = 'Transport and Infrastructure' LIMIT 1;
    SELECT id INTO health_dept_id FROM departments WHERE name = 'Health' LIMIT 1;
    SELECT id INTO education_dept_id FROM departments WHERE name = 'Child Welfare and Basic Education' LIMIT 1;
    SELECT id INTO environment_dept_id FROM departments WHERE name = 'Environment and Tourism' LIMIT 1;
    SELECT id INTO water_dept_id FROM departments WHERE name = 'Water and Human Settlement' LIMIT 1;
    SELECT id INTO youth_dept_id FROM departments WHERE name = 'Youth and Gender Affairs' LIMIT 1;
    SELECT id INTO agriculture_dept_id FROM departments WHERE name = 'Lands and Agriculture' LIMIT 1;
    SELECT id INTO justice_dept_id FROM departments WHERE name = 'Justice and Correctional Services' LIMIT 1;
    SELECT id INTO local_govt_dept_id FROM departments WHERE name = 'Local Government and Traditional Affairs' LIMIT 1;
    SELECT id INTO energy_dept_id FROM departments WHERE name = 'Minerals and Energy' LIMIT 1;
    SELECT id INTO communications_dept_id FROM departments WHERE name = 'Communications, Knowledge and Technology' LIMIT 1;
    SELECT id INTO sports_dept_id FROM departments WHERE name = 'Sports and Arts' LIMIT 1;
    SELECT id INTO trade_dept_id FROM departments WHERE name = 'Trade and Entrepreneurship' LIMIT 1;
    SELECT id INTO finance_dept_id FROM departments WHERE name = 'Finance' LIMIT 1;
    SELECT id INTO international_dept_id FROM departments WHERE name = 'International Relations' LIMIT 1;
    SELECT id INTO higher_ed_dept_id FROM departments WHERE name = 'Higher Education' LIMIT 1;
    SELECT id INTO labour_dept_id FROM departments WHERE name = 'Labour and Home Affairs' LIMIT 1;
    SELECT id INTO presidency_dept_id FROM departments WHERE name = 'State Presidency' LIMIT 1;

    -- Insert Transport and Infrastructure categories
    IF transport_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color) VALUES
        ('Roads and Highways', 'Issues related to road maintenance, construction, and traffic', transport_dept_id, 'road', '#3B82F6'),
        ('Public Transportation', 'Bus services, taxi ranks, and public transport infrastructure', transport_dept_id, 'bus', '#3B82F6'),
        ('Infrastructure Development', 'General infrastructure projects and maintenance', transport_dept_id, 'building', '#3B82F6');
    END IF;

    -- Insert Health categories
    IF health_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color) VALUES
        ('Healthcare Services', 'Hospital services, clinic operations, medical care quality', health_dept_id, 'heart', '#EF4444'),
        ('Public Health', 'Disease prevention, health education, vaccination programs', health_dept_id, 'shield', '#EF4444'),
        ('Medical Equipment', 'Medical equipment availability and maintenance', health_dept_id, 'stethoscope', '#EF4444');
    END IF;

    -- Insert Education categories
    IF education_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color) VALUES
        ('School Infrastructure', 'School buildings, classrooms, and facilities', education_dept_id, 'school', '#10B981'),
        ('Educational Resources', 'Textbooks, learning materials, and educational tools', education_dept_id, 'book', '#10B981'),
        ('Child Welfare', 'Child protection, welfare programs, and support services', education_dept_id, 'users', '#10B981');
    END IF;

    -- Insert Environment categories
    IF environment_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color) VALUES
        ('Environmental Protection', 'Pollution, conservation, and environmental damage', environment_dept_id, 'leaf', '#059669'),
        ('Tourism Development', 'Tourism infrastructure and destination management', environment_dept_id, 'camera', '#059669'),
        ('Wildlife Conservation', 'Wildlife protection and conservation efforts', environment_dept_id, 'tree-pine', '#059669');
    END IF;

    -- Insert Water categories
    IF water_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color) VALUES
        ('Water Supply', 'Water availability, quality, and distribution systems', water_dept_id, 'droplets', '#0EA5E9'),
        ('Sanitation', 'Sewage systems, waste management, and sanitation facilities', water_dept_id, 'recycle', '#0EA5E9'),
        ('Housing Development', 'Housing projects, settlement planning, and urban development', water_dept_id, 'home', '#0EA5E9');
    END IF;

    -- Insert Justice categories
    IF justice_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color) VALUES
        ('Public Safety', 'Crime prevention, police services, and community safety', justice_dept_id, 'shield-check', '#DC2626'),
        ('Legal Services', 'Court services, legal aid, and justice system issues', justice_dept_id, 'scale', '#DC2626');
    END IF;

    -- Insert Energy categories
    IF energy_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color) VALUES
        ('Electricity Supply', 'Power outages, electrical infrastructure, and energy access', energy_dept_id, 'zap', '#F59E0B'),
        ('Mining Operations', 'Mining activities, regulations, and environmental impact', energy_dept_id, 'pickaxe', '#F59E0B');
    END IF;

    -- Insert Agriculture categories
    IF agriculture_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color) VALUES
        ('Agricultural Support', 'Farming assistance, subsidies, and agricultural programs', agriculture_dept_id, 'wheat', '#84CC16'),
        ('Land Management', 'Land allocation, disputes, and land use planning', agriculture_dept_id, 'map', '#84CC16');
    END IF;

    -- Insert Youth categories
    IF youth_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color) VALUES
        ('Youth Development', 'Youth programs, employment, and skills development', youth_dept_id, 'graduation-cap', '#EC4899'),
        ('Gender Equality', 'Gender-based issues, women empowerment, and equality programs', youth_dept_id, 'users-2', '#EC4899');
    END IF;

    -- Insert Communications categories
    IF communications_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color) VALUES
        ('Digital Infrastructure', 'Internet connectivity, telecommunications, and digital services', communications_dept_id, 'wifi', '#8B5CF6');
    END IF;

    -- Insert Trade categories
    IF trade_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color) VALUES
        ('Business Development', 'Small business support, entrepreneurship programs, and business registration', trade_dept_id, 'briefcase', '#F97316');
    END IF;

    -- Insert Finance categories
    IF finance_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color) VALUES
        ('Public Finance', 'Budget allocation, financial management, and public spending', finance_dept_id, 'banknote', '#059669');
    END IF;

    -- Insert Labour categories
    IF labour_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color) VALUES
        ('Employment Services', 'Job creation, unemployment, and labor market issues', labour_dept_id, 'briefcase-business', '#6366F1');
    END IF;

    -- Insert Higher Education categories
    IF higher_ed_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color) VALUES
        ('University Services', 'Higher education institutions, research, and academic programs', higher_ed_dept_id, 'graduation-cap', '#0891B2');
    END IF;

    -- Insert International Relations categories
    IF international_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color) VALUES
        ('Diplomatic Services', 'Embassy services, international relations, and diplomatic issues', international_dept_id, 'globe', '#BE185D');
    END IF;

    -- Insert Presidency categories
    IF presidency_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color) VALUES
        ('Government Administration', 'General government services and administrative issues', presidency_dept_id, 'building-2', '#1F2937');
    END IF;

    RAISE NOTICE 'Successfully created % categories', (SELECT COUNT(*) FROM issue_categories);
END $$;

-- Step 7: Fix missing tables and storage setup
-- Create missing tables that the frontend expects

-- Create votes table (if it doesn't exist) - frontend expects this name
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  solution_id UUID REFERENCES solutions(id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, issue_id),
  UNIQUE(user_id, solution_id)
);

-- Create watchers table (if it doesn't exist) - frontend expects this name
CREATE TABLE IF NOT EXISTS watchers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, issue_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_votes_issue_id ON votes(issue_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_watchers_issue_id ON watchers(issue_id);
CREATE INDEX IF NOT EXISTS idx_watchers_user_id ON watchers(user_id);

-- Enable RLS
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for votes
DROP POLICY IF EXISTS "Anyone can view votes" ON votes;
DROP POLICY IF EXISTS "Authenticated users can vote" ON votes;
DROP POLICY IF EXISTS "Users can update their own votes" ON votes;
DROP POLICY IF EXISTS "Users can delete their own votes" ON votes;

CREATE POLICY "Anyone can view votes" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON votes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON votes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for watchers
DROP POLICY IF EXISTS "Anyone can view watchers" ON watchers;
DROP POLICY IF EXISTS "Authenticated users can watch" ON watchers;
DROP POLICY IF EXISTS "Users can manage their own watches" ON watchers;

CREATE POLICY "Anyone can view watchers" ON watchers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can watch" ON watchers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own watches" ON watchers
  FOR DELETE USING (auth.uid() = user_id);

-- Step 8: Create storage bucket and policies for images
-- Note: This needs to be run separately in the Supabase dashboard Storage section
-- or via the Supabase CLI, as SQL cannot create storage buckets directly

-- Step 9: Show results
SELECT
  'SETUP COMPLETE! 🎉' as status,
  COUNT(*) as total_categories,
  COUNT(DISTINCT department_id) as departments_with_categories
FROM issue_categories;
