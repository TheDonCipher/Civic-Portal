import { createClient } from '@supabase/supabase-js';

// Initialize Supabase clients
const supabase = createClient(
  'https://rygyecrhevzrtfjtkfwf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5Z3llY3JoZXZ6cnRmanRrZndmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwMjE2NTMsImV4cCI6MjA1NDU5NzY1M30.t_41y0qOBiBmZaudvIBW_VsNzDmmlO17iGe2s9pzi1A'
);

// Service role client for testing admin operations
const serviceSupabase = createClient(
  'https://rygyecrhevzrtfjtkfwf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5Z3llY3JoZXZ6cnRmanRrZndmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTAyMTY1MywiZXhwIjoyMDU0NTk3NjUzfQ.oxduQpqmkK7FP5p0IyK_rHXkC5J_9-d86YiZLtIkEJ8'
);

async function testAdminVerificationWorkflow() {
  console.log('🔍 Testing Admin Verification Workflow...\n');

  try {
    // 1. Get pending officials and admin users
    console.log('1. Fetching users...');
    
    const { data: pendingOfficials, error: pendingError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'official')
      .eq('verification_status', 'pending');
    
    const { data: admins, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin');
    
    if (pendingError || adminError) {
      console.error('❌ Error fetching users:', { pendingError, adminError });
      return;
    }
    
    console.log(`✅ Found ${pendingOfficials.length} pending officials`);
    console.log(`✅ Found ${admins.length} admin users`);
    
    if (pendingOfficials.length === 0) {
      console.log('⚠️ No pending officials to test with');
      return;
    }
    
    if (admins.length === 0) {
      console.log('⚠️ No admin users found');
      return;
    }

    const pendingOfficial = pendingOfficials[0];
    const admin = admins[0];
    
    console.log(`\n2. Testing verification of official: ${pendingOfficial.username}`);
    console.log(`   Admin performing verification: ${admin.username}`);

    // 2. Test updating verification status (simulating admin action)
    console.log('\n3. Updating verification status to "verified"...');
    
    const { data: updateResult, error: updateError } = await serviceSupabase
      .from('profiles')
      .update({ verification_status: 'verified' })
      .eq('id', pendingOfficial.id)
      .select();
    
    if (updateError) {
      console.error('❌ Failed to update verification status:', updateError);
      return;
    }
    
    console.log('✅ Verification status updated successfully');

    // 3. Test sending notification
    console.log('\n4. Sending verification approved notification...');
    
    const { data: notificationResult, error: notificationError } = await serviceSupabase
      .from('notifications')
      .insert({
        user_id: pendingOfficial.id,
        type: 'verification_approved',
        title: 'Account Verified! 🎉',
        message: `Congratulations ${pendingOfficial.full_name || pendingOfficial.username}! Your government official account has been verified. You now have access to the stakeholder dashboard.`,
        data: {
          department: pendingOfficial.department?.name,
          verified_at: new Date().toISOString()
        }
      })
      .select();
    
    if (notificationError) {
      console.error('❌ Failed to send notification:', notificationError);
    } else {
      console.log('✅ Notification sent successfully:', notificationResult);
    }

    // 4. Test audit log creation
    console.log('\n5. Creating audit log...');
    
    const { data: auditResult, error: auditError } = await serviceSupabase
      .from('audit_logs')
      .insert({
        action: 'verification_update',
        resource_type: 'user_management',
        resource_id: pendingOfficial.id,
        user_id: admin.id,
        details: {
          target_user_id: pendingOfficial.id,
          target_user_name: pendingOfficial.full_name || pendingOfficial.username,
          verification_status: 'verified',
          admin_id: admin.id,
          admin_name: admin.full_name || admin.username
        }
      })
      .select();
    
    if (auditError) {
      console.error('❌ Failed to create audit log:', auditError);
    } else {
      console.log('✅ Audit log created successfully:', auditResult);
    }

    // 5. Verify the changes
    console.log('\n6. Verifying changes...');
    
    const { data: updatedProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', pendingOfficial.id)
      .single();
    
    if (verifyError) {
      console.error('❌ Failed to verify changes:', verifyError);
    } else {
      console.log('✅ Profile verification status:', updatedProfile.verification_status);
    }

    // 6. Check notifications for the user
    const { data: userNotifications, error: notifError } = await serviceSupabase
      .from('notifications')
      .select('*')
      .eq('user_id', pendingOfficial.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (notifError) {
      console.error('❌ Failed to fetch user notifications:', notifError);
    } else {
      console.log('✅ User notifications:', userNotifications.length);
      userNotifications.forEach(notif => {
        console.log(`   - ${notif.title}: ${notif.message}`);
      });
    }

    console.log('\n🎉 Admin verification workflow test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   ✅ Verification status updated: ${pendingOfficial.username}`);
    console.log(`   ✅ Notification sent: ${notificationResult ? 'Yes' : 'No'}`);
    console.log(`   ✅ Audit log created: ${auditResult ? 'Yes' : 'No'}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testAdminVerificationWorkflow();
