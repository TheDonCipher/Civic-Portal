-- Sample Data for Reports Enhancement
-- Run this AFTER running reports_enhancement.sql to populate sample data
-- This provides realistic data for testing reports functionality

-- Update existing issues with constituency and response time data
UPDATE issues SET
  constituency = CASE
    WHEN location LIKE '%Gaborone%' THEN 'Gaborone Central'
    WHEN location LIKE '%Francistown%' THEN 'Francistown East'
    WHEN location LIKE '%Maun%' THEN 'Maun West'
    WHEN location LIKE '%Palapye%' THEN 'Palapye'
    ELSE 'Other'
  END,
  first_response_at = CASE
    WHEN status != 'open' THEN created_at + INTERVAL '1 day' + (RANDOM() * INTERVAL '3 days')
    ELSE NULL
  END
WHERE constituency IS NULL;

-- Sample updates for existing issues (only if issues exist)
DO $$
DECLARE
    issue_record RECORD;
    official_record RECORD;
BEGIN
    -- Only insert updates if we have issues and officials
    IF (SELECT COUNT(*) FROM issues) > 0 AND (SELECT COUNT(*) FROM profiles WHERE role = 'official') > 0 THEN

        -- Get first available issue and official for water-related update
        SELECT i.id as issue_id, p.id as official_id
        INTO issue_record
        FROM issues i
        CROSS JOIN profiles p
        WHERE p.role = 'official'
        LIMIT 1;

        IF FOUND THEN
            INSERT INTO updates (issue_id, author_id, title, content, is_official) VALUES
            (issue_record.issue_id, issue_record.official_id,
             'Status Update from Department',
             'We have received this issue report and our team is currently reviewing the situation. We will provide updates as work progresses.',
             true)
            ON CONFLICT DO NOTHING;
        END IF;

        -- Add more generic updates if we have multiple issues
        FOR issue_record IN
            SELECT i.id as issue_id, p.id as official_id
            FROM issues i
            CROSS JOIN (SELECT id FROM profiles WHERE role = 'official' LIMIT 1) p
            LIMIT 3
        LOOP
            INSERT INTO updates (issue_id, author_id, title, content, is_official) VALUES
            (issue_record.issue_id, issue_record.official_id,
             'Department Response',
             'Thank you for reporting this issue. Our department has been notified and will investigate this matter promptly.',
             true)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;
END $$;

-- Sample budget allocations for current fiscal year
INSERT INTO budget_allocations (department_id, category, fiscal_year, allocated_amount, spent_amount, description) VALUES
  ((SELECT id FROM departments WHERE name = 'Transport and Infrastructure'), 'Road Maintenance', 2024, 5000000.00, 3200000.00, 'Annual road maintenance and repairs'),
  ((SELECT id FROM departments WHERE name = 'Transport and Infrastructure'), 'Street Lighting', 2024, 1500000.00, 800000.00, 'Street light installation and maintenance'),
  ((SELECT id FROM departments WHERE name = 'Transport and Infrastructure'), 'Traffic Management', 2024, 2000000.00, 1200000.00, 'Traffic signals and road signage'),

  ((SELECT id FROM departments WHERE name = 'Health'), 'Clinic Operations', 2024, 8000000.00, 6500000.00, 'Clinic operational expenses and equipment'),
  ((SELECT id FROM departments WHERE name = 'Health'), 'Medical Supplies', 2024, 3000000.00, 2100000.00, 'Medical supplies and pharmaceuticals'),
  ((SELECT id FROM departments WHERE name = 'Health'), 'Emergency Services', 2024, 4500000.00, 3800000.00, 'Emergency medical services and ambulances'),

  ((SELECT id FROM departments WHERE name = 'Child Welfare and Basic Education'), 'Educational Materials', 2024, 4500000.00, 3800000.00, 'Textbooks and learning materials'),
  ((SELECT id FROM departments WHERE name = 'Child Welfare and Basic Education'), 'School Infrastructure', 2024, 6000000.00, 4200000.00, 'School building maintenance and construction'),
  ((SELECT id FROM departments WHERE name = 'Child Welfare and Basic Education'), 'Teacher Training', 2024, 2500000.00, 1800000.00, 'Professional development for educators'),

  ((SELECT id FROM departments WHERE name = 'Water and Human Settlement'), 'Water Infrastructure', 2024, 12000000.00, 8500000.00, 'Water supply infrastructure and maintenance'),
  ((SELECT id FROM departments WHERE name = 'Water and Human Settlement'), 'Housing Development', 2024, 15000000.00, 9800000.00, 'Public housing projects'),
  ((SELECT id FROM departments WHERE name = 'Water and Human Settlement'), 'Sanitation Services', 2024, 3500000.00, 2400000.00, 'Waste management and sanitation'),

  ((SELECT id FROM departments WHERE name = 'Communications and Knowledge Management'), 'Digital Infrastructure', 2024, 8000000.00, 5200000.00, 'Internet and telecommunications infrastructure'),
  ((SELECT id FROM departments WHERE name = 'Communications and Knowledge Management'), 'E-Government Services', 2024, 4000000.00, 2800000.00, 'Digital government service platforms'),

  ((SELECT id FROM departments WHERE name = 'Environment and Tourism'), 'Conservation Programs', 2024, 6500000.00, 4100000.00, 'Wildlife and environmental conservation'),
  ((SELECT id FROM departments WHERE name = 'Environment and Tourism'), 'Tourism Promotion', 2024, 3000000.00, 2200000.00, 'Tourism marketing and development')
