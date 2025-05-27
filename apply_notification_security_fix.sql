-- NOTIFICATION SECURITY FIX APPLICATION
-- Run this first to ensure the enhanced security system is properly applied
-- This script applies the core security functions and policies

-- Step 1: Ensure notifications table has required structure
DO $$
BEGIN
    RAISE NOTICE '=== APPLYING NOTIFICATION SECURITY FIX ===';
    RAISE NOTICE 'Ensuring proper table structure and security functions...';
END $$;

-- Step 2: Add missing columns if they don't exist
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_issue_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_comment_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_solution_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Step 3: Create the core security function (fixed version)
CREATE OR REPLACE FUNCTION should_notify_user(
  p_user_id UUID,
  p_issue_id UUID,
  p_action_user_id UUID,
  p_notification_type TEXT
) RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_profile RECORD;
  issue_record RECORD;
  is_watcher BOOLEAN := FALSE;
  is_author BOOLEAN := FALSE;
  is_commenter BOOLEAN := FALSE;
  is_solution_proposer BOOLEAN := FALSE;
  same_department BOOLEAN := FALSE;
BEGIN
  -- Don't notify the user who triggered the action
  IF p_user_id = p_action_user_id THEN
    RETURN FALSE;
  END IF;

  -- Get user profile and issue details
  SELECT * INTO user_profile FROM profiles WHERE id = p_user_id;
  SELECT * INTO issue_record FROM issues WHERE id = p_issue_id;

  -- Check if user is watching the issue
  SELECT EXISTS(
    SELECT 1 FROM issue_watchers
    WHERE issue_id = p_issue_id AND user_id = p_user_id
  ) INTO is_watcher;

  -- Check if user is the issue author
  SELECT (issue_record.author_id = p_user_id) INTO is_author;

  -- Check if user has commented on the issue
  SELECT EXISTS(
    SELECT 1 FROM comments
    WHERE issue_id = p_issue_id AND author_id = p_user_id
  ) INTO is_commenter;

  -- Check if user has proposed solutions
  SELECT EXISTS(
    SELECT 1 FROM solutions
    WHERE issue_id = p_issue_id AND author_id = p_user_id
  ) INTO is_solution_proposer;

  -- Check if user is in same department (for officials)
  IF user_profile.role = 'official' AND user_profile.department_id IS NOT NULL THEN
    SELECT (issue_record.department_id = user_profile.department_id) INTO same_department;
  END IF;

  -- Determine if user should be notified based on notification type
  CASE p_notification_type
    WHEN 'status_change' THEN
      -- Notify watchers, author, commenters, solution proposers, and department officials
      RETURN is_watcher OR is_author OR is_commenter OR is_solution_proposer OR same_department;

    WHEN 'comment' THEN
      -- Notify watchers, author, and other commenters (but not the commenter themselves)
      RETURN is_watcher OR is_author OR is_commenter;

    WHEN 'solution' THEN
      -- Notify watchers, author, and other solution proposers
      RETURN is_watcher OR is_author OR is_solution_proposer;

    WHEN 'issue_update' THEN
      -- Notify watchers and department officials
      RETURN is_watcher OR same_department;

    ELSE
      -- Default: only notify watchers and author
      RETURN is_watcher OR is_author;
  END CASE;
END;
$$;

-- Step 4: Create duplicate prevention function
CREATE OR REPLACE FUNCTION prevent_duplicate_notification(
  p_user_id UUID,
  p_type TEXT,
  p_related_issue_id UUID,
  p_related_comment_id UUID,
  p_related_solution_id UUID,
  p_time_window_minutes INTEGER DEFAULT 5
) RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check for duplicate notifications within time window
  RETURN NOT EXISTS(
    SELECT 1 FROM notifications
    WHERE user_id = p_user_id
    AND type = p_type
    AND (
      (p_related_issue_id IS NOT NULL AND related_issue_id = p_related_issue_id) OR
      (p_related_comment_id IS NOT NULL AND related_comment_id = p_related_comment_id) OR
      (p_related_solution_id IS NOT NULL AND related_solution_id = p_related_solution_id)
    )
    AND created_at > NOW() - INTERVAL '1 minute' * p_time_window_minutes
  );
END;
$$;

-- Step 5: Create secure notification creation function
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

-- Step 6: Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications
  WHERE expires_at IS NOT NULL AND expires_at <= NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Step 7: Update RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;

-- Create enhanced RLS policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (
    user_id = auth.uid() AND
    (expires_at IS NULL OR expires_at > NOW())
  );

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS(SELECT 1 FROM profiles WHERE id = user_id)
  );

CREATE POLICY "Admins can view all notifications" ON notifications
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Step 8: Grant permissions
GRANT EXECUTE ON FUNCTION should_notify_user(UUID, UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION prevent_duplicate_notification(UUID, TEXT, UUID, UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION create_secure_notification(UUID, TEXT, TEXT, TEXT, JSONB, UUID, UUID, UUID, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_notifications() TO authenticated;

-- Step 9: Verification
DO $$
DECLARE
    function_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Count security functions
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines
    WHERE routine_name IN (
        'should_notify_user',
        'prevent_duplicate_notification',
        'create_secure_notification',
        'cleanup_expired_notifications'
    );

    -- Count RLS policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'notifications';

    RAISE NOTICE '=== SECURITY FIX APPLICATION SUMMARY ===';
    RAISE NOTICE 'Security functions created: %/4', function_count;
    RAISE NOTICE 'RLS policies active: %', policy_count;

    IF function_count = 4 AND policy_count >= 4 THEN
        RAISE NOTICE '✅ SECURITY FIX APPLIED SUCCESSFULLY';
        RAISE NOTICE 'Core notification security functions are now active!';
    ELSE
        RAISE NOTICE '⚠ SECURITY FIX INCOMPLETE';
        RAISE NOTICE 'Some components may need manual verification.';
    END IF;
END $$;

SELECT 'Notification security fix application completed!' AS result;
