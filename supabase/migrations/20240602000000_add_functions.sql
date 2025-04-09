-- Create functions for incrementing and decrementing issue votes
CREATE OR REPLACE FUNCTION increment_issue_votes(issue_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE issues
  SET votes = votes + 1
  WHERE id = issue_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_issue_votes(issue_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE issues
  SET votes = GREATEST(0, votes - 1)
  WHERE id = issue_id;
END;
$$ LANGUAGE plpgsql;

-- Create functions for incrementing and decrementing issue watchers
CREATE OR REPLACE FUNCTION increment_issue_watchers(issue_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE issues
  SET watchers_count = watchers_count + 1
  WHERE id = issue_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_issue_watchers(issue_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE issues
  SET watchers_count = GREATEST(0, watchers_count - 1)
  WHERE id = issue_id;
END;
$$ LANGUAGE plpgsql;

-- Create functions for incrementing and decrementing solution votes
CREATE OR REPLACE FUNCTION increment_solution_votes(solution_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE solutions
  SET votes = votes + 1
  WHERE id = solution_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_solution_votes(solution_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE solutions
  SET votes = GREATEST(0, votes - 1)
  WHERE id = solution_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get all issues for a user (created, watching, or solved)
CREATE OR REPLACE FUNCTION get_user_issues(user_id UUID)
RETURNS TABLE (
  issue_id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  status TEXT,
  votes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  location TEXT,
  constituency TEXT,
  thumbnail TEXT,
  author_name TEXT,
  author_avatar TEXT,
  type TEXT
) AS $$
BEGIN
  -- Issues created by the user
  RETURN QUERY
  SELECT 
    i.id AS issue_id,
    i.title,
    i.description,
    i.category,
    i.status,
    i.votes,
    i.created_at,
    i.location,
    i.constituency,
    i.thumbnail,
    i.author_name,
    i.author_avatar,
    'created' AS type
  FROM issues i
  WHERE i.author_id = user_id
  
  UNION ALL
  
  -- Issues the user is watching
  SELECT 
    i.id AS issue_id,
    i.title,
    i.description,
    i.category,
    i.status,
    i.votes,
    i.created_at,
    i.location,
    i.constituency,
    i.thumbnail,
    i.author_name,
    i.author_avatar,
    'watching' AS type
  FROM issues i
  JOIN issue_watchers w ON i.id = w.issue_id
  WHERE w.user_id = user_id AND i.author_id != user_id
  
  UNION ALL
  
  -- Issues resolved by the user
  SELECT 
    i.id AS issue_id,
    i.title,
    i.description,
    i.category,
    i.status,
    i.votes,
    i.created_at,
    i.location,
    i.constituency,
    i.thumbnail,
    i.author_name,
    i.author_avatar,
    'solved' AS type
  FROM issues i
  WHERE i.resolved_by = user_id AND i.author_id != user_id;
  
END;
$$ LANGUAGE plpgsql;
