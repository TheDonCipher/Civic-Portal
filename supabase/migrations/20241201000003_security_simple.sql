-- Simple Security Hardening Migration for Civic Portal
-- This migration uses the simplest approach to avoid any PL/pgSQL issues

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action TEXT NOT NULL,
    identifier TEXT NOT NULL,
    success BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create security_logs table
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Handle audit_logs table - drop and recreate if exists with wrong structure
DROP TABLE IF EXISTS audit_logs CASCADE;

CREATE TABLE audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    user_id UUID REFERENCES auth.users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rate_limits_action_identifier ON rate_limits(action, identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_created_at ON rate_limits(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_event ON security_logs(event);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_operation ON audit_logs(table_name, operation);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Enable RLS on existing tables (one by one to avoid loops)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on issues table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'issues') THEN
        ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Enable RLS on comments table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comments') THEN
        ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Enable RLS on solutions table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'solutions') THEN
        ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Enable RLS on notifications table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
        ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Enable RLS on departments table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'departments') THEN
        ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Enable RLS on security tables
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create audit trigger function
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

-- Create audit triggers for profiles table
DROP TRIGGER IF EXISTS audit_profiles_trigger ON profiles;
CREATE TRIGGER audit_profiles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Create audit triggers for issues table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'issues') THEN
        DROP TRIGGER IF EXISTS audit_issues_trigger ON issues;
        CREATE TRIGGER audit_issues_trigger
            AFTER INSERT OR UPDATE OR DELETE ON issues
            FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    END IF;
END $$;

-- Create utility functions
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits 
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION cleanup_security_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM security_logs 
  WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Add helpful comments
COMMENT ON TABLE rate_limits IS 'Rate limiting tracking for security';
COMMENT ON TABLE security_logs IS 'Security event logging';
COMMENT ON TABLE audit_logs IS 'Audit trail for data changes';
COMMENT ON FUNCTION audit_trigger_function() IS 'Audit logging trigger function';
COMMENT ON FUNCTION cleanup_rate_limits() IS 'Cleanup old rate limit records';
COMMENT ON FUNCTION cleanup_security_logs() IS 'Cleanup old security log records';

-- Success message
SELECT 'Security hardening migration completed successfully!' as result;
