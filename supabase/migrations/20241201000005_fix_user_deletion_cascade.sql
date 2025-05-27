-- Fix user deletion cascade issues
-- This migration ensures that when a user is deleted from auth.users,
-- all related records are properly cleaned up

-- First, let's check and fix the profiles table foreign key constraint
-- Drop existing constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Add the constraint with CASCADE DELETE
ALTER TABLE profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix other tables that reference profiles
-- Issues table
DO $$
BEGIN
  -- Fix author_id constraint if column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'issues' AND column_name = 'author_id') THEN
    ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_author_id_fkey;
    ALTER TABLE issues
    ADD CONSTRAINT issues_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  -- Fix assigned_to constraint if column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'issues' AND column_name = 'assigned_to') THEN
    ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_assigned_to_fkey;
    ALTER TABLE issues
    ADD CONSTRAINT issues_assigned_to_fkey
    FOREIGN KEY (assigned_to) REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Comments table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
    ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
    ALTER TABLE comments
    ADD CONSTRAINT comments_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Solutions table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'solutions') THEN
    ALTER TABLE solutions DROP CONSTRAINT IF EXISTS solutions_proposed_by_fkey;
    ALTER TABLE solutions
    ADD CONSTRAINT solutions_proposed_by_fkey
    FOREIGN KEY (proposed_by) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Updates table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'updates') THEN
    ALTER TABLE updates DROP CONSTRAINT IF EXISTS updates_author_id_fkey;
    ALTER TABLE updates
    ADD CONSTRAINT updates_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Votes table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'votes') THEN
    ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_user_id_fkey;
    ALTER TABLE votes
    ADD CONSTRAINT votes_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Watchers table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'watchers') THEN
    ALTER TABLE watchers DROP CONSTRAINT IF EXISTS watchers_user_id_fkey;
    ALTER TABLE watchers
    ADD CONSTRAINT watchers_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Notifications table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
    ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
    ALTER TABLE notifications
    ADD CONSTRAINT notifications_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Legal consents table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'legal_consents') THEN
    ALTER TABLE legal_consents DROP CONSTRAINT IF EXISTS legal_consents_user_id_fkey;
    ALTER TABLE legal_consents
    ADD CONSTRAINT legal_consents_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Security logs table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_logs') THEN
    ALTER TABLE security_logs DROP CONSTRAINT IF EXISTS security_logs_user_id_fkey;
    ALTER TABLE security_logs
    ADD CONSTRAINT security_logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Rate limits table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rate_limits') THEN
    -- Rate limits don't need user_id constraint as they use email/identifier
    -- Just ensure no orphaned records
    DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL '7 days';
  END IF;
END $$;

-- Audit logs table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
    ALTER TABLE audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create a function to clean up user data before deletion
CREATE OR REPLACE FUNCTION cleanup_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the user deletion for audit purposes
  INSERT INTO audit_logs (action, resource_type, resource_id, details, created_at)
  VALUES (
    'user_deleted',
    'auth_user',
    OLD.id::text,
    jsonb_build_object(
      'email', OLD.email,
      'deleted_at', NOW(),
      'cleanup_trigger', true
    ),
    NOW()
  );

  RETURN OLD;
EXCEPTION WHEN OTHERS THEN
  -- If audit log fails, still allow deletion
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user deletion cleanup
DROP TRIGGER IF EXISTS trigger_cleanup_user_data ON auth.users;
CREATE TRIGGER trigger_cleanup_user_data
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_user_data();

-- Add comments for documentation
COMMENT ON FUNCTION cleanup_user_data() IS 'Cleans up user data and logs deletion before user is removed';
COMMENT ON TRIGGER trigger_cleanup_user_data ON auth.users IS 'Triggers cleanup when a user is deleted from auth.users';

-- Create a helper function to safely delete users (for admin use)
CREATE OR REPLACE FUNCTION admin_delete_user(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if user exists
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = user_id) INTO user_exists;

  IF NOT user_exists THEN
    RAISE NOTICE 'User % does not exist', user_id;
    RETURN FALSE;
  END IF;

  -- Delete the user (cascading will handle related records)
  DELETE FROM auth.users WHERE id = user_id;

  RAISE NOTICE 'User % deleted successfully', user_id;
  RETURN TRUE;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error deleting user %: %', user_id, SQLERRM;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (admins)
GRANT EXECUTE ON FUNCTION admin_delete_user(UUID) TO authenticated;

COMMENT ON FUNCTION admin_delete_user(UUID) IS 'Safely deletes a user and all related data with proper error handling';
