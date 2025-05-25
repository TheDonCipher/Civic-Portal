// Comprehensive demo data for Botswana Civic Portal
// This file contains realistic mock data showcasing all platform features

// Government Departments (18 total as per requirements)
export const departments = [
  {
    id: 'finance',
    name: 'Finance',
    description: 'Budget, taxation, and financial management',
  },
  {
    id: 'international-relations',
    name: 'International Relations',
    description: 'Foreign affairs and diplomatic relations',
  },
  {
    id: 'health',
    name: 'Health',
    description: 'Healthcare services and public health',
  },
  {
    id: 'child-welfare-education',
    name: 'Child Welfare and Basic Education',
    description: 'Primary education and child protection',
  },
  {
    id: 'higher-education',
    name: 'Higher Education',
    description: 'Universities and tertiary education',
  },
  {
    id: 'lands-agriculture',
    name: 'Lands and Agriculture',
    description: 'Land management and agricultural development',
  },
  {
    id: 'youth-gender',
    name: 'Youth and Gender Affairs',
    description: 'Youth development and gender equality',
  },
  {
    id: 'state-presidency',
    name: 'State Presidency',
    description: 'Presidential office and state affairs',
  },
  {
    id: 'justice-correctional',
    name: 'Justice and Correctional Services',
    description: 'Legal system and correctional facilities',
  },
  {
    id: 'local-government',
    name: 'Local Government and Traditional Affairs',
    description: 'Local governance and traditional leadership',
  },
  {
    id: 'minerals-energy',
    name: 'Minerals and Energy',
    description: 'Mining sector and energy resources',
  },
  {
    id: 'communications-innovation',
    name: 'Communications and Innovation',
    description: 'ICT and technological innovation',
  },
  {
    id: 'environment-tourism',
    name: 'Environment and Tourism',
    description: 'Environmental protection and tourism development',
  },
  {
    id: 'labour-home-affairs',
    name: 'Labour and Home Affairs',
    description: 'Employment and immigration services',
  },
  {
    id: 'sports-arts',
    name: 'Sports and Arts',
    description: 'Sports development and cultural affairs',
  },
  {
    id: 'trade-entrepreneurship',
    name: 'Trade and Entrepreneurship',
    description: 'Business development and trade promotion',
  },
  {
    id: 'transport-infrastructure',
    name: 'Transport and Infrastructure',
    description: 'Transportation and infrastructure development',
  },
  {
    id: 'water-human-settlement',
    name: 'Water and Human Settlement',
    description: 'Water resources and housing development',
  },
];

// Major cities and locations in Botswana
export const locations = [
  'Gaborone',
  'Francistown',
  'Maun',
  'Kasane',
  'Serowe',
  'Palapye',
  'Molepolole',
  'Kanye',
  'Mochudi',
  'Lobatse',
  'Selibe-Phikwe',
  'Jwaneng',
  'Orapa',
  'Letlhakane',
  'Sowa',
  'Ghanzi',
  'Tsabong',
  'Shakawe',
  'Gumare',
  'Nokaneng',
  'Rakops',
  'Letlhakeng',
  'Mmadinare',
  'Bobonong',
  'Tonota',
  'Nata',
  'Gweta',
];

// Authentic Tswana names for demo users
export const tswanaNames = {
  male: [
    'Thabo',
    'Mpho',
    'Kgosi',
    'Tebogo',
    'Kagiso',
    'Tshepo',
    'Keabetswe',
    'Mothusi',
    'Onkabetse',
    'Phenyo',
    'Tumelo',
    'Goitseone',
    'Lebogang',
    'Kealeboga',
    'Boitumelo',
    'Oratile',
    'Kgothatso',
    'Reabetswe',
  ],
  female: [
    'Kefilwe',
    'Naledi',
    'Boipelo',
    'Mmabatho',
    'Gorata',
    'Lesego',
    'Kelebogile',
    'Onthatile',
    'Refilwe',
    'Tshegofatso',
    'Botshelo',
    'Olebogeng',
    'Kgomotso',
    'Masego',
    'Thato',
    'Bonolo',
    'Gaone',
  ],
  surnames: [
    'Mogale',
    'Seretse',
    'Kgositsile',
    'Mmusi',
    'Tshekedi',
    'Khama',
    'Masire',
    'Sebego',
    'Mothibi',
    'Kgafela',
    'Bathoen',
    'Linchwe',
    'Sekgoma',
    'Gaseitsiwe',
    'Kgalemang',
    'Molefhi',
    'Mosinyi',
    'Gaolathe',
    'Saleshando',
    'Kgoroba',
    'Mmolotsi',
    'Segokgo',
  ],
};

