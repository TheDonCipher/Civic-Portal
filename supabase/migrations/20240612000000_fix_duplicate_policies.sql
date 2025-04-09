-- Fix duplicate policy issue by dropping existing policies first

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view issues" ON issues;
DROP POLICY IF EXISTS "Authenticated users can create issues" ON issues;
DROP POLICY IF EXISTS "Users can update their own issues" ON issues;
DROP POLICY IF EXISTS "Users can delete their own issues" ON issues;
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
DROP POLICY IF EXISTS "Anyone can view updates" ON updates;
DROP POLICY IF EXISTS "Authenticated users can create updates" ON updates;
DROP POLICY IF EXISTS "Users can update their own updates" ON updates;
DROP POLICY IF EXISTS "Users can delete their own updates" ON updates;
DROP POLICY IF EXISTS "Anyone can view solutions" ON solutions;
DROP POLICY IF EXISTS "Authenticated users can create solutions" ON solutions;
DROP POLICY IF EXISTS "Users can update their own solutions" ON solutions;
DROP POLICY IF EXISTS "Users can delete their own solutions" ON solutions;
DROP POLICY IF EXISTS "Anyone can view issue votes" ON issue_votes;
DROP POLICY IF EXISTS "Authenticated users can create issue votes" ON issue_votes;
DROP POLICY IF EXISTS "Users can delete their own issue votes" ON issue_votes;
DROP POLICY IF EXISTS "Anyone can view issue watchers" ON issue_watchers;
DROP POLICY IF EXISTS "Authenticated users can create issue watchers" ON issue_watchers;
DROP POLICY IF EXISTS "Users can delete their own issue watchers" ON issue_watchers;
DROP POLICY IF EXISTS "Anyone can view solution votes" ON solution_votes;
DROP POLICY IF EXISTS "Authenticated users can create solution votes" ON solution_votes;
DROP POLICY IF EXISTS "Users can delete their own solution votes" ON solution_votes;

-- Recreate policies
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

-- Make sure realtime is enabled for all tables
DO $$
BEGIN
  -- Check if tables are in the realtime publication
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'issues') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE issues;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'comments') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE comments;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'updates') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE updates;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'solutions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE solutions;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'issue_votes') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE issue_votes;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'issue_watchers') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE issue_watchers;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'solution_votes') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE solution_votes;
  END IF;
END
$$;