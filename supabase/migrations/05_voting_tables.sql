-- Voting Tables for Issues and Solutions
-- Run this in Supabase SQL Editor

-- Issue Votes Table
CREATE TABLE IF NOT EXISTS issue_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(issue_id, user_id)
);

-- Solution Votes Table
CREATE TABLE IF NOT EXISTS solution_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id UUID REFERENCES solutions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(solution_id, user_id)
);

-- Issue Watchers Table
CREATE TABLE IF NOT EXISTS issue_watchers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(issue_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_issue_votes_issue_id ON issue_votes(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_votes_user_id ON issue_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_solution_votes_solution_id ON solution_votes(solution_id);
CREATE INDEX IF NOT EXISTS idx_solution_votes_user_id ON solution_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_issue_watchers_issue_id ON issue_watchers(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_watchers_user_id ON issue_watchers(user_id);

-- Enable RLS
ALTER TABLE issue_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_watchers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for issue_votes
CREATE POLICY "Anyone can view issue votes" ON issue_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote on issues" ON issue_votes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own issue votes" ON issue_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own issue votes" ON issue_votes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for solution_votes
CREATE POLICY "Anyone can view solution votes" ON solution_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote on solutions" ON solution_votes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own solution votes" ON solution_votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own solution votes" ON solution_votes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for issue_watchers
CREATE POLICY "Anyone can view issue watchers" ON issue_watchers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can watch issues" ON issue_watchers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own watches" ON issue_watchers
  FOR DELETE USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE issue_votes IS 'User votes on civic issues';
COMMENT ON TABLE solution_votes IS 'User votes on proposed solutions';
COMMENT ON TABLE issue_watchers IS 'Users watching issues for updates';

SELECT 'Voting tables created successfully' AS result;
