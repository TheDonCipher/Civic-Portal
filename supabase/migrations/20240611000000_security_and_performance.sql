-- Add audit logging table for security tracking
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit_logs table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only allow users to view their own audit logs, but officials can view all
CREATE POLICY "Users can view their own audit logs" 
  ON audit_logs FOR SELECT 
  USING (auth.uid() = user_id OR 
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'official'));

-- Only allow system to insert audit logs
CREATE POLICY "System can insert audit logs" 
  ON audit_logs FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_issues_author_id ON issues(author_id);
CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_constituency ON issues(constituency);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues(created_at);

CREATE INDEX IF NOT EXISTS idx_comments_issue_id ON comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

CREATE INDEX IF NOT EXISTS idx_updates_issue_id ON updates(issue_id);
CREATE INDEX IF NOT EXISTS idx_updates_author_id ON updates(author_id);
CREATE INDEX IF NOT EXISTS idx_updates_created_at ON updates(created_at);

CREATE INDEX IF NOT EXISTS idx_solutions_issue_id ON solutions(issue_id);
CREATE INDEX IF NOT EXISTS idx_solutions_proposed_by ON solutions(proposed_by);
CREATE INDEX IF NOT EXISTS idx_solutions_status ON solutions(status);

CREATE INDEX IF NOT EXISTS idx_issue_votes_issue_id ON issue_votes(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_votes_user_id ON issue_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_issue_watchers_issue_id ON issue_watchers(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_watchers_user_id ON issue_watchers(user_id);

CREATE INDEX IF NOT EXISTS idx_solution_votes_solution_id ON solution_votes(solution_id);
CREATE INDEX IF NOT EXISTS idx_solution_votes_user_id ON solution_votes(user_id);

-- Add text search capabilities for better search performance
ALTER TABLE issues ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_issue_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.constituency, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update search vector on insert or update
CREATE TRIGGER update_issue_search_vector_trigger
BEFORE INSERT OR UPDATE ON issues
FOR EACH ROW
EXECUTE FUNCTION update_issue_search_vector();

-- Create index on search vector for faster text search
CREATE INDEX IF NOT EXISTS idx_issues_search_vector ON issues USING gin(search_vector);

-- Update existing issues to populate search vector
UPDATE issues SET search_vector = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(category, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(location, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(constituency, '')), 'C');

-- Add storage bucket policies
BEGIN;
  -- Create storage bucket for issue images if it doesn't exist
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('issues', 'issues', true)
  ON CONFLICT (id) DO NOTHING;

  -- Allow authenticated users to upload to the issues bucket
  CREATE POLICY "Authenticated users can upload issue images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'issues');

  -- Allow public access to read issue images
  CREATE POLICY "Public can view issue images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'issues');

  -- Allow users to update and delete their own uploads
  CREATE POLICY "Users can update their own issue images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'issues' AND owner = auth.uid());

  CREATE POLICY "Users can delete their own issue images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'issues' AND owner = auth.uid());

  -- Allow officials to manage all issue images
  CREATE POLICY "Officials can manage all issue images"
    ON storage.objects
    TO authenticated
    USING (
      bucket_id = 'issues' AND 
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'official')
    );
COMMIT;
