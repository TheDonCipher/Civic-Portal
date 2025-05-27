-- Solutions Table for Issue Solutions
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS solutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_official BOOLEAN DEFAULT false,
  is_selected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_solutions_issue_id ON solutions(issue_id);
CREATE INDEX IF NOT EXISTS idx_solutions_author_id ON solutions(author_id);
CREATE INDEX IF NOT EXISTS idx_solutions_is_official ON solutions(is_official);
CREATE INDEX IF NOT EXISTS idx_solutions_is_selected ON solutions(is_selected);
CREATE INDEX IF NOT EXISTS idx_solutions_created_at ON solutions(created_at);

-- Enable RLS
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view solutions" ON solutions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create solutions" ON solutions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own solutions" ON solutions
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own solutions" ON solutions
  FOR DELETE USING (auth.uid() = author_id);

-- Trigger for updated_at
CREATE TRIGGER update_solutions_updated_at
  BEFORE UPDATE ON solutions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE solutions IS 'Proposed solutions for civic issues';

SELECT 'Solutions table created successfully' AS result;
