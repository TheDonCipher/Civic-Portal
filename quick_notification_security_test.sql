-- QUICK NOTIFICATION SECURITY TEST
-- Fixed version without ambiguous column references
-- Run this in Supabase SQL Editor to verify the security system works

-- Step 1: Basic system check
DO $$
BEGIN
    RAISE NOTICE '=== QUICK NOTIFICATION SECURITY TEST ===';
    RAISE NOTICE 'Testing core security functions...';
END $$;

-- Step 2: Test security functions exist
SELECT 'CHECKING SECURITY FUNCTIONS' AS test_section;

DO $$
DECLARE
    function_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines
    WHERE routine_name IN (
        'should_notify_user',
        'prevent_duplicate_notification',
        'create_secure_notification',
        'cleanup_expired_notifications'
    );

    IF function_count = 4 THEN
        RAISE NOTICE 'Security functions check - ✓ PASSED (All 4 functions exist)';
    ELSE
        RAISE NOTICE 'Security functions check - ❌ FAILED (Only % of 4 functions exist)', function_count;
    END IF;
END $$;

-- Step 3: Test RLS policies
SELECT 'CHECKING RLS POLICIES' AS test_section;

DO $$
DECLARE
    rls_enabled BOOLEAN;
    policy_count INTEGER;
BEGIN
    -- Check if RLS is enabled
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = 'notifications';

    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'notifications';

    IF rls_enabled AND policy_count >= 3 THEN
        RAISE NOTICE 'RLS policies check - ✓ PASSED (RLS enabled, % policies active)', policy_count;
    ELSE
        RAISE NOTICE 'RLS policies check - ❌ FAILED (RLS: %, Policies: %)', rls_enabled, policy_count;
    END IF;
END $$;

-- Step 4: Test self-notification prevention
SELECT 'TESTING SELF-NOTIFICATION PREVENTION' AS test_section;

DO $$
DECLARE
    test_user UUID;
    test_issue UUID;
    should_notify_result BOOLEAN;
BEGIN
    -- Get a test user and issue
    SELECT id INTO test_user FROM auth.users LIMIT 1;
    SELECT id INTO test_issue FROM issues LIMIT 1;

    IF test_user IS NOT NULL AND test_issue IS NOT NULL THEN
        -- Test that user doesn't get notified for their own actions
        SELECT should_notify_user(
            test_user,      -- user to notify
            test_issue,     -- issue id
            test_user,      -- action user (same as notify user)
            'comment'       -- notification type
        ) INTO should_notify_result;

        IF should_notify_result = FALSE THEN
            RAISE NOTICE 'Self-notification prevention - ✓ PASSED';
        ELSE
            RAISE NOTICE 'Self-notification prevention - ❌ FAILED';
        END IF;
    ELSE
        RAISE NOTICE 'Self-notification prevention - ⚠ SKIPPED (No test data available)';
    END IF;
END $$;

-- Step 5: Test duplicate prevention
SELECT 'TESTING DUPLICATE PREVENTION' AS test_section;

DO $$
DECLARE
    test_user UUID;
    test_issue UUID;
    first_notification UUID;
    second_notification UUID;
    is_duplicate_prevented BOOLEAN;
BEGIN
    -- Get test user and issue
    SELECT id INTO test_user FROM auth.users LIMIT 1;
    SELECT id INTO test_issue FROM issues LIMIT 1;

    IF test_user IS NOT NULL AND test_issue IS NOT NULL THEN
        -- Create first notification
        SELECT create_secure_notification(
            test_user,
            'system',
            'Duplicate Test',
            'Testing duplicate prevention',
            '{"test": true}',
            test_issue,
            NULL, NULL, NULL, 'normal', NULL, NULL
        ) INTO first_notification;

        -- Try to create duplicate notification immediately
        SELECT create_secure_notification(
            test_user,
            'system',
            'Duplicate Test',
            'Testing duplicate prevention',
            '{"test": true}',
            test_issue,
            NULL, NULL, NULL, 'normal', NULL, NULL
        ) INTO second_notification;

        -- Check if duplicate was prevented
        is_duplicate_prevented := (second_notification IS NULL);

        IF is_duplicate_prevented THEN
            RAISE NOTICE 'Duplicate prevention - ✓ PASSED';
        ELSE
            RAISE NOTICE 'Duplicate prevention - ❌ FAILED';
        END IF;

        -- Clean up test notifications
        DELETE FROM notifications WHERE id IN (first_notification, second_notification);
    ELSE
        RAISE NOTICE 'Duplicate prevention - ⚠ SKIPPED (No test data available)';
    END IF;
END $$;

-- Step 6: Test department filtering (fixed version)
SELECT 'TESTING DEPARTMENT FILTERING' AS test_section;

DO $$
DECLARE
    official_user UUID;
    official_dept_id UUID;
    test_issue UUID;
    should_notify_result BOOLEAN;
