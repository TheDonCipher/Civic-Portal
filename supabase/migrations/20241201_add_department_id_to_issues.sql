-- Add department_id column to issues table
-- This column links issues to the responsible government department

-- Add the department_id column to issues table if it doesn't exist
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

-- Update RLS policies to include department-based access if needed
-- (This will be handled in a separate migration if required)
