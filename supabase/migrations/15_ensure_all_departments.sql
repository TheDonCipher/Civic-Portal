-- Ensure All Botswana Government Departments Exist
-- Run this in Supabase SQL Editor

-- First, create departments table if it doesn't exist
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);
CREATE INDEX IF NOT EXISTS idx_departments_category ON departments(category);

-- Enable RLS if not already enabled
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DROP POLICY IF EXISTS "Allow authenticated users to read departments" ON departments;
DROP POLICY IF EXISTS "Allow anonymous users to read departments" ON departments;

CREATE POLICY "Allow authenticated users to read departments" ON departments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow anonymous users to read departments" ON departments
  FOR SELECT TO anon USING (true);

-- Insert/Update all Botswana government departments
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
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  updated_at = NOW();

-- Grant permissions
GRANT SELECT ON departments TO authenticated;
GRANT SELECT ON departments TO anon;

-- Verify all departments were inserted
SELECT 
  'Departments verification:' AS info,
  COUNT(*) AS total_departments,
  string_agg(name, ', ' ORDER BY name) AS department_names
FROM departments;

SELECT 'All Botswana government departments ensured successfully' AS result;
