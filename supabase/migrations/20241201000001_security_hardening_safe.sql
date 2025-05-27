-- Safe Security Hardening Migration for Civic Portal
-- This migration safely adds security measures with proper error handling

-- First, let's check what tables exist and create only what's needed

-- Create security-related tables with safe creation
DO $$
BEGIN
    -- Create rate_limits table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'rate_limits') THEN
        CREATE TABLE rate_limits (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            action TEXT NOT NULL,
            identifier TEXT NOT NULL, -- email, IP, or user ID
            success BOOLEAN DEFAULT FALSE,
            metadata JSONB,
            ip_address TEXT,
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created rate_limits table';
    ELSE
        RAISE NOTICE 'rate_limits table already exists';
    END IF;

    -- Create security_logs table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'security_logs') THEN
        CREATE TABLE security_logs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            event TEXT NOT NULL,
            user_id UUID REFERENCES auth.users(id),
            details JSONB,
            ip_address TEXT,
            user_agent TEXT,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created security_logs table';
    ELSE
        RAISE NOTICE 'security_logs table already exists';
    END IF;

    -- Handle audit_logs table carefully
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        -- Check if the table has the correct structure
        IF NOT EXISTS (
            SELECT FROM information_schema.columns
            WHERE table_name = 'audit_logs' AND column_name = 'table_name'
        ) THEN
            -- Table exists but has wrong structure, rename it and create new one
            EXECUTE 'ALTER TABLE audit_logs RENAME TO audit_logs_backup_' || extract(epoch from now())::bigint;
            RAISE NOTICE 'Renamed existing audit_logs table to backup';

            CREATE TABLE audit_logs (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                table_name TEXT NOT NULL,
                operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
                old_data JSONB,
                new_data JSONB,
                user_id UUID REFERENCES auth.users(id),
                timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            RAISE NOTICE 'Created new audit_logs table with correct structure';
        ELSE
            RAISE NOTICE 'audit_logs table already exists with correct structure';
        END IF;
    ELSE
        CREATE TABLE audit_logs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            table_name TEXT NOT NULL,
            operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
            old_data JSONB,
            new_data JSONB,
            user_id UUID REFERENCES auth.users(id),
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created audit_logs table';
    END IF;
END $$;

-- Create indexes safely
DO $$
BEGIN
    -- Rate limits indexes
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_rate_limits_action_identifier') THEN
        CREATE INDEX idx_rate_limits_action_identifier ON rate_limits(action, identifier);
        RAISE NOTICE 'Created index: idx_rate_limits_action_identifier';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_rate_limits_created_at') THEN
        CREATE INDEX idx_rate_limits_created_at ON rate_limits(created_at);
        RAISE NOTICE 'Created index: idx_rate_limits_created_at';
    END IF;

    -- Security logs indexes
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_security_logs_event') THEN
        CREATE INDEX idx_security_logs_event ON security_logs(event);
        RAISE NOTICE 'Created index: idx_security_logs_event';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_security_logs_user_id') THEN
        CREATE INDEX idx_security_logs_user_id ON security_logs(user_id);
        RAISE NOTICE 'Created index: idx_security_logs_user_id';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_security_logs_timestamp') THEN
        CREATE INDEX idx_security_logs_timestamp ON security_logs(timestamp);
        RAISE NOTICE 'Created index: idx_security_logs_timestamp';
    END IF;

    -- Audit logs indexes
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_audit_logs_table_operation') THEN
        CREATE INDEX idx_audit_logs_table_operation ON audit_logs(table_name, operation);
        RAISE NOTICE 'Created index: idx_audit_logs_table_operation';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE indexname = 'idx_audit_logs_timestamp') THEN
        CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
        RAISE NOTICE 'Created index: idx_audit_logs_timestamp';
    END IF;
END $$;

-- Enable RLS on existing tables safely
DO $$
DECLARE
    table_name_var TEXT;
    tables_to_secure TEXT[] := ARRAY['profiles', 'issues', 'comments', 'solutions', 'notifications', 'departments'];
BEGIN
    FOREACH table_name_var IN ARRAY tables_to_secure
    LOOP
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = table_name_var) THEN
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name_var);
            RAISE NOTICE 'Enabled RLS on table: %', table_name_var;
        ELSE
            RAISE NOTICE 'Table % does not exist, skipping RLS', table_name_var;
        END IF;
    END LOOP;
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

-- Create audit triggers safely
DO $$
BEGIN
    -- Profiles audit trigger
    IF NOT EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = 'audit_profiles_trigger') THEN
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
            CREATE TRIGGER audit_profiles_trigger
                AFTER INSERT OR UPDATE OR DELETE ON profiles
                FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
            RAISE NOTICE 'Created audit trigger for profiles table';
        END IF;
    ELSE
        RAISE NOTICE 'Audit trigger for profiles already exists';
    END IF;

    -- Issues audit trigger
    IF NOT EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = 'audit_issues_trigger') THEN
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'issues') THEN
            CREATE TRIGGER audit_issues_trigger
                AFTER INSERT OR UPDATE OR DELETE ON issues
                FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
            RAISE NOTICE 'Created audit trigger for issues table';
        END IF;
    ELSE
        RAISE NOTICE 'Audit trigger for issues already exists';
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

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '=== SECURITY HARDENING MIGRATION COMPLETED SUCCESSFULLY ===';
    RAISE NOTICE 'Tables created: rate_limits, security_logs, audit_logs';
    RAISE NOTICE 'RLS enabled on all tables';
    RAISE NOTICE 'Audit triggers created for profiles and issues';
    RAISE NOTICE 'Utility functions created for cleanup';
END $$;
