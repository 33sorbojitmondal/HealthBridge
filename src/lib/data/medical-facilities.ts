export type MedicalFacility = {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'pharmacy' | 'laboratory' | 'ambulance';
  address: string;
  phone: string;
  governmentSupported: boolean;
  openingHours: string;
  services: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  description?: string;
};

export const medicalFacilities: MedicalFacility[] = [
  {
    id: 'hosp-1',
    name: 'Community General Hospital',
    type: 'hospital',
    address: '123 Main Street, Central District',
    phone: '+1 (555) 123-4567',
    governmentSupported: true,
    openingHours: '24 hours',
    services: [
      'Emergency Care',
      'General Surgery',
      'Pediatrics',
      'Obstetrics & Gynecology',
      'Cardiology',
      'Neurology'
    ],
    location: {
      latitude: 37.7749,
      longitude: -122.4194
    },
    description: 'A full-service government hospital serving the community with comprehensive healthcare services.'
  },
  {
    id: 'clin-1',
    name: 'Rural Health Center',
    type: 'clinic',
    address: '456 Village Road, East District',
    phone: '+1 (555) 987-6543',
    governmentSupported: true,
    openingHours: '8:00 AM - 5:00 PM, Monday to Saturday',
    services: [
      'General Medicine',
      'Vaccination',
      'Maternal Care',
      'First Aid',
      'Health Education'
    ],
    location: {
      latitude: 37.7735,
      longitude: -122.4256
    },
    description: 'A government-funded rural health center providing essential healthcare services to the local community.'
  },
  {
    id: 'pharm-1',
    name: 'Community Pharmacy',
    type: 'pharmacy',
    address: '789 Market Street, West District',
    phone: '+1 (555) 765-4321',
    governmentSupported: false,
    openingHours: '8:00 AM - 9:00 PM, Every day',
    services: [
      'Prescription Medications',
      'Over-the-counter Products',
      'Health Consultations',
      'Blood Pressure Monitoring',
      'Vaccination'
    ],
    location: {
      latitude: 37.7831,
      longitude: -122.4181
    },
    description: 'A well-stocked pharmacy offering a wide range of medications and health-related products.'
  },
  {
    id: 'hosp-2',
    name: 'Memorial Medical Center',
    type: 'hospital',
    address: '321 Healthcare Avenue, North District',
    phone: '+1 (555) 234-5678',
    governmentSupported: false,
    openingHours: '24 hours',
    services: [
      'Emergency Care',
      'Oncology',
      'Orthopedics',
      'Cardiology',
      'Dermatology',
      'Specialized Surgery'
    ],
    location: {
      latitude: 37.7852,
      longitude: -122.4215
    },
    description: 'A private hospital with advanced medical technologies and specialized care units.'
  },
  {
    id: 'clin-2',
    name: 'Family Health Clinic',
    type: 'clinic',
    address: '567 Community Road, South District',
    phone: '+1 (555) 876-5432',
    governmentSupported: false,
    openingHours: '9:00 AM - 6:00 PM, Monday to Friday, 9:00 AM - 1:00 PM Saturday',
    services: [
      'Family Medicine',
      'Pediatric Care',
      'Women\'s Health',
      'Preventive Care',
      'Minor Procedures'
    ],
    location: {
      latitude: 37.7717,
      longitude: -122.4228
    },
    description: 'A family-oriented clinic offering comprehensive care for all ages.'
  },
  {
    id: 'amb-1',
    name: 'Quick Response Ambulance Services',
    type: 'ambulance',
    address: '987 Emergency Lane, Central District',
    phone: '+1 (555) 911-1234',
    governmentSupported: true,
    openingHours: '24 hours',
    services: [
      'Emergency Transportation',
      'Basic Life Support',
      'Advanced Life Support',
      'Medical Evacuation'
    ],
    location: {
      latitude: 37.7789,
      longitude: -122.4205
    },
    description: 'Government-supported emergency ambulance service providing rapid response to medical emergencies.'
  },
  {
    id: 'lab-1',
    name: 'Central Diagnostic Laboratory',
    type: 'laboratory',
    address: '654 Science Street, East District',
    phone: '+1 (555) 345-6789',
    governmentSupported: false,
    openingHours: '7:00 AM - 7:00 PM, Monday to Saturday',
    services: [
      'Blood Tests',
      'Urine Analysis',
      'X-Ray',
      'Ultrasound',
      'CT Scan',
      'MRI'
    ],
    location: {
      latitude: 37.7762,
      longitude: -122.4189
    },
    description: 'A well-equipped diagnostic center offering a wide range of laboratory and imaging services.'
  },
  {
    id: 'pharm-2',
    name: 'Discount Medicine Shop',
    type: 'pharmacy',
    address: '432 Budget Road, West District',
    phone: '+1 (555) 678-9012',
    governmentSupported: true,
    openingHours: '8:00 AM - 8:00 PM, Every day',
    services: [
      'Low-cost Medications',
      'Generic Alternatives',
      'Health Subsidies',
      'Prescription Filling',
      'Basic Health Supplies'
    ],
    location: {
      latitude: 37.7805,
      longitude: -122.4235
    },
    description: 'A government-subsidized pharmacy providing affordable medications to the community.'
  }
];

export function filterFacilities(
  facilityType?: string, 
  governmentOnly?: boolean,
  searchQuery?: string
): MedicalFacility[] {
  let filtered = [...medicalFacilities];
  
  // Filter by type
  if (facilityType && facilityType !== 'all') {
    filtered = filtered.filter(facility => facility.type === facilityType);
  }
  
  // Filter by government support
  if (governmentOnly) {
    filtered = filtered.filter(facility => facility.governmentSupported);
  }
  
  // Filter by search query
  if (searchQuery && searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(facility => 
      facility.name.toLowerCase().includes(query) ||
      facility.address.toLowerCase().includes(query) ||
      facility.services.some(service => service.toLowerCase().includes(query))
    );
  }
  
  return filtered;
} 