// Generate realistic user data
export const generateUser = (
  id: string,
  role: 'citizen' | 'official' | 'admin' = 'citizen',
  department?: string
) => {
  const isMale = Math.random() > 0.5;
  const firstName = isMale
    ? tswanaNames.male[Math.floor(Math.random() * tswanaNames.male.length)]
    : tswanaNames.female[Math.floor(Math.random() * tswanaNames.female.length)];
  const surname =
    tswanaNames.surnames[
      Math.floor(Math.random() * tswanaNames.surnames.length)
    ];
  const fullName = `${firstName} ${surname}`;
  const username = `${firstName.toLowerCase()}.${surname.toLowerCase()}`;

  return {
    id,
    username,
    full_name: fullName,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    constituency:
      Math.random() > 0.3
        ? [
            'Gaborone central',
            'Francistown east',
            'Maun east',
            'Serowe north',
            'Palapye',
          ][Math.floor(Math.random() * 5)]
        : null,
    role,
    department,
    created_at: new Date(
      Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
    ).toISOString(),
  };
};

// Demo users with specific roles and departments
export const demoUsers = [
  // Citizens
  generateUser('user-1', 'citizen'),
  generateUser('user-2', 'citizen'),
  generateUser('user-3', 'citizen'),
  generateUser('user-4', 'citizen'),
  generateUser('user-5', 'citizen'),

  // Government officials for each department
  generateUser('official-finance', 'official', 'finance'),
  generateUser('official-health', 'official', 'health'),
  generateUser('official-education', 'official', 'child-welfare-education'),
  generateUser('official-transport', 'official', 'transport-infrastructure'),
  generateUser('official-environment', 'official', 'environment-tourism'),
  generateUser('official-water', 'official', 'water-human-settlement'),
  generateUser('official-youth', 'official', 'youth-gender'),
  generateUser('official-local-gov', 'official', 'local-government'),

  // Admin
  generateUser('admin-1', 'admin'),
];

// Issue categories mapped to departments
export const issueCategories = {
  Infrastructure: 'transport-infrastructure',
  Healthcare: 'health',
  Education: 'child-welfare-education',
  Environment: 'environment-tourism',
  'Water & Sanitation': 'water-human-settlement',
  'Youth Development': 'youth-gender',
  Agriculture: 'lands-agriculture',
  'Public Safety': 'justice-correctional',
  'Local Government': 'local-government',
  Energy: 'minerals-energy',
  Technology: 'communications-innovation',
  'Sports & Culture': 'sports-arts',
  'Trade & Business': 'trade-entrepreneurship',
  Finance: 'finance',
  'International Affairs': 'international-relations',
  'Higher Education': 'higher-education',
  Labour: 'labour-home-affairs',
};

// Generate realistic timestamps
const getRandomDate = (daysAgo: number) => {
  return new Date(
    Date.now() - Math.random() * daysAgo * 24 * 60 * 60 * 1000
  ).toISOString();
};

