-- Fix for LatestUpdates component and user deletion issues
-- Run this in your Supabase SQL Editor

-- PART 1: Fix missing avatar_url column in profiles table
-- Add avatar_url column if it doesn't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add other missing columns that might be needed
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS government_id TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- PART 2: Fix the get_latest_combined_updates function
CREATE OR REPLACE FUNCTION get_latest_combined_updates(p_limit INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  title TEXT,
  content TEXT,
  type TEXT,
  author_name TEXT,
  author_role TEXT,
  author_avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  issue_id UUID,
  issue_title TEXT,
  platform_update_id UUID,
  is_official BOOLEAN,
  source_type TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  -- Issue updates only for now
  SELECT
    u.id,
    COALESCE(u.title, 'Update on ' || i.title) as title,
    u.content,
    COALESCE(u.type, 'update') as type,
    COALESCE(p.full_name, 'Official') as author_name,
    COALESCE(p.role, 'official') as author_role,
    COALESCE(p.avatar_url, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || COALESCE(p.id::text, 'default')) as author_avatar,
    u.created_at,
    u.issue_id,
    i.title as issue_title,
    NULL::UUID as platform_update_id,
    COALESCE(u.is_official, true) as is_official,
    'issue'::TEXT as source_type
  FROM updates u
  LEFT JOIN profiles p ON u.author_id = p.id
  LEFT JOIN issues i ON u.issue_id = i.id
  WHERE u.issue_id IS NOT NULL
  ORDER BY u.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_latest_combined_updates(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_latest_combined_updates(INTEGER) TO anon;

-- PART 3: Fix user deletion cascade issues
-- Fix the profiles table foreign key constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix legal_consents table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'legal_consents') THEN
    ALTER TABLE legal_consents DROP CONSTRAINT IF EXISTS legal_consents_user_id_fkey;
    ALTER TABLE legal_consents
    ADD CONSTRAINT legal_consents_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Fix other common tables
ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_author_id_fkey;
ALTER TABLE issues
ADD CONSTRAINT issues_author_id_fkey
FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
ALTER TABLE comments
ADD CONSTRAINT comments_author_id_fkey
FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- PART 4: Create a safe user deletion function
CREATE OR REPLACE FUNCTION safe_delete_user(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  user_id UUID;
  result_message TEXT;
BEGIN
  -- Find user by email
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;

  IF user_id IS NULL THEN
    RETURN 'User not found with email: ' || user_email;
  END IF;

  -- Delete the user (cascading will handle related records)
  DELETE FROM auth.users WHERE id = user_id;

  RETURN 'User deleted successfully: ' || user_email || ' (ID: ' || user_id || ')';

EXCEPTION WHEN OTHERS THEN
  RETURN 'Error deleting user: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add missing type column to updates table if it doesn't exist
ALTER TABLE updates
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'update';

-- Example usage (uncomment and modify the email):
-- SELECT safe_delete_user('user@example.com');

SELECT 'LatestUpdates fix applied successfully! The avatar_url column has been added and the function updated.' AS result;
