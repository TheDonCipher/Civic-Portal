-- Create departments table for Botswana government departments
-- This table stores the 18 official government departments

-- Create the departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for better query performance
CREATE INDEX idx_departments_name ON departments(name);
CREATE INDEX idx_departments_category ON departments(category);

-- Add RLS policies
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read departments
CREATE POLICY "Allow authenticated users to read departments" ON departments
  FOR SELECT TO authenticated USING (true);

-- Allow only admins to modify departments
CREATE POLICY "Allow admins to modify departments" ON departments
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow anonymous users to read departments (for public forms)
CREATE POLICY "Allow anonymous users to read departments" ON departments
  FOR SELECT TO anon USING (true);

-- Insert the 18 Botswana government departments
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

-- Add department_id column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'department_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN department_id UUID REFERENCES departments(id);
    CREATE INDEX idx_profiles_department_id ON profiles(department_id);
  END IF;
END $$;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON departments TO authenticated;
GRANT SELECT ON departments TO anon;

-- Add comments for documentation
COMMENT ON TABLE departments IS 'Government departments in Botswana';
COMMENT ON COLUMN departments.name IS 'Official name of the department';
COMMENT ON COLUMN departments.description IS 'Brief description of department responsibilities';
COMMENT ON COLUMN departments.category IS 'Category grouping for departments';
