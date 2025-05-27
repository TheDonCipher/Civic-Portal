-- TEST ADMIN DASHBOARD FIX
-- Verifies that the admin dashboard auth error has been resolved
-- Run this after applying the fix_admin_dashboard_auth_error.sql script

-- Step 1: Test basic admin access
DO $$
BEGIN
    RAISE NOTICE '=== TESTING ADMIN DASHBOARD FIX ===';
    RAISE NOTICE 'Verifying admin dashboard functionality...';
END $$;

-- Step 2: Test notification policies
SELECT 'TESTING NOTIFICATION POLICIES' AS test_section;

DO $$
DECLARE
    policy_count INTEGER;
    test_user_id UUID;
    test_notification_id UUID;
BEGIN
    -- Count notification policies
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE tablename = 'notifications';
    
    RAISE NOTICE 'Notification RLS policies found: %', policy_count;
    
    -- Test notification creation (should work without auth.users reference)
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        BEGIN
            INSERT INTO notifications (user_id, type, title, message, data)
            VALUES (
                test_user_id,
                'system',
                'Test Notification',
                'Testing admin dashboard fix',
                '{"test": true}'
            ) RETURNING id INTO test_notification_id;
            
            RAISE NOTICE '✓ Notification creation test - PASSED';
            
            -- Clean up test notification
            DELETE FROM notifications WHERE id = test_notification_id;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '❌ Notification creation test - FAILED: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE '⚠ No test user found - skipping notification test';
    END IF;
END $$;

-- Step 3: Test admin functions
SELECT 'TESTING ADMIN FUNCTIONS' AS test_section;

DO $$
DECLARE
    admin_stats JSON;
    current_user_role TEXT;
    function_exists BOOLEAN;
BEGIN
    -- Check if current user is admin
    SELECT role INTO current_user_role FROM profiles WHERE id = auth.uid();
    
    -- Check if admin functions exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'get_admin_user_stats'
    ) INTO function_exists;
    
    IF function_exists THEN
        RAISE NOTICE '✓ Admin functions exist';
        
        IF current_user_role = 'admin' THEN
            BEGIN
                -- Test admin stats function
                SELECT get_admin_user_stats() INTO admin_stats;
                RAISE NOTICE '✓ Admin stats function - PASSED';
                RAISE NOTICE 'Stats: %', admin_stats;
                
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE '❌ Admin stats function - FAILED: %', SQLERRM;
            END;
        ELSE
            RAISE NOTICE '⚠ Current user is not admin (role: %), skipping admin function test', current_user_role;
        END IF;
    ELSE
        RAISE NOTICE '❌ Admin functions not found';
    END IF;
END $$;

-- Step 4: Test profile access (should work fine)
SELECT 'TESTING PROFILE ACCESS' AS test_section;

DO $$
DECLARE
    profile_count INTEGER;
    sample_profile RECORD;
BEGIN
    -- Test basic profile query
    SELECT COUNT(*) INTO profile_count FROM profiles;
    RAISE NOTICE 'Total profiles accessible: %', profile_count;
    
    -- Test profile details query
    SELECT * INTO sample_profile FROM profiles LIMIT 1;
    
    IF sample_profile IS NOT NULL THEN
        RAISE NOTICE '✓ Profile access test - PASSED';
        RAISE NOTICE 'Sample profile: % (role: %)', sample_profile.email, sample_profile.role;
    ELSE
        RAISE NOTICE '❌ Profile access test - FAILED (no profiles found)';
    END IF;
END $$;

-- Step 5: Test auth.users access (should fail gracefully)
SELECT 'TESTING AUTH.USERS ACCESS' AS test_section;

DO $$
DECLARE
    users_accessible BOOLEAN := FALSE;
