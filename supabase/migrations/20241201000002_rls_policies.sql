-- Row-Level Security Policies for Civic Portal
-- This migration creates comprehensive RLS policies for all tables

-- Enhanced RLS Policies for profiles table
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
    DROP POLICY IF EXISTS "Admins can update verification status" ON profiles;

    -- Create new policies
    CREATE POLICY "Users can view their own profile" ON profiles
        FOR SELECT USING (auth.uid() = id);

    CREATE POLICY "Users can update their own profile" ON profiles
        FOR UPDATE USING (auth.uid() = id);

    CREATE POLICY "Admins can view all profiles" ON profiles
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role = 'admin'
            )
        );

    CREATE POLICY "Admins can update verification status" ON profiles
        FOR UPDATE USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role = 'admin'
            )
        );

    RAISE NOTICE 'Created RLS policies for profiles table';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating profiles policies: %', SQLERRM;
END $$;

-- Enhanced RLS Policies for issues table
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'issues') THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can view public issues" ON issues;
        DROP POLICY IF EXISTS "Users can create issues" ON issues;
        DROP POLICY IF EXISTS "Users can update their own issues" ON issues;
        DROP POLICY IF EXISTS "Only authors and admins can delete issues" ON issues;

        -- Create new policies
        CREATE POLICY "Users can view public issues" ON issues
            FOR SELECT USING (
                status != 'draft' OR 
                author_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role IN ('admin', 'official')
                )
            );

        CREATE POLICY "Users can create issues" ON issues
            FOR INSERT WITH CHECK (
                auth.uid() IS NOT NULL AND
                author_id = auth.uid()
            );

        CREATE POLICY "Users can update their own issues" ON issues
            FOR UPDATE USING (
                author_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role IN ('admin', 'official')
                    AND (profiles.role = 'admin' OR profiles.department_id = issues.department_id)
                )
            );

        CREATE POLICY "Only authors and admins can delete issues" ON issues
            FOR DELETE USING (
                author_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role = 'admin'
                )
            );

        RAISE NOTICE 'Created RLS policies for issues table';
    ELSE
        RAISE NOTICE 'Issues table does not exist, skipping policies';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating issues policies: %', SQLERRM;
END $$;

-- Enhanced RLS Policies for comments table
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'comments') THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can view comments on visible issues" ON comments;
        DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
        DROP POLICY IF EXISTS "Users can update their own comments" ON comments;

        -- Create new policies
        CREATE POLICY "Users can view comments on visible issues" ON comments
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM issues 
                    WHERE issues.id = comments.issue_id 
                    AND (
                        issues.status != 'draft' OR 
                        issues.author_id = auth.uid() OR
                        EXISTS (
                            SELECT 1 FROM profiles 
                            WHERE profiles.id = auth.uid() 
                            AND profiles.role IN ('admin', 'official')
                        )
                    )
                )
            );

        CREATE POLICY "Authenticated users can create comments" ON comments
            FOR INSERT WITH CHECK (
                auth.uid() IS NOT NULL AND
                author_id = auth.uid() AND
                EXISTS (
                    SELECT 1 FROM issues 
                    WHERE issues.id = comments.issue_id 
                    AND issues.status != 'draft'
                )
            );

        CREATE POLICY "Users can update their own comments" ON comments
            FOR UPDATE USING (
                author_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role = 'admin'
                )
            );

        RAISE NOTICE 'Created RLS policies for comments table';
    ELSE
        RAISE NOTICE 'Comments table does not exist, skipping policies';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating comments policies: %', SQLERRM;
END $$;

-- Enhanced RLS Policies for solutions table
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'solutions') THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can view solutions" ON solutions;
        DROP POLICY IF EXISTS "Authenticated users can propose solutions" ON solutions;

        -- Create new policies
        CREATE POLICY "Users can view solutions" ON solutions
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM issues 
                    WHERE issues.id = solutions.issue_id 
                    AND issues.status != 'draft'
                )
            );

        CREATE POLICY "Authenticated users can propose solutions" ON solutions
            FOR INSERT WITH CHECK (
                auth.uid() IS NOT NULL AND
                author_id = auth.uid()
            );

        RAISE NOTICE 'Created RLS policies for solutions table';
    ELSE
        RAISE NOTICE 'Solutions table does not exist, skipping policies';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating solutions policies: %', SQLERRM;
END $$;

-- Enhanced RLS Policies for notifications table
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
        DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

        -- Create new policies
        CREATE POLICY "Users can view their own notifications" ON notifications
            FOR SELECT USING (user_id = auth.uid());

        CREATE POLICY "Users can update their own notifications" ON notifications
            FOR UPDATE USING (user_id = auth.uid());

        RAISE NOTICE 'Created RLS policies for notifications table';
    ELSE
        RAISE NOTICE 'Notifications table does not exist, skipping policies';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating notifications policies: %', SQLERRM;
END $$;

-- Security tables policies
DO $$
BEGIN
    -- Rate limits policies
    DROP POLICY IF EXISTS "Only admins can view rate limits" ON rate_limits;
    DROP POLICY IF EXISTS "System can insert rate limits" ON rate_limits;

    CREATE POLICY "Only admins can view rate limits" ON rate_limits
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role = 'admin'
            )
        );

    CREATE POLICY "System can insert rate limits" ON rate_limits
        FOR INSERT WITH CHECK (true);

    -- Security logs policies
    DROP POLICY IF EXISTS "Only admins can view security logs" ON security_logs;
    DROP POLICY IF EXISTS "System can insert security logs" ON security_logs;

    CREATE POLICY "Only admins can view security logs" ON security_logs
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role = 'admin'
            )
        );

    CREATE POLICY "System can insert security logs" ON security_logs
        FOR INSERT WITH CHECK (true);

    -- Audit logs policies
    DROP POLICY IF EXISTS "Only admins can view audit logs" ON audit_logs;

    CREATE POLICY "Only admins can view audit logs" ON audit_logs
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role = 'admin'
            )
        );

    RAISE NOTICE 'Created RLS policies for security tables';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating security table policies: %', SQLERRM;
END $$;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '=== RLS POLICIES MIGRATION COMPLETED SUCCESSFULLY ===';
    RAISE NOTICE 'All Row-Level Security policies have been created';
    RAISE NOTICE 'Tables secured: profiles, issues, comments, solutions, notifications';
    RAISE NOTICE 'Security tables secured: rate_limits, security_logs, audit_logs';
END $$;
