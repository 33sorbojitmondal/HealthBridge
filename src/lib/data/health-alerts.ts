export type HealthAlert = {
  id: string;
  title: string;
  description: string;
  type: 'vaccination' | 'disease_outbreak' | 'health_camp' | 'awareness_campaign';
  urgency: 'low' | 'medium' | 'high';
  region: string;
  startDate: string;
  endDate?: string;
  location?: string;
  contact?: string;
  imageUrl?: string;
};

export const healthAlerts: HealthAlert[] = [
  {
    id: 'alert-1',
    title: 'COVID-19 Vaccination Drive',
    description: 'Free COVID-19 vaccination camp for all adults. Boosters available for those who have completed primary vaccination series 6+ months ago. Bring ID and vaccination card if available.',
    type: 'vaccination',
    urgency: 'high',
    region: 'Central District',
    startDate: '2023-12-15',
    endDate: '2023-12-20',
    location: 'Community General Hospital, Main Street',
    contact: '+1 (555) 123-4567',
    imageUrl: 'https://images.unsplash.com/photo-1618961734760-466979ce35b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8dmFjY2luYXRpb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 'alert-2',
    title: 'Influenza Season Alert',
    description: 'Seasonal influenza cases are on the rise in our region. Watch for symptoms such as fever, cough, sore throat, body aches, and fatigue. Get your flu shot at the nearest clinic.',
    type: 'disease_outbreak',
    urgency: 'medium',
    region: 'All Districts',
    startDate: '2023-11-01',
    endDate: '2024-02-28',
    contact: 'Health Department: +1 (555) 987-6543',
    imageUrl: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2lja3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 'alert-3',
    title: 'Free Dental Check-up Camp',
    description: 'Free dental check-ups, cleanings, and basic treatments for children and adults. Services include routine examination, cleaning, cavity filling, and dental health education.',
    type: 'health_camp',
    urgency: 'low',
    region: 'East District',
    startDate: '2023-12-10',
    endDate: '2023-12-12',
    location: 'Public School Auditorium, Village Road',
    contact: 'Dr. Roberts: +1 (555) 234-5678',
    imageUrl: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGRlbnRpc3R8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 'alert-4',
    title: 'Dengue Fever Outbreak Alert',
    description: 'Multiple cases of dengue fever reported in the South District. Residents are advised to eliminate stagnant water sources, use mosquito repellent, and cover exposed skin, especially during dawn and dusk.',
    type: 'disease_outbreak',
    urgency: 'high',
    region: 'South District',
    startDate: '2023-07-15',
    endDate: '2023-10-30',
    contact: 'Disease Control Center: +1 (555) 876-5432',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bW9zcXVpdG98ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 'alert-5',
    title: 'Maternal Health Awareness Campaign',
    description: 'Learn about best practices for maternal health, nutrition during pregnancy, newborn care, and available healthcare services for mothers and infants. Free check-ups for pregnant women.',
    type: 'awareness_campaign',
    urgency: 'medium',
    region: 'All Districts',
    startDate: '2023-11-10',
    endDate: '2023-12-10',
    location: 'Multiple community centers. Check local listings.',
    contact: 'Women\'s Health Initiative: +1 (555) 345-6789',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHByZWduYW50fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 'alert-6',
    title: 'Children\'s Vaccination Week',
    description: 'Comprehensive vaccination program for children under 5 years. Available vaccines include MMR, DTP, Polio, Hepatitis B, and more. Bring your child\'s vaccination card.',
    type: 'vaccination',
    urgency: 'medium',
    region: 'West District',
    startDate: '2023-12-01',
    endDate: '2023-12-07',
    location: 'Rural Health Center, Community Road',
    contact: 'Child Health Services: +1 (555) 678-9012',
    imageUrl: 'https://images.unsplash.com/photo-1626263020721-b7221e349cd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2hpbGQlMjBkb2N0b3J8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 'alert-7',
    title: 'Diabetes Screening Camp',
    description: 'Free diabetes screening, blood pressure checks, and health consultations. Nutrition counseling and diabetes management education will also be provided.',
    type: 'health_camp',
    urgency: 'low',
    region: 'North District',
    startDate: '2023-11-25',
    endDate: '2023-11-27',
    location: 'Community Hall, Healthcare Avenue',
    contact: 'Diabetes Association: +1 (555) 456-7890',
    imageUrl: 'https://images.unsplash.com/photo-1579684453423-f84349ef60b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZGlhYmV0ZXN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 'alert-8',
    title: 'Mental Health Awareness Week',
    description: 'Events focusing on mental health awareness, stress management techniques, and available support services. Free counseling sessions available on appointment basis.',
    type: 'awareness_campaign',
    urgency: 'medium',
    region: 'All Districts',
    startDate: '2023-10-10',
    endDate: '2023-10-16',
    location: 'Various locations throughout the region',
    contact: 'Mental Health Helpline: +1 (555) 567-8901',
    imageUrl: 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWVudGFsJTIwaGVhbHRofGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
  }
];

export function filterAlerts(
  alertType?: string, 
  region?: string,
  urgency?: string
): HealthAlert[] {
  let filtered = [...healthAlerts];
  
  // Filter by type
  if (alertType && alertType !== 'all') {
    filtered = filtered.filter(alert => alert.type === alertType);
  }
  
  // Filter by region
  if (region && region !== 'all') {
    filtered = filtered.filter(alert => 
      alert.region === region || alert.region === 'All Districts'
    );
  }
  
  // Filter by urgency
  if (urgency && urgency !== 'all') {
    filtered = filtered.filter(alert => alert.urgency === urgency);
  }
  
  // Sort by date (newest first) and then by urgency (high to low)
  filtered.sort((a, b) => {
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    
    if (dateA !== dateB) {
      return dateB - dateA; // newest first
    }
    
    const urgencyOrder = { high: 3, medium: 2, low: 1 };
    return urgencyOrder[b.urgency as keyof typeof urgencyOrder] - urgencyOrder[a.urgency as keyof typeof urgencyOrder];
  });
  
  return filtered;
} 