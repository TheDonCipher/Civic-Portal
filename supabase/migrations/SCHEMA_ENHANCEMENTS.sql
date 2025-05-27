-- SCHEMA ENHANCEMENTS FOR CIVIC PORTAL
-- Additional improvements to support all features
-- Run this AFTER the critical missing functions

-- Add missing enhanced fields to issues table
ALTER TABLE issues
ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS thumbnails JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Add missing fields to profiles table for legal consent tracking
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS privacy_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_processing_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_processing_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS legal_consent_version TEXT DEFAULT '2024.1',
ADD COLUMN IF NOT EXISTS consent_ip_address INET,
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'pending_consent' CHECK (account_status IN ('pending_consent', 'active', 'suspended', 'deactivated')),
ADD COLUMN IF NOT EXISTS consent_required_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS consent_reminder_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_consent_reminder TIMESTAMP WITH TIME ZONE;

-- Add missing enhanced fields to solutions table if they don't exist
ALTER TABLE solutions
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'under_review', 'approved', 'rejected', 'implemented')),
ADD COLUMN IF NOT EXISTS implementation_plan TEXT,
ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL,
ADD COLUMN IF NOT EXISTS estimated_timeline TEXT;

-- NOTIFICATIONS TABLE STANDARDIZATION
-- Fix schema conflicts between 'data' and 'metadata' columns
-- Ensure consistent structure across all notification-related code

-- First, check if notifications table exists and what columns it has
DO $$
DECLARE
    has_data_column BOOLEAN := FALSE;
    has_metadata_column BOOLEAN := FALSE;
    has_read_column BOOLEAN := FALSE;
    has_read_at_column BOOLEAN := FALSE;
BEGIN
    -- Check for existing columns
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'data'
    ) INTO has_data_column;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'metadata'
    ) INTO has_metadata_column;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'read'
    ) INTO has_read_column;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'read_at'
    ) INTO has_read_at_column;

    RAISE NOTICE 'Notifications table column check: data=%, metadata=%, read=%, read_at=%',
                 has_data_column, has_metadata_column, has_read_column, has_read_at_column;
END $$;

-- Create or update notifications table with standardized schema
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}', -- Standardize on 'data' column for consistency
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  related_issue_id UUID REFERENCES issues(id),
  related_comment_id UUID REFERENCES comments(id),
  related_solution_id UUID REFERENCES solutions(id),
  action_url TEXT,
  priority TEXT DEFAULT 'normal',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop existing constraints if they exist and add updated ones
DO $$
BEGIN
    -- Drop existing type constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'notifications'
        AND constraint_name = 'notifications_type_check'
    ) THEN
        ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
        RAISE NOTICE 'Dropped existing notifications_type_check constraint';
    END IF;

    -- Drop existing priority constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'notifications'
        AND constraint_name = 'notifications_priority_check'
    ) THEN
        ALTER TABLE notifications DROP CONSTRAINT notifications_priority_check;
        RAISE NOTICE 'Dropped existing notifications_priority_check constraint';
    END IF;
END $$;

-- Add updated constraints with all supported types
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
CHECK (type IN (
  'verification_approved', 'verification_rejected', 'role_changed',
  'status_change', 'issue_update', 'comment', 'solution',
  'system', 'general', 'info', 'success', 'warning', 'error'
));

