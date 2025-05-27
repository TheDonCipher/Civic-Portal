-- Manual migration script to apply user management fixes
-- Run this in your Supabase SQL Editor to apply all fixes

-- 1. Add individual consent timestamp fields to legal_consents table
ALTER TABLE legal_consents 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_processing_accepted_at TIMESTAMP WITH TIME ZONE;

-- 2. Create indexes for the new timestamp fields
CREATE INDEX IF NOT EXISTS idx_legal_consents_terms_accepted_at ON legal_consents(terms_accepted_at);
CREATE INDEX IF NOT EXISTS idx_legal_consents_privacy_accepted_at ON legal_consents(privacy_accepted_at);
CREATE INDEX IF NOT EXISTS idx_legal_consents_data_processing_accepted_at ON legal_consents(data_processing_accepted_at);

-- 3. Update existing records to populate the new timestamp fields
-- Set them to the consent_timestamp for existing records
UPDATE legal_consents 
SET 
  terms_accepted_at = CASE WHEN terms_accepted = true THEN consent_timestamp ELSE NULL END,
  privacy_accepted_at = CASE WHEN privacy_accepted = true THEN consent_timestamp ELSE NULL END,
  data_processing_accepted_at = CASE WHEN data_processing_consent = true THEN consent_timestamp ELSE NULL END
WHERE terms_accepted_at IS NULL OR privacy_accepted_at IS NULL OR data_processing_accepted_at IS NULL;

-- 4. Add comments for the new columns
COMMENT ON COLUMN legal_consents.terms_accepted_at IS 'Timestamp when user accepted Terms of Service';
COMMENT ON COLUMN legal_consents.privacy_accepted_at IS 'Timestamp when user accepted Privacy Policy';
COMMENT ON COLUMN legal_consents.data_processing_accepted_at IS 'Timestamp when user accepted Data Processing Agreement';

-- 5. Create or replace the verification status function to handle both INSERT and UPDATE
CREATE OR REPLACE FUNCTION set_verification_status_on_insert_or_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT operations (new user signup)
  IF TG_OP = 'INSERT' THEN
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
    
    RAISE NOTICE 'Set verification status for new user % with role % to %', NEW.id, NEW.role, NEW.verification_status;
  
  -- Handle UPDATE operations (role changes)
  ELSIF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
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
    
    RAISE NOTICE 'Updated verification status for user % from role % to % with status %', NEW.id, OLD.role, NEW.role, NEW.verification_status;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Drop existing trigger and create new one for both INSERT and UPDATE
DROP TRIGGER IF EXISTS trigger_set_verification_status ON profiles;
CREATE TRIGGER trigger_set_verification_status
  BEFORE INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_verification_status_on_insert_or_update();

-- 7. Verify the trigger was created successfully
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_set_verification_status';

-- 8. Check that the function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'set_verification_status_on_insert_or_update';

-- 9. Update any existing officials who might have incorrect verification status
-- This ensures existing data is consistent with the new rules
UPDATE profiles 
SET verification_status = 'pending' 
WHERE role = 'official' 
  AND verification_status = 'verified'
  AND created_at > NOW() - INTERVAL '7 days'; -- Only update recent records to be safe

-- 10. Verify the changes
SELECT 
  'Migration Applied Successfully' as status,
  NOW() as applied_at;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'User management fixes applied successfully!';
  RAISE NOTICE 'New government officials will now get pending verification status automatically.';
  RAISE NOTICE 'Legal consent individual timestamps are now supported.';
  RAISE NOTICE 'Run the check-user-management-status.sql script to verify everything is working.';
END $$;
