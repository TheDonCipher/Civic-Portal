-- Add thumbnails array to issues table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'issues' AND column_name = 'thumbnails') THEN
    ALTER TABLE issues ADD COLUMN thumbnails TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Migrate existing thumbnail data to thumbnails array
UPDATE issues 
SET thumbnails = ARRAY[thumbnail] 
WHERE thumbnail IS NOT NULL AND (thumbnails IS NULL OR array_length(thumbnails, 1) IS NULL);

-- Create or replace function to get first thumbnail from array
CREATE OR REPLACE FUNCTION get_first_thumbnail(thumbnails TEXT[]) 
RETURNS TEXT AS $$
BEGIN
  IF thumbnails IS NULL OR array_length(thumbnails, 1) IS NULL THEN
    RETURN NULL;
  ELSE
    RETURN thumbnails[1];
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies to include thumbnails
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS issues_select_policy ON issues;
CREATE POLICY issues_select_policy ON issues
  FOR SELECT USING (true);

DROP POLICY IF EXISTS issues_insert_policy ON issues;
CREATE POLICY issues_insert_policy ON issues
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS issues_update_policy ON issues;
CREATE POLICY issues_update_policy ON issues
  FOR UPDATE USING (auth.uid() = author_id OR 
                   auth.uid() IN (SELECT id FROM profiles WHERE role = 'official' OR role = 'admin'));

DROP POLICY IF EXISTS issues_delete_policy ON issues;
CREATE POLICY issues_delete_policy ON issues
  FOR DELETE USING (auth.uid() = author_id OR 
                   auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
