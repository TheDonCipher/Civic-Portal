-- Fix infinite recursion in RLS policies
-- This migration fixes the circular dependency in profiles table policies

-- First, disable RLS temporarily to clean up
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update verification status" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create fixed policies without circular references
-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy 2: Users can update their own profile  
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy 3: Users can insert their own profile during signup
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy 4: Admins can view all profiles (using auth.jwt() to avoid recursion)
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    (auth.jwt() ->> 'role')::text = 'admin' OR
    auth.uid() = id
  );

-- Policy 5: Admins can update any profile (using auth.jwt() to avoid recursion)
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (
    (auth.jwt() ->> 'role')::text = 'admin' OR
    auth.uid() = id
  );

-- Create a function to set user role in JWT claims
CREATE OR REPLACE FUNCTION public.set_user_role_claim(user_id uuid, user_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function can be called by triggers to set role claims
  -- For now, we'll rely on application-level role management
  NULL;
END;
$$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- Add helpful comments
COMMENT ON POLICY "Users can view their own profile" ON profiles IS 'Users can view their own profile data';
COMMENT ON POLICY "Users can update their own profile" ON profiles IS 'Users can update their own profile data';
COMMENT ON POLICY "Users can insert their own profile" ON profiles IS 'Users can create their profile during signup';
COMMENT ON POLICY "Admins can view all profiles" ON profiles IS 'Admins can view all user profiles';
COMMENT ON POLICY "Admins can update any profile" ON profiles IS 'Admins can update any user profile';

-- Log success
DO $$
BEGIN
  RAISE NOTICE '=== RLS INFINITE RECURSION FIX COMPLETED ===';
  RAISE NOTICE 'Fixed circular dependency in profiles table policies';
  RAISE NOTICE 'Policies now use auth.jwt() instead of recursive profile lookups';
END $$;