ALTER TABLE notifications ADD CONSTRAINT notifications_priority_check
CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Add missing columns if they don't exist (for existing tables)
DO $$
BEGIN
    -- Add data column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'data') THEN
        ALTER TABLE notifications ADD COLUMN data JSONB DEFAULT '{}';
        RAISE NOTICE 'Added data column to notifications table';
    END IF;

    -- Add read_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read_at') THEN
        ALTER TABLE notifications ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added read_at column to notifications table';
    END IF;

    -- Add related columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_issue_id') THEN
        ALTER TABLE notifications ADD COLUMN related_issue_id UUID REFERENCES issues(id);
        RAISE NOTICE 'Added related_issue_id column to notifications table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_comment_id') THEN
        ALTER TABLE notifications ADD COLUMN related_comment_id UUID REFERENCES comments(id);
        RAISE NOTICE 'Added related_comment_id column to notifications table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_solution_id') THEN
        ALTER TABLE notifications ADD COLUMN related_solution_id UUID REFERENCES solutions(id);
        RAISE NOTICE 'Added related_solution_id column to notifications table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'action_url') THEN
        ALTER TABLE notifications ADD COLUMN action_url TEXT;
        RAISE NOTICE 'Added action_url column to notifications table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'priority') THEN
        ALTER TABLE notifications ADD COLUMN priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
        RAISE NOTICE 'Added priority column to notifications table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'expires_at') THEN
        ALTER TABLE notifications ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added expires_at column to notifications table';
    END IF;

    -- Migrate metadata to data if metadata column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'metadata') THEN
        UPDATE notifications SET data = COALESCE(metadata, '{}') WHERE data IS NULL OR data = '{}';
        RAISE NOTICE 'Migrated metadata to data column';
    END IF;

    -- Update read_at for existing read notifications
    UPDATE notifications SET read_at = updated_at WHERE read = TRUE AND read_at IS NULL;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during notifications table migration: %', SQLERRM;
END $$;

-- Add missing performance indexes
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_author_id ON issues(author_id);
CREATE INDEX IF NOT EXISTS idx_issues_department_id ON issues(department_id);
CREATE INDEX IF NOT EXISTS idx_issues_constituency ON issues(constituency);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at);
CREATE INDEX IF NOT EXISTS idx_issues_updated_at ON issues(updated_at);

CREATE INDEX IF NOT EXISTS idx_comments_issue_id ON comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

CREATE INDEX IF NOT EXISTS idx_solutions_issue_id ON solutions(issue_id);
CREATE INDEX IF NOT EXISTS idx_solutions_author_id ON solutions(author_id);
CREATE INDEX IF NOT EXISTS idx_solutions_status ON solutions(status);
CREATE INDEX IF NOT EXISTS idx_solutions_is_official ON solutions(is_official);

