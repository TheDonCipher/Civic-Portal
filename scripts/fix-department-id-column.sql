-- URGENT FIX: Add missing department_id column to issues table
-- Run this in Supabase SQL Editor to fix the stakeholder dashboard errors

-- Step 1: Add department_id column to issues table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'issues' AND column_name = 'department_id'
  ) THEN
    -- Add the department_id column
    ALTER TABLE issues ADD COLUMN department_id UUID REFERENCES departments(id);
    
    -- Create an index for better query performance
    CREATE INDEX idx_issues_department_id ON issues(department_id);
    
    -- Add a comment to document the column
    COMMENT ON COLUMN issues.department_id IS 'Department responsible for handling this issue';
    
    RAISE NOTICE 'Added department_id column to issues table';
  ELSE
    RAISE NOTICE 'department_id column already exists in issues table';
  END IF;
END $$;

-- Step 2: Verify the column was added
SELECT 
  'Issues table columns:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'issues' 
ORDER BY ordinal_position;

-- Step 3: Check if we have any existing issues
SELECT 
  'Existing issues count:' as info,
  COUNT(*) as total_issues
FROM issues;

-- Step 4: Show sample of issues table structure
SELECT 
  'Sample issues (first 3):' as info,
  id,
  title,
  category,
  department_id,
  created_at
FROM issues 
ORDER BY created_at DESC 
LIMIT 3;

RAISE NOTICE 'Fix completed! The stakeholder dashboard should now work properly.';
