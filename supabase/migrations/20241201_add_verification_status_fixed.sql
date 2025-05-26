-- Add verification_status column to profiles table
-- This column tracks the verification status of government officials

-- Check if verification_status column exists, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'verification_status'
  ) THEN
    -- Add the verification_status column
    ALTER TABLE profiles
    ADD COLUMN verification_status TEXT DEFAULT 'verified'
    CHECK (verification_status IN ('pending', 'verified', 'rejected'));

    -- Create an index for better query performance
    CREATE INDEX idx_profiles_verification_status ON profiles(verification_status);

    -- Add a comment to document the column
    COMMENT ON COLUMN profiles.verification_status IS 'Verification status for government officials: pending, verified, or rejected';
  END IF;
END $$;

-- Check if verification_notes column exists, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'verification_notes'
  ) THEN
    -- Add the verification_notes column for storing rejection reasons
    ALTER TABLE profiles
    ADD COLUMN verification_notes TEXT;

    -- Add a comment to document the column
    COMMENT ON COLUMN profiles.verification_notes IS 'Notes or reasons for verification status changes, especially rejections';
  END IF;
END $$;

-- Update existing official users to have pending status
UPDATE profiles
SET verification_status = 'pending'
WHERE role = 'official' AND verification_status = 'verified';

-- Update existing citizen and admin users to have verified status
UPDATE profiles
SET verification_status = 'verified'
WHERE (role IN ('citizen', 'admin') OR role IS NULL) AND verification_status != 'verified';

-- Create a function to automatically set verification status based on role
CREATE OR REPLACE FUNCTION set_verification_status_on_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is being changed to official, set verification to pending
  IF NEW.role = 'official' AND (OLD.role IS NULL OR OLD.role != 'official') THEN
    NEW.verification_status = 'pending';
  -- If role is being changed from official to something else, set to verified
  ELSIF OLD.role = 'official' AND NEW.role != 'official' THEN
    NEW.verification_status = 'verified';
  -- If role is being set to citizen or admin, ensure verified status
  ELSIF NEW.role IN ('citizen', 'admin') THEN
    NEW.verification_status = 'verified';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically manage verification status
DROP TRIGGER IF EXISTS trigger_set_verification_status ON profiles;
CREATE TRIGGER trigger_set_verification_status
  BEFORE UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_verification_status_on_role_change();

-- Grant necessary permissions
GRANT SELECT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;
