-- Enhanced Admin Policies and Profile Management
-- Run this in Supabase SQL Editor

-- Add admin policies to existing tables
-- Profiles - Admin access
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'admin'
    )
  );

-- Legal Consents - Admin access (now that profiles table exists)
CREATE POLICY "Admins can view all consent records" ON legal_consents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Issues - Admin and stakeholder management
CREATE POLICY "Admins can update all issues" ON issues
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'official')
    )
  );

-- Departments - Admin management
CREATE POLICY "Admins can modify departments" ON departments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, verification_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen'),
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'citizen') = 'official' THEN 'pending'
      ELSE 'verified'
    END
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to auto-watch issues when user creates them
CREATE OR REPLACE FUNCTION auto_watch_created_issue()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO issue_watchers (issue_id, user_id)
  VALUES (NEW.id, NEW.author_id)
  ON CONFLICT (issue_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to auto-watch created issues
DROP TRIGGER IF EXISTS on_issue_created ON issues;
CREATE TRIGGER on_issue_created
  AFTER INSERT ON issues
  FOR EACH ROW
  EXECUTE FUNCTION auto_watch_created_issue();

SELECT 'Admin policies and triggers created successfully' AS result;
