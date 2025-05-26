import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (same as frontend)
const supabase = createClient(
  'https://rygyecrhevzrtfjtkfwf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5Z3llY3JoZXZ6cnRmanRrZndmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwMjE2NTMsImV4cCI6MjA1NDU5NzY1M30.t_41y0qOBiBmZaudvIBW_VsNzDmmlO17iGe2s9pzi1A'
);

async function debugAdminAuth() {
  console.log('🔍 Debugging Admin Authentication...\n');

  try {
    // 1. Check current session
    console.log('1. Checking current session...');
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
    } else if (session.session) {
      console.log('✅ Active session found');
      console.log('   User ID:', session.session.user.id);
      console.log('   Email:', session.session.user.email);
      console.log('   Role:', session.session.user.role);
    } else {
      console.log('❌ No active session');
    }

    // 2. Try to get admin users
    console.log('\n2. Fetching admin users...');
    const { data: admins, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin');
    
    if (adminError) {
      console.error('❌ Error fetching admins:', adminError);
    } else {
      console.log('✅ Admin users found:', admins.length);
      admins.forEach(admin => {
        console.log(`   - ${admin.username} (${admin.email})`);
      });
    }

    // 3. Test notification insertion without authentication
    console.log('\n3. Testing notification insertion (unauthenticated)...');
    const { data: insertResult, error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: '88532ad1-995e-44b2-938e-175494060a80', // Test user ID
        type: 'general',
        title: 'Test Notification',
        message: 'Testing notification insertion without auth',
        data: { test: true }
      })
      .select();
    
    if (insertError) {
      console.error('❌ Failed to insert notification (expected):', insertError.message);
      console.log('   This confirms RLS is working correctly');
    } else {
      console.log('⚠️ Notification inserted without auth (unexpected):', insertResult);
    }

    // 4. Check RLS policies
    console.log('\n4. Checking RLS policies...');
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'notifications');
    
    if (policyError) {
      console.error('❌ Error fetching policies:', policyError);
    } else {
      console.log('✅ RLS policies found:', policies.length);
      policies.forEach(policy => {
        console.log(`   - ${policy.policyname}: ${policy.cmd}`);
      });
    }

    // 5. Provide debugging recommendations
    console.log('\n📋 Debugging Recommendations:');
    console.log('1. Check if admin user is properly signed in on the frontend');
    console.log('2. Verify that the Supabase client has the correct session');
    console.log('3. Check browser console for authentication errors');
    console.log('4. Ensure the admin user has the correct role in the database');
    console.log('5. Test the verification workflow while logged in as admin');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the debug
debugAdminAuth();
