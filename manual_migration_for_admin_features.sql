-- Manual Migration Script for Admin Features
-- Run this in the Supabase SQL Editor to enable notifications and audit logging

-- =====================================================
-- 1. CREATE NOTIFICATIONS TABLE
-- =====================================================

-- Create the notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('verification_approved', 'verification_rejected', 'role_changed', 'general')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;
CREATE POLICY "Authenticated users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
CREATE POLICY "Admins can manage all notifications" ON notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- 2. CREATE AUDIT LOGS TABLE
-- =====================================================

-- Create the audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);

-- Enable Row Level Security (RLS)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for audit logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON audit_logs;
CREATE POLICY "Authenticated users can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- 3. GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions for notifications
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;
GRANT SELECT ON notifications TO anon;

-- Grant necessary permissions for audit logs
GRANT SELECT, INSERT ON audit_logs TO authenticated;

-- =====================================================
-- 4. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE notifications IS 'User notifications for verification status changes, role updates, etc.';
COMMENT ON COLUMN notifications.user_id IS 'ID of the user who should receive the notification';
COMMENT ON COLUMN notifications.type IS 'Type of notification: verification_approved, verification_rejected, role_changed, general';
COMMENT ON COLUMN notifications.title IS 'Short title for the notification';
COMMENT ON COLUMN notifications.message IS 'Full notification message';
COMMENT ON COLUMN notifications.data IS 'Additional data related to the notification (JSON)';
COMMENT ON COLUMN notifications.read IS 'Whether the notification has been read by the user';

COMMENT ON TABLE audit_logs IS 'Audit trail for administrative actions and system events';
COMMENT ON COLUMN audit_logs.action IS 'Type of action performed (e.g., verification_update, role_update)';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected (e.g., user_management, issue_management)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the specific resource affected';
COMMENT ON COLUMN audit_logs.user_id IS 'ID of the user who performed the action';
COMMENT ON COLUMN audit_logs.details IS 'Additional details about the action (JSON)';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the user who performed the action';
COMMENT ON COLUMN audit_logs.user_agent IS 'User agent string of the client';

-- =====================================================
-- 5. FIX DEPARTMENT ASSIGNMENT DURING SIGNUP
-- =====================================================

-- Create a function to convert department names to department IDs
CREATE OR REPLACE FUNCTION convert_department_name_to_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If department field is set but department_id is not, convert name to ID
  IF NEW.department IS NOT NULL AND NEW.department_id IS NULL THEN
    SELECT id INTO NEW.department_id
    FROM departments
    WHERE name = NEW.department;

    -- Clear the department name field since we now have the ID
    NEW.department := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically convert department names to IDs
DROP TRIGGER IF EXISTS trigger_convert_department_name ON profiles;
CREATE TRIGGER trigger_convert_department_name
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION convert_department_name_to_id();

-- Update existing profiles that have department names but no department_id
UPDATE profiles
SET department_id = departments.id
FROM departments
WHERE profiles.department = departments.name
AND profiles.department_id IS NULL;

-- Clear department names now that we have IDs
UPDATE profiles
SET department = NULL
WHERE department_id IS NOT NULL;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- This migration adds:
-- 1. notifications table for user notifications
-- 2. audit_logs table for tracking admin actions
-- 3. Proper RLS policies for security
-- 4. Indexes for performance
-- 5. Triggers for automatic timestamp updates
-- 6. Department name to ID conversion system
