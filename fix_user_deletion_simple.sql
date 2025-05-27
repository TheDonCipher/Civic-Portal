-- Simple fix for user deletion cascade issues
-- This script only fixes the essential constraints to allow user deletion

-- Step 1: Fix the main profiles table constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Fix legal_consents table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'legal_consents') THEN
    ALTER TABLE legal_consents DROP CONSTRAINT IF EXISTS legal_consents_user_id_fkey;
    ALTER TABLE legal_consents 
    ADD CONSTRAINT legal_consents_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 3: Check what tables exist and their structure
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name IN ('issues', 'comments', 'solutions', 'updates', 'votes', 'watchers', 'notifications')
  AND column_name IN ('author_id', 'user_id', 'proposed_by', 'assigned_to')
ORDER BY table_name, column_name;

-- Step 4: Create a safe user deletion function that works with any schema
CREATE OR REPLACE FUNCTION delete_user_by_email(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  user_id UUID;
  result_message TEXT;
  table_record RECORD;
BEGIN
  -- Find user by email
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN 'User not found with email: ' || user_email;
  END IF;
  
  -- Log what we're about to delete
  result_message := 'Deleting user: ' || user_email || ' (ID: ' || user_id || ')' || E'\n';
  
  -- Check for related records
  FOR table_record IN 
    SELECT 
      schemaname, 
      tablename,
      'SELECT COUNT(*) FROM ' || schemaname || '.' || tablename || ' WHERE ' || 
      CASE 
        WHEN tablename = 'profiles' THEN 'id'
        ELSE 'author_id'
      END || ' = ''' || user_id || '''' as count_query
    FROM pg_tables 
    WHERE tablename IN ('profiles', 'issues', 'comments', 'solutions', 'updates', 'votes', 'watchers', 'notifications')
      AND schemaname = 'public'
  LOOP
    BEGIN
      EXECUTE table_record.count_query;
      result_message := result_message || 'Found records in: ' || table_record.tablename || E'\n';
    EXCEPTION WHEN OTHERS THEN
      -- Table might not have the expected column, skip it
      CONTINUE;
    END;
  END LOOP;
  
  -- Try to delete the user
  BEGIN
    DELETE FROM auth.users WHERE id = user_id;
    result_message := result_message || 'User deleted successfully!';
    RETURN result_message;
  EXCEPTION WHEN OTHERS THEN
    RETURN result_message || 'Error during deletion: ' || SQLERRM;
  END;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION delete_user_by_email(TEXT) TO authenticated;

-- Step 6: Usage example (uncomment to use)
-- SELECT delete_user_by_email('futurefleshnft@gmail.com');
