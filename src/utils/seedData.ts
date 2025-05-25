import { supabase } from '@/lib/supabase';

/**
 * Seed data functions for development and testing
 */

export const departments = [
  {
    name: 'Finance',
    description: 'Financial management and budget oversight'
  },
  {
    name: 'International Relations',
    description: 'Foreign affairs and diplomatic relations'
  },
  {
    name: 'Health',
    description: 'Public health services and healthcare management'
  },
  {
    name: 'Child Welfare and Basic Education',
    description: 'Education and child protection services'
  },
  {
    name: 'Higher Education',
    description: 'Universities and tertiary education'
  },
  {
    name: 'Lands and Agriculture',
    description: 'Land management and agricultural development'
  },
  {
    name: 'Youth and Gender Affairs',
    description: 'Youth development and gender equality programs'
  },
  {
    name: 'State Presidency',
    description: 'Executive office and state administration'
  },
  {
    name: 'Justice and Correctional Services',
    description: 'Legal system and correctional facilities'
  },
  {
    name: 'Local Government and Traditional Affairs',
    description: 'Municipal governance and traditional leadership'
  },
  {
    name: 'Minerals and Energy',
    description: 'Mining and energy sector oversight'
  },
  {
    name: 'Communications and Innovation',
    description: 'Technology and communications infrastructure'
  },
  {
    name: 'Environment and Tourism',
    description: 'Environmental protection and tourism development'
  },
  {
    name: 'Labour and Home Affairs',
    description: 'Employment and internal affairs'
  },
  {
    name: 'Sports and Arts',
    description: 'Sports development and cultural affairs'
  },
  {
    name: 'Trade and Entrepreneurship',
    description: 'Business development and trade promotion'
  },
  {
    name: 'Transport and Infrastructure',
    description: 'Transportation systems and infrastructure development'
  },
  {
    name: 'Water and Human Settlement',
    description: 'Water resources and housing development'
  }
];

export const seedDepartments = async () => {
  try {
    console.log('Seeding departments...');
    
    // Check if departments already exist
    const { data: existingDepts, error: checkError } = await supabase
      .from('departments')
      .select('name');

    if (checkError) throw checkError;

    const existingNames = existingDepts?.map(d => d.name) || [];
    const newDepartments = departments.filter(d => !existingNames.includes(d.name));

    if (newDepartments.length === 0) {
      console.log('All departments already exist');
      return true;
    }

    const { error } = await supabase
      .from('departments')
      .insert(newDepartments);

    if (error) throw error;

    console.log(`Successfully seeded ${newDepartments.length} departments`);
    return true;
  } catch (error) {
    console.error('Error seeding departments:', error);
    return false;
  }
};

export const createSampleIssues = async () => {
  try {
    console.log('Creating sample issues...');
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user logged in');
      return false;
    }

    // Get departments
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('id, name');

    if (deptError) throw deptError;

    const sampleIssues = [
      {
        title: 'Pothole on Main Street needs urgent repair',
        description: 'Large pothole causing damage to vehicles and safety concerns for pedestrians.',
        category: 'Infrastructure',
        status: 'open',
        location: 'Main Street, City Center',
        constituency: 'Ward 1',
        author_id: user.id,
        department_id: departments?.find(d => d.name === 'Transport and Infrastructure')?.id,
      },
      {
        title: 'Water shortage in residential area',
        description: 'Residents have been without water for 3 days. Urgent intervention needed.',
        category: 'Utilities',
        status: 'open',
        location: 'Sunset Avenue',
        constituency: 'Ward 2',
        author_id: user.id,
        department_id: departments?.find(d => d.name === 'Water and Human Settlement')?.id,
      },
      {
        title: 'Streetlight outage creating safety concerns',
        description: 'Multiple streetlights are out, creating unsafe conditions at night.',
        category: 'Safety',
        status: 'in-progress',
        location: 'Oak Street',
        constituency: 'Ward 3',
        author_id: user.id,
        department_id: departments?.find(d => d.name === 'Local Government and Traditional Affairs')?.id,
      }
    ];

    const { error } = await supabase
      .from('issues')
      .insert(sampleIssues);

    if (error) throw error;

    console.log('Sample issues created successfully');
    return true;
  } catch (error) {
    console.error('Error creating sample issues:', error);
    return false;
  }
};

export const initializeDatabase = async () => {
  try {
    console.log('Initializing database with seed data...');
    
    const departmentsSuccess = await seedDepartments();
    if (!departmentsSuccess) {
      console.error('Failed to seed departments');
      return false;
    }

    const issuesSuccess = await createSampleIssues();
    if (!issuesSuccess) {
      console.error('Failed to create sample issues');
      return false;
    }

    console.log('Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

// Export for browser console access
if (typeof window !== 'undefined') {
  (window as any).seedDepartments = seedDepartments;
  (window as any).createSampleIssues = createSampleIssues;
  (window as any).initializeDatabase = initializeDatabase;
}
