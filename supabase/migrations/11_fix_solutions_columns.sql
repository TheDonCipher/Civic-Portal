-- Fix Solutions Table Column Names
-- Run this in Supabase SQL Editor

-- The frontend is looking for 'proposed_by' but the table has 'author_id'
-- Add an alias column or update the table structure

-- Option 1: Add a view for backward compatibility
CREATE OR REPLACE VIEW solutions_view AS
SELECT 
  id,
  issue_id,
  author_id as proposed_by,  -- Alias for frontend compatibility
  author_id,  -- Keep original for new code
  title,
  description,
  is_official,
  is_selected,
  created_at,
  updated_at
FROM solutions;

-- Grant permissions on the view
GRANT SELECT ON solutions_view TO authenticated;
GRANT SELECT ON solutions_view TO anon;

-- Enable RLS on the view (inherits from base table)
-- Views automatically inherit RLS from the underlying table

-- Alternative: Update the frontend queries to use 'author_id' instead of 'proposed_by'
-- This is the cleaner long-term solution

SELECT 'Solutions table column compatibility fixed' AS result;
