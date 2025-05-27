-- Quick fix for LatestUpdates component
-- This creates a simplified version of the function that works with existing schema

-- First, create a simple function that only returns issue updates for now
CREATE OR REPLACE FUNCTION get_latest_combined_updates(p_limit INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  title TEXT,
  content TEXT,
  type TEXT,
  author_name TEXT,
  author_role TEXT,
  author_avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  issue_id UUID,
  issue_title TEXT,
  platform_update_id UUID,
  is_official BOOLEAN,
  source_type TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  -- Issue updates only for now
  SELECT
    u.id,
    COALESCE(u.title, 'Update on ' || i.title) as title,
    u.content,
    u.type,
    COALESCE(p.full_name, 'Official') as author_name,
    COALESCE(p.role, 'official') as author_role,
    COALESCE(p.avatar_url, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || COALESCE(p.id::text, 'default')) as author_avatar,
    u.created_at,
    u.issue_id,
    i.title as issue_title,
    NULL::UUID as platform_update_id,
    COALESCE(u.is_official, true) as is_official,
    'issue'::TEXT as source_type
  FROM updates u
  LEFT JOIN profiles p ON u.author_id = p.id
  LEFT JOIN issues i ON u.issue_id = i.id
  ORDER BY u.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_latest_combined_updates(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_latest_combined_updates(INTEGER) TO anon;

-- Add comment
COMMENT ON FUNCTION get_latest_combined_updates IS 'Returns combined updates for LatestUpdates component - simplified version';

SELECT 'Quick fix function created successfully!' AS result;
