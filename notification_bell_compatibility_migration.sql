-- NOTIFICATION BELL COMPATIBILITY MIGRATION
-- Ensures enhanced NotificationBell component works with existing database
-- Run this in your Supabase SQL Editor

-- Step 1: Check current state and add missing columns
DO $$
BEGIN
    RAISE NOTICE '=== NOTIFICATION BELL COMPATIBILITY MIGRATION ===';
    RAISE NOTICE 'Checking and updating notifications table schema...';
END $$;

-- Add missing columns if they don't exist
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_issue_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_comment_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_solution_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Migrate metadata to data if metadata column exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'metadata') THEN
        UPDATE notifications SET data = COALESCE(metadata, '{}') 
        WHERE data IS NULL OR data = '{}';
        RAISE NOTICE 'Migrated metadata to data column';
    END IF;
END $$;

-- Step 3: Update read_at for existing read notifications
UPDATE notifications SET read_at = updated_at 
WHERE read = TRUE AND read_at IS NULL;

-- Step 4: Create required database functions
CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE notifications 
  SET read = TRUE, read_at = NOW()
  WHERE id = p_notification_id AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION mark_all_notifications_read(
  p_user_id UUID
) RETURNS INTEGER
SECURITY DEFINER  
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE notifications 
  SET read = TRUE, read_at = NOW()
  WHERE user_id = p_user_id AND read = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;

-- Step 6: Ensure RLS policies exist
DO $$
BEGIN
    -- Enable RLS if not already enabled
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
    DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
    
    -- Create RLS policies
    CREATE POLICY "Users can view their own notifications" ON notifications
      FOR SELECT USING (user_id = auth.uid());
    
    CREATE POLICY "Users can update their own notifications" ON notifications
      FOR UPDATE USING (user_id = auth.uid());
    
    CREATE POLICY "System can insert notifications" ON notifications
      FOR INSERT WITH CHECK (true);
    
    RAISE NOTICE 'RLS policies created successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating RLS policies: %', SQLERRM;
END $$;

-- Step 7: Enable real-time (if not already enabled)
DO $$
BEGIN
    -- Add notifications table to real-time publication
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    RAISE NOTICE 'Real-time enabled for notifications table';
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Notifications table already in real-time publication';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error enabling real-time: %', SQLERRM;
END $$;

-- Step 8: Create trigger for automatic read_at updates
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

-- Step 9: Grant necessary permissions
GRANT EXECUTE ON FUNCTION mark_notification_read(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read(UUID) TO authenticated;

-- Step 10: Verification and summary
DO $$
DECLARE
    column_count INTEGER;
    function_count INTEGER;
    policy_count INTEGER;
    index_count INTEGER;
BEGIN
    -- Count required columns
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name IN (
        'id', 'user_id', 'type', 'title', 'message', 'read', 'read_at', 
        'created_at', 'data', 'related_issue_id', 'related_comment_id', 
        'related_solution_id', 'action_url', 'priority', 'expires_at'
    );
    
    -- Count required functions
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_name IN ('mark_notification_read', 'mark_all_notifications_read');
    
    -- Count RLS policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'notifications';
    
    -- Count indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE tablename = 'notifications';
    
    RAISE NOTICE '=== MIGRATION SUMMARY ===';
    RAISE NOTICE 'Required columns present: %/15', column_count;
    RAISE NOTICE 'Required functions created: %/2', function_count;
    RAISE NOTICE 'RLS policies active: %', policy_count;
    RAISE NOTICE 'Performance indexes: %', index_count;
    
    IF column_count = 15 AND function_count = 2 THEN
        RAISE NOTICE '✓ Enhanced NotificationBell component is now compatible!';
    ELSE
        RAISE NOTICE '⚠ Some compatibility issues may remain. Check the logs above.';
    END IF;
END $$;

SELECT 'Enhanced NotificationBell compatibility migration completed!' AS result;
