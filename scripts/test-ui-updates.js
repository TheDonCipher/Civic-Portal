import { createClient } from '@supabase/supabase-js';

// Service role client for testing
const serviceSupabase = createClient(
  'https://rygyecrhevzrtfjtkfwf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5Z3llY3JoZXZ6cnRmanRrZndmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTAyMTY1MywiZXhwIjoyMDU0NTk3NjUzfQ.oxduQpqmkK7FP5p0IyK_rHXkC5J_9-d86YiZLtIkEJ8'
);

async function testUIUpdates() {
  console.log('🧪 Testing UI Update Workflow...\n');

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
      console.log('❌ No official users found to test with');
      return;
    }
    
    const testOfficial = officials[0];
    console.log(`Found test official: ${testOfficial.username}`);
    console.log(`Current status: ${testOfficial.verification_status}`);

    // 2. Set to pending if not already
    if (testOfficial.verification_status !== 'pending') {
      console.log('\n🔄 Setting verification status to pending...');
      
      const { error: resetError } = await serviceSupabase
        .from('profiles')
        .update({ verification_status: 'pending' })
        .eq('id', testOfficial.id);
      
      if (resetError) {
        console.error('❌ Failed to reset status:', resetError);
        return;
      }
      
      console.log('✅ Status set to pending');
    }

    console.log('\n📋 Test Instructions:');
    console.log('1. Open the admin page in your browser');
    console.log('2. Look for the pending official user in the User Management tab');
    console.log('3. Click the ✓ button to verify the user');
    console.log('4. Observe the following UI changes:');
    console.log('   - Buttons should show loading spinner immediately');
    console.log('   - Verification status badge should update to "verified"');
    console.log('   - Verify/Reject buttons should disappear');
    console.log('   - Success toast notification should appear');
    console.log('   - Console should show detailed logs');

    console.log('\n🔍 Expected Console Logs:');
    console.log('- "Starting verification update process"');
    console.log('- "Updating verification status for user"');
    console.log('- "Profile verification status updated successfully"');
    console.log('- "Creating audit log..."');
    console.log('- "Sending notification to user..."');
    console.log('- "Sending notification with authenticated session"');
    console.log('- "Notification sent successfully"');
    console.log('- "Profiles fetched successfully"');
    console.log('- "Verification update process completed successfully"');

    console.log('\n✅ Test setup complete! Now test the UI in your browser.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testUIUpdates();
