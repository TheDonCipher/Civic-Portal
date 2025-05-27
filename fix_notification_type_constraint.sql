-- FIX NOTIFICATION TYPE CONSTRAINT
-- This script ensures the notifications table accepts all required notification types
-- Run this before running any notification security tests

-- Step 1: Check current constraint
SELECT 'Checking current notification type constraint...' AS step;

SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname LIKE '%notifications%type%' OR conname LIKE '%type%check%';

-- Step 2: Drop existing type constraints
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    RAISE NOTICE 'Dropping existing notification type constraints...';
    
    -- Drop all type-related constraints on notifications table
    FOR constraint_rec IN
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'notifications'
        AND constraint_type = 'CHECK'
        AND (constraint_name LIKE '%type%' OR constraint_name LIKE '%notifications%check%')
    LOOP
        EXECUTE 'ALTER TABLE notifications DROP CONSTRAINT IF EXISTS ' || constraint_rec.constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_rec.constraint_name;
    END LOOP;
    
    -- Also try common constraint names
    BEGIN
        ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
        RAISE NOTICE 'Dropped notifications_type_check constraint';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'notifications_type_check constraint did not exist';
    END;
    
    BEGIN
        ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_check;
        RAISE NOTICE 'Dropped notifications_check constraint';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'notifications_check constraint did not exist';
    END;
END $$;

-- Step 3: Add comprehensive type constraint
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
CHECK (type IN (
  -- Verification and account types
  'verification_approved', 'verification_rejected', 'role_changed',
  -- Issue-related types
  'status_change', 'issue_update', 'comment', 'solution',
  -- System and general types
  'system', 'general', 'info', 'success', 'warning', 'error'
));

-- Step 4: Add priority constraint if it doesn't exist
DO $$
BEGIN
    -- Check if priority constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'notifications'
        AND constraint_name = 'notifications_priority_check'
    ) THEN
        ALTER TABLE notifications ADD CONSTRAINT notifications_priority_check
        CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
        RAISE NOTICE 'Added notifications_priority_check constraint';
    ELSE
        RAISE NOTICE 'notifications_priority_check constraint already exists';
    END IF;
END $$;

-- Step 5: Verify the new constraints
SELECT 'Verifying updated constraints...' AS step;

SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname IN ('notifications_type_check', 'notifications_priority_check');

-- Step 6: Test notification creation with all types
SELECT 'Testing notification type creation...' AS step;

DO $$
DECLARE
    test_user_id UUID;
    notification_types TEXT[] := ARRAY[
        'verification_approved', 'verification_rejected', 'role_changed',
        'status_change', 'issue_update', 'comment', 'solution',
        'system', 'general', 'info', 'success', 'warning', 'error'
    ];
    notification_type TEXT;
    test_count INTEGER := 0;
    notification_id UUID;
BEGIN
    -- Get a test user
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;

    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing notification creation with user: %', test_user_id;
        
        FOREACH notification_type IN ARRAY notification_types
        LOOP
            BEGIN
                INSERT INTO notifications (user_id, type, title, message, data)
                VALUES (
                    test_user_id,
                    notification_type,
                    'Test ' || notification_type,
                    'Testing notification type: ' || notification_type,
                    '{"test": true, "type_test": "' || notification_type || '"}'
                ) RETURNING id INTO notification_id;
                
                test_count := test_count + 1;
                RAISE NOTICE '✓ Successfully created notification of type: %', notification_type;
                
                -- Clean up test notification
                DELETE FROM notifications WHERE id = notification_id;
                
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE '❌ Failed to create notification of type: % - Error: %', notification_type, SQLERRM;
            END;
        END LOOP;

        RAISE NOTICE 'Successfully tested %/% notification types', test_count, array_length(notification_types, 1);
    ELSE
        RAISE NOTICE 'No test user found - skipping notification type tests';
    END IF;
END $$;

-- Step 7: Summary
DO $$
DECLARE
    type_constraint_exists BOOLEAN;
    priority_constraint_exists BOOLEAN;
BEGIN
    -- Check if constraints exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'notifications'
        AND constraint_name = 'notifications_type_check'
    ) INTO type_constraint_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'notifications'
        AND constraint_name = 'notifications_priority_check'
    ) INTO priority_constraint_exists;
    
    RAISE NOTICE '=== NOTIFICATION TYPE CONSTRAINT FIX SUMMARY ===';
    RAISE NOTICE 'Type constraint exists: %', type_constraint_exists;
    RAISE NOTICE 'Priority constraint exists: %', priority_constraint_exists;
    
    IF type_constraint_exists AND priority_constraint_exists THEN
        RAISE NOTICE '✅ NOTIFICATION CONSTRAINTS FIXED SUCCESSFULLY';
        RAISE NOTICE 'All notification types are now supported!';
    ELSE
        RAISE NOTICE '⚠ SOME CONSTRAINTS MAY BE MISSING';
        RAISE NOTICE 'Manual verification may be required.';
    END IF;
END $$;

SELECT 'Notification type constraint fix completed!' AS result;
