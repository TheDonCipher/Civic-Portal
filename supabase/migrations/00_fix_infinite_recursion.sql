-- Fix Infinite Recursion in Profiles RLS Policies
-- Run this IMMEDIATELY in Supabase SQL Editor

-- First, disable RLS temporarily to fix the policies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can update profiles" ON profiles;

-- Create the profiles table if it doesn't exist (with correct structure)
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_constituency ON profiles(constituency);
CREATE INDEX IF NOT EXISTS idx_profiles_department_id ON profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create SIMPLE, NON-RECURSIVE policies
-- 1. Basic user access (no recursion)
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Service role access (for auto-creation)
CREATE POLICY "profiles_service_role_all" ON profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. Admin access (simple check without recursion)
-- We'll add this later after we have at least one admin user

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

-- Create or replace the auto-profile creation function
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

SELECT 'Infinite recursion fixed - profiles table ready' AS result;