// Demo issues with realistic Botswana context
export const demoIssues = [
  {
    id: 'issue-1',
    title: 'A1 Highway Potholes Between Gaborone and Lobatse',
    description:
      'The A1 highway has developed numerous dangerous potholes between Gaborone and Lobatse, particularly near the Ramotswa junction. These are causing vehicle damage and creating safety hazards for daily commuters.',
    category: 'Infrastructure',
    status: 'open',
    votes: 127,
    watchers_count: 89,
    location: 'A1 Highway, Ramotswa Junction',
    constituency: 'Ramotswa',
    thumbnail:
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop',
    author_id: 'user-1',
    author_name: demoUsers[0].full_name,
    author_avatar: demoUsers[0].avatar_url,
    created_at: getRandomDate(5),
    department_id: 'transport-infrastructure',
  },
  {
    id: 'issue-2',
    title: 'Water Shortage in Old Naledi',
    description:
      'Residents of Old Naledi have been experiencing intermittent water supply for the past three weeks. The situation is particularly affecting families with young children and elderly residents.',
    category: 'Water & Sanitation',
    status: 'in-progress',
    votes: 203,
    watchers_count: 156,
    location: 'Old Naledi, Gaborone',
    constituency: 'Gaborone south',
    thumbnail:
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop',
    author_id: 'user-2',
    author_name: demoUsers[1].full_name,
    author_avatar: demoUsers[1].avatar_url,
    created_at: getRandomDate(12),
    department_id: 'water-human-settlement',
  },
  {
    id: 'issue-3',
    title: 'Shortage of Textbooks at Maun Primary School',
    description:
      'Maun Primary School is facing a severe shortage of mathematics and English textbooks for Standard 4-7 students. This is affecting the quality of education and student performance.',
    category: 'Education',
    status: 'open',
    votes: 89,
    watchers_count: 67,
    location: 'Maun Primary School, Maun',
    constituency: 'Maun east',
    thumbnail:
      'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=300&fit=crop',
    author_id: 'user-3',
    author_name: demoUsers[2].full_name,
    author_avatar: demoUsers[2].avatar_url,
    created_at: getRandomDate(8),
    department_id: 'child-welfare-education',
  },
  {
    id: 'issue-4',
    title: 'Illegal Dumping in Chobe National Park Buffer Zone',
    description:
      'There has been increased illegal dumping of waste in the buffer zone near Chobe National Park. This is threatening wildlife and the pristine environment that attracts tourists to Kasane.',
    category: 'Environment',
    status: 'open',
    votes: 156,
    watchers_count: 98,
    location: 'Chobe National Park Buffer Zone, Kasane',
    constituency: 'Chobe',
    thumbnail:
      'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&h=300&fit=crop',
    author_id: 'user-4',
    author_name: demoUsers[3].full_name,
    author_avatar: demoUsers[3].avatar_url,
    created_at: getRandomDate(3),
    department_id: 'environment-tourism',
  },
  {
    id: 'issue-5',
    title: 'Youth Unemployment in Francistown',
    description:
      'High unemployment rates among youth in Francistown are leading to social problems. We need more skills development programs and job creation initiatives for young people aged 18-35.',
    category: 'Youth Development',
    status: 'in-progress',
    votes: 234,
    watchers_count: 187,
    location: 'Francistown',
    constituency: 'Francistown east',
    thumbnail:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop',
    author_id: 'user-5',
    author_name: demoUsers[4].full_name,
    author_avatar: demoUsers[4].avatar_url,
    created_at: getRandomDate(15),
    department_id: 'youth-gender',
  },
  {
    id: 'issue-6',
    title: 'Clinic Understaffing in Serowe',
    description:
      'Serowe Clinic is severely understaffed with only 2 nurses serving a population of over 15,000 people. Patients are waiting hours for basic medical attention.',
    category: 'Healthcare',
    status: 'open',
    votes: 178,
    watchers_count: 134,
    location: 'Serowe Clinic, Serowe',
    constituency: 'Serowe north',
    thumbnail:
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
    author_id: 'user-1',
    author_name: demoUsers[0].full_name,
    author_avatar: demoUsers[0].avatar_url,
    created_at: getRandomDate(7),
    department_id: 'health',
  },
  {
    id: 'issue-7',
    title: 'Poor Internet Connectivity in Rural Kgalagadi',
    description:
      'Rural communities in Kgalagadi district have very poor internet connectivity, limiting access to online education, e-government services, and business opportunities.',
    category: 'Technology',
    status: 'open',
    votes: 92,
    watchers_count: 76,
    location: 'Kgalagadi District',
    constituency: 'Kgalagadi south',
    thumbnail:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
    author_id: 'user-2',
    author_name: demoUsers[1].full_name,
    author_avatar: demoUsers[1].avatar_url,
    created_at: getRandomDate(20),
    department_id: 'communications-innovation',
  },
  {
    id: 'issue-8',
    title: 'Drought Impact on Cattle Farming in Ghanzi',
    description:
      'The ongoing drought has severely affected cattle farming in Ghanzi district. Farmers need support with drought-resistant feed and water infrastructure.',
    category: 'Agriculture',
    status: 'in-progress',
    votes: 145,
    watchers_count: 112,
    location: 'Ghanzi District',
    constituency: 'Ghanzi south',
    thumbnail:
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&h=300&fit=crop',
    author_id: 'user-3',
    author_name: demoUsers[2].full_name,
    author_avatar: demoUsers[2].avatar_url,
    created_at: getRandomDate(25),
    department_id: 'lands-agriculture',
  },
  {
    id: 'issue-9',
    title: 'Sports Facilities Needed in Palapye',
    description:
      'Palapye lacks adequate sports facilities for youth development. The community needs a proper football field, basketball court, and athletics track.',
    category: 'Sports & Culture',
    status: 'open',
    votes: 67,
    watchers_count: 45,
    location: 'Palapye',
    constituency: 'Palapye',
    thumbnail:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    author_id: 'user-4',
    author_name: demoUsers[3].full_name,
    author_avatar: demoUsers[3].avatar_url,
    created_at: getRandomDate(10),
    department_id: 'sports-arts',
  },
  {
    id: 'issue-10',
    title: 'Housing Shortage in Gaborone',
    description:
      'There is a critical shortage of affordable housing in Gaborone, forcing many families to live in overcrowded conditions or informal settlements.',
    category: 'Water & Sanitation',
    status: 'open',
    votes: 289,
    watchers_count: 234,
    location: 'Gaborone',
    constituency: 'Gaborone central',
    thumbnail:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop',
    author_id: 'user-5',
    author_name: demoUsers[4].full_name,
    author_avatar: demoUsers[4].avatar_url,
    created_at: getRandomDate(30),
    department_id: 'water-human-settlement',
  },
];

