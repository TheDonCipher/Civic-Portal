-- Database Connection and Status Test
-- Run this FIRST in Supabase SQL Editor to verify connection

-- Test basic database functionality
SELECT 'Database connection successful' AS status, NOW() AS timestamp;

-- Check if auth schema exists and is accessible
SELECT 'Auth schema accessible' AS auth_status 
FROM information_schema.schemata 
WHERE schema_name = 'auth';

-- List all tables in public schema
SELECT 
  'Tables in public schema:' AS info,
  string_agg(table_name, ', ') AS tables
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check if auth.users table is accessible
SELECT 
  'Auth users table status:' AS info,
  COUNT(*) AS user_count
FROM auth.users;

-- Check current user authentication
SELECT 
  'Current user:' AS info,
  auth.uid() AS user_id,
  auth.email() AS user_email;

-- Test if we can create a simple table
CREATE TABLE IF NOT EXISTS connection_test (
  id SERIAL PRIMARY KEY,
  test_message TEXT DEFAULT 'Connection working',
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO connection_test (test_message) VALUES ('Database is responsive');

SELECT * FROM connection_test ORDER BY created_at DESC LIMIT 1;

-- Clean up test table
DROP TABLE connection_test;

SELECT 'All connection tests completed successfully' AS final_status;