ON CONFLICT DO NOTHING;

-- Sample satisfaction ratings for resolved issues
INSERT INTO satisfaction_ratings (issue_id, user_id, rating, feedback) VALUES
  ((SELECT id FROM issues WHERE status = 'resolved' LIMIT 1 OFFSET 0),
   (SELECT id FROM profiles WHERE role = 'citizen' LIMIT 1 OFFSET 0),
   5, 'Excellent response time and solution. Very satisfied with the service.'),
  ((SELECT id FROM issues WHERE status = 'resolved' LIMIT 1 OFFSET 0),
   (SELECT id FROM profiles WHERE role = 'citizen' LIMIT 1 OFFSET 1),
   4, 'Good resolution, but took longer than expected.'),
  ((SELECT id FROM issues WHERE status = 'resolved' LIMIT 1 OFFSET 0),
   (SELECT id FROM profiles WHERE role = 'citizen' LIMIT 1 OFFSET 2),
   5, 'Great improvement to our community. Thank you!')
ON CONFLICT DO NOTHING;

-- Create additional sample issues for better reporting data
INSERT INTO issues (title, description, category, status, priority, location, constituency, department_id, author_id, vote_count, comment_count, first_response_at) VALUES
  ('Public Wi-Fi Access Points Needed',
   'Request for public Wi-Fi installation in the city center for improved connectivity.',
   'technology', 'in_progress', 'medium', 'City Center, Gaborone', 'Gaborone Central',
   (SELECT id FROM departments WHERE name = 'Communications and Knowledge Management'),
   (SELECT id FROM profiles WHERE role = 'citizen' LIMIT 1),
   25, 8, NOW() - INTERVAL '2 days'),

  ('Park Maintenance Required',
   'The public park needs landscaping and playground equipment repairs.',
   'environment', 'open', 'low', 'Central Park, Francistown', 'Francistown East',
   (SELECT id FROM departments WHERE name = 'Environment and Tourism'),
   (SELECT id FROM profiles WHERE role = 'citizen' LIMIT 1 OFFSET 1),
   12, 4, NULL),

  ('Traffic Light Malfunction',
   'Traffic lights at the main intersection are not working properly, causing congestion.',
   'infrastructure', 'resolved', 'high', 'Main Street Intersection, Palapye', 'Palapye',
   (SELECT id FROM departments WHERE name = 'Transport and Infrastructure'),
   (SELECT id FROM profiles WHERE role = 'citizen' LIMIT 1 OFFSET 2),
   45, 15, NOW() - INTERVAL '1 day'),

  ('Library Hours Extension Request',
   'Request to extend public library operating hours for working professionals.',
   'education', 'open', 'medium', 'Public Library, Maun', 'Maun West',
   (SELECT id FROM departments WHERE name = 'Child Welfare and Basic Education'),
   (SELECT id FROM profiles WHERE role = 'citizen' LIMIT 1),
   18, 6, NOW() - INTERVAL '3 days'),

  ('Waste Collection Schedule Issues',
   'Irregular waste collection causing sanitation problems in residential areas.',
   'utilities', 'in_progress', 'high', 'Extension 15, Gaborone', 'Gaborone Central',
   (SELECT id FROM departments WHERE name = 'Water and Human Settlement'),
   (SELECT id FROM profiles WHERE role = 'citizen' LIMIT 1 OFFSET 1),
   32, 11, NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Create a sample monthly report
INSERT INTO reports (title, description, type, period, department_id, author_id, status, data) VALUES
  ('Monthly Civic Issues Report - ' || TO_CHAR(CURRENT_DATE, 'Month YYYY'),
   'Comprehensive monthly report on civic issues, resolutions, and department performance',
   'monthly',
   TO_CHAR(CURRENT_DATE, 'YYYY-MM'),
   NULL, -- All departments
   (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1),
   'published',
   jsonb_build_object(
     'summary', jsonb_build_object(
       'total_issues', (SELECT COUNT(*) FROM issues),
       'resolved_issues', (SELECT COUNT(*) FROM issues WHERE status = 'resolved'),
       'resolution_rate', ROUND((SELECT COUNT(*) FROM issues WHERE status = 'resolved')::NUMERIC / (SELECT COUNT(*) FROM issues) * 100, 2)
     ),
     'generated_at', CURRENT_TIMESTAMP
   ))
ON CONFLICT DO NOTHING;

-- Update vote counts and comment counts for more realistic data
UPDATE issues SET
  vote_count = FLOOR(RANDOM() * 50) + 5,
  comment_count = FLOOR(RANDOM() * 20) + 1
WHERE vote_count = 0 OR comment_count = 0;

-- Success message
SELECT 'Sample data for reports enhancement loaded successfully!' AS result,
       (SELECT COUNT(*) FROM updates) AS updates_count,
       (SELECT COUNT(*) FROM budget_allocations) AS budget_allocations_count,
       (SELECT COUNT(*) FROM satisfaction_ratings) AS satisfaction_ratings_count,
       (SELECT COUNT(*) FROM reports) AS reports_count;