// Demo comments for issues
export const demoComments = [
  // Comments for issue-1 (A1 Highway Potholes)
  {
    id: 'comment-1-1',
    issue_id: 'issue-1',
    content:
      'I drive this route daily and can confirm the situation is getting worse. My car was damaged last week hitting one of these potholes.',
    author_id: 'user-2',
    author_name: demoUsers[1].full_name,
    author_avatar: demoUsers[1].avatar_url,
    created_at: getRandomDate(4),
  },
  {
    id: 'comment-1-2',
    issue_id: 'issue-1',
    content:
      "The Transport Department should prioritize this. It's a major economic route connecting two important cities.",
    author_id: 'official-transport',
    author_name:
      demoUsers.find((u) => u.id === 'official-transport')?.full_name ||
      'Transport Official',
    author_avatar:
      demoUsers.find((u) => u.id === 'official-transport')?.avatar_url || '',
    created_at: getRandomDate(3),
  },

  // Comments for issue-2 (Water Shortage)
  {
    id: 'comment-2-1',
    issue_id: 'issue-2',
    content:
      "This is affecting our children's health. We need urgent intervention from the Water Department.",
    author_id: 'user-3',
    author_name: demoUsers[2].full_name,
    author_avatar: demoUsers[2].avatar_url,
    created_at: getRandomDate(10),
  },
  {
    id: 'comment-2-2',
    issue_id: 'issue-2',
    content:
      'We are working on a temporary solution while the main pipeline is being repaired. Water trucks will be deployed this week.',
    author_id: 'official-water',
    author_name:
      demoUsers.find((u) => u.id === 'official-water')?.full_name ||
      'Water Official',
    author_avatar:
      demoUsers.find((u) => u.id === 'official-water')?.avatar_url || '',
    created_at: getRandomDate(8),
  },

  // Comments for issue-3 (Textbook Shortage)
  {
    id: 'comment-3-1',
    issue_id: 'issue-3',
    content:
      "As a parent, I'm concerned about my child's education. When will new textbooks arrive?",
    author_id: 'user-4',
    author_name: demoUsers[3].full_name,
    author_avatar: demoUsers[3].avatar_url,
    created_at: getRandomDate(6),
  },
  {
    id: 'comment-3-2',
    issue_id: 'issue-3',
    content:
      'We have allocated budget for new textbooks. Procurement process is underway and delivery expected within 6 weeks.',
    author_id: 'official-education',
    author_name:
      demoUsers.find((u) => u.id === 'official-education')?.full_name ||
      'Education Official',
    author_avatar:
      demoUsers.find((u) => u.id === 'official-education')?.avatar_url || '',
    created_at: getRandomDate(5),
  },
];