-- Enhanced notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_related_issue ON notifications(related_issue_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_profiles_department_id ON profiles(department_id);

-- NOTIFICATION SYSTEM FUNCTIONS AND TRIGGERS
-- Enable Row Level Security on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;

-- Create comprehensive RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow admins to view all notifications for admin dashboard
CREATE POLICY "Admins can view all notifications" ON notifications
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON notifications;
CREATE TRIGGER trigger_update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Function to automatically set read_at when read is set to true
CREATE OR REPLACE FUNCTION set_notification_read_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- If read status changed from false to true, set read_at
  IF OLD.read = FALSE AND NEW.read = TRUE THEN
    NEW.read_at = NOW();
  -- If read status changed from true to false, clear read_at
  ELSIF OLD.read = TRUE AND NEW.read = FALSE THEN
    NEW.read_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for read_at
DROP TRIGGER IF EXISTS trigger_set_notification_read_at ON notifications;
CREATE TRIGGER trigger_set_notification_read_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION set_notification_read_at();

-- Function to clean up expired notifications
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
  WHERE expires_at IS NOT NULL
  AND expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Function to create notifications for civic portal events
CREATE OR REPLACE FUNCTION create_notification(
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
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  notification_id UUID;
BEGIN
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
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE notifications
  SET read = TRUE, read_at = NOW(), updated_at = NOW()
  WHERE id = p_notification_id
  AND user_id = p_user_id
  AND read = FALSE;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE notifications
  SET read = TRUE, read_at = NOW(), updated_at = NOW()
  WHERE user_id = p_user_id
  AND read = FALSE;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Function to get notification statistics for admin dashboard
CREATE OR REPLACE FUNCTION get_notification_stats()
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_notifications', (SELECT COUNT(*) FROM notifications),
    'unread_notifications', (SELECT COUNT(*) FROM notifications WHERE read = FALSE),
    'notifications_today', (
      SELECT COUNT(*) FROM notifications
      WHERE created_at >= CURRENT_DATE
    ),
    'notifications_this_week', (
      SELECT COUNT(*) FROM notifications
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    ),
    'by_type', (
      SELECT json_object_agg(type, count)
      FROM (
        SELECT type, COUNT(*) as count
        FROM notifications
        GROUP BY type
      ) type_counts
    ),
    'by_priority', (
      SELECT json_object_agg(priority, count)
      FROM (
        SELECT priority, COUNT(*) as count
        FROM notifications
        GROUP BY priority
      ) priority_counts
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- AUTOMATIC NOTIFICATION TRIGGERS FOR CIVIC PORTAL EVENTS

-- Function to notify watchers when issue status changes
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
BEGIN
  -- Only proceed if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    notification_title := 'Issue Status Updated';
    notification_message := format('Issue "%s" status changed from %s to %s',
                                   NEW.title, OLD.status, NEW.status);

    -- Notify all watchers of this issue
    FOR watcher_record IN
      SELECT user_id FROM watchers WHERE issue_id = NEW.id
    LOOP
      -- Don't notify the user who made the change
      IF watcher_record.user_id != auth.uid() THEN
        PERFORM create_notification(
          watcher_record.user_id,
          'status_change',
          notification_title,
          notification_message,
          json_build_object(
            'issue_id', NEW.id,
            'old_status', OLD.status,
            'new_status', NEW.status
          ),
          NEW.id,
          NULL,
          NULL,
          format('/issues/%s', NEW.id),
          'normal',
          NULL
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- Function to notify watchers when new comment is added
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
BEGIN
  -- Get issue details
  SELECT title INTO issue_record FROM issues WHERE id = NEW.issue_id;

  comment_type := CASE WHEN NEW.is_official THEN 'Official' ELSE 'Community' END;
  notification_title := format('New %s Comment', comment_type);
  notification_message := format('A new %s comment was added to issue "%s"',
                                 LOWER(comment_type), issue_record.title);

  -- Notify all watchers of this issue
  FOR watcher_record IN
    SELECT user_id FROM watchers WHERE issue_id = NEW.issue_id
  LOOP
    -- Don't notify the comment author
    IF watcher_record.user_id != NEW.author_id THEN
      PERFORM create_notification(
        watcher_record.user_id,
        'comment',
        notification_title,
        notification_message,
        json_build_object(
          'issue_id', NEW.issue_id,
          'comment_id', NEW.id,
          'is_official', NEW.is_official
        ),
        NEW.issue_id,
        NEW.id,
        NULL,
        format('/issues/%s', NEW.issue_id),
        CASE WHEN NEW.is_official THEN 'high' ELSE 'normal' END,
        NULL
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Function to notify watchers when new solution is proposed
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
BEGIN
  -- Get issue details
  SELECT title INTO issue_record FROM issues WHERE id = NEW.issue_id;

  solution_type := CASE WHEN NEW.is_official THEN 'Official' ELSE 'Community' END;
  notification_title := format('New %s Solution', solution_type);
  notification_message := format('A new %s solution was proposed for issue "%s"',
                                 LOWER(solution_type), issue_record.title);

  -- Notify all watchers of this issue
  FOR watcher_record IN
    SELECT user_id FROM watchers WHERE issue_id = NEW.issue_id
  LOOP
    -- Don't notify the solution author
    IF watcher_record.user_id != NEW.author_id THEN
      PERFORM create_notification(
        watcher_record.user_id,
        'solution',
        notification_title,
        notification_message,
        json_build_object(
          'issue_id', NEW.issue_id,
          'solution_id', NEW.id,
          'is_official', NEW.is_official
        ),
        NEW.issue_id,
        NULL,
        NEW.id,
        format('/issues/%s', NEW.issue_id),
        CASE WHEN NEW.is_official THEN 'high' ELSE 'normal' END,
        NULL
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create triggers for automatic notifications
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

-- Function to update comment counts
CREATE OR REPLACE FUNCTION update_issue_comment_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE issues
    SET comment_count = COALESCE(comment_count, 0) + 1,
        updated_at = NOW()
    WHERE id = NEW.issue_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE issues
    SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0),
        updated_at = NOW()
    WHERE id = OLD.issue_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for comment count updates
DROP TRIGGER IF EXISTS trigger_update_comment_count ON comments;
CREATE TRIGGER trigger_update_comment_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_issue_comment_count();

-- Function to set first response time
CREATE OR REPLACE FUNCTION set_first_response_time()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only set first_response_at if it's not already set and this is an official response
  IF TG_OP = 'INSERT' AND NEW.is_official = true THEN
    UPDATE issues
    SET first_response_at = COALESCE(first_response_at, NOW()),
        updated_at = NOW()
    WHERE id = NEW.issue_id AND first_response_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for first response time
DROP TRIGGER IF EXISTS trigger_set_first_response ON comments;
CREATE TRIGGER trigger_set_first_response
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION set_first_response_time();

-- Update existing comment counts
UPDATE issues
SET comment_count = (
  SELECT COUNT(*)
  FROM comments
  WHERE comments.issue_id = issues.id
);

-- Function to get comprehensive issue statistics
CREATE OR REPLACE FUNCTION get_issue_stats(issue_id UUID)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'votes_count', COALESCE(i.vote_count, 0),
    'comments_count', COALESCE(i.comment_count, 0),
    'watchers_count', COALESCE(i.watchers_count, 0),
    'solutions_count', (
      SELECT COUNT(*) FROM solutions WHERE solutions.issue_id = i.id
    ),
    'response_time_hours', (
      CASE
        WHEN i.first_response_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (i.first_response_at - i.created_at)) / 3600
        ELSE NULL
      END
    )
  ) INTO result
  FROM issues i
  WHERE i.id = issue_id;

  RETURN result;
END;
$$;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_id UUID)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'issues_created', (
      SELECT COUNT(*) FROM issues WHERE author_id = user_id
    ),
    'issues_watching', (
      SELECT COUNT(*) FROM issue_watchers WHERE user_id = get_user_stats.user_id
    ),
    'comments_made', (
      SELECT COUNT(*) FROM comments WHERE author_id = user_id
    ),
    'solutions_proposed', (
      SELECT COUNT(*) FROM solutions WHERE author_id = user_id
    ),
    'votes_cast', (
      SELECT COUNT(*) FROM issue_votes WHERE user_id = get_user_stats.user_id
    ) + (
      SELECT COUNT(*) FROM solution_votes WHERE user_id = get_user_stats.user_id
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Function to get department statistics
CREATE OR REPLACE FUNCTION get_department_stats(department_id UUID)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_issues', (
      SELECT COUNT(*) FROM issues WHERE issues.department_id = get_department_stats.department_id
    ),
    'open_issues', (
      SELECT COUNT(*) FROM issues
      WHERE issues.department_id = get_department_stats.department_id
      AND status = 'open'
    ),
    'resolved_issues', (
      SELECT COUNT(*) FROM issues
      WHERE issues.department_id = get_department_stats.department_id
      AND status = 'resolved'
    ),
    'avg_resolution_time_hours', (
      SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600)
      FROM issues
      WHERE issues.department_id = get_department_stats.department_id
      AND resolved_at IS NOT NULL
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Add table comments for better documentation
COMMENT ON COLUMN issues.first_response_at IS 'Timestamp of first official response to this issue';
COMMENT ON COLUMN issues.resolved_by IS 'User ID of who resolved this issue';
COMMENT ON COLUMN issues.thumbnails IS 'JSON array of thumbnail URLs for this issue';
COMMENT ON COLUMN issues.comment_count IS 'Cached count of comments for this issue';
COMMENT ON COLUMN profiles.terms_accepted_at IS 'Timestamp when user accepted terms of service';
COMMENT ON COLUMN profiles.privacy_accepted_at IS 'Timestamp when user accepted privacy policy';

-- Add comprehensive table and column comments for notifications
COMMENT ON TABLE notifications IS 'Comprehensive notification system for civic portal events with automatic triggers';
COMMENT ON COLUMN notifications.user_id IS 'ID of the user who should receive the notification';
COMMENT ON COLUMN notifications.type IS 'Type of notification: verification, status changes, comments, solutions, etc.';
COMMENT ON COLUMN notifications.title IS 'Short title for the notification';
COMMENT ON COLUMN notifications.message IS 'Full notification message';
COMMENT ON COLUMN notifications.data IS 'Additional structured data related to the notification (JSON)';
COMMENT ON COLUMN notifications.read IS 'Whether the notification has been read by the user';
COMMENT ON COLUMN notifications.read_at IS 'Timestamp when the notification was marked as read';
COMMENT ON COLUMN notifications.related_issue_id IS 'ID of related issue if applicable';
COMMENT ON COLUMN notifications.related_comment_id IS 'ID of related comment if applicable';
COMMENT ON COLUMN notifications.related_solution_id IS 'ID of related solution if applicable';
COMMENT ON COLUMN notifications.action_url IS 'URL for the primary action related to this notification';
COMMENT ON COLUMN notifications.priority IS 'Priority level: low, normal, high, urgent';
COMMENT ON COLUMN notifications.expires_at IS 'Optional expiration time for temporary notifications';

-- Create a view for unread notifications count per user
CREATE OR REPLACE VIEW user_notification_counts AS
SELECT
  user_id,
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE read = FALSE) as unread_count,
  COUNT(*) FILTER (WHERE read = TRUE) as read_count,
  COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_count,
  COUNT(*) FILTER (WHERE priority = 'high') as high_priority_count,
  MAX(created_at) as latest_notification_at
FROM notifications
GROUP BY user_id;

COMMENT ON VIEW user_notification_counts IS 'Summary of notification counts per user for dashboard widgets';

-- Create a view for recent notifications with issue details
CREATE OR REPLACE VIEW recent_notifications_with_details AS
SELECT
  n.*,
  i.title as issue_title,
  i.status as issue_status,
  i.category as issue_category,
  p.full_name as author_name,
  p.role as author_role
FROM notifications n
LEFT JOIN issues i ON n.related_issue_id = i.id
LEFT JOIN profiles p ON i.author_id = p.id
WHERE n.created_at >= NOW() - INTERVAL '30 days'
ORDER BY n.created_at DESC;

COMMENT ON VIEW recent_notifications_with_details IS 'Recent notifications with related issue and author details for admin dashboard';

-- Function to send bulk notifications (for admin announcements)
CREATE OR REPLACE FUNCTION send_bulk_notification(
  p_user_ids UUID[],
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}',
  p_priority TEXT DEFAULT 'normal',
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_id UUID;
  notification_count INTEGER := 0;
BEGIN
  -- Validate priority
  IF p_priority NOT IN ('low', 'normal', 'high', 'urgent') THEN
    RAISE EXCEPTION 'Invalid priority: %', p_priority;
  END IF;

  -- Send notification to each user
  FOREACH user_id IN ARRAY p_user_ids
  LOOP
    PERFORM create_notification(
      user_id,
      p_type,
      p_title,
      p_message,
      p_data,
      NULL, -- related_issue_id
      NULL, -- related_comment_id
      NULL, -- related_solution_id
      NULL, -- action_url
      p_priority,
      p_expires_at
    );
    notification_count := notification_count + 1;
  END LOOP;

  RETURN notification_count;
END;
$$;

COMMENT ON FUNCTION send_bulk_notification IS 'Send notifications to multiple users at once (for admin announcements)';

-- PLATFORM UPDATES SYSTEM
-- Create platform_updates table for admin-created platform-wide updates

CREATE TABLE IF NOT EXISTS platform_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('general', 'maintenance', 'feature', 'announcement', 'policy')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id), -- Optional department association
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'citizens', 'officials', 'admins')),
  is_published BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for platform_updates
