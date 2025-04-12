export type User = {
  id: string;
  name: string;
  role: 'community_member' | 'health_professional' | 'moderator';
  avatar?: string;
};

export type ForumPost = {
  id: string;
  title: string;
  content: string;
  author: User;
  timestamp: string;
  tags: string[];
  likes: number;
  verified: boolean;
  replies: ForumReply[];
};

export type ForumReply = {
  id: string;
  content: string;
  author: User;
  timestamp: string;
  likes: number;
  verified: boolean;
};

// Sample users
export const users: User[] = [
  {
    id: 'user1',
    name: 'Dr. Sarah Johnson',
    role: 'health_professional',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg'
  },
  {
    id: 'user2',
    name: 'Michael Chen',
    role: 'community_member',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg'
  },
  {
    id: 'user3',
    name: 'Nurse Emma Rodriguez',
    role: 'health_professional',
    avatar: 'https://randomuser.me/api/portraits/women/6.jpg'
  },
  {
    id: 'user4',
    name: 'Health Admin',
    role: 'moderator',
    avatar: 'https://randomuser.me/api/portraits/women/7.jpg'
  }
];

// Sample forum posts
export const forumPosts: ForumPost[] = [
  {
    id: 'post1',
    title: 'What vaccines are required for my 1-year-old?',
    content: 'My daughter just turned one year old and I\'m not sure what vaccines she should be getting at this age. Could someone provide information about the recommended immunizations for a 12-month-old?',
    author: users[1], // Michael Chen
    timestamp: '2023-10-15T09:30:00Z',
    tags: ['vaccines', 'pediatrics', 'children', 'preventive-care'],
    likes: 5,
    verified: false,
    replies: [
      {
        id: 'reply1',
        content: 'At 12 months, your child should typically receive the MMR (measles, mumps, rubella), Varicella (chickenpox), Hepatitis A, and possibly the fourth dose of PCV (pneumococcal) vaccines. It\'s also a good time for the third dose of Hepatitis B if not already given. Always consult with your pediatrician for the specific schedule appropriate for your child.',
        author: users[0], // Dr. Sarah Johnson
        timestamp: '2023-10-15T10:15:00Z',
        likes: 7,
        verified: true
      },
      {
        id: 'reply2',
        content: 'My son just had his one-year vaccines last month. The doctor gave him MMR, chickenpox, and Hepatitis A vaccines. They also did a blood test to check for lead exposure, which I think is standard at this age visit.',
        author: users[1], // Michael Chen
        timestamp: '2023-10-15T11:00:00Z',
        likes: 2,
        verified: false
      },
      {
        id: 'reply3',
        content: 'It\'s important to note that there might be regional variations in vaccination schedules. The WHO and most national health organizations have recommended schedules, but they can differ slightly. Your local health department or pediatrician will have the most relevant information for your area.',
        author: users[3], // Health Admin
        timestamp: '2023-10-15T14:30:00Z',
        likes: 4,
        verified: true
      }
    ]
  },
  {
    id: 'post2',
    title: 'Tips for managing seasonal allergies?',
    content: 'I\'ve been struggling with seasonal allergies this spring. My symptoms include sneezing, runny nose, and itchy eyes. What are some effective over-the-counter remedies or natural methods to alleviate these symptoms?',
    author: users[1], // Michael Chen
    timestamp: '2023-09-20T15:45:00Z',
    tags: ['allergies', 'seasonal', 'remedies', 'over-the-counter'],
    likes: 8,
    verified: false,
    replies: [
      {
        id: 'reply4',
        content: 'OTC antihistamines like cetirizine (Zyrtec), loratadine (Claritin), or fexofenadine (Allegra) can be effective for managing seasonal allergy symptoms. Nasal corticosteroid sprays like fluticasone (Flonase) can also help reduce inflammation. Try to take them regularly during your allergy season rather than just when symptoms arise for better control.',
        author: users[0], // Dr. Sarah Johnson
        timestamp: '2023-09-20T16:20:00Z',
        likes: 6,
        verified: true
      },
      {
        id: 'reply5',
        content: 'I find that using a saline nasal rinse (like a Neti pot) helps flush allergens from my nasal passages. Also, changing clothes and showering after being outdoors can reduce exposure to pollen. Keep windows closed during high pollen count days and use air purifiers indoors if possible.',
        author: users[2], // Nurse Emma Rodriguez
        timestamp: '2023-09-20T17:05:00Z',
        likes: 5,
        verified: true
      }
    ]
  },
  {
    id: 'post3',
    title: 'Understanding blood pressure readings',
    content: 'Recently my blood pressure was measured at 135/85. The doctor mentioned it\'s slightly elevated but didn\'t prescribe any medication. What do these numbers mean exactly, and what lifestyle changes might help bring it down to a healthier range?',
    author: users[1], // Michael Chen
    timestamp: '2023-08-10T11:20:00Z',
    tags: ['blood-pressure', 'hypertension', 'heart-health', 'lifestyle'],
    likes: 12,
    verified: false,
    replies: [
      {
        id: 'reply6',
        content: 'Blood pressure readings have two numbers: systolic (the higher number) and diastolic (the lower number). A reading of 135/85 falls into the "elevated" or "pre-hypertension" category, which is why medication wasn\'t prescribed yet. Normal is considered below 120/80. Lifestyle modifications are the first line of treatment at this stage.',
        author: users[0], // Dr. Sarah Johnson
        timestamp: '2023-08-10T12:00:00Z',
        likes: 9,
        verified: true
      },
      {
        id: 'reply7',
        content: 'Some effective lifestyle changes include reducing sodium intake (aim for less than 2,300mg daily), regular exercise (aim for 150 minutes per week of moderate activity), maintaining a healthy weight, limiting alcohol, quitting smoking, and managing stress. The DASH diet is specifically designed to help lower blood pressure through dietary choices.',
        author: users[2], // Nurse Emma Rodriguez
        timestamp: '2023-08-10T13:15:00Z',
        likes: 7,
        verified: true
      },
      {
        id: 'reply8',
        content: 'It\'s also important to monitor your blood pressure regularly. Single readings can be affected by many factors including stress and time of day. I\'d recommend getting a home blood pressure monitor and keeping a log of readings at different times. Take this log to your next doctor\'s appointment.',
        author: users[0], // Dr. Sarah Johnson
        timestamp: '2023-08-10T14:30:00Z',
        likes: 5,
        verified: true
      }
    ]
  }
];

// Function to filter forum posts by tag or search query
export function filterPosts(searchQuery?: string, tagFilter?: string): ForumPost[] {
  let filtered = [...forumPosts];
  
  // Filter by tag
  if (tagFilter && tagFilter !== 'all') {
    filtered = filtered.filter(post => post.tags.includes(tagFilter));
  }
  
  // Filter by search query
  if (searchQuery && searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  return filtered;
} 