// Types and utilities for doctor management in AI HealthBridge

export type Specialty = 
  | 'Cardiology'
  | 'Dermatology'
  | 'Endocrinology'
  | 'Gastroenterology'
  | 'Neurology'
  | 'Oncology'
  | 'Pediatrics'
  | 'Psychiatry'
  | 'Radiology'
  | 'Family Medicine'
  | 'General Practice'
  | 'Surgery'
  | 'Orthopedics'
  | 'Gynecology'
  | 'Urology'
  | 'Other';

export type DoctorRating = {
  userId: string;
  rating: number; // 1-5
  review?: string;
  date: Date;
  verified: boolean;
  helpful?: number; // Number of people who found this review helpful
};

export type Doctor = {
  id: string;
  name: string;
  specialty: Specialty;
  qualifications: string[];
  experience: number; // Years of experience
  hospital?: string;
  address: string;
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  availability?: {
    days: string[];
    hours: string;
  };
  languages: string[];
  image?: string;
  ratings: DoctorRating[];
  averageRating: number;
  totalRatings: number;
  aiEvaluation?: {
    score: number; // 0-100
    strengths: string[];
    areas_for_improvement?: string[];
    last_updated: Date;
  };
  verified: boolean;
  acceptingNewPatients: boolean;
  consultationFee?: number;
  insuranceAccepted?: string[];
};

// Mock data for testing
export const mockDoctors: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    qualifications: ['MD', 'FACC'],
    experience: 15,
    hospital: 'Central Medical Center',
    address: '123 Health St, Medical District',
    contact: {
      phone: '555-123-4567',
      email: 'sarah.johnson@example.com',
      website: 'www.drsarahjohnson.com'
    },
    location: {
      lat: 37.7749,
      lng: -122.4194
    },
    availability: {
      days: ['Monday', 'Wednesday', 'Friday'],
      hours: '9:00 AM - 5:00 PM'
    },
    languages: ['English', 'Spanish'],
    image: '/images/doctors/sarah-johnson.jpg',
    ratings: [
      {
        userId: 'u1',
        rating: 4.5,
        review: 'Very knowledgeable and takes time to explain things.',
        date: new Date('2023-11-15'),
        verified: true,
        helpful: 12
      },
      {
        userId: 'u2',
        rating: 5,
        review: 'Excellent doctor, saved my life!',
        date: new Date('2023-10-20'),
        verified: true,
        helpful: 8
      }
    ],
    averageRating: 4.8,
    totalRatings: 125,
    aiEvaluation: {
      score: 92,
      strengths: ['Patient communication', 'Diagnostic accuracy', 'Treatment success rate'],
      areas_for_improvement: ['Wait times'],
      last_updated: new Date('2024-03-01')
    },
    verified: true,
    acceptingNewPatients: true,
    consultationFee: 150,
    insuranceAccepted: ['BlueCross', 'Aetna', 'UnitedHealthcare']
  },
  {
    id: 'd2',
    name: 'Dr. James Chen',
    specialty: 'Neurology',
    qualifications: ['MD', 'PhD', 'FAAN'],
    experience: 20,
    hospital: 'Memorial Neurological Institute',
    address: '456 Brain Ave, Research Park',
    contact: {
      phone: '555-987-6543',
      email: 'james.chen@example.com'
    },
    location: {
      lat: 37.7739,
      lng: -122.4312
    },
    availability: {
      days: ['Tuesday', 'Thursday', 'Saturday'],
      hours: '10:00 AM - 6:00 PM'
    },
    languages: ['English', 'Mandarin', 'Cantonese'],
    image: '/images/doctors/james-chen.jpg',
    ratings: [
      {
        userId: 'u3',
        rating: 5,
        review: 'Brilliant doctor with excellent bedside manner.',
        date: new Date('2024-01-05'),
        verified: true,
        helpful: 15
      }
    ],
    averageRating: 4.9,
    totalRatings: 87,
    aiEvaluation: {
      score: 95,
      strengths: ['Research contributions', 'Complex case management', 'Patient outcomes'],
      last_updated: new Date('2024-02-15')
    },
    verified: true,
    acceptingNewPatients: false,
    consultationFee: 200,
    insuranceAccepted: ['BlueCross', 'Cigna', 'Medicare']
  },
  {
    id: 'd3',
    name: 'Dr. Maria Rodriguez',
    specialty: 'Pediatrics',
    qualifications: ['MD', 'FAAP'],
    experience: 12,
    hospital: "Children's Health Center",
    address: '789 Kids Lane, Family District',
    contact: {
      phone: '555-456-7890',
      email: 'maria.rodriguez@example.com',
      website: 'www.drmariaforchildren.com'
    },
    location: {
      lat: 37.7831,
      lng: -122.4100
    },
    availability: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      hours: '8:00 AM - 4:00 PM'
    },
    languages: ['English', 'Spanish', 'Portuguese'],
    image: '/images/doctors/maria-rodriguez.jpg',
    ratings: [
      {
        userId: 'u4',
        rating: 5,
        review: 'Amazing with kids! My daughter loves her.',
        date: new Date('2023-12-12'),
        verified: true,
        helpful: 20
      },
      {
        userId: 'u5',
        rating: 4,
        review: 'Great doctor, but sometimes the wait can be long.',
        date: new Date('2024-01-18'),
        verified: true,
        helpful: 5
      }
    ],
    averageRating: 4.7,
    totalRatings: 156,
    aiEvaluation: {
      score: 91,
      strengths: ['Child-friendly approach', 'Preventive care education', 'Parent communication'],
      areas_for_improvement: ['Appointment scheduling efficiency'],
      last_updated: new Date('2024-02-28')
    },
    verified: true,
    acceptingNewPatients: true,
    consultationFee: 125,
    insuranceAccepted: ['BlueCross', 'Aetna', 'Medicaid', 'CHIP']
  }
];

// Function to fetch doctors near a location
export async function getDoctorsNearLocation(
  lat: number, 
  lng: number, 
  radius: number = 10, // km
  specialty?: Specialty
): Promise<Doctor[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In a real app, this would query a database or external API
  // For now, return mock data
  let doctors = [...mockDoctors];
  
  // Filter by specialty if provided
  if (specialty) {
    doctors = doctors.filter(doctor => doctor.specialty === specialty);
  }
  
  // In a real implementation, we would calculate distance and filter by radius
  // For now, just return all doctors in the mock data
  return doctors;
}

// Function to get a doctor by ID
export async function getDoctorById(id: string): Promise<Doctor | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Find doctor by ID
  const doctor = mockDoctors.find(doc => doc.id === id);
  return doctor || null;
}

// Function to submit a rating for a doctor
export async function submitDoctorRating(
  doctorId: string,
  userId: string,
  rating: number,
  review?: string
): Promise<{ success: boolean; message: string; newRating?: number }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real app, this would update a database
  // For now, just return a success response
  return {
    success: true,
    message: 'Rating submitted successfully',
    newRating: rating
  };
}

// Function to generate an AI evaluation for a doctor
export async function generateAIEvaluation(doctorId: string): Promise<{
  score: number;
  strengths: string[];
  areas_for_improvement?: string[];
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real app, this would use AI to analyze doctor data, reviews, outcomes, etc.
  // For now, return mock evaluation
  return {
    score: 85 + Math.floor(Math.random() * 15),
    strengths: [
      'Patient communication',
      'Treatment effectiveness',
      'Medical knowledge'
    ],
    areas_for_improvement: Math.random() > 0.5 ? ['Documentation timeliness'] : undefined
  };
} 