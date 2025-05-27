-- Create Issue Categories Table
-- This table stores predefined categories for issues, linked to departments
-- Run this in Supabase SQL Editor

-- Create issue_categories table
CREATE TABLE IF NOT EXISTS issue_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES departments(id),
  icon TEXT, -- Optional icon name for UI
  color TEXT, -- Optional color for UI theming
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_issue_categories_name ON issue_categories(name);
CREATE INDEX IF NOT EXISTS idx_issue_categories_department_id ON issue_categories(department_id);
CREATE INDEX IF NOT EXISTS idx_issue_categories_active ON issue_categories(is_active);

-- Enable RLS
ALTER TABLE issue_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies (create only if they don't exist)
DO $$
BEGIN
    -- Create read policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'issue_categories'
        AND policyname = 'Allow authenticated users to read issue categories'
    ) THEN
        CREATE POLICY "Allow authenticated users to read issue categories" ON issue_categories
          FOR SELECT TO authenticated USING (true);
        RAISE NOTICE 'Created read policy for issue_categories';
    ELSE
        RAISE NOTICE 'Read policy for issue_categories already exists';
    END IF;

    -- Create admin policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'issue_categories'
        AND policyname = 'Allow admins to manage issue categories'
    ) THEN
        CREATE POLICY "Allow admins to manage issue categories" ON issue_categories
          FOR ALL TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
            )
          );
        RAISE NOTICE 'Created admin policy for issue_categories';
    ELSE
        RAISE NOTICE 'Admin policy for issue_categories already exists';
    END IF;
END $$;

-- Insert default categories for each department
-- First, let's get the department IDs and insert categories

DO $$
DECLARE
    dept_record RECORD;
    transport_dept_id UUID;
    health_dept_id UUID;
    education_dept_id UUID;
    environment_dept_id UUID;
    water_dept_id UUID;
    youth_dept_id UUID;
    agriculture_dept_id UUID;
    justice_dept_id UUID;
    local_govt_dept_id UUID;
    energy_dept_id UUID;
    communications_dept_id UUID;
    sports_dept_id UUID;
    trade_dept_id UUID;
    finance_dept_id UUID;
    international_dept_id UUID;
    higher_ed_dept_id UUID;
    labour_dept_id UUID;
    presidency_dept_id UUID;
