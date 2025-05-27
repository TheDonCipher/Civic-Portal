-- Check Issue Categories Status
-- Run this to see the current state of your issue_categories table

-- Check if the table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'issue_categories' 
      AND table_schema = 'public'
    ) 
    THEN '✅ issue_categories table EXISTS'
    ELSE '❌ issue_categories table DOES NOT EXIST'
  END AS table_status;

-- Check if RLS is enabled
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'issue_categories' 
      AND rowsecurity = true
    )
    THEN '✅ RLS is ENABLED on issue_categories'
    ELSE '❌ RLS is NOT ENABLED on issue_categories'
  END AS rls_status;

-- Check existing policies
SELECT 
  '📋 EXISTING POLICIES:' AS policy_header,
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'issue_categories'
ORDER BY policyname;

-- Check how many categories exist
SELECT 
  '📊 CATEGORY COUNT:' AS count_header,
  COUNT(*) as total_categories,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_categories,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_categories
FROM issue_categories;

-- Check categories by department
SELECT 
  '🏢 CATEGORIES BY DEPARTMENT:' AS dept_header,
  d.name as department_name,
  COUNT(ic.id) as category_count,
  STRING_AGG(ic.name, ', ' ORDER BY ic.name) as categories
FROM departments d
LEFT JOIN issue_categories ic ON d.id = ic.department_id AND ic.is_active = true
GROUP BY d.id, d.name
ORDER BY d.name;

-- Check if departments exist
SELECT 
  '🏛️ DEPARTMENTS STATUS:' AS dept_status_header,
  COUNT(*) as total_departments,
  STRING_AGG(name, ', ' ORDER BY name) as department_names
FROM departments;

-- Sample of existing categories
SELECT 
  '📝 SAMPLE CATEGORIES:' AS sample_header,
  ic.name,
  ic.description,
  d.name as department,
  ic.color,
  ic.icon,
  ic.is_active
FROM issue_categories ic
LEFT JOIN departments d ON ic.department_id = d.id
ORDER BY d.name, ic.name
LIMIT 10;
