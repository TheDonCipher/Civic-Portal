-- Insert mock issues
INSERT INTO issues (
  title, 
  description, 
  category, 
  status, 
  location, 
  constituency, 
  thumbnail, 
  votes, 
  watchers_count, 
  author_id, 
  author_name, 
  author_avatar, 
  created_at
) VALUES 
(
  'Road Maintenance Required',
  'Multiple potholes need attention along the Serowe-Palapye road.',
  'Infrastructure',
  'open',
  'Serowe-Palapye Road',
  'serowe north',
  'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop',
  42,
  68,
  (SELECT id FROM auth.users LIMIT 1),
  'Thabo Thapelo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
  NOW() - INTERVAL '3 days'
),
(
  'Cleanup Initiative',
  'Organizing community cleanup at Main Mall. Need volunteers and equipment.',
  'Environment',
  'in-progress',
  'Main Mall',
  'gaborone central',
  'https://images.unsplash.com/photo-1571954471509-801c155e01ec?w=400&h=300&fit=crop',
  28,
  42,
  (SELECT id FROM auth.users LIMIT 1),
  'Lesego Pelekekae',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
  NOW() - INTERVAL '5 days'
),
(
  'Street Light Malfunction',
  'Several street lights have fallen after heavy rains',
  'Safety',
  'open',
  'Boiteko Junction Mall',
  'serowe north',
  'https://images.unsplash.com/photo-1542574621-e088a4464f7e?w=400&h=300&fit=crop',
  15,
  35,
  (SELECT id FROM auth.users LIMIT 1),
  'Pearl Samson',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
  NOW() - INTERVAL '7 days'
),
(
  'Park Renovation Needed',
  'The minestone park needs renovation. Benches are broken and playground equipment is unsafe.',
  'Community',
  'open',
  'Minestone Park',
  'francistown east',
  'https://images.unsplash.com/photo-1552083375-1447ce886485?w=400&h=300&fit=crop',
  36,
  52,
  (SELECT id FROM auth.users LIMIT 1),
  'Chedza Magama',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
  NOW() - INTERVAL '10 days'
),
(
  'Drainage System Blocked',
  'The drainage system on Monarch is blocked causing flooding during rains.',
  'Infrastructure',
  'in-progress',
  'Monarch',
  'francistown east',
  'https://images.unsplash.com/photo-1593978301851-40c1849d47d4?w=400&h=300&fit=crop',
  31,
  47,
  (SELECT id FROM auth.users LIMIT 1),
  'Eric Mookodi',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
  NOW() - INTERVAL '12 days'
);

-- Insert comments for the first issue
INSERT INTO issue_comments (
  issue_id,
  author_id,
  author_name,
  author_avatar,
  content,
  created_at
) VALUES
(
  (SELECT id FROM issues WHERE title = 'Road Maintenance Required' LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1),
  'Malebogo Moeti',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
  'This needs immediate attention. I''ve seen multiple cars damaged.',
  NOW() - INTERVAL '2 days'
),
(
  (SELECT id FROM issues WHERE title = 'Road Maintenance Required' LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1),
  'Michael Gobuamang',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
  'I agree, this is becoming a serious safety hazard.',
  NOW() - INTERVAL '1 day'
);

-- Insert updates for the first issue
INSERT INTO issue_updates (
  issue_id,
  author_id,
  author_name,
  author_avatar,
  content,
  type,
  created_at
) VALUES
(
  (SELECT id FROM issues WHERE title = 'Road Maintenance Required' LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1),
  'Ministry of Roads and Transport',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=city',
  'Issue has been reviewed and scheduled for repair next week.',
  'status',
  NOW() - INTERVAL '1 day'
);

-- Insert solutions for the first issue
INSERT INTO issue_solutions (
  issue_id,
  title,
  description,
  estimated_cost,
  votes,
  status,
  proposed_by_id,
  proposed_by_name,
  proposed_by_avatar,
  created_at
) VALUES
(
  (SELECT id FROM issues WHERE title = 'Road Maintenance Required' LIMIT 1),
  'Complete Road Resurfacing',
  'Full resurfacing of the affected area with high-quality asphalt.',
  25000,
  15,
  'proposed',
  (SELECT id FROM auth.users LIMIT 1),
  'Ministry of Roads and Transport',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=engineer',
  NOW() - INTERVAL '1 day'
);
