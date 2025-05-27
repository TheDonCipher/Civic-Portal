-- Updates Table for Official Issue Updates
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID REFERENCES issues(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'update' CHECK (type IN ('update', 'status_change', 'official', 'system')),
  is_official BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_updates_issue_id ON updates(issue_id);
CREATE INDEX IF NOT EXISTS idx_updates_author_id ON updates(author_id);
CREATE INDEX IF NOT EXISTS idx_updates_type ON updates(type);
CREATE INDEX IF NOT EXISTS idx_updates_is_official ON updates(is_official);
CREATE INDEX IF NOT EXISTS idx_updates_created_at ON updates(created_at);

-- Enable RLS
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view updates" ON updates
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create updates" ON updates
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own updates" ON updates
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own updates" ON updates
  FOR DELETE USING (auth.uid() = author_id);

-- Trigger for updated_at
CREATE TRIGGER update_updates_updated_at
  BEFORE UPDATE ON updates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE updates IS 'Official and user updates on civic issues';

SELECT 'Updates table created successfully' AS result;
