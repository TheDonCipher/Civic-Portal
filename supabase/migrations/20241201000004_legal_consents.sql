-- Legal Consents Migration for Civic Portal
-- This migration creates the legal_consents table for storing user consent records

-- Create legal_consents table
CREATE TABLE IF NOT EXISTS legal_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  terms_version TEXT NOT NULL,
  privacy_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  privacy_version TEXT NOT NULL,
  data_processing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  data_processing_version TEXT NOT NULL,
  marketing_opt_in BOOLEAN DEFAULT FALSE,
  consent_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_legal_consents_user_id ON legal_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_consents_timestamp ON legal_consents(consent_timestamp);
CREATE INDEX IF NOT EXISTS idx_legal_consents_terms_version ON legal_consents(terms_version);
CREATE INDEX IF NOT EXISTS idx_legal_consents_privacy_version ON legal_consents(privacy_version);

-- Enable RLS
ALTER TABLE legal_consents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for legal_consents
-- Users can only view their own consent records
CREATE POLICY "Users can view own consent records" ON legal_consents
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own consent records
CREATE POLICY "Users can insert own consent records" ON legal_consents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all consent records for compliance
CREATE POLICY "Admins can view all consent records" ON legal_consents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_legal_consents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_legal_consents_updated_at_trigger
  BEFORE UPDATE ON legal_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_legal_consents_updated_at();

-- Add table comment
COMMENT ON TABLE legal_consents IS 'Legal consent records for Terms of Service, Privacy Policy, and Data Processing agreements';

-- Grant necessary permissions
GRANT SELECT, INSERT ON legal_consents TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Legal consents table created successfully with RLS policies';
END $$;
