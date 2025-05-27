-- Add individual consent timestamp fields to legal_consents table
-- This migration adds separate timestamp fields for terms and privacy acceptance

-- Add the new timestamp columns
ALTER TABLE legal_consents
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_processing_accepted_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for the new timestamp fields
CREATE INDEX IF NOT EXISTS idx_legal_consents_terms_accepted_at ON legal_consents(terms_accepted_at);
CREATE INDEX IF NOT EXISTS idx_legal_consents_privacy_accepted_at ON legal_consents(privacy_accepted_at);
CREATE INDEX IF NOT EXISTS idx_legal_consents_data_processing_accepted_at ON legal_consents(data_processing_accepted_at);

-- Update existing records to populate the new timestamp fields
-- Set them to the consent_timestamp for existing records
UPDATE legal_consents
SET
  terms_accepted_at = CASE WHEN terms_accepted = true THEN consent_timestamp ELSE NULL END,
  privacy_accepted_at = CASE WHEN privacy_accepted = true THEN consent_timestamp ELSE NULL END,
  data_processing_accepted_at = CASE WHEN data_processing_consent = true THEN consent_timestamp ELSE NULL END
WHERE terms_accepted_at IS NULL OR privacy_accepted_at IS NULL OR data_processing_accepted_at IS NULL;

-- Add comments for the new columns
COMMENT ON COLUMN legal_consents.terms_accepted_at IS 'Timestamp when user accepted Terms of Service';
COMMENT ON COLUMN legal_consents.privacy_accepted_at IS 'Timestamp when user accepted Privacy Policy';
COMMENT ON COLUMN legal_consents.data_processing_accepted_at IS 'Timestamp when user accepted Data Processing Agreement';

-- Fix verification status trigger to handle INSERT operations
-- This ensures new government officials get 'pending' status during signup

-- Create or replace the verification status function to handle both INSERT and UPDATE
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

-- Drop existing trigger and create new one for both INSERT and UPDATE
DROP TRIGGER IF EXISTS trigger_set_verification_status ON profiles;
CREATE TRIGGER trigger_set_verification_status
  BEFORE INSERT OR UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_verification_status_on_insert_or_update();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Individual consent timestamp fields and verification status trigger updated successfully';
END $$;
