-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'citizen',
  constituency TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create issues table
CREATE TABLE IF NOT EXISTS issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  votes INTEGER NOT NULL DEFAULT 0,
  author_id UUID NOT NULL,
  author_name TEXT,
  author_avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location TEXT,
  constituency TEXT,
  thumbnail TEXT,
  thumbnails TEXT[] DEFAULT '{}',
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  watchers_count INTEGER DEFAULT 0
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updates table
CREATE TABLE IF NOT EXISTS updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'status',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create solutions table
CREATE TABLE IF NOT EXISTS solutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues ON DELETE CASCADE,
  proposed_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  estimated_cost INTEGER NOT NULL,
  votes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'proposed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create issue votes table
CREATE TABLE IF NOT EXISTS issue_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(issue_id, user_id)
);

-- Create issue watchers table
CREATE TABLE IF NOT EXISTS issue_watchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(issue_id, user_id)
);

-- Create solution votes table
CREATE TABLE IF NOT EXISTS solution_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solution_id UUID NOT NULL REFERENCES solutions ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(solution_id, user_id)
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_watchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_votes ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
CREATE POLICY profiles_select_policy ON profiles
  FOR SELECT USING (true);

CREATE POLICY profiles_insert_policy ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_policy ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create issues policies
CREATE POLICY issues_select_policy ON issues
  FOR SELECT USING (true);

CREATE POLICY issues_insert_policy ON issues
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY issues_update_policy ON issues
  FOR UPDATE USING (auth.uid() = author_id OR 
                   auth.uid() IN (SELECT id FROM profiles WHERE role = 'official' OR role = 'admin'));

CREATE POLICY issues_delete_policy ON issues
  FOR DELETE USING (auth.uid() = author_id OR 
                   auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Create comments policies
CREATE POLICY comments_select_policy ON comments
  FOR SELECT USING (true);

CREATE POLICY comments_insert_policy ON comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY comments_delete_policy ON comments
  FOR DELETE USING (auth.uid() = author_id OR 
                   auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Create updates policies
CREATE POLICY updates_select_policy ON updates
  FOR SELECT USING (true);

CREATE POLICY updates_insert_policy ON updates
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY updates_delete_policy ON updates
  FOR DELETE USING (auth.uid() = author_id OR 
                   auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Create solutions policies
CREATE POLICY solutions_select_policy ON solutions
  FOR SELECT USING (true);

CREATE POLICY solutions_insert_policy ON solutions
  FOR INSERT WITH CHECK (auth.uid() = proposed_by);

CREATE POLICY solutions_update_policy ON solutions
  FOR UPDATE USING (auth.uid() = proposed_by OR 
                   auth.uid() IN (SELECT id FROM profiles WHERE role = 'official' OR role = 'admin'));

CREATE POLICY solutions_delete_policy ON solutions
  FOR DELETE USING (auth.uid() = proposed_by OR 
                   auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Create issue votes policies
CREATE POLICY issue_votes_select_policy ON issue_votes
  FOR SELECT USING (true);

CREATE POLICY issue_votes_insert_policy ON issue_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY issue_votes_delete_policy ON issue_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Create issue watchers policies
CREATE POLICY issue_watchers_select_policy ON issue_watchers
  FOR SELECT USING (true);

CREATE POLICY issue_watchers_insert_policy ON issue_watchers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY issue_watchers_delete_policy ON issue_watchers
  FOR DELETE USING (auth.uid() = user_id);

-- Create solution votes policies
CREATE POLICY solution_votes_select_policy ON solution_votes
  FOR SELECT USING (true);

CREATE POLICY solution_votes_insert_policy ON solution_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY solution_votes_delete_policy ON solution_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Create functions for incrementing/decrementing votes and watchers
CREATE OR REPLACE FUNCTION increment_issue_votes(issue_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE issues SET votes = votes + 1 WHERE id = issue_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_issue_votes(issue_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE issues SET votes = GREATEST(0, votes - 1) WHERE id = issue_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_issue_watchers(issue_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE issues SET watchers_count = watchers_count + 1 WHERE id = issue_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_issue_watchers(issue_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE issues SET watchers_count = GREATEST(0, watchers_count - 1) WHERE id = issue_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_solution_votes(solution_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE solutions SET votes = votes + 1 WHERE id = solution_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_solution_votes(solution_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE solutions SET votes = GREATEST(0, votes - 1) WHERE id = solution_id;
END;
$$ LANGUAGE plpgsql;
