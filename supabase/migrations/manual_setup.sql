-- Manual setup script for Civic Portal database
-- Run this in Supabase SQL Editor

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
DROP POLICY IF EXISTS "Allow authenticated users to read departments" ON departments;
CREATE POLICY "Allow authenticated users to read departments" ON departments
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow admins to modify departments" ON departments;
CREATE POLICY "Allow admins to modify departments" ON departments
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Allow anonymous users to read departments" ON departments;
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

-- 2. Add department_id to profiles if it doesn't exist
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

-- 3. Add verification_status to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN verification_status TEXT DEFAULT 'verified' 
    CHECK (verification_status IN ('pending', 'verified', 'rejected'));
    
    CREATE INDEX idx_profiles_verification_status ON profiles(verification_status);
  END IF;
END $$;

-- Update verification status for existing users
UPDATE profiles 
SET verification_status = 'pending' 
WHERE role = 'official' AND (verification_status IS NULL OR verification_status = 'verified');

UPDATE profiles 
SET verification_status = 'verified' 
WHERE (role IN ('citizen', 'admin') OR role IS NULL) AND (verification_status IS NULL OR verification_status != 'verified');

-- 4. Create update trigger function for departments
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for departments
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Create verification status management function
CREATE OR REPLACE FUNCTION set_verification_status_on_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is being changed to official, set verification to pending
  IF NEW.role = 'official' AND (OLD.role IS NULL OR OLD.role != 'official') THEN
    NEW.verification_status = 'pending';
  -- If role is being changed from official to something else, set to verified
  ELSIF OLD.role = 'official' AND NEW.role != 'official' THEN
    NEW.verification_status = 'verified';
  -- If role is being set to citizen or admin, ensure verified status
  ELSIF NEW.role IN ('citizen', 'admin') THEN
    NEW.verification_status = 'verified';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for verification status
DROP TRIGGER IF EXISTS trigger_set_verification_status ON profiles;
CREATE TRIGGER trigger_set_verification_status
  BEFORE UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_verification_status_on_role_change();

-- Add table comments
COMMENT ON TABLE departments IS 'Government departments in Botswana';
COMMENT ON COLUMN departments.name IS 'Official name of the department';
COMMENT ON COLUMN departments.description IS 'Brief description of department responsibilities';
COMMENT ON COLUMN departments.category IS 'Category grouping for departments';
COMMENT ON COLUMN profiles.verification_status IS 'Verification status for government officials: pending, verified, or rejected';
