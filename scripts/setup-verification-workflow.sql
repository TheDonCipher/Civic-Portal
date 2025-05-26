-- Setup script for verification workflow
-- Run this script to ensure all necessary tables and data exist

-- 1. Ensure profiles table has verification columns
DO $$
BEGIN
  -- Add verification_status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE profiles
    ADD COLUMN verification_status TEXT DEFAULT 'verified'
    CHECK (verification_status IN ('pending', 'verified', 'rejected'));

    CREATE INDEX idx_profiles_verification_status ON profiles(verification_status);
    COMMENT ON COLUMN profiles.verification_status IS 'Verification status for government officials: pending, verified, or rejected';
  END IF;

  -- Add verification_notes if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'verification_notes'
  ) THEN
    ALTER TABLE profiles
    ADD COLUMN verification_notes TEXT;

    COMMENT ON COLUMN profiles.verification_notes IS 'Notes or reasons for verification status changes, especially rejections';
  END IF;
END $$;

-- 2. Ensure notifications table exists with proper structure
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('verification_approved', 'verification_rejected', 'role_changed', 'status_change', 'general')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notifications if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_user_id') THEN
    CREATE INDEX idx_notifications_user_id ON notifications(user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_read') THEN
    CREATE INDEX idx_notifications_read ON notifications(read);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_created_at') THEN
    CREATE INDEX idx_notifications_created_at ON notifications(created_at);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_type') THEN
    CREATE INDEX idx_notifications_type ON notifications(type);
  END IF;
END $$;

-- 3. Ensure audit_logs table exists
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit_logs if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_logs_user_id') THEN
    CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_logs_action') THEN
    CREATE INDEX idx_audit_logs_action ON audit_logs(action);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_logs_resource_type') THEN
    CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_logs_created_at') THEN
    CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
  END IF;
END $$;

-- 4. Set up RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage all notifications" ON notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 5. Set up RLS policies for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON audit_logs;

-- Create RLS policies for audit_logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. Update existing official users to have pending status
UPDATE profiles
SET verification_status = 'pending'
WHERE role = 'official' AND (verification_status IS NULL OR verification_status = 'verified');

-- 7. Update existing citizen and admin users to have verified status
UPDATE profiles
SET verification_status = 'verified'
WHERE (role IN ('citizen', 'admin') OR role IS NULL) AND (verification_status IS NULL OR verification_status != 'verified');

-- 8. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;
GRANT SELECT ON notifications TO anon;
GRANT SELECT, INSERT ON audit_logs TO authenticated;
GRANT SELECT ON audit_logs TO anon;

-- 9. Create or update trigger functions
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifications updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- 10. Create function to automatically set verification status on role change
CREATE OR REPLACE FUNCTION set_verification_status_on_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update verification status if role is changing
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    CASE NEW.role
      WHEN 'official' THEN
        NEW.verification_status = 'pending';
      WHEN 'citizen' THEN
        NEW.verification_status = 'verified';
      WHEN 'admin' THEN
        NEW.verification_status = 'verified';
      ELSE
        NEW.verification_status = 'verified';
    END CASE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic verification status management
DROP TRIGGER IF EXISTS trigger_set_verification_status ON profiles;
CREATE TRIGGER trigger_set_verification_status
  BEFORE UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_verification_status_on_role_change();

-- 11. Add helpful comments
COMMENT ON TABLE notifications IS 'User notifications for verification status changes, role updates, etc.';
COMMENT ON TABLE audit_logs IS 'Audit trail for administrative actions';
COMMENT ON COLUMN notifications.user_id IS 'ID of the user who should receive the notification';
COMMENT ON COLUMN notifications.type IS 'Type of notification: verification_approved, verification_rejected, role_changed, status_change, general';
COMMENT ON COLUMN notifications.title IS 'Short title for the notification';
COMMENT ON COLUMN notifications.message IS 'Full notification message';
COMMENT ON COLUMN notifications.data IS 'Additional data related to the notification (JSON)';
COMMENT ON COLUMN notifications.read IS 'Whether the notification has been read by the user';

-- 12. Create test data (optional - uncomment if needed for testing)
/*
-- Create a test admin user (replace with actual user ID)
-- INSERT INTO profiles (id, username, full_name, role, verification_status)
-- VALUES ('admin-test-id', 'testadmin', 'Test Administrator', 'admin', 'verified')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin', verification_status = 'verified';

-- Create a test official user (replace with actual user ID)
-- INSERT INTO profiles (id, username, full_name, role, verification_status, department_id)
-- VALUES ('official-test-id', 'testofficial', 'Test Official', 'official', 'pending', 'dept-id')
-- ON CONFLICT (id) DO UPDATE SET role = 'official', verification_status = 'pending';
*/

-- Verification queries to check setup
SELECT 'Setup verification completed. Run these queries to verify:' as message;
SELECT 'SELECT column_name, data_type FROM information_schema.columns WHERE table_name = ''profiles'' AND column_name LIKE ''verification%'';' as query_1;
SELECT 'SELECT COUNT(*) as notification_count FROM notifications;' as query_2;
SELECT 'SELECT COUNT(*) as audit_log_count FROM audit_logs;' as query_3;
SELECT 'SELECT role, verification_status, COUNT(*) FROM profiles GROUP BY role, verification_status;' as query_4;