BEGIN
    -- Get an official user with department (using different variable name)
    SELECT p.id, p.department_id INTO official_user, official_dept_id
    FROM profiles p
    WHERE p.role = 'official' AND p.department_id IS NOT NULL
    LIMIT 1;

    -- Get an issue in that department (using table alias to avoid ambiguity)
    SELECT i.id INTO test_issue
    FROM issues i
    WHERE i.department_id = official_dept_id
    LIMIT 1;

    IF official_user IS NOT NULL AND test_issue IS NOT NULL THEN
        -- Test that department official gets notified
        SELECT should_notify_user(
            official_user,  -- department official
            test_issue,     -- issue in their department
            (SELECT id FROM auth.users WHERE id != official_user LIMIT 1), -- different action user
            'status_change' -- notification type
        ) INTO should_notify_result;

        IF should_notify_result = TRUE THEN
            RAISE NOTICE 'Department filtering - ✓ PASSED';
        ELSE
            RAISE NOTICE 'Department filtering - ❌ FAILED';
        END IF;
    ELSE
        RAISE NOTICE 'Department filtering - ⚠ SKIPPED (No official with department and matching issue found)';
    END IF;
END $$;

-- Step 7: Test notification expiration
SELECT 'TESTING NOTIFICATION EXPIRATION' AS test_section;

DO $$
DECLARE
    test_user UUID;
    expired_notification UUID;
BEGIN
    -- Get test user
    SELECT id INTO test_user FROM auth.users LIMIT 1;

    IF test_user IS NOT NULL THEN
        -- Try to create an already-expired notification
        SELECT create_secure_notification(
            test_user,
            'system',
            'Expired Test',
            'This should not be created',
            '{"test": true}',
            NULL, NULL, NULL, NULL, 'normal',
            NOW() - INTERVAL '1 hour', -- expired 1 hour ago
            NULL
        ) INTO expired_notification;

        IF expired_notification IS NULL THEN
            RAISE NOTICE 'Expiration prevention - ✓ PASSED';
        ELSE
            RAISE NOTICE 'Expiration prevention - ❌ FAILED';
            -- Clean up if somehow created
            DELETE FROM notifications WHERE id = expired_notification;
        END IF;
    ELSE
        RAISE NOTICE 'Expiration prevention - ⚠ SKIPPED (No test user available)';
    END IF;
END $$;

-- Step 8: Test cleanup function
SELECT 'TESTING CLEANUP FUNCTION' AS test_section;

DO $$
DECLARE
    test_user UUID;
    expired_notification UUID;
    cleanup_count INTEGER;
BEGIN
    -- Get test user
    SELECT id INTO test_user FROM auth.users LIMIT 1;

    IF test_user IS NOT NULL THEN
        -- Manually insert an expired notification for testing
        INSERT INTO notifications (
            user_id, type, title, message, expires_at
        ) VALUES (
            test_user, 'system', 'Cleanup Test', 'Should be cleaned up',
            NOW() - INTERVAL '1 hour'
        ) RETURNING id INTO expired_notification;

        -- Run cleanup function
        SELECT cleanup_expired_notifications() INTO cleanup_count;

        -- Check if notification was cleaned up
        IF NOT EXISTS(SELECT 1 FROM notifications WHERE id = expired_notification) THEN
            RAISE NOTICE 'Cleanup function - ✓ PASSED (Cleaned up % notifications)', cleanup_count;
        ELSE
            RAISE NOTICE 'Cleanup function - ❌ FAILED';
            -- Manual cleanup
            DELETE FROM notifications WHERE id = expired_notification;
        END IF;
    ELSE
        RAISE NOTICE 'Cleanup function - ⚠ SKIPPED (No test user available)';
    END IF;
END $$;

-- Step 9: Summary
SELECT 'TEST SUMMARY' AS test_section;

DO $$
DECLARE
    total_notifications INTEGER;
    active_policies INTEGER;
    available_functions INTEGER;
BEGIN
    -- Get statistics
    SELECT COUNT(*) INTO total_notifications FROM notifications;
    SELECT COUNT(*) INTO active_policies FROM pg_policies WHERE tablename = 'notifications';
    SELECT COUNT(*) INTO available_functions
    FROM information_schema.routines
    WHERE routine_name IN (
        'should_notify_user', 'prevent_duplicate_notification',
        'create_secure_notification', 'cleanup_expired_notifications'
    );

    RAISE NOTICE '=== QUICK TEST SUMMARY ===';
    RAISE NOTICE 'Security functions available: %/4', available_functions;
    RAISE NOTICE 'RLS policies active: %', active_policies;
    RAISE NOTICE 'Total notifications in system: %', total_notifications;
    RAISE NOTICE '';

    IF available_functions = 4 AND active_policies >= 3 THEN
        RAISE NOTICE '✅ SECURITY SYSTEM STATUS: READY';
        RAISE NOTICE 'Enhanced notification security is properly configured!';
    ELSE
        RAISE NOTICE '⚠ SECURITY SYSTEM STATUS: NEEDS ATTENTION';
        RAISE NOTICE 'Some security components may be missing or misconfigured.';
    END IF;
END $$;

SELECT 'Quick notification security test completed!' AS result;
