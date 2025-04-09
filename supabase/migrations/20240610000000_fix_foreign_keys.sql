-- Fix foreign key relationships for comments, updates, and solutions tables

-- First, ensure the profiles table exists and has the correct structure
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'citizen',
  constituency TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fix comments table foreign keys
ALTER TABLE IF EXISTS comments
  DROP CONSTRAINT IF EXISTS comments_author_id_fkey,
  ADD CONSTRAINT comments_author_id_fkey
    FOREIGN KEY (author_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;

-- Fix updates table foreign keys
ALTER TABLE IF EXISTS updates
  DROP CONSTRAINT IF EXISTS updates_author_id_fkey,
  ADD CONSTRAINT updates_author_id_fkey
    FOREIGN KEY (author_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE;

-- Fix solutions table foreign keys
ALTER TABLE IF EXISTS solutions
  DROP CONSTRAINT IF EXISTS solutions_proposed_by_fkey,
  ADD CONSTRAINT solutions_proposed_by_fkey
    FOREIGN KEY (proposed_by)
    REFERENCES profiles(id)
    ON DELETE CASCADE;

-- Enable RLS on all tables
ALTER TABLE IF EXISTS issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS issue_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS issue_watchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS solution_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables
-- For development, allow all authenticated users to read/write

-- Profiles policies
CREATE POLICY "Users can view all profiles" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Issues policies
CREATE POLICY "Anyone can view issues" 
  ON issues FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create issues" 
  ON issues FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own issues" 
  ON issues FOR UPDATE 
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own issues" 
  ON issues FOR DELETE 
  USING (auth.uid() = author_id);

-- Comments policies
CREATE POLICY "Anyone can view comments" 
  ON comments FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create comments" 
  ON comments FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own comments" 
  ON comments FOR UPDATE 
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" 
  ON comments FOR DELETE 
  USING (auth.uid() = author_id);

-- Updates policies
CREATE POLICY "Anyone can view updates" 
  ON updates FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create updates" 
  ON updates FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own updates" 
  ON updates FOR UPDATE 
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own updates" 
  ON updates FOR DELETE 
  USING (auth.uid() = author_id);

-- Solutions policies
CREATE POLICY "Anyone can view solutions" 
  ON solutions FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create solutions" 
  ON solutions FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own solutions" 
  ON solutions FOR UPDATE 
  USING (auth.uid() = proposed_by);

CREATE POLICY "Users can delete their own solutions" 
  ON solutions FOR DELETE 
  USING (auth.uid() = proposed_by);

-- Issue votes policies
CREATE POLICY "Anyone can view issue votes" 
  ON issue_votes FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create issue votes" 
  ON issue_votes FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own issue votes" 
  ON issue_votes FOR DELETE 
  USING (auth.uid() = user_id);

-- Issue watchers policies
CREATE POLICY "Anyone can view issue watchers" 
  ON issue_watchers FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create issue watchers" 
  ON issue_watchers FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own issue watchers" 
  ON issue_watchers FOR DELETE 
  USING (auth.uid() = user_id);

-- Solution votes policies
CREATE POLICY "Anyone can view solution votes" 
  ON solution_votes FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create solution votes" 
  ON solution_votes FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own solution votes" 
  ON solution_votes FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE issues;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE updates;
ALTER PUBLICATION supabase_realtime ADD TABLE solutions;
ALTER PUBLICATION supabase_realtime ADD TABLE issue_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE issue_watchers;
ALTER PUBLICATION supabase_realtime ADD TABLE solution_votes;
