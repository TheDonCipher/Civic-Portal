import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  'https://rygyecrhevzrtfjtkfwf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5Z3llY3JoZXZ6cnRmanRrZndmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwMjE2NTMsImV4cCI6MjA1NDU5NzY1M30.t_41y0qOBiBmZaudvIBW_VsNzDmmlO17iGe2s9pzi1A'
);

async function testVerificationWorkflow() {
  console.log('🔍 Testing Verification Workflow...\n');

  try {
    // 1. Check if tables exist
    console.log('1. Checking table structure...');

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, role, verification_status')
      .limit(5);

    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError);
      return;
    }

    console.log('✅ Profiles table accessible');
    console.log('Sample profiles:', profiles);

    // 2. Check notifications table
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .limit(5);

    if (notificationsError) {
      console.error('❌ Notifications table error:', notificationsError);
    } else {
      console.log('✅ Notifications table accessible');
      console.log('Sample notifications:', notifications);
    }

    // 3. Check audit logs table
    const { data: auditLogs, error: auditError } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(5);

    if (auditError) {
      console.error('❌ Audit logs table error:', auditError);
    } else {
      console.log('✅ Audit logs table accessible');
      console.log('Sample audit logs:', auditLogs);
    }

    // 4. Check for pending officials
    const { data: pendingOfficials, error: pendingError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'official')
      .eq('verification_status', 'pending');

    if (pendingError) {
      console.error('❌ Error fetching pending officials:', pendingError);
    } else {
      console.log('✅ Pending officials found:', pendingOfficials.length);
      console.log('Pending officials:', pendingOfficials);
    }

    // 5. Check for admin users
    const { data: admins, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin');

    if (adminError) {
      console.error('❌ Error fetching admins:', adminError);
    } else {
      console.log('✅ Admin users found:', admins.length);
      console.log('Admin users:', admins);
    }

    // 6. Test notification insertion
    console.log('\n2. Testing notification insertion...');

    if (profiles && profiles.length > 0) {
      const testUserId = profiles[0].id;

      const { data: insertResult, error: insertError } = await supabase
        .from('notifications')
        .insert({
          user_id: testUserId,
          type: 'general',
          title: 'Test Notification',
          message:
            'This is a test notification to verify the system is working.',
          data: { test: true },
        })
        .select();

      if (insertError) {
        console.error('❌ Failed to insert test notification:', insertError);
      } else {
        console.log(
          '✅ Test notification inserted successfully:',
          insertResult
        );

        // Clean up test notification
        await supabase
          .from('notifications')
          .delete()
          .eq('id', insertResult[0].id);
        console.log('✅ Test notification cleaned up');
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testVerificationWorkflow();
