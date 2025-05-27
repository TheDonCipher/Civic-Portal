-- Security Hardening Migration for Civic Portal
-- This migration adds comprehensive security measures including RLS policies,
-- audit logging, and rate limiting tables.

-- Create security-related tables
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  identifier TEXT NOT NULL, -- email, IP, or user ID
  success BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop existing audit_logs table if it exists with wrong structure
DROP TABLE IF EXISTS audit_logs CASCADE;

CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_action_identifier ON rate_limits(action, identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_created_at ON rate_limits(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_event ON security_logs(event);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_operation ON audit_logs(table_name, operation);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Enhanced RLS Policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update verification status" ON profiles;
CREATE POLICY "Admins can update verification status" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Enhanced RLS Policies for issues table
DROP POLICY IF EXISTS "Users can view public issues" ON issues;
CREATE POLICY "Users can view public issues" ON issues
  FOR SELECT USING (
    status != 'draft' OR
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'official')
    )
  );

DROP POLICY IF EXISTS "Users can create issues" ON issues;
CREATE POLICY "Users can create issues" ON issues
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    author_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update their own issues" ON issues;
CREATE POLICY "Users can update their own issues" ON issues
  FOR UPDATE USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'official')
      AND (profiles.role = 'admin' OR profiles.department_id = issues.department_id)
    )
  );

DROP POLICY IF EXISTS "Only authors and admins can delete issues" ON issues;
CREATE POLICY "Only authors and admins can delete issues" ON issues
  FOR DELETE USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Enhanced RLS Policies for comments table
DROP POLICY IF EXISTS "Users can view comments on visible issues" ON comments;
CREATE POLICY "Users can view comments on visible issues" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM issues
      WHERE issues.id = comments.issue_id
      AND (
        issues.status != 'draft' OR
        issues.author_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role IN ('admin', 'official')
        )
      )
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM issues
      WHERE issues.id = comments.issue_id
      AND issues.status != 'draft'
    )
  );

DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Enhanced RLS Policies for solutions table
DROP POLICY IF EXISTS "Users can view solutions" ON solutions;
CREATE POLICY "Users can view solutions" ON solutions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM issues
      WHERE issues.id = solutions.issue_id
      AND issues.status != 'draft'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can propose solutions" ON solutions;
CREATE POLICY "Authenticated users can propose solutions" ON solutions
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    author_id = auth.uid()
  );

-- Enhanced RLS Policies for notifications table
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Security tables policies
DROP POLICY IF EXISTS "Only admins can view rate limits" ON rate_limits;
CREATE POLICY "Only admins can view rate limits" ON rate_limits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "System can insert rate limits" ON rate_limits;
CREATE POLICY "System can insert rate limits" ON rate_limits
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can view security logs" ON security_logs;
CREATE POLICY "Only admins can view security logs" ON security_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "System can insert security logs" ON security_logs;
CREATE POLICY "System can insert security logs" ON security_logs
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can view audit logs" ON audit_logs;
CREATE POLICY "Only admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Audit logging triggers
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (table_name, operation, old_data, user_id)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (table_name, operation, old_data, new_data, user_id)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, operation, new_data, user_id)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for important tables
DROP TRIGGER IF EXISTS audit_profiles_trigger ON profiles;
CREATE TRIGGER audit_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_issues_trigger ON issues;
CREATE TRIGGER audit_issues_trigger
  AFTER INSERT OR UPDATE OR DELETE ON issues
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Function to clean up old rate limit records
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old security logs
CREATE OR REPLACE FUNCTION cleanup_security_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM security_logs
  WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create rate limit table (for dynamic creation)
CREATE OR REPLACE FUNCTION create_rate_limit_table()
RETURNS void AS $$
BEGIN
  -- This function is called from the application when needed
  -- Table creation is handled above
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE rate_limits IS 'Rate limiting tracking for security';
COMMENT ON TABLE security_logs IS 'Security event logging';
COMMENT ON TABLE audit_logs IS 'Audit trail for data changes';
COMMENT ON FUNCTION audit_trigger_function() IS 'Audit logging trigger function';
COMMENT ON FUNCTION cleanup_rate_limits() IS 'Cleanup old rate limit records';
COMMENT ON FUNCTION cleanup_security_logs() IS 'Cleanup old security log records';