// Demo solutions for issues
export const demoSolutions = [
  // Solutions for issue-1 (A1 Highway Potholes)
  {
    id: 'solution-1-1',
    issue_id: 'issue-1',
    title: 'Complete Road Resurfacing Project',
    description:
      'Comprehensive resurfacing of the entire A1 highway section between Gaborone and Lobatse using high-quality asphalt and modern road construction techniques.',
    proposed_by: 'official-transport',
    proposer_name:
      demoUsers.find((u) => u.id === 'official-transport')?.full_name ||
      'Transport Official',
    proposer_avatar:
      demoUsers.find((u) => u.id === 'official-transport')?.avatar_url || '',
    estimated_cost: 2500000,
    votes: 89,
    status: 'proposed',
    created_at: getRandomDate(2),
  },
  {
    id: 'solution-1-2',
    issue_id: 'issue-1',
    title: 'Emergency Pothole Patching',
    description:
      'Immediate temporary patching of the worst potholes while planning for the complete resurfacing project.',
    proposed_by: 'user-5',
    proposer_name: demoUsers[4].full_name,
    proposer_avatar: demoUsers[4].avatar_url,
    estimated_cost: 150000,
    votes: 156,
    status: 'approved',
    created_at: getRandomDate(1),
  },

  // Solutions for issue-2 (Water Shortage)
  {
    id: 'solution-2-1',
    issue_id: 'issue-2',
    title: 'New Water Pipeline Installation',
    description:
      'Install a new water pipeline to Old Naledi with increased capacity to serve the growing population.',
    proposed_by: 'official-water',
    proposer_name:
      demoUsers.find((u) => u.id === 'official-water')?.full_name ||
      'Water Official',
    proposer_avatar:
      demoUsers.find((u) => u.id === 'official-water')?.avatar_url || '',
    estimated_cost: 1800000,
    votes: 203,
    status: 'in-progress',
    created_at: getRandomDate(7),
  },

  // Solutions for issue-5 (Youth Unemployment)
  {
    id: 'solution-5-1',
    issue_id: 'issue-5',
    title: 'Youth Skills Development Center',
    description:
      'Establish a comprehensive skills development center in Francistown offering training in ICT, entrepreneurship, and technical skills.',
    proposed_by: 'official-youth',
    proposer_name:
      demoUsers.find((u) => u.id === 'official-youth')?.full_name ||
      'Youth Official',
    proposer_avatar:
      demoUsers.find((u) => u.id === 'official-youth')?.avatar_url || '',
    estimated_cost: 3200000,
    votes: 178,
    status: 'proposed',
    created_at: getRandomDate(12),
  },
];

