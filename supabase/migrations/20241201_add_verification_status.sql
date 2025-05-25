-- Add verification_status column to profiles table
-- This column tracks the verification status of government officials

-- Add the verification_status column
ALTER TABLE profiles 
ADD COLUMN verification_status TEXT DEFAULT 'verified' 
CHECK (verification_status IN ('pending', 'verified', 'rejected'));

-- Update existing official users to have pending status
UPDATE profiles 
SET verification_status = 'pending' 
WHERE role = 'official';

-- Update existing citizen and admin users to have verified status
UPDATE profiles 
SET verification_status = 'verified' 
WHERE role IN ('citizen', 'admin') OR role IS NULL;

-- Create an index for better query performance
CREATE INDEX idx_profiles_verification_status ON profiles(verification_status);

-- Add a comment to document the column
COMMENT ON COLUMN profiles.verification_status IS 'Verification status for government officials: pending, verified, or rejected';

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
