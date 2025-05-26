import { createClient } from '@supabase/supabase-js';

// Service role client for resetting test data
const serviceSupabase = createClient(
  'https://rygyecrhevzrtfjtkfwf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5Z3llY3JoZXZ6cnRmanRrZndmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTAyMTY1MywiZXhwIjoyMDU0NTk3NjUzfQ.oxduQpqmkK7FP5p0IyK_rHXkC5J_9-d86YiZLtIkEJ8'
);

async function resetTestUser() {
  console.log('🔄 Resetting test user for verification testing...\n');

  try {
    // 1. Find the test official user
    const { data: officials, error: officialsError } = await serviceSupabase
      .from('profiles')
      .select('*')
      .eq('role', 'official');
    
    if (officialsError) {
      console.error('❌ Error fetching officials:', officialsError);
      return;
    }
    
    if (officials.length === 0) {
      console.log('❌ No official users found to reset');
      return;
    }
    
    const testOfficial = officials[0];
    console.log(`Found test official: ${testOfficial.username} (${testOfficial.email})`);
    console.log(`Current status: ${testOfficial.verification_status}`);

    // 2. Reset verification status to pending
    console.log('\n🔄 Resetting verification status to pending...');
    
    const { error: updateError } = await serviceSupabase
      .from('profiles')
      .update({ 
        verification_status: 'pending',
        verification_notes: null 
      })
      .eq('id', testOfficial.id);
    
    if (updateError) {
      console.error('❌ Failed to reset verification status:', updateError);
      return;
    }
    
    console.log('✅ Verification status reset to pending');

    // 3. Clean up test notifications
    console.log('\n🧹 Cleaning up test notifications...');
    
    const { error: deleteError } = await serviceSupabase
      .from('notifications')
      .delete()
      .eq('user_id', testOfficial.id);
    
    if (deleteError) {
      console.error('❌ Failed to clean up notifications:', deleteError);
    } else {
      console.log('✅ Test notifications cleaned up');
    }

    // 4. Clean up test audit logs
    console.log('\n🧹 Cleaning up test audit logs...');
    
    const { error: auditDeleteError } = await serviceSupabase
      .from('audit_logs')
      .delete()
      .eq('resource_id', testOfficial.id);
    
    if (auditDeleteError) {
      console.error('❌ Failed to clean up audit logs:', auditDeleteError);
    } else {
      console.log('✅ Test audit logs cleaned up');
    }

    console.log('\n🎉 Test user reset completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Open the application in your browser');
    console.log('2. Sign in as admin user: eugeniusratshipa@gmail.com');
    console.log('3. Go to the Admin page (/admin)');
    console.log('4. Look for the pending official user and try to verify them');
    console.log('5. Check the browser console for detailed logs');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the reset
resetTestUser();
