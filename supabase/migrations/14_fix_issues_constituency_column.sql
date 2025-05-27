-- Fix Issues Table - Add Missing Constituency Column
-- Run this in Supabase SQL Editor

-- Add the missing 'constituency' column to the issues table
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS constituency TEXT;

-- Create index for the constituency column
CREATE INDEX IF NOT EXISTS idx_issues_constituency ON issues(constituency);

-- Add comment for the new column
COMMENT ON COLUMN issues.constituency IS 'Constituency where the issue is located';

SELECT 'Issues table constituency column added successfully' AS result;
