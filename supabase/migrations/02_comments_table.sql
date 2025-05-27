-- Comments Table for Issues
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comments_issue_id ON comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (auth.uid() = author_id);

-- Trigger for updated_at
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE comments IS 'Comments on civic issues';

SELECT 'Comments table created successfully' AS result;
