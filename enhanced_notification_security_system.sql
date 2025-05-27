-- ENHANCED NOTIFICATION SECURITY AND FILTERING SYSTEM
-- Implements comprehensive user-specific filtering, role-based access, and spam prevention
-- Run this in your Supabase SQL Editor

-- Step 1: Create enhanced notification filtering functions
DO $$
BEGIN
    RAISE NOTICE '=== ENHANCED NOTIFICATION SECURITY SYSTEM ===';
    RAISE NOTICE 'Implementing comprehensive filtering and security...';
END $$;

-- Enhanced function to check if user should receive notification
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

-- Enhanced function to prevent duplicate notifications
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

-- Enhanced notification creation function with security checks
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
  -- Validate user exists and is active
  IF NOT EXISTS(SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
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

-- Enhanced issue status change notification function
CREATE OR REPLACE FUNCTION notify_issue_status_change()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  watcher_record RECORD;
  notification_title TEXT;
  notification_message TEXT;
  notification_priority TEXT;
BEGIN
  -- Only proceed if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    notification_title := 'Issue Status Updated';
    notification_message := format('Issue "%s" status changed from %s to %s',
                                   NEW.title, OLD.status, NEW.status);

    -- Set priority based on status change
    notification_priority := CASE
      WHEN NEW.status = 'resolved' THEN 'high'
      WHEN NEW.status = 'in_progress' THEN 'normal'
      WHEN NEW.status = 'closed' THEN 'normal'
      ELSE 'normal'
    END;

    -- Notify all eligible users (watchers, author, commenters, department officials)
    FOR watcher_record IN
      SELECT DISTINCT user_id FROM (
        -- Issue watchers
        SELECT user_id FROM issue_watchers WHERE issue_id = NEW.id
        UNION
        -- Issue author
        SELECT NEW.author_id as user_id
        UNION
        -- Users who commented
        SELECT DISTINCT author_id as user_id FROM comments WHERE issue_id = NEW.id
        UNION
        -- Users who proposed solutions
        SELECT DISTINCT author_id as user_id FROM solutions WHERE issue_id = NEW.id
        UNION
        -- Department officials (if department assigned)
        SELECT p.id as user_id FROM profiles p
        WHERE p.role = 'official'
        AND p.department_id = NEW.department_id
        AND NEW.department_id IS NOT NULL
      ) eligible_users
    LOOP
      PERFORM create_secure_notification(
        watcher_record.user_id,
        'status_change',
        notification_title,
        notification_message,
        json_build_object(
          'issue_id', NEW.id,
          'old_status', OLD.status,
          'new_status', NEW.status,
          'changed_by', auth.uid()
        ),
        NEW.id,
        NULL,
        NULL,
        format('/issues/%s', NEW.id),
        notification_priority,
        NULL,
        auth.uid() -- action_user_id to prevent self-notification
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- Enhanced comment notification function
CREATE OR REPLACE FUNCTION notify_new_comment()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  watcher_record RECORD;
  issue_record RECORD;
  notification_title TEXT;
  notification_message TEXT;
  comment_type TEXT;
  notification_priority TEXT;
BEGIN
  -- Get issue details
  SELECT title INTO issue_record FROM issues WHERE id = NEW.issue_id;

  comment_type := CASE WHEN NEW.is_official THEN 'Official' ELSE 'Community' END;
  notification_title := format('New %s Comment', comment_type);
  notification_message := format('A new %s comment was added to issue "%s"',
                                 LOWER(comment_type), issue_record.title);

  notification_priority := CASE WHEN NEW.is_official THEN 'high' ELSE 'normal' END;

  -- Notify eligible users (watchers, author, other commenters)
  FOR watcher_record IN
    SELECT DISTINCT user_id FROM (
      -- Issue watchers
      SELECT user_id FROM issue_watchers WHERE issue_id = NEW.issue_id
      UNION
      -- Issue author
      SELECT i.author_id as user_id FROM issues i WHERE i.id = NEW.issue_id
      UNION
      -- Other commenters
      SELECT DISTINCT author_id as user_id FROM comments
      WHERE issue_id = NEW.issue_id AND author_id != NEW.author_id
    ) eligible_users
  LOOP
    PERFORM create_secure_notification(
      watcher_record.user_id,
      'comment',
      notification_title,
      notification_message,
      json_build_object(
        'issue_id', NEW.issue_id,
        'comment_id', NEW.id,
        'is_official', NEW.is_official,
        'comment_author', NEW.author_id
      ),
      NEW.issue_id,
      NEW.id,
      NULL,
      format('/issues/%s', NEW.issue_id),
      notification_priority,
      NULL,
      NEW.author_id -- action_user_id to prevent self-notification
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Enhanced solution notification function
CREATE OR REPLACE FUNCTION notify_new_solution()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  watcher_record RECORD;
  issue_record RECORD;
  notification_title TEXT;
  notification_message TEXT;
  solution_type TEXT;
  notification_priority TEXT;
BEGIN
  -- Get issue details
  SELECT title INTO issue_record FROM issues WHERE id = NEW.issue_id;

  solution_type := CASE WHEN NEW.is_official THEN 'Official' ELSE 'Community' END;
  notification_title := format('New %s Solution', solution_type);
  notification_message := format('A new %s solution was proposed for issue "%s"',
                                 LOWER(solution_type), issue_record.title);

  notification_priority := CASE WHEN NEW.is_official THEN 'high' ELSE 'normal' END;

  -- Notify eligible users (watchers, author, other solution proposers)
  FOR watcher_record IN
    SELECT DISTINCT user_id FROM (
      -- Issue watchers
      SELECT user_id FROM issue_watchers WHERE issue_id = NEW.issue_id
      UNION
      -- Issue author
      SELECT i.author_id as user_id FROM issues i WHERE i.id = NEW.issue_id
      UNION
      -- Other solution proposers
      SELECT DISTINCT author_id as user_id FROM solutions
      WHERE issue_id = NEW.issue_id AND author_id != NEW.author_id
    ) eligible_users
  LOOP
    PERFORM create_secure_notification(
      watcher_record.user_id,
      'solution',
      notification_title,
      notification_message,
      json_build_object(
        'issue_id', NEW.issue_id,
        'solution_id', NEW.id,
        'is_official', NEW.is_official,
        'solution_author', NEW.author_id
      ),
      NEW.issue_id,
      NULL,
      NEW.id,
      format('/issues/%s', NEW.issue_id),
      notification_priority,
      NULL,
      NEW.author_id -- action_user_id to prevent self-notification
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Function to auto-watch issues and notify department officials
CREATE OR REPLACE FUNCTION auto_watch_and_notify_new_issue()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  official_record RECORD;
BEGIN
  -- Auto-watch: Issue author automatically watches their own issue
  INSERT INTO issue_watchers (issue_id, user_id)
  VALUES (NEW.id, NEW.author_id)
  ON CONFLICT (issue_id, user_id) DO NOTHING;

  -- Notify department officials about new issues in their department
  IF NEW.department_id IS NOT NULL THEN
    FOR official_record IN
      SELECT id FROM profiles
      WHERE role = 'official'
      AND department_id = NEW.department_id
      AND id != NEW.author_id -- Don't notify if official created the issue
    LOOP
      PERFORM create_secure_notification(
        official_record.id,
        'issue_update',
        'New Issue in Your Department',
        format('A new issue "%s" has been reported in your department', NEW.title),
        json_build_object(
          'issue_id', NEW.id,
          'category', NEW.category,
          'priority', NEW.priority,
          'author_id', NEW.author_id
        ),
        NEW.id,
        NULL,
        NULL,
        format('/issues/%s', NEW.id),
        CASE WHEN NEW.priority = 'urgent' THEN 'urgent' ELSE 'normal' END,
        NULL,
        NEW.author_id
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- Enhanced RLS policies for notifications with role-based filtering
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;

-- Strict user-specific notification access
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (
    user_id = auth.uid() AND
    (expires_at IS NULL OR expires_at > NOW())
  );

-- Users can only update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Only authenticated users can insert notifications (system functions)
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT TO authenticated WITH CHECK (
    -- Ensure user_id matches an existing profile (safer than auth.users)
    EXISTS(SELECT 1 FROM profiles WHERE id = user_id)
  );

-- Admins can view all notifications for dashboard purposes
CREATE POLICY "Admins can view all notifications" ON notifications
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Update triggers to use enhanced functions
DROP TRIGGER IF EXISTS trigger_notify_issue_status_change ON issues;
CREATE TRIGGER trigger_notify_issue_status_change
  AFTER UPDATE ON issues
  FOR EACH ROW
  EXECUTE FUNCTION notify_issue_status_change();

DROP TRIGGER IF EXISTS trigger_notify_new_comment ON comments;
CREATE TRIGGER trigger_notify_new_comment
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_comment();

DROP TRIGGER IF EXISTS trigger_notify_new_solution ON solutions;
CREATE TRIGGER trigger_notify_new_solution
  AFTER INSERT ON solutions
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_solution();

-- Replace the basic auto-watch trigger with enhanced version
DROP TRIGGER IF EXISTS on_issue_created ON issues;
CREATE TRIGGER on_issue_created
  AFTER INSERT ON issues
  FOR EACH ROW
  EXECUTE FUNCTION auto_watch_and_notify_new_issue();

-- Function to cleanup expired notifications
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION should_notify_user(UUID, UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION prevent_duplicate_notification(UUID, TEXT, UUID, UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION create_secure_notification(UUID, TEXT, TEXT, TEXT, JSONB, UUID, UUID, UUID, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_notifications() TO authenticated;

SELECT 'Enhanced notification security system implemented successfully!' AS result;
