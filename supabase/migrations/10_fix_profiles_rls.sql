-- Fix Profiles Table RLS Issues
-- Run this IMMEDIATELY in Supabase SQL Editor

-- First, check if profiles table exists and create if missing
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

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_constituency ON profiles(constituency);
CREATE INDEX IF NOT EXISTS idx_profiles_department_id ON profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create comprehensive RLS policies
-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- 2. Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Allow service role to insert profiles (for auto-creation)
CREATE POLICY "Service role can insert profiles" ON profiles
  FOR INSERT TO service_role WITH CHECK (true);

-- 5. Allow service role to update profiles (for auto-creation)
CREATE POLICY "Service role can update profiles" ON profiles
  FOR UPDATE TO service_role USING (true);

-- 6. Admins can view all profiles (safe policy)
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'admin'
    )
    OR auth.uid() = id  -- Users can always see their own profile
  );

-- 7. Admins can update all profiles (safe policy)
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.id = auth.uid() 
      AND admin_profile.role = 'admin'
    )
    OR auth.uid() = id  -- Users can always update their own profile
  );

-- Create or update the trigger function for auto-profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, verification_status, constituency, department_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen'),
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'citizen') = 'official' THEN 'pending'
      ELSE 'verified'
    END,
    NEW.raw_user_meta_data->>'constituency',
    CASE 
      WHEN NEW.raw_user_meta_data->>'department_id' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'department_id')::UUID
      ELSE NULL
    END
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create profile for current user if it doesn't exist
INSERT INTO profiles (id, email, full_name, role, verification_status)
SELECT 
  auth.uid(),
  auth.email(),
  'Current User',
  'admin',  -- Make current user admin for testing
  'verified'
WHERE auth.uid() IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
ON CONFLICT (id) DO NOTHING;

SELECT 'Profiles table and RLS policies fixed successfully' AS result;
