-- Migration to create issue_categories table and establish relationship with departments

-- Create issue_categories table
CREATE TABLE IF NOT EXISTS issue_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  department_id UUID REFERENCES departments(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add department_id to issues table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'issues' AND column_name = 'department_id') THEN
    ALTER TABLE issues ADD COLUMN department_id UUID REFERENCES departments(id);
  END IF;
END $$;

-- Create index on department_id in issues table
CREATE INDEX IF NOT EXISTS idx_issues_department_id ON issues(department_id);

-- Create index on department_id in issue_categories table
CREATE INDEX IF NOT EXISTS idx_issue_categories_department_id ON issue_categories(department_id);

-- Insert standard categories mapped to appropriate departments
INSERT INTO issue_categories (name, description, department_id)
VALUES 
  -- Transport and Infrastructure Ministry
  ('Roads', 'Issues related to road maintenance, potholes, and road infrastructure', (SELECT id FROM departments WHERE name = 'Transport and Infrastructure')),
  ('Public Transport', 'Issues related to public transportation services and infrastructure', (SELECT id FROM departments WHERE name = 'Transport and Infrastructure')),
  ('Infrastructure', 'General infrastructure issues including bridges, public buildings, etc.', (SELECT id FROM departments WHERE name = 'Transport and Infrastructure')),
  
  -- Environment and Tourism Ministry
  ('Environment', 'Environmental issues including pollution, waste management, and conservation', (SELECT id FROM departments WHERE name = 'Environment and Tourism')),
  ('Wildlife', 'Issues related to wildlife management and conservation', (SELECT id FROM departments WHERE name = 'Environment and Tourism')),
  ('Tourism', 'Issues affecting tourism sites and services', (SELECT id FROM departments WHERE name = 'Environment and Tourism')),
  
  -- Justice and Correctional Services Ministry
  ('Safety', 'Public safety concerns including crime and security issues', (SELECT id FROM departments WHERE name = 'Justice and Correctional Services')),
  ('Legal Services', 'Issues related to legal services and access to justice', (SELECT id FROM departments WHERE name = 'Justice and Correctional Services')),
  
  -- Local Government and Traditional Affairs Ministry
  ('Community', 'Community development and social issues', (SELECT id FROM departments WHERE name = 'Local Government and Traditional Affairs')),
  ('Traditional Affairs', 'Issues related to traditional leadership and cultural matters', (SELECT id FROM departments WHERE name = 'Local Government and Traditional Affairs')),
  
  -- Water and Human Settlement Ministry
  ('Water Supply', 'Issues related to water supply and access', (SELECT id FROM departments WHERE name = 'Water and Human Settlement')),
  ('Housing', 'Issues related to public housing and settlements', (SELECT id FROM departments WHERE name = 'Water and Human Settlement')),
  
  -- Health Ministry
  ('Healthcare', 'Issues related to healthcare services and facilities', (SELECT id FROM departments WHERE name = 'Health')),
  ('Public Health', 'Public health concerns including sanitation and disease prevention', (SELECT id FROM departments WHERE name = 'Health')),
  
  -- Education Ministries
  ('Schools', 'Issues related to primary and secondary education facilities', (SELECT id FROM departments WHERE name = 'Child Welfare and Basic Education')),
  ('Higher Education', 'Issues related to universities and colleges', (SELECT id FROM departments WHERE name = 'Higher Education')),
  
  -- Minerals and Energy Ministry
  ('Energy', 'Issues related to electricity supply and energy services', (SELECT id FROM departments WHERE name = 'Minerals and Energy')),
  ('Mining', 'Issues related to mining operations and their impact', (SELECT id FROM departments WHERE name = 'Minerals and Energy'))
ON CONFLICT (name) DO UPDATE SET
  department_id = EXCLUDED.department_id,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Update existing issues to set department_id based on their category
UPDATE issues i
SET department_id = ic.department_id
FROM issue_categories ic
WHERE i.category = ic.name AND i.department_id IS NULL;

-- For any issues with categories not in the issue_categories table,
-- map them to appropriate departments based on best guess
UPDATE issues
SET department_id = (SELECT id FROM departments WHERE name = 'Transport and Infrastructure')
WHERE category ILIKE '%infrastructure%' AND department_id IS NULL;

UPDATE issues
SET department_id = (SELECT id FROM departments WHERE name = 'Environment and Tourism')
WHERE category ILIKE '%environment%' AND department_id IS NULL;

UPDATE issues
SET department_id = (SELECT id FROM departments WHERE name = 'Justice and Correctional Services')
WHERE category ILIKE '%safety%' AND department_id IS NULL;

UPDATE issues
SET department_id = (SELECT id FROM departments WHERE name = 'Local Government and Traditional Affairs')
WHERE category ILIKE '%community%' AND department_id IS NULL;

-- For any remaining issues without a department, assign to State Presidency as a fallback
UPDATE issues
SET department_id = (SELECT id FROM departments WHERE name = 'State Presidency')
WHERE department_id IS NULL;

-- Create a function to get categories for a specific department
CREATE OR REPLACE FUNCTION get_categories_by_department(dept_id UUID)
RETURNS TABLE (id UUID, name TEXT, description TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT ic.id, ic.name, ic.description
  FROM issue_categories ic
  WHERE ic.department_id = dept_id
  ORDER BY ic.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view to show issues with their department information
CREATE OR REPLACE VIEW issues_with_departments AS
SELECT 
  i.*,
  d.name as department_name,
  ic.name as category_name
FROM 
  issues i
LEFT JOIN 
  departments d ON i.department_id = d.id
LEFT JOIN 
  issue_categories ic ON i.category = ic.name;

-- Enable RLS on issue_categories table
ALTER TABLE issue_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to issue_categories
CREATE POLICY "Allow public read access to issue_categories"
  ON issue_categories FOR SELECT USING (true);

-- Log completion of the migration
DO $$ 
BEGIN
  RAISE NOTICE 'Migration completed: Created issue_categories table and established relationship with departments';
END $$;
