-- Audit Logs Table for Admin Actions
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Add comment
COMMENT ON TABLE audit_logs IS 'Audit trail for administrative actions and system events';

SELECT 'Audit logs table created successfully' AS result;
