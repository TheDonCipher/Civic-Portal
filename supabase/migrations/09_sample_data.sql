-- Sample Data for Testing Civic Portal
-- Run this in Supabase SQL Editor (OPTIONAL - for testing only)

-- Note: This script creates sample issues for testing
-- Only run this if you want test data in your database

-- Sample issues for testing
INSERT INTO issues (title, description, category, status, priority, location, author_id, department_id) 
SELECT 
  'Pothole on Main Street',
  'Large pothole causing damage to vehicles on Main Street near the shopping center. Needs urgent repair.',
  'Infrastructure',
  'open',
  'high',
  'Gaborone Central',
  auth.uid(),
  (SELECT id FROM departments WHERE name = 'Transport and Infrastructure' LIMIT 1)
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO issues (title, description, category, status, priority, location, author_id, department_id) 
SELECT 
  'Street Light Not Working',
  'Street light has been out for 2 weeks on Independence Avenue. Safety concern for pedestrians.',
  'Public Safety',
  'open',
  'medium',
  'Gaborone',
  auth.uid(),
  (SELECT id FROM departments WHERE name = 'Local Government and Traditional Affairs' LIMIT 1)
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO issues (title, description, category, status, priority, location, author_id, department_id) 
SELECT 
  'Water Supply Interruption',
  'Frequent water supply interruptions in Block 8. Residents have been without water for 3 days.',
  'Utilities',
  'in_progress',
  'urgent',
  'Gaborone Block 8',
  auth.uid(),
  (SELECT id FROM departments WHERE name = 'Water and Human Settlement' LIMIT 1)
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO issues (title, description, category, status, priority, location, author_id, department_id) 
SELECT 
  'Clinic Needs More Staff',
  'Local clinic is understaffed. Long waiting times for patients, especially during peak hours.',
  'Healthcare',
  'open',
  'high',
  'Francistown',
  auth.uid(),
  (SELECT id FROM departments WHERE name = 'Health' LIMIT 1)
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO issues (title, description, category, status, priority, location, author_id, department_id) 
SELECT 
  'School Playground Equipment Broken',
  'Playground equipment at primary school is broken and unsafe for children. Needs replacement.',
  'Education',
  'open',
  'medium',
  'Maun',
  auth.uid(),
  (SELECT id FROM departments WHERE name = 'Child Welfare and Basic Education' LIMIT 1)
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

-- Sample comments (only if issues exist)
INSERT INTO comments (issue_id, author_id, content)
SELECT 
  i.id,
  auth.uid(),
  'I have also noticed this issue. It really needs to be addressed soon.'
FROM issues i
WHERE auth.uid() IS NOT NULL
AND i.title = 'Pothole on Main Street'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO comments (issue_id, author_id, content)
SELECT 
  i.id,
  auth.uid(),
  'This has been a problem for months. When will it be fixed?'
FROM issues i
WHERE auth.uid() IS NOT NULL
AND i.title = 'Street Light Not Working'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Sample solutions
INSERT INTO solutions (issue_id, author_id, title, description)
SELECT 
  i.id,
  auth.uid(),
  'Temporary Road Repair',
  'Use cold patch asphalt as a temporary fix until proper road resurfacing can be scheduled.'
FROM issues i
WHERE auth.uid() IS NOT NULL
AND i.title = 'Pothole on Main Street'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO solutions (issue_id, author_id, title, description)
SELECT 
  i.id,
  auth.uid(),
  'LED Street Light Replacement',
  'Replace with energy-efficient LED street lights that have longer lifespan and better illumination.'
FROM issues i
WHERE auth.uid() IS NOT NULL
AND i.title = 'Street Light Not Working'
LIMIT 1
ON CONFLICT DO NOTHING;

SELECT 'Sample data inserted successfully (if user is authenticated)' AS result;
