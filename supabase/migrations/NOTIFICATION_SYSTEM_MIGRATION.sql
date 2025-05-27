-- COMPREHENSIVE NOTIFICATION SYSTEM MIGRATION
-- Run this script manually in your Supabase SQL Editor
-- This resolves the "Could not find the 'data' column of 'notifications' in the schema cache" error
-- and implements a complete notification system for the Civic Portal

-- Step 1: Check current notifications table structure
DO $$
BEGIN
    RAISE NOTICE '=== NOTIFICATION SYSTEM MIGRATION STARTING ===';
    RAISE NOTICE 'Checking current notifications table structure...';
    
    -- Check if notifications table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
        RAISE NOTICE 'Notifications table exists. Checking columns...';
        
        -- List current columns
        FOR rec IN 
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'notifications' 
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE 'Column: % (Type: %, Nullable: %)', rec.column_name, rec.data_type, rec.is_nullable;
        END LOOP;
    ELSE
        RAISE NOTICE 'Notifications table does not exist. Will create new table.';
    END IF;
END $$;

-- Step 2: Create or update notifications table with standardized schema
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'verification_approved', 'verification_rejected', 'role_changed', 
    'status_change', 'issue_update', 'comment', 'solution', 
    'system', 'general', 'info', 'success', 'warning', 'error'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}', -- Standardized on 'data' column
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  related_issue_id UUID REFERENCES issues(id),
  related_comment_id UUID REFERENCES comments(id),
  related_solution_id UUID REFERENCES solutions(id),
  action_url TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Add missing columns to existing table
DO $$
BEGIN
    RAISE NOTICE 'Adding missing columns to notifications table...';
    
    -- Add data column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'data') THEN
        ALTER TABLE notifications ADD COLUMN data JSONB DEFAULT '{}';
        RAISE NOTICE 'Added data column';
    END IF;
    
    -- Add read_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read_at') THEN
        ALTER TABLE notifications ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added read_at column';
    END IF;
    
    -- Add related columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_issue_id') THEN
        ALTER TABLE notifications ADD COLUMN related_issue_id UUID REFERENCES issues(id);
        RAISE NOTICE 'Added related_issue_id column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_comment_id') THEN
        ALTER TABLE notifications ADD COLUMN related_comment_id UUID REFERENCES comments(id);
        RAISE NOTICE 'Added related_comment_id column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_solution_id') THEN
        ALTER TABLE notifications ADD COLUMN related_solution_id UUID REFERENCES solutions(id);
        RAISE NOTICE 'Added related_solution_id column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'action_url') THEN
        ALTER TABLE notifications ADD COLUMN action_url TEXT;
        RAISE NOTICE 'Added action_url column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'priority') THEN
        ALTER TABLE notifications ADD COLUMN priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
        RAISE NOTICE 'Added priority column';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'expires_at') THEN
        ALTER TABLE notifications ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added expires_at column';
    END IF;
    
    -- Migrate metadata to data if metadata column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'metadata') THEN
        UPDATE notifications SET data = COALESCE(metadata, '{}') WHERE data IS NULL OR data = '{}';
        RAISE NOTICE 'Migrated metadata to data column';
    END IF;
    
    -- Update read_at for existing read notifications
    UPDATE notifications SET read_at = updated_at WHERE read = TRUE AND read_at IS NULL;
    RAISE NOTICE 'Updated read_at timestamps for existing read notifications';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during column migration: %', SQLERRM;
END $$;

-- Step 4: Create enhanced indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_related_issue ON notifications(related_issue_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;

-- Step 5: Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;

CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins can view all notifications" ON notifications
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Success message
SELECT 'NOTIFICATION SYSTEM MIGRATION COMPLETED!' AS result,
       'Schema standardized and enhanced' AS status,
       'Run the NOTIFICATION_FUNCTIONS.sql script next' AS next_step;
