-- CRITICAL MISSING DATABASE FUNCTIONS
-- These functions are required for the voting and watching system to work
-- Run this IMMEDIATELY in Supabase SQL Editor

-- First, add missing columns to issues table if they don't exist
ALTER TABLE issues 
ADD COLUMN IF NOT EXISTS vote_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS watchers_count INTEGER DEFAULT 0;

-- Add missing columns to solutions table if they don't exist
ALTER TABLE solutions 
ADD COLUMN IF NOT EXISTS vote_count INTEGER DEFAULT 0;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_issues_vote_count ON issues(vote_count);
CREATE INDEX IF NOT EXISTS idx_issues_watchers_count ON issues(watchers_count);
CREATE INDEX IF NOT EXISTS idx_solutions_vote_count ON solutions(vote_count);

-- Function to increment issue votes
CREATE OR REPLACE FUNCTION increment_issue_votes(issue_id UUID)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE issues 
  SET vote_count = COALESCE(vote_count, 0) + 1,
      updated_at = NOW()
  WHERE id = issue_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Issue with id % not found', issue_id;
  END IF;
END;
$$;

-- Function to decrement issue votes
CREATE OR REPLACE FUNCTION decrement_issue_votes(issue_id UUID)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE issues 
  SET vote_count = GREATEST(COALESCE(vote_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = issue_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Issue with id % not found', issue_id;
  END IF;
END;
$$;

-- Function to increment issue watchers
CREATE OR REPLACE FUNCTION increment_issue_watchers(issue_id UUID)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE issues 
  SET watchers_count = COALESCE(watchers_count, 0) + 1,
      updated_at = NOW()
  WHERE id = issue_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Issue with id % not found', issue_id;
  END IF;
END;
$$;

-- Function to decrement issue watchers
CREATE OR REPLACE FUNCTION decrement_issue_watchers(issue_id UUID)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE issues 
  SET watchers_count = GREATEST(COALESCE(watchers_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = issue_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Issue with id % not found', issue_id;
  END IF;
END;
$$;

-- Function to increment solution votes
CREATE OR REPLACE FUNCTION increment_solution_votes(solution_id UUID)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE solutions 
  SET vote_count = COALESCE(vote_count, 0) + 1,
      updated_at = NOW()
  WHERE id = solution_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solution with id % not found', solution_id;
  END IF;
END;
$$;

-- Function to decrement solution votes
CREATE OR REPLACE FUNCTION decrement_solution_votes(solution_id UUID)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE solutions 
  SET vote_count = GREATEST(COALESCE(vote_count, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = solution_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solution with id % not found', solution_id;
  END IF;
END;
$$;

-- Fix issue_votes table to remove vote_type requirement (make it optional)
ALTER TABLE issue_votes 
ALTER COLUMN vote_type DROP NOT NULL,
ALTER COLUMN vote_type SET DEFAULT 'up';

-- Fix solution_votes table to remove vote_type requirement (make it optional)
ALTER TABLE solution_votes 
ALTER COLUMN vote_type DROP NOT NULL,
ALTER COLUMN vote_type SET DEFAULT 'up';

-- Update existing vote counts based on current data
UPDATE issues 
SET vote_count = (
  SELECT COUNT(*) 
  FROM issue_votes 
  WHERE issue_votes.issue_id = issues.id
),
watchers_count = (
  SELECT COUNT(*) 
  FROM issue_watchers 
  WHERE issue_watchers.issue_id = issues.id
);

UPDATE solutions 
SET vote_count = (
  SELECT COUNT(*) 
  FROM solution_votes 
  WHERE solution_votes.solution_id = solutions.id
);

-- Add comments for documentation
COMMENT ON FUNCTION increment_issue_votes(UUID) IS 'Increments vote count for an issue';
COMMENT ON FUNCTION decrement_issue_votes(UUID) IS 'Decrements vote count for an issue';
COMMENT ON FUNCTION increment_issue_watchers(UUID) IS 'Increments watcher count for an issue';
COMMENT ON FUNCTION decrement_issue_watchers(UUID) IS 'Decrements watcher count for an issue';
COMMENT ON FUNCTION increment_solution_votes(UUID) IS 'Increments vote count for a solution';
COMMENT ON FUNCTION decrement_solution_votes(UUID) IS 'Decrements vote count for a solution';

COMMENT ON COLUMN issues.vote_count IS 'Cached count of votes for this issue';
COMMENT ON COLUMN issues.watchers_count IS 'Cached count of users watching this issue';
COMMENT ON COLUMN solutions.vote_count IS 'Cached count of votes for this solution';

-- Success message
SELECT 'CRITICAL MISSING FUNCTIONS CREATED SUCCESSFULLY!' AS result,
       'Voting and watching functionality should now work' AS status;
