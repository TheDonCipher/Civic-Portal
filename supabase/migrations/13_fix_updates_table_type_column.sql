-- Fix Updates Table - Add Missing Type Column
-- Run this in Supabase SQL Editor to fix the missing 'type' column

-- Add the missing 'type' column to the updates table
ALTER TABLE updates 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'update' CHECK (type IN ('update', 'status_change', 'official', 'system'));

-- Create index for the type column
CREATE INDEX IF NOT EXISTS idx_updates_type ON updates(type);

-- Update existing records to have a proper type
UPDATE updates 
SET type = CASE 
  WHEN is_official = true THEN 'official'
  ELSE 'update'
END
WHERE type IS NULL OR type = '';

-- Add comment for the new column
COMMENT ON COLUMN updates.type IS 'Type of update: update, status_change, official, or system';

SELECT 'Updates table type column added successfully' AS result;
