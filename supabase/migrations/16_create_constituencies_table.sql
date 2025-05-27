-- Create Constituencies Table for Botswana
-- Run this in Supabase SQL Editor

-- Create constituencies table
CREATE TABLE IF NOT EXISTS constituencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_constituencies_name ON constituencies(name);
CREATE INDEX IF NOT EXISTS idx_constituencies_region ON constituencies(region);

-- Enable RLS
ALTER TABLE constituencies ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Allow authenticated users to read constituencies" ON constituencies
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow anonymous users to read constituencies" ON constituencies
  FOR SELECT TO anon USING (true);

-- Insert all Botswana constituencies
INSERT INTO constituencies (name, region) VALUES
  ('Chobe', 'North West'),
  ('Maun East', 'North West'),
  ('Maun West', 'North West'),
  ('Ngami', 'North West'),
  ('Okavango', 'North West'),
  ('Tati East', 'North East'),
  ('Tati West', 'North East'),
  ('Francistown East', 'North East'),
  ('Francistown South', 'North East'),
  ('Francistown West', 'North East'),
  ('Nata-Gweta', 'North East'),
  ('Nkange', 'North East'),
  ('Shashe West', 'North East'),
  ('Tonota', 'North East'),
  ('Bobonong', 'Central'),
  ('Mmadinare', 'Central'),
  ('Selibe Phikwe East', 'Central'),
  ('Selibe Phikwe West', 'Central'),
  ('Lerala-Maunatlala', 'Central'),
  ('Palapye', 'Central'),
  ('Sefhare-Ramokgonami', 'Central'),
  ('Mahalapye East', 'Central'),
  ('Mahalapye West', 'Central'),
  ('Shoshong', 'Central'),
  ('Serowe North', 'Central'),
  ('Serowe West', 'Central'),
  ('Serowe South', 'Central'),
  ('Boteti East', 'Central'),
  ('Boteti West', 'Central'),
  ('Mochudi East', 'South East'),
  ('Mochudi West', 'South East'),
  ('Gaborone Central', 'South East'),
  ('Gaborone North', 'South East'),
  ('Gaborone South', 'South East'),
  ('Gaborone Bonnington North', 'South East'),
  ('Gaborone Bonnington South', 'South East'),
  ('Tlokweng', 'South East'),
  ('Ramotswa', 'South East'),
  ('Mogoditshane', 'South East'),
  ('Gabane-Mmankgodi', 'South East'),
  ('Thamaga-Kumakwane', 'South'),
  ('Molepolole North', 'South'),
  ('Molepolole South', 'South'),
  ('Lentsweletau-Mmopane', 'South'),
  ('Letlhakeng Lephephe', 'South'),
  ('Takatokwane', 'South'),
  ('Lobatse', 'South'),
  ('Goodhope Mabule', 'South'),
  ('Mmathethe-Molapowabojang', 'South'),
  ('Kanye North', 'South'),
  ('Kanye South', 'South'),
  ('Moshupa-Manyana', 'South'),
  ('Jwaneng-Mabutsane', 'South'),
  ('Kgalagadi North', 'Kgalagadi'),
  ('Kgalagadi South', 'Kgalagadi'),
  ('Ghanzi North', 'Ghanzi'),
  ('Ghanzi South', 'Ghanzi')
ON CONFLICT (name) DO UPDATE SET
  region = EXCLUDED.region,
  updated_at = NOW();

-- Grant permissions
GRANT SELECT ON constituencies TO authenticated;
GRANT SELECT ON constituencies TO anon;

-- Verify all constituencies were inserted
SELECT 
  'Constituencies verification:' AS info,
  COUNT(*) AS total_constituencies,
  COUNT(DISTINCT region) AS total_regions
FROM constituencies;

SELECT 'All Botswana constituencies created successfully' AS result;