BEGIN
    -- Get department IDs using the actual department names from the database
    SELECT id INTO transport_dept_id FROM departments WHERE name = 'Transport and Infrastructure' LIMIT 1;
    SELECT id INTO health_dept_id FROM departments WHERE name = 'Health' LIMIT 1;
    SELECT id INTO education_dept_id FROM departments WHERE name = 'Child Welfare and Basic Education' LIMIT 1;
    SELECT id INTO environment_dept_id FROM departments WHERE name = 'Environment and Tourism' LIMIT 1;
    SELECT id INTO water_dept_id FROM departments WHERE name = 'Water and Human Settlement' LIMIT 1;
    SELECT id INTO youth_dept_id FROM departments WHERE name = 'Youth and Gender Affairs' LIMIT 1;
    SELECT id INTO agriculture_dept_id FROM departments WHERE name = 'Lands and Agriculture' LIMIT 1;
    SELECT id INTO justice_dept_id FROM departments WHERE name = 'Justice and Correctional Services' LIMIT 1;
    SELECT id INTO local_govt_dept_id FROM departments WHERE name = 'Local Government and Traditional Affairs' LIMIT 1;
    SELECT id INTO energy_dept_id FROM departments WHERE name = 'Minerals and Energy' LIMIT 1;
    SELECT id INTO communications_dept_id FROM departments WHERE name = 'Communications, Knowledge and Technology' LIMIT 1;
    SELECT id INTO sports_dept_id FROM departments WHERE name = 'Sports and Arts' LIMIT 1;
    SELECT id INTO trade_dept_id FROM departments WHERE name = 'Trade and Entrepreneurship' LIMIT 1;
    SELECT id INTO finance_dept_id FROM departments WHERE name = 'Finance' LIMIT 1;
    SELECT id INTO international_dept_id FROM departments WHERE name = 'International Relations' LIMIT 1;
    SELECT id INTO higher_ed_dept_id FROM departments WHERE name = 'Higher Education' LIMIT 1;
    SELECT id INTO labour_dept_id FROM departments WHERE name = 'Labour and Home Affairs' LIMIT 1;
    SELECT id INTO presidency_dept_id FROM departments WHERE name = 'State Presidency' LIMIT 1;

    -- Insert categories only if they don't already exist
    -- Transport and Infrastructure categories
    IF transport_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Roads and Highways', 'Issues related to road maintenance, construction, and traffic', transport_dept_id, 'road', '#3B82F6'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Roads and Highways' AND department_id = transport_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Public Transportation', 'Bus services, taxi ranks, and public transport infrastructure', transport_dept_id, 'bus', '#3B82F6'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Public Transportation' AND department_id = transport_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Infrastructure Development', 'General infrastructure projects and maintenance', transport_dept_id, 'building', '#3B82F6'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Infrastructure Development' AND department_id = transport_dept_id);
    END IF;

    -- Health categories
    IF health_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Healthcare Services', 'Hospital services, clinic operations, medical care quality', health_dept_id, 'heart', '#EF4444'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Healthcare Services' AND department_id = health_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Public Health', 'Disease prevention, health education, vaccination programs', health_dept_id, 'shield', '#EF4444'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Public Health' AND department_id = health_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Medical Equipment', 'Medical equipment availability and maintenance', health_dept_id, 'stethoscope', '#EF4444'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Medical Equipment' AND department_id = health_dept_id);
    END IF;

    -- Education categories
    IF education_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'School Infrastructure', 'School buildings, classrooms, and facilities', education_dept_id, 'school', '#10B981'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'School Infrastructure' AND department_id = education_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Educational Resources', 'Textbooks, learning materials, and educational tools', education_dept_id, 'book', '#10B981'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Educational Resources' AND department_id = education_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Child Welfare', 'Child protection, welfare programs, and support services', education_dept_id, 'users', '#10B981'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Child Welfare' AND department_id = education_dept_id);
    END IF;

    -- Environment categories
    IF environment_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Environmental Protection', 'Pollution, conservation, and environmental damage', environment_dept_id, 'leaf', '#059669'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Environmental Protection' AND department_id = environment_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Tourism Development', 'Tourism infrastructure and destination management', environment_dept_id, 'camera', '#059669'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Tourism Development' AND department_id = environment_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Wildlife Conservation', 'Wildlife protection and conservation efforts', environment_dept_id, 'tree-pine', '#059669'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Wildlife Conservation' AND department_id = environment_dept_id);
    END IF;

    -- Water and Human Settlement categories
    IF water_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Water Supply', 'Water availability, quality, and distribution systems', water_dept_id, 'droplets', '#0EA5E9'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Water Supply' AND department_id = water_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Sanitation', 'Sewage systems, waste management, and sanitation facilities', water_dept_id, 'recycle', '#0EA5E9'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Sanitation' AND department_id = water_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Housing Development', 'Housing projects, settlement planning, and urban development', water_dept_id, 'home', '#0EA5E9'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Housing Development' AND department_id = water_dept_id);
    END IF;

    -- Justice and Safety categories
    IF justice_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Public Safety', 'Crime prevention, police services, and community safety', justice_dept_id, 'shield-check', '#DC2626'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Public Safety' AND department_id = justice_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Legal Services', 'Court services, legal aid, and justice system issues', justice_dept_id, 'scale', '#DC2626'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Legal Services' AND department_id = justice_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Correctional Services', 'Prison facilities and rehabilitation programs', justice_dept_id, 'lock', '#DC2626'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Correctional Services' AND department_id = justice_dept_id);
    END IF;

    -- Local Government categories
    IF local_govt_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Municipal Services', 'Local government services and administration', local_govt_dept_id, 'building-2', '#7C3AED'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Municipal Services' AND department_id = local_govt_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Community Development', 'Local community projects and development initiatives', local_govt_dept_id, 'users', '#7C3AED'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Community Development' AND department_id = local_govt_dept_id);
    END IF;

    -- Energy categories
    IF energy_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Electricity Supply', 'Power outages, electrical infrastructure, and energy access', energy_dept_id, 'zap', '#F59E0B'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Electricity Supply' AND department_id = energy_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Mining Operations', 'Mining activities, regulations, and environmental impact', energy_dept_id, 'pickaxe', '#F59E0B'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Mining Operations' AND department_id = energy_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Renewable Energy', 'Solar, wind, and other renewable energy projects', energy_dept_id, 'sun', '#F59E0B'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Renewable Energy' AND department_id = energy_dept_id);
    END IF;

    -- Agriculture categories
    IF agriculture_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Agricultural Support', 'Farming assistance, subsidies, and agricultural programs', agriculture_dept_id, 'wheat', '#84CC16'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Agricultural Support' AND department_id = agriculture_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Land Management', 'Land allocation, disputes, and land use planning', agriculture_dept_id, 'map', '#84CC16'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Land Management' AND department_id = agriculture_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Livestock Services', 'Veterinary services, livestock health, and animal welfare', agriculture_dept_id, 'cow', '#84CC16'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Livestock Services' AND department_id = agriculture_dept_id);
    END IF;

    -- Youth, Gender, Sport and Culture categories
    IF youth_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Youth Development', 'Youth programs, employment, and skills development', youth_dept_id, 'graduation-cap', '#EC4899'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Youth Development' AND department_id = youth_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Sports Facilities', 'Sports infrastructure, equipment, and recreational facilities', youth_dept_id, 'trophy', '#EC4899'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Sports Facilities' AND department_id = youth_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Cultural Heritage', 'Cultural preservation, arts, and heritage sites', youth_dept_id, 'palette', '#EC4899'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Cultural Heritage' AND department_id = youth_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Gender Equality', 'Gender-based issues, women empowerment, and equality programs', youth_dept_id, 'users-2', '#EC4899'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Gender Equality' AND department_id = youth_dept_id);
    END IF;

    -- Communications and Technology categories
    IF communications_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Digital Infrastructure', 'Internet connectivity, telecommunications, and digital services', communications_dept_id, 'wifi', '#8B5CF6'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Digital Infrastructure' AND department_id = communications_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Technology Innovation', 'Tech development, innovation hubs, and digital transformation', communications_dept_id, 'cpu', '#8B5CF6'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Technology Innovation' AND department_id = communications_dept_id);
    END IF;

    -- Trade and Entrepreneurship categories
    IF trade_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Business Development', 'Small business support, entrepreneurship programs, and business registration', trade_dept_id, 'briefcase', '#F97316'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Business Development' AND department_id = trade_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Trade Facilitation', 'Import/export processes, trade agreements, and market access', trade_dept_id, 'truck', '#F97316'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Trade Facilitation' AND department_id = trade_dept_id);
    END IF;

    -- Finance categories
    IF finance_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Public Finance', 'Budget allocation, financial management, and public spending', finance_dept_id, 'banknote', '#059669'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Public Finance' AND department_id = finance_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Tax Services', 'Tax collection, tax policies, and taxpayer services', finance_dept_id, 'calculator', '#059669'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Tax Services' AND department_id = finance_dept_id);
    END IF;

    -- Labour and Home Affairs categories
    IF labour_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Employment Services', 'Job creation, unemployment, and labor market issues', labour_dept_id, 'briefcase-business', '#6366F1'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Employment Services' AND department_id = labour_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Immigration Services', 'Visa processing, work permits, and immigration policies', labour_dept_id, 'passport', '#6366F1'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Immigration Services' AND department_id = labour_dept_id);
    END IF;

    -- Higher Education categories
    IF higher_ed_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'University Services', 'Higher education institutions, research, and academic programs', higher_ed_dept_id, 'graduation-cap', '#0891B2'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'University Services' AND department_id = higher_ed_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Research and Development', 'Scientific research, innovation, and technology development', higher_ed_dept_id, 'flask-conical', '#0891B2'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Research and Development' AND department_id = higher_ed_dept_id);
    END IF;

    -- International Relations categories
    IF international_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Diplomatic Services', 'Embassy services, international relations, and diplomatic issues', international_dept_id, 'globe', '#BE185D'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Diplomatic Services' AND department_id = international_dept_id);
    END IF;

    -- Office of the President categories
    IF presidency_dept_id IS NOT NULL THEN
        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Government Administration', 'General government services and administrative issues', presidency_dept_id, 'building-2', '#1F2937'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Government Administration' AND department_id = presidency_dept_id);

        INSERT INTO issue_categories (name, description, department_id, icon, color)
        SELECT 'Policy Implementation', 'Government policy execution and implementation issues', presidency_dept_id, 'scroll-text', '#1F2937'
        WHERE NOT EXISTS (SELECT 1 FROM issue_categories WHERE name = 'Policy Implementation' AND department_id = presidency_dept_id);
    END IF;

    RAISE NOTICE 'Issue categories have been created successfully';
END $$;