// Demo updates from stakeholders
export const demoUpdates = [
  {
    id: 'update-1-1',
    issue_id: 'issue-1',
    content:
      'Road assessment completed. Tender process for resurfacing project will begin next month.',
    author_id: 'official-transport',
    author_name:
      demoUsers.find((u) => u.id === 'official-transport')?.full_name ||
      'Transport Official',
    author_avatar:
      demoUsers.find((u) => u.id === 'official-transport')?.avatar_url || '',
    type: 'status',
    created_at: getRandomDate(1),
  },
  {
    id: 'update-2-1',
    issue_id: 'issue-2',
    content:
      'Water trucks deployed to Old Naledi. Pipeline repair work scheduled to begin Monday.',
    author_id: 'official-water',
    author_name:
      demoUsers.find((u) => u.id === 'official-water')?.full_name ||
      'Water Official',
    author_avatar:
      demoUsers.find((u) => u.id === 'official-water')?.avatar_url || '',
    type: 'status',
    created_at: getRandomDate(6),
  },
  {
    id: 'update-5-1',
    issue_id: 'issue-5',
    content:
      'Youth development committee formed. Stakeholder consultations scheduled for next week.',
    author_id: 'official-youth',
    author_name:
      demoUsers.find((u) => u.id === 'official-youth')?.full_name ||
      'Youth Official',
    author_avatar:
      demoUsers.find((u) => u.id === 'official-youth')?.avatar_url || '',
    type: 'status',
    created_at: getRandomDate(10),
  },
];

// Demo platform statistics
export const demoStats = {
  totalIssues: 1247,
  openIssues: 456,
  inProgressIssues: 234,
  resolvedIssues: 557,
  totalUsers: 8934,
  activeUsers: 2156,
  totalComments: 5678,
  totalSolutions: 892,
  departmentStats: [
    {
      department: 'Transport and Infrastructure',
      issues: 234,
      resolved: 89,
      responseTime: 12,
    },
    {
      department: 'Water and Human Settlement',
      issues: 189,
      resolved: 76,
      responseTime: 8,
    },
    { department: 'Health', issues: 156, resolved: 98, responseTime: 6 },
    {
      department: 'Child Welfare and Basic Education',
      issues: 134,
      resolved: 87,
      responseTime: 10,
    },
    {
      department: 'Environment and Tourism',
      issues: 98,
      resolved: 45,
      responseTime: 15,
    },
    {
      department: 'Youth and Gender Affairs',
      issues: 87,
      resolved: 34,
      responseTime: 18,
    },
    {
      department: 'Local Government and Traditional Affairs',
      issues: 76,
      resolved: 56,
      responseTime: 14,
    },
    {
      department: 'Lands and Agriculture',
      issues: 65,
      resolved: 43,
      responseTime: 20,
    },
  ],
  monthlyData: [
    { month: 'Jan 2024', created: 89, resolved: 67, responseTime: 12 },
    { month: 'Feb 2024', created: 76, resolved: 89, responseTime: 11 },
    { month: 'Mar 2024', created: 134, resolved: 98, responseTime: 10 },
    { month: 'Apr 2024', created: 156, resolved: 123, responseTime: 9 },
    { month: 'May 2024', created: 189, resolved: 145, responseTime: 8 },
    { month: 'Jun 2024', created: 203, resolved: 167, responseTime: 7 },
  ],
  topConstituencies: [
    { name: 'Gaborone central', issues: 234, engagement: 89 },
    { name: 'Francistown east', issues: 189, engagement: 76 },
    { name: 'Maun east', issues: 156, engagement: 67 },
    { name: 'Serowe north', issues: 134, engagement: 54 },
    { name: 'Palapye', issues: 98, engagement: 43 },
  ],
};

