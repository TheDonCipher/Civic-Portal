-- Fix Function Security - Set Secure Search Path
-- This script fixes the security warning about mutable search_path

-- Drop the trigger first, then the function, then recreate both with secure search_path
DROP TRIGGER IF EXISTS update_legal_consents_updated_at_trigger ON legal_consents;
DROP FUNCTION IF EXISTS update_legal_consents_updated_at();

-- Create the function with secure search_path
CREATE OR REPLACE FUNCTION update_legal_consents_updated_at()
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

-- Recreate the trigger
CREATE TRIGGER update_legal_consents_updated_at_trigger
  BEFORE UPDATE ON legal_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_legal_consents_updated_at();

-- Also fix any other functions that might have the same issue
-- Update the verification status function if it exists
DROP FUNCTION IF EXISTS set_verification_status_on_insert_or_update();

CREATE OR REPLACE FUNCTION set_verification_status_on_insert_or_update()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
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
  END IF;

  RETURN NEW;
END;
$$;

-- Fix the departments update function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column();

CREATE OR REPLACE FUNCTION update_updated_at_column()
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

-- Success message
SELECT 'Database functions updated with secure search_path' AS result;
