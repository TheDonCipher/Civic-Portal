-- Create tables for comments, solutions, and votes

-- Comments table to store user comments on issues
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Updates table to store status updates for issues
CREATE TABLE IF NOT EXISTS updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'status', -- 'status', 'solution', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Solutions table to store proposed solutions for issues
CREATE TABLE IF NOT EXISTS solutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  proposed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  estimated_cost INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed', -- 'proposed', 'approved', 'in-progress', 'completed'
  votes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Solution votes table to track user votes on solutions
CREATE TABLE IF NOT EXISTS solution_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(solution_id, user_id)
);

-- Add RLS policies for the new tables

-- Comments policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Comments are viewable by everyone'
  ) THEN
    CREATE POLICY "Comments are viewable by everyone"
      ON comments FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Users can insert their own comments'
  ) THEN
    CREATE POLICY "Users can insert their own comments"
      ON comments FOR INSERT
      WITH CHECK (auth.uid() = author_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Users can update their own comments'
  ) THEN
    CREATE POLICY "Users can update their own comments"
      ON comments FOR UPDATE
      USING (auth.uid() = author_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Users can delete their own comments'
  ) THEN
    CREATE POLICY "Users can delete their own comments"
      ON comments FOR DELETE
      USING (auth.uid() = author_id);
  END IF;
END
$$;

-- Updates policies
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'updates' AND policyname = 'Updates are viewable by everyone'
  ) THEN
    CREATE POLICY "Updates are viewable by everyone"
      ON updates FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'updates' AND policyname = 'Users can insert their own updates'
  ) THEN
    CREATE POLICY "Users can insert their own updates"
      ON updates FOR INSERT
      WITH CHECK (auth.uid() = author_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'updates' AND policyname = 'Users can update their own updates'
  ) THEN
    CREATE POLICY "Users can update their own updates"
      ON updates FOR UPDATE
      USING (auth.uid() = author_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'updates' AND policyname = 'Users can delete their own updates'
  ) THEN
    CREATE POLICY "Users can delete their own updates"
      ON updates FOR DELETE
      USING (auth.uid() = author_id);
  END IF;
END
$$;

-- Solutions policies
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'solutions' AND policyname = 'Solutions are viewable by everyone'
  ) THEN
    CREATE POLICY "Solutions are viewable by everyone"
      ON solutions FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'solutions' AND policyname = 'Users can insert their own solutions'
  ) THEN
    CREATE POLICY "Users can insert their own solutions"
      ON solutions FOR INSERT
      WITH CHECK (auth.uid() = proposed_by);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'solutions' AND policyname = 'Users can update their own solutions or officials can update any solution'
  ) THEN
    CREATE POLICY "Users can update their own solutions or officials can update any solution"
      ON solutions FOR UPDATE
      USING (
        auth.uid() = proposed_by OR 
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() AND profiles.role = 'official'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'solutions' AND policyname = 'Users can delete their own solutions'
  ) THEN
    CREATE POLICY "Users can delete their own solutions"
      ON solutions FOR DELETE
      USING (auth.uid() = proposed_by);
  END IF;
END
$$;

-- Solution votes policies
ALTER TABLE solution_votes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'solution_votes' AND policyname = 'Solution votes are viewable by everyone'
  ) THEN
    CREATE POLICY "Solution votes are viewable by everyone"
      ON solution_votes FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'solution_votes' AND policyname = 'Users can insert their own solution votes'
  ) THEN
    CREATE POLICY "Users can insert their own solution votes"
      ON solution_votes FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'solution_votes' AND policyname = 'Users can delete their own solution votes'
  ) THEN
    CREATE POLICY "Users can delete their own solution votes"
      ON solution_votes FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

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

-- Add triggers for real-time functionality
CREATE OR REPLACE FUNCTION handle_new_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify subscribers about the new comment
  PERFORM pg_notify(
    'new_comment',
    json_build_object(
      'issue_id', NEW.issue_id,
      'comment_id', NEW.id,
      'author_id', NEW.author_id,
      'content', NEW.content,
      'created_at', NEW.created_at
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_new_comment'
  ) THEN
    CREATE TRIGGER on_new_comment
    AFTER INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_comment();
  END IF;
END
$$;

-- Enable realtime for all tables
DO $$
BEGIN
  -- Check if tables are already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE comments;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'updates'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE updates;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'solutions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE solutions;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'solution_votes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE solution_votes;
  END IF;
END
$$;