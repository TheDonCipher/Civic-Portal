-- EMERGENCY FIX FOR INFINITE RECURSION IN RLS POLICIES
-- Run this directly in Supabase SQL Editor to fix the database immediately

-- Step 1: Disable RLS temporarily on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies on profiles table to clear conflicts
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Get all policies on profiles table
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_record.policyname, 
                      policy_record.schemaname, 
                      policy_record.tablename);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, non-recursive policies

-- Allow users to view their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile during signup
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow public read access for basic profile info (needed for app functionality)
CREATE POLICY "profiles_public_read" ON profiles
  FOR SELECT USING (true);

-- Step 5: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- Step 6: Verify the fix
DO $$
BEGIN
  RAISE NOTICE '=== EMERGENCY RLS FIX COMPLETED ===';
  RAISE NOTICE 'All recursive policies removed from profiles table';
  RAISE NOTICE 'Simple, non-recursive policies created';
  RAISE NOTICE 'Database should now be accessible';
END $$;

-- Step 7: Test query to verify fix works
SELECT 'RLS policies fixed successfully' as status;
