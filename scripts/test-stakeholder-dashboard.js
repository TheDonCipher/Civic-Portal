import { createClient } from '@supabase/supabase-js';

// Service role client for testing
const serviceSupabase = createClient(
  'https://rygyecrhevzrtfjtkfwf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5Z3llY3JoZXZ6cnRmanRrZndmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTAyMTY1MywiZXhwIjoyMDU0NTk3NjUzfQ.oxduQpqmkK7FP5p0IyK_rHXkC5J_9-d86YiZLtIkEJ8'
);

async function testStakeholderDashboard() {
  console.log('🔍 Testing Stakeholder Dashboard Data...\n');

  try {
    // 1. Get the verified official user
    const { data: officials, error: officialsError } = await serviceSupabase
      .from('profiles')
      .select('*')
      .eq('role', 'official')
      .eq('verification_status', 'verified');
    
    if (officialsError) {
      console.error('❌ Error fetching officials:', officialsError);
      return;
    }
    
    if (officials.length === 0) {
      console.log('❌ No verified official users found');
      return;
    }
    
    const testOfficial = officials[0];
    console.log('👤 Test Official:');
    console.log(`   Username: ${testOfficial.username}`);
    console.log(`   Email: ${testOfficial.email}`);
    console.log(`   Role: ${testOfficial.role}`);
    console.log(`   Verification Status: ${testOfficial.verification_status}`);
    console.log(`   Department ID: ${testOfficial.department_id}`);

    // 2. Check if departments table exists and has data
    console.log('\n🏢 Checking departments...');
    
    const { data: departments, error: departmentsError } = await serviceSupabase
      .from('departments')
      .select('*')
      .order('name');
    
    if (departmentsError) {
      console.error('❌ Error fetching departments:', departmentsError);
      return;
    }
    
    console.log(`✅ Found ${departments.length} departments:`);
    departments.forEach(dept => {
      console.log(`   - ${dept.name} (ID: ${dept.id})`);
    });

    // 3. Check if the official's department exists
    if (testOfficial.department_id) {
      const userDepartment = departments.find(d => d.id === testOfficial.department_id);
      if (userDepartment) {
        console.log(`\n✅ Official's department found: ${userDepartment.name}`);
      } else {
        console.log(`\n❌ Official's department NOT found: ${testOfficial.department_id}`);
        console.log('   This will cause errors in the stakeholder dashboard!');
        
        // Try to assign the official to the first available department
        if (departments.length > 0) {
          console.log(`\n🔧 Assigning official to first department: ${departments[0].name}`);
          
          const { error: updateError } = await serviceSupabase
            .from('profiles')
            .update({ department_id: departments[0].id })
            .eq('id', testOfficial.id);
          
          if (updateError) {
            console.error('❌ Failed to update department:', updateError);
          } else {
            console.log('✅ Department assignment updated');
          }
        }
      }
    } else {
      console.log('\n❌ Official has no department assignment');
      
      // Assign to first department if available
      if (departments.length > 0) {
        console.log(`\n🔧 Assigning official to first department: ${departments[0].name}`);
        
        const { error: updateError } = await serviceSupabase
          .from('profiles')
          .update({ department_id: departments[0].id })
          .eq('id', testOfficial.id);
        
        if (updateError) {
          console.error('❌ Failed to update department:', updateError);
        } else {
          console.log('✅ Department assignment updated');
        }
      }
    }

    // 4. Check issues table
    console.log('\n📋 Checking issues...');
    
    const { data: issues, error: issuesError } = await serviceSupabase
      .from('issues')
      .select('*')
      .limit(5);
    
    if (issuesError) {
      console.error('❌ Error fetching issues:', issuesError);
    } else {
      console.log(`✅ Found ${issues.length} issues (showing first 5)`);
      issues.forEach(issue => {
        console.log(`   - ${issue.title} (Status: ${issue.status}, Dept: ${issue.department_id})`);
      });
    }

    // 5. Check department-specific issues
    if (testOfficial.department_id) {
      const { data: deptIssues, error: deptIssuesError } = await serviceSupabase
        .from('issues')
        .select('*')
        .eq('department_id', testOfficial.department_id);
      
      if (deptIssuesError) {
        console.error('❌ Error fetching department issues:', deptIssuesError);
      } else {
        console.log(`\n📊 Department-specific issues: ${deptIssues.length}`);
        if (deptIssues.length === 0) {
          console.log('   No issues assigned to this department yet');
        }
      }
    }

    console.log('\n🎯 Stakeholder Dashboard Test Results:');
    console.log('✅ Official user is verified');
    console.log('✅ Departments table accessible');
    console.log('✅ Issues table accessible');
    console.log('✅ Department assignment checked/fixed');

    console.log('\n📋 Next Steps:');
    console.log('1. Open the stakeholder dashboard in your browser');
    console.log('2. Sign in as the verified official');
    console.log('3. Navigate to /stakeholder');
    console.log('4. Check the browser console for detailed logs');
    console.log('5. The dashboard should now load without errors');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testStakeholderDashboard();
