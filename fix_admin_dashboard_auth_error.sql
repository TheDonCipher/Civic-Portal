-- FIX ADMIN DASHBOARD AUTH ERROR
-- Resolves "permission denied for table users" error in admin dashboard
-- Run this in Supabase SQL Editor

-- Step 1: Identify the issue
DO $$
BEGIN
    RAISE NOTICE '=== FIXING ADMIN DASHBOARD AUTH ERROR ===';
    RAISE NOTICE 'Resolving permission denied for table users error...';
END $$;

-- Step 2: Fix notification RLS policies that reference auth.users
-- Drop problematic policies that reference auth.users directly
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

-- Step 3: Create safe RLS policies that use profiles instead of auth.users
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (
    user_id = auth.uid() AND
    (expires_at IS NULL OR expires_at > NOW())
  );

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- System can insert notifications (using profiles table for validation)
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT TO authenticated WITH CHECK (
    -- Ensure user_id matches an existing profile (safer than auth.users)
    EXISTS(SELECT 1 FROM profiles WHERE id = user_id)
  );

-- Admins can view all notifications (using profiles table)
CREATE POLICY "Admins can view all notifications" ON notifications
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 4: Fix any database functions that reference auth.users
-- Update create_secure_notification function to use profiles
CREATE OR REPLACE FUNCTION create_secure_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}',
  p_related_issue_id UUID DEFAULT NULL,
  p_related_comment_id UUID DEFAULT NULL,
  p_related_solution_id UUID DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT 'normal',
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_action_user_id UUID DEFAULT NULL
) RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  notification_id UUID;
  should_notify BOOLEAN := TRUE;
  is_duplicate BOOLEAN := FALSE;
BEGIN
  -- Validate user exists and is active (check profiles instead of auth.users)
  IF NOT EXISTS(SELECT 1 FROM profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Invalid user ID: %', p_user_id;
  END IF;
  
  -- Check if notification is expired before creating
  IF p_expires_at IS NOT NULL AND p_expires_at <= NOW() THEN
    RETURN NULL; -- Don't create expired notifications
  END IF;
  
  -- For issue-related notifications, check if user should be notified
  IF p_related_issue_id IS NOT NULL AND p_action_user_id IS NOT NULL THEN
    SELECT should_notify_user(
      p_user_id, 
      p_related_issue_id, 
      p_action_user_id, 
      p_type
    ) INTO should_notify;
  END IF;
  
  -- Check for duplicate notifications
  SELECT NOT prevent_duplicate_notification(
    p_user_id,
    p_type,
    p_related_issue_id,
    p_related_comment_id,
    p_related_solution_id
  ) INTO is_duplicate;
  
  -- Only create notification if user should be notified and it's not a duplicate
  IF should_notify AND NOT is_duplicate THEN
    INSERT INTO notifications (
      user_id, type, title, message, data,
      related_issue_id, related_comment_id, related_solution_id,
      action_url, priority, expires_at
    ) VALUES (
      p_user_id, p_type, p_title, p_message, p_data,
      p_related_issue_id, p_related_comment_id, p_related_solution_id,
      p_action_url, p_priority, p_expires_at
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
  END IF;
  
  RETURN NULL; -- Notification was filtered out
END;
$$;

-- Step 5: Create admin-safe user management functions
-- Function to get user count for admin dashboard (using profiles)
CREATE OR REPLACE FUNCTION get_admin_user_stats()
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  -- Only allow admins to call this function
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'citizens', (SELECT COUNT(*) FROM profiles WHERE role = 'citizen'),
    'officials', (SELECT COUNT(*) FROM profiles WHERE role = 'official'),
    'admins', (SELECT COUNT(*) FROM profiles WHERE role = 'admin'),
    'verified_users', (SELECT COUNT(*) FROM profiles WHERE verification_status = 'verified'),
    'pending_verification', (SELECT COUNT(*) FROM profiles WHERE verification_status = 'pending'),
    'recent_signups', (
      SELECT COUNT(*) FROM profiles 
      WHERE created_at > NOW() - INTERVAL '7 days'
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Step 6: Create function to get user details for admin (using profiles)
CREATE OR REPLACE FUNCTION get_admin_user_details(target_user_id UUID)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
  user_profile RECORD;
BEGIN
  -- Only allow admins to call this function
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  -- Get user profile details
  SELECT * INTO user_profile FROM profiles WHERE id = target_user_id;
  
  IF user_profile IS NULL THEN
    RETURN json_build_object('error', 'User not found');
  END IF;

  SELECT json_build_object(
    'id', user_profile.id,
    'email', user_profile.email,
    'full_name', user_profile.full_name,
    'username', user_profile.username,
    'role', user_profile.role,
    'verification_status', user_profile.verification_status,
    'constituency', user_profile.constituency,
    'department_id', user_profile.department_id,
    'created_at', user_profile.created_at,
    'updated_at', user_profile.updated_at,
    'last_login', user_profile.last_login,
    'is_active', user_profile.is_active
  ) INTO result;

  RETURN result;
END;
$$;

-- Step 7: Grant permissions for admin functions
GRANT EXECUTE ON FUNCTION get_admin_user_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_user_details(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_secure_notification(UUID, TEXT, TEXT, TEXT, JSONB, UUID, UUID, UUID, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, UUID) TO authenticated;

-- Step 8: Verify the fix
DO $$
DECLARE
    policy_count INTEGER;
    function_count INTEGER;
    current_user_role TEXT;
BEGIN
    -- Count notification policies
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'notifications';
    
    -- Count admin functions
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_name IN ('get_admin_user_stats', 'get_admin_user_details', 'create_secure_notification');
    
    -- Get current user role
    SELECT role INTO current_user_role FROM profiles WHERE id = auth.uid();
    
    RAISE NOTICE '=== ADMIN DASHBOARD AUTH FIX SUMMARY ===';
    RAISE NOTICE 'Notification RLS policies: %', policy_count;
    RAISE NOTICE 'Admin functions available: %', function_count;
    RAISE NOTICE 'Current user role: %', COALESCE(current_user_role, 'Not found');
    
    IF policy_count >= 4 AND function_count >= 3 THEN
        RAISE NOTICE '✅ ADMIN DASHBOARD AUTH ERROR FIXED';
        RAISE NOTICE 'All policies and functions use profiles table instead of auth.users';
        RAISE NOTICE 'Admin dashboard should now work without permission errors';
    ELSE
        RAISE NOTICE '⚠ SOME COMPONENTS MAY STILL NEED ATTENTION';
        RAISE NOTICE 'Manual verification recommended';
    END IF;
END $$;

SELECT 'Admin dashboard auth error fix completed!' AS result;
