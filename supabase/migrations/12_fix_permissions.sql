-- Fix Database Permissions
-- Run this in Supabase SQL Editor

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions on all tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant permissions on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Specific table permissions
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON issues TO authenticated;
GRANT SELECT ON issues TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON comments TO authenticated;
GRANT SELECT ON comments TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON solutions TO authenticated;
GRANT SELECT ON solutions TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON updates TO authenticated;
GRANT SELECT ON updates TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON issue_votes TO authenticated;
GRANT SELECT ON issue_votes TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON solution_votes TO authenticated;
GRANT SELECT ON solution_votes TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON issue_watchers TO authenticated;
GRANT SELECT ON issue_watchers TO anon;

GRANT SELECT ON departments TO authenticated;
GRANT SELECT ON departments TO anon;

GRANT SELECT, INSERT ON legal_consents TO authenticated;

GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;

GRANT SELECT, INSERT ON audit_logs TO authenticated;

-- Grant permissions on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

SELECT 'Database permissions fixed successfully' AS result;
