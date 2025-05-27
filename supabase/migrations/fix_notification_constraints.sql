-- FIX NOTIFICATION CONSTRAINTS
-- =============================
--
-- This script fixes the notification type constraints to support all notification types
-- Run this BEFORE running the test_notifications.sql script
--
-- This script is safe to run multiple times

-- Check current constraint
SELECT 'Current notification type constraint:' AS info;
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname = 'notifications_type_check';

-- Drop existing constraints if they exist and add updated ones
DO $$
BEGIN
    -- Drop existing type constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'notifications'
        AND constraint_name = 'notifications_type_check'
    ) THEN
        ALTER TABLE notifications DROP CONSTRAINT notifications_type_check;
        RAISE NOTICE 'Dropped existing notifications_type_check constraint';
    END IF;

    -- Drop existing priority constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'notifications'
        AND constraint_name = 'notifications_priority_check'
    ) THEN
        ALTER TABLE notifications DROP CONSTRAINT notifications_priority_check;
        RAISE NOTICE 'Dropped existing notifications_priority_check constraint';
    END IF;

    -- Also check for any other constraint names that might exist
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'notifications'
        AND constraint_type = 'CHECK'
        AND constraint_name LIKE '%type%'
    ) THEN
        DECLARE
            constraint_rec RECORD;
        BEGIN
            FOR constraint_rec IN
                SELECT constraint_name
                FROM information_schema.table_constraints
                WHERE table_name = 'notifications'
                AND constraint_type = 'CHECK'
                AND constraint_name LIKE '%type%'
            LOOP
                EXECUTE 'ALTER TABLE notifications DROP CONSTRAINT ' || constraint_rec.constraint_name;
                RAISE NOTICE 'Dropped constraint: %', constraint_rec.constraint_name;
            END LOOP;
        END;
    END IF;
END $$;

-- Add updated constraints with all supported types
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
CHECK (type IN (
  'verification_approved', 'verification_rejected', 'role_changed',
  'status_change', 'issue_update', 'comment', 'solution',
  'system', 'general', 'info', 'success', 'warning', 'error'
));

ALTER TABLE notifications ADD CONSTRAINT notifications_priority_check
CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Verify the new constraints
SELECT 'Updated notification type constraint:' AS info;
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname = 'notifications_type_check';

SELECT 'Updated notification priority constraint:' AS info;
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname = 'notifications_priority_check';

-- Test that we can now create notifications with all types
SELECT 'Testing notification type creation...' AS test_step;

-- Test each notification type
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
BEGIN
    -- Get a test user
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;

    IF test_user_id IS NOT NULL THEN
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
                );
                test_count := test_count + 1;
                RAISE NOTICE 'Successfully created notification of type: %', notification_type;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Failed to create notification of type: % - Error: %', notification_type, SQLERRM;
            END;
        END LOOP;

        RAISE NOTICE 'Successfully created % test notifications', test_count;
    ELSE
        RAISE NOTICE 'No test user found - skipping notification type tests';
    END IF;
END $$;

-- Clean up test notifications
DELETE FROM notifications WHERE data->>'test' = 'true' AND data->>'type_test' IS NOT NULL;

SELECT 'NOTIFICATION CONSTRAINTS FIXED!' AS result,
       'All notification types are now supported' AS status;
