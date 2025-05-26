import { createClient } from '@supabase/supabase-js';

// Service role client for testing
const serviceSupabase = createClient(
  'https://rygyecrhevzrtfjtkfwf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5Z3llY3JoZXZ6cnRmanRrZndmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTAyMTY1MywiZXhwIjoyMDU0NTk3NjUzfQ.oxduQpqmkK7FP5p0IyK_rHXkC5J_9-d86YiZLtIkEJ8'
);

async function checkDepartments() {
  try {
    console.log('Checking departments table...');
    
    const { data: departments, error } = await serviceSupabase
      .from('departments')
      .select('*');
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('Departments found:', departments.length);
    departments.forEach(dept => {
      console.log(`- ${dept.name} (${dept.id})`);
    });
    
    // Check official user
    const { data: official, error: officialError } = await serviceSupabase
      .from('profiles')
      .select('*')
      .eq('role', 'official')
      .single();
    
    if (officialError) {
      console.error('Official error:', officialError);
      return;
    }
    
    console.log('Official department_id:', official.department_id);
    
    if (official.department_id) {
      const dept = departments.find(d => d.id === official.department_id);
      console.log('Department found:', dept ? dept.name : 'NOT FOUND');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkDepartments();