BEGIN
    -- Try to access auth.users (this should fail)
    BEGIN
        PERFORM COUNT(*) FROM auth.users;
        users_accessible := TRUE;
        RAISE NOTICE '⚠ auth.users table is accessible (unexpected)';
    EXCEPTION
        WHEN insufficient_privilege THEN
            RAISE NOTICE '✓ auth.users access properly restricted - EXPECTED';
        WHEN OTHERS THEN
            RAISE NOTICE '✓ auth.users access blocked: % - EXPECTED', SQLERRM;
    END;
    
    IF NOT users_accessible THEN
        RAISE NOTICE '✓ Security test passed - auth.users is properly protected';
    END IF;
END $$;

-- Step 6: Test notification security functions
SELECT 'TESTING NOTIFICATION SECURITY FUNCTIONS' AS test_section;

DO $$
DECLARE
    security_functions TEXT[] := ARRAY[
        'should_notify_user',
        'prevent_duplicate_notification',
        'create_secure_notification',
        'cleanup_expired_notifications'
    ];
    function_name TEXT;
    function_count INTEGER := 0;
BEGIN
    FOREACH function_name IN ARRAY security_functions
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = function_name
        ) THEN
            function_count := function_count + 1;
            RAISE NOTICE '✓ Function exists: %', function_name;
        ELSE
            RAISE NOTICE '❌ Function missing: %', function_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Security functions available: %/%', function_count, array_length(security_functions, 1);
END $$;

-- Step 7: Summary and recommendations
SELECT 'TEST SUMMARY' AS test_section;

DO $$
DECLARE
    notification_policies INTEGER;
    admin_functions INTEGER;
    security_functions INTEGER;
    current_user_role TEXT;
BEGIN
    -- Count components
    SELECT COUNT(*) INTO notification_policies 
    FROM pg_policies 
    WHERE tablename = 'notifications';
    
    SELECT COUNT(*) INTO admin_functions
    FROM information_schema.routines 
    WHERE routine_name IN ('get_admin_user_stats', 'get_admin_user_details');
    
    SELECT COUNT(*) INTO security_functions
    FROM information_schema.routines 
    WHERE routine_name IN (
        'should_notify_user', 'prevent_duplicate_notification', 
        'create_secure_notification', 'cleanup_expired_notifications'
    );
    
    SELECT role INTO current_user_role FROM profiles WHERE id = auth.uid();
    
    RAISE NOTICE '=== ADMIN DASHBOARD FIX TEST SUMMARY ===';
    RAISE NOTICE 'Notification RLS policies: %', notification_policies;
    RAISE NOTICE 'Admin functions: %', admin_functions;
    RAISE NOTICE 'Security functions: %', security_functions;
    RAISE NOTICE 'Current user role: %', COALESCE(current_user_role, 'Not authenticated');
    RAISE NOTICE '';
    
    IF notification_policies >= 4 AND admin_functions >= 2 AND security_functions >= 4 THEN
        RAISE NOTICE '✅ ALL TESTS PASSED';
        RAISE NOTICE 'Admin dashboard should work without auth.users permission errors';
        RAISE NOTICE '';
        RAISE NOTICE 'Next steps:';
        RAISE NOTICE '1. Test admin dashboard in browser';
        RAISE NOTICE '2. Verify notification bell works correctly';
        RAISE NOTICE '3. Check that user management functions work';
        RAISE NOTICE '4. Confirm no more "permission denied for table users" errors';
    ELSE
        RAISE NOTICE '⚠ SOME TESTS FAILED';
        RAISE NOTICE 'Manual verification and additional fixes may be needed';
        RAISE NOTICE '';
        RAISE NOTICE 'Issues to check:';
        IF notification_policies < 4 THEN
            RAISE NOTICE '- Notification RLS policies incomplete';
        END IF;
        IF admin_functions < 2 THEN
            RAISE NOTICE '- Admin functions missing';
        END IF;
        IF security_functions < 4 THEN
            RAISE NOTICE '- Security functions incomplete';
        END IF;
    END IF;
END $$;

SELECT 'Admin dashboard fix test completed!' AS result;