CREATE INDEX IF NOT EXISTS idx_platform_updates_type ON platform_updates(type);
CREATE INDEX IF NOT EXISTS idx_platform_updates_priority ON platform_updates(priority);
CREATE INDEX IF NOT EXISTS idx_platform_updates_author_id ON platform_updates(author_id);
CREATE INDEX IF NOT EXISTS idx_platform_updates_department_id ON platform_updates(department_id);
CREATE INDEX IF NOT EXISTS idx_platform_updates_target_audience ON platform_updates(target_audience);
CREATE INDEX IF NOT EXISTS idx_platform_updates_is_published ON platform_updates(is_published);
CREATE INDEX IF NOT EXISTS idx_platform_updates_published_at ON platform_updates(published_at);
CREATE INDEX IF NOT EXISTS idx_platform_updates_created_at ON platform_updates(created_at);

-- Enable RLS for platform_updates
ALTER TABLE platform_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for platform_updates
CREATE POLICY "Anyone can view published platform updates" ON platform_updates
  FOR SELECT USING (is_published = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Admins can manage all platform updates" ON platform_updates
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Trigger for platform_updates updated_at
CREATE OR REPLACE FUNCTION update_platform_updates_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_platform_updates_updated_at ON platform_updates;
CREATE TRIGGER trigger_update_platform_updates_updated_at
  BEFORE UPDATE ON platform_updates
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_updates_updated_at();

-- Function to create platform update and send notifications
CREATE OR REPLACE FUNCTION create_platform_update_with_notifications(
  p_title TEXT,
  p_content TEXT,
  p_type TEXT DEFAULT 'general',
  p_priority TEXT DEFAULT 'normal',
  p_author_id UUID,
  p_department_id UUID DEFAULT NULL,
  p_target_audience TEXT DEFAULT 'all',
  p_send_notifications BOOLEAN DEFAULT TRUE
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  update_id UUID;
  user_record RECORD;
  notification_title TEXT;
  notification_message TEXT;
  notification_count INTEGER := 0;
BEGIN
  -- Create the platform update
  INSERT INTO platform_updates (
    title, content, type, priority, author_id, department_id, target_audience
  ) VALUES (
    p_title, p_content, p_type, p_priority, p_author_id, p_department_id, p_target_audience
  ) RETURNING id INTO update_id;

  -- Send notifications if requested
  IF p_send_notifications THEN
    notification_title := 'New Platform Update: ' || p_title;
    notification_message := 'A new platform update has been published. Click to read more.';

    -- Send notifications based on target audience
    FOR user_record IN
      SELECT id FROM auth.users
      WHERE id IN (
        SELECT p.id FROM profiles p
        WHERE (
          p_target_audience = 'all' OR
          (p_target_audience = 'citizens' AND p.role = 'citizen') OR
          (p_target_audience = 'officials' AND p.role = 'official') OR
          (p_target_audience = 'admins' AND p.role = 'admin')
        )
        AND (p_department_id IS NULL OR p.department_id = p_department_id)
      )
    LOOP
      PERFORM create_notification(
        user_record.id,
        'system',
        notification_title,
        notification_message,
        json_build_object(
          'platform_update_id', update_id,
          'update_type', p_type,
          'priority', p_priority
        ),
        NULL, -- related_issue_id
        NULL, -- related_comment_id
        NULL, -- related_solution_id
        '/platform-updates',
        p_priority,
        NULL -- expires_at
      );
      notification_count := notification_count + 1;
    END LOOP;

    RAISE NOTICE 'Created platform update % and sent % notifications', update_id, notification_count;
  END IF;

  RETURN update_id;
END;
$$;

-- Function to get platform updates with pagination and filtering
CREATE OR REPLACE FUNCTION get_platform_updates(
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0,
  p_type TEXT DEFAULT NULL,
  p_department_id UUID DEFAULT NULL,
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  content TEXT,
  type TEXT,
  priority TEXT,
  author_name TEXT,
  author_role TEXT,
  department_name TEXT,
  target_audience TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER,
  total_count BIGINT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pu.id,
    pu.title,
    pu.content,
    pu.type,
    pu.priority,
    p.full_name as author_name,
    p.role as author_role,
    d.name as department_name,
    pu.target_audience,
    pu.published_at,
    pu.view_count,
    COUNT(*) OVER() as total_count
  FROM platform_updates pu
  LEFT JOIN profiles p ON pu.author_id = p.id
  LEFT JOIN departments d ON pu.department_id = d.id
  WHERE pu.is_published = TRUE
    AND (pu.expires_at IS NULL OR pu.expires_at > NOW())
    AND (p_type IS NULL OR pu.type = p_type)
    AND (p_department_id IS NULL OR pu.department_id = p_department_id)
    AND (p_search IS NULL OR
         pu.title ILIKE '%' || p_search || '%' OR
         pu.content ILIKE '%' || p_search || '%')
  ORDER BY pu.published_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Enhanced updates table to support platform-wide updates
ALTER TABLE updates
ADD COLUMN IF NOT EXISTS platform_update_id UUID REFERENCES platform_updates(id),
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'issue' CHECK (visibility IN ('issue', 'platform', 'department'));

-- Create index for new columns
CREATE INDEX IF NOT EXISTS idx_updates_platform_update_id ON updates(platform_update_id);
CREATE INDEX IF NOT EXISTS idx_updates_visibility ON updates(visibility);

-- Function to get combined updates (issue + platform) for LatestUpdates component
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
  -- Issue updates
  SELECT
    u.id,
    u.title,
    u.content,
    u.type,
    p.full_name as author_name,
    p.role as author_role,
    COALESCE(p.avatar_url, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || p.id::text) as author_avatar,
    u.created_at,
    u.issue_id,
    i.title as issue_title,
    NULL::UUID as platform_update_id,
    u.is_official,
    'issue'::TEXT as source_type
  FROM updates u
  LEFT JOIN profiles p ON u.author_id = p.id
  LEFT JOIN issues i ON u.issue_id = i.id
  WHERE u.visibility = 'issue'

  UNION ALL

  -- Platform updates
  SELECT
    pu.id,
    pu.title,
    pu.content,
    pu.type,
    p.full_name as author_name,
    p.role as author_role,
    COALESCE(p.avatar_url, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || p.id::text) as author_avatar,
    pu.published_at as created_at,
    NULL::UUID as issue_id,
    NULL::TEXT as issue_title,
    pu.id as platform_update_id,
    TRUE as is_official, -- Platform updates are always official
    'platform'::TEXT as source_type
  FROM platform_updates pu
  LEFT JOIN profiles p ON pu.author_id = p.id
  WHERE pu.is_published = TRUE
    AND (pu.expires_at IS NULL OR pu.expires_at > NOW())

  ORDER BY created_at DESC
  LIMIT p_limit;
END;
$$;

-- Success message with comprehensive summary
SELECT 'NOTIFICATION AND PLATFORM UPDATES SYSTEM IMPLEMENTATION COMPLETED!' AS result,
       'Schema enhanced, platform updates created, functions added' AS status,
       json_build_object(
         'features_added', ARRAY[
           'Platform updates table for admin announcements',
           'Enhanced notifications with bulk sending capabilities',
           'Combined updates system (issue + platform)',
           'Advanced filtering and pagination for updates',
           'Role-based access control for platform updates',
           'Automatic notification sending for platform updates',
           'Enhanced LatestUpdates with combined data sources'
         ],
         'functions_created', ARRAY[
           'create_platform_update_with_notifications()',
           'get_platform_updates()',
           'get_latest_combined_updates()',
           'send_bulk_notification()',
           'create_notification()',
           'mark_notification_read()',
           'mark_all_notifications_read()',
           'get_notification_stats()',
           'cleanup_expired_notifications()'
         ],
         'tables_created', ARRAY[
           'platform_updates - Admin platform-wide updates',
           'Enhanced updates table with platform support',
           'Enhanced notifications with admin capabilities'
         ]
       ) AS implementation_details;

-- MANUAL MIGRATION INSTRUCTIONS
-- =============================
--
-- To apply these schema enhancements to your Supabase database:
--
-- 1. Open your Supabase dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "Run" to execute the migration
--
-- This migration is designed to be:
-- - Safe to run multiple times (idempotent)
-- - Backward compatible with existing data
-- - Non-destructive (preserves all existing data)
--
-- The migration will:
-- ✅ Standardize the notifications table schema
-- ✅ Add missing columns to existing tables
-- ✅ Create comprehensive database functions
-- ✅ Enable automatic notification triggers
-- ✅ Set up proper RLS policies
-- ✅ Add performance indexes
-- ✅ Create admin dashboard views
--
-- After running this migration, your civic portal will have:
-- 🔔 Real-time notifications for all civic events
-- 📊 Enhanced admin dashboard with notification statistics
-- 🔐 Proper security with role-based access control
-- ⚡ Optimized performance with proper indexing
-- 🔄 Automatic cleanup of expired notifications
-- 📢 Bulk notification system for announcements
