-- Safe update script for verification workflow
-- This script only adds missing components without recreating existing ones

-- 1. Add verification_notes column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'verification_notes'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN verification_notes TEXT;
    
    COMMENT ON COLUMN profiles.verification_notes IS 'Notes or reasons for verification status changes, especially rejections';
    
    RAISE NOTICE 'Added verification_notes column to profiles table';
  ELSE
    RAISE NOTICE 'verification_notes column already exists in profiles table';
  END IF;
END $$;

-- 2. Update notification type constraint to include status_change if needed
DO $$
BEGIN
  -- Check if the constraint allows status_change
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name LIKE '%notifications_type_check%' 
    AND check_clause LIKE '%status_change%'
  ) THEN
    -- Drop the old constraint
    ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
    
    -- Add the new constraint with status_change
    ALTER TABLE notifications 
    ADD CONSTRAINT notifications_type_check 
    CHECK (type IN ('verification_approved', 'verification_rejected', 'role_changed', 'status_change', 'general'));
    
    RAISE NOTICE 'Updated notifications type constraint to include status_change';
  ELSE
    RAISE NOTICE 'Notifications type constraint already includes status_change';
  END IF;
END $$;

-- 3. Ensure verification_status has proper values for existing users
DO $$
DECLARE
  updated_officials INTEGER;
  updated_others INTEGER;
BEGIN
  -- Update officials to pending if they don't have a verification status
  UPDATE profiles 
  SET verification_status = 'pending' 
  WHERE role = 'official' 
    AND (verification_status IS NULL OR verification_status = 'verified');
  
  GET DIAGNOSTICS updated_officials = ROW_COUNT;
  
  -- Update non-officials to verified if they don't have a verification status
  UPDATE profiles 
  SET verification_status = 'verified' 
  WHERE (role IN ('citizen', 'admin') OR role IS NULL) 
    AND (verification_status IS NULL OR verification_status != 'verified');
  
  GET DIAGNOSTICS updated_others = ROW_COUNT;
  
  RAISE NOTICE 'Updated % officials to pending status', updated_officials;
  RAISE NOTICE 'Updated % non-officials to verified status', updated_others;
END $$;

-- 4. Create or update trigger function for verification status
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
    
    RAISE NOTICE 'Updated verification status for user % from role % to %', NEW.id, OLD.role, NEW.role;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'trigger_set_verification_status'
  ) THEN
    CREATE TRIGGER trigger_set_verification_status
      BEFORE UPDATE OF role ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION set_verification_status_on_role_change();
    
    RAISE NOTICE 'Created trigger for automatic verification status management';
  ELSE
    RAISE NOTICE 'Verification status trigger already exists';
  END IF;
END $$;

-- 6. Ensure RLS policies are properly set up for notifications
DO $$
BEGIN
  -- Enable RLS if not already enabled
  ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
  
  -- Check and create policies if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'Users can view their own notifications'
  ) THEN
    CREATE POLICY "Users can view their own notifications" ON notifications
      FOR SELECT USING (auth.uid() = user_id);
    RAISE NOTICE 'Created policy: Users can view their own notifications';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'Users can update their own notifications'
  ) THEN
    CREATE POLICY "Users can update their own notifications" ON notifications
      FOR UPDATE USING (auth.uid() = user_id);
    RAISE NOTICE 'Created policy: Users can update their own notifications';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'Authenticated users can insert notifications'
  ) THEN
    CREATE POLICY "Authenticated users can insert notifications" ON notifications
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    RAISE NOTICE 'Created policy: Authenticated users can insert notifications';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND policyname = 'Admins can manage all notifications'
  ) THEN
    CREATE POLICY "Admins can manage all notifications" ON notifications
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = 'admin'
        )
      );
    RAISE NOTICE 'Created policy: Admins can manage all notifications';
  END IF;
END $$;

-- 7. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;
GRANT SELECT ON notifications TO anon;

-- 8. Verification summary
DO $$
DECLARE
  profile_count INTEGER;
  notification_count INTEGER;
  audit_count INTEGER;
  pending_officials INTEGER;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM profiles;
  SELECT COUNT(*) INTO notification_count FROM notifications;
  SELECT COUNT(*) INTO audit_count FROM audit_logs;
  SELECT COUNT(*) INTO pending_officials FROM profiles WHERE role = 'official' AND verification_status = 'pending';
  
  RAISE NOTICE '=== Verification Workflow Setup Summary ===';
  RAISE NOTICE 'Total profiles: %', profile_count;
  RAISE NOTICE 'Total notifications: %', notification_count;
  RAISE NOTICE 'Total audit logs: %', audit_count;
  RAISE NOTICE 'Pending officials: %', pending_officials;
  RAISE NOTICE '=== Setup Complete ===';
END $$;

-- 9. Show current verification status distribution
SELECT 
  role,
  verification_status,
  COUNT(*) as count
FROM profiles 
WHERE role IS NOT NULL
GROUP BY role, verification_status
ORDER BY role, verification_status;
