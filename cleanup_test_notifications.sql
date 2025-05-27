-- CLEANUP TEST NOTIFICATIONS
-- Removes test notifications created by AuthDebugPanel
-- Run this in Supabase dashboard to clean up test data

-- Remove test notifications with "Test" title and "Test message"
DELETE FROM notifications 
WHERE title = 'Test' 
  AND message = 'Test message' 
  AND type = 'general'
  AND data->>'test' = 'true';

-- Show remaining notification count
SELECT 
  'Cleanup completed' as status,
  COUNT(*) as remaining_notifications
FROM notifications;

-- Show notification breakdown by type
SELECT 
  type,
  COUNT(*) as count,
  COUNT(CASE WHEN read = false THEN 1 END) as unread_count
FROM notifications
GROUP BY type
ORDER BY count DESC;