// Demo user activity data
export const demoUserActivity = [
  {
    id: 'activity-1',
    user_id: 'user-1',
    type: 'issue_created',
    title: 'Created new issue',
    description: 'A1 Highway Potholes Between Gaborone and Lobatse',
    date: getRandomDate(5),
    issue_id: 'issue-1',
  },
  {
    id: 'activity-2',
    user_id: 'user-1',
    type: 'comment_posted',
    title: 'Commented on issue',
    description: 'Clinic Understaffing in Serowe',
    date: getRandomDate(7),
    issue_id: 'issue-6',
  },
  {
    id: 'activity-3',
    user_id: 'user-2',
    type: 'issue_created',
    title: 'Created new issue',
    description: 'Water Shortage in Old Naledi',
    date: getRandomDate(12),
    issue_id: 'issue-2',
  },
  {
    id: 'activity-4',
    user_id: 'user-2',
    type: 'issue_supported',
    title: 'Voted on issue',
    description: 'A1 Highway Potholes Between Gaborone and Lobatse',
    date: getRandomDate(4),
    issue_id: 'issue-1',
  },
  {
    id: 'activity-5',
    user_id: 'user-3',
    type: 'solution_offered',
    title: 'Proposed solution',
    description: 'Emergency Pothole Patching for A1 Highway',
    date: getRandomDate(1),
    issue_id: 'issue-1',
  },
];

// Demo user statistics for individual users
export const demoUserStats = {
  'user-1': {
    issuesCreated: 3,
    issuesWatching: 8,
    commentsPosted: 12,
    issuesSupported: 24,
    solutionsProposed: 2,
  },
  'user-2': {
    issuesCreated: 2,
    issuesWatching: 15,
    commentsPosted: 18,
    issuesSupported: 31,
    solutionsProposed: 1,
  },
  'user-3': {
    issuesCreated: 1,
    issuesWatching: 6,
    commentsPosted: 8,
    issuesSupported: 19,
    solutionsProposed: 3,
  },
  'user-4': {
    issuesCreated: 2,
    issuesWatching: 11,
    commentsPosted: 14,
    issuesSupported: 27,
    solutionsProposed: 1,
  },
  'user-5': {
    issuesCreated: 4,
    issuesWatching: 9,
    commentsPosted: 16,
    issuesSupported: 22,
    solutionsProposed: 2,
  },
};

// Helper function to get demo data for a specific issue
export const getDemoIssueData = (issueId: string) => {
  const issue = demoIssues.find((i) => i.id === issueId);
  if (!issue) return null;

  const comments = demoComments.filter((c) => c.issue_id === issueId);
  const solutions = demoSolutions.filter((s) => s.issue_id === issueId);
  const updates = demoUpdates.filter((u) => u.issue_id === issueId);

  return {
    ...issue,
    comments,
    solutions,
    updates,
  };
};

// Helper function to get demo data for a specific user
export const getDemoUserData = (userId: string) => {
  const user = demoUsers.find((u) => u.id === userId);
  if (!user) return null;

  const userIssues = demoIssues.filter((i) => i.author_id === userId);
  const userComments = demoComments.filter((c) => c.author_id === userId);
  const userSolutions = demoSolutions.filter((s) => s.proposed_by === userId);
  const userActivity = demoUserActivity.filter((a) => a.user_id === userId);
  const userStats = demoUserStats[userId] || {
    issuesCreated: 0,
    issuesWatching: 0,
    commentsPosted: 0,
    issuesSupported: 0,
    solutionsProposed: 0,
  };

  return {
    ...user,
    issues: userIssues,
    comments: userComments,
    solutions: userSolutions,
    activity: userActivity,
    stats: userStats,
  };
};

// Helper function to get demo data for a specific department
export const getDemoDepartmentData = (departmentId: string) => {
  const department = departments.find((d) => d.id === departmentId);
  if (!department) return null;

  const departmentIssues = demoIssues.filter(
    (i) => i.department_id === departmentId
  );
  const departmentStats = demoStats.departmentStats.find(
    (d) =>
      d.department.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '') ===
      departmentId.replace(/-/g, '')
  );

  return {
    ...department,
    issues: departmentIssues,
    stats: departmentStats,
  };
};
