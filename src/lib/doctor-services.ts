// doctor-services.ts - Functions for doctor ratings, evaluations, and recommendations

/**
 * Doctor specialties
 */
export type DoctorSpecialty = 
  | 'general_practice' 
  | 'cardiology' 
  | 'endocrinology' 
  | 'neurology' 
  | 'pediatrics'
  | 'psychiatry'
  | 'dermatology'
  | 'orthopedics'
  | 'gynecology'
  | 'gastroenterology'
  | 'urology'
  | 'pulmonology'
  | 'oncology'
  | 'rheumatology'
  | 'ophthalmology';

/**
 * Doctor location information
 */
export interface DoctorLocation {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  telehealth: boolean;
}

/**
 * Doctor availability
 */
export interface DoctorAvailability {
  hasAvailability: boolean;
  nextAvailable?: string; // e.g. "Today at 3:00 PM", "Tomorrow", "Next Tuesday"
  availableDays?: string[]; // e.g. ["Monday", "Wednesday", "Friday"]
  availableTimeSlots?: string[]; // e.g. ["9:00 AM", "10:00 AM"]
}

/**
 * Time slot
 */
export interface TimeSlot {
  start: string; // Format: "HH:MM"
  end: string;   // Format: "HH:MM"
  available: boolean;
}

/**
 * Rating criteria
 */
export interface DoctorRating {
  average: number; // 0-5 scale
  count: number;
  reviews: {
    patientId: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

/**
 * Doctor info
 */
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  photoUrl: string;
  hospital: string;
  experience: number;
  acceptingNewPatients: boolean;
  telemedicine: boolean;
  languages: string[];
  insuranceAccepted: string[];
  availability: DoctorAvailability;
  rating: DoctorRating;
  location: { 
    address: string;
    coordinates: [number, number]; // [latitude, longitude]
  };
  distanceKm: number;
  address: string;
  phone: string;
  email: string;
  reviews?: DoctorReview[];
}

/**
 * Doctor evaluation by AI
 */
export interface DoctorAIEvaluation {
  doctorId: string;
  evaluationId: string;
  date: string; // ISO date string
  prescriptionAnalysis: {
    appropriatenessScore: number; // 0-100
    overprescribingRisk: 'low' | 'moderate' | 'high';
    commonlyPrescribedMedications: string[];
    concerns: string[];
  };
  patientEngagement: {
    averageConsultationTime: number; // minutes
    followUpRate: number; // percentage
    patientRetentionRate: number; // percentage
    score: number; // 0-100
  };
  patientFeedbackAnalysis: {
    positiveAspects: string[];
    areasForImprovement: string[];
    sentimentScore: number; // 0-100
  };
  recommendedActions: string[];
}

/**
 * Consultation data
 */
export interface Consultation {
  id: string;
  doctorId: string;
  patientId: string;
  date: string; // ISO date string
  duration: number; // minutes
  type: 'in_person' | 'video' | 'phone' | 'messaging';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  chiefComplaint: string;
  diagnosis?: string[];
  prescriptions?: {
    medication: string;
    dosage: string;
    instructions: string;
    duration: string;
  }[];
  notes?: string;
  followUp?: {
    recommended: boolean;
    timeframe?: string;
    reason?: string;
  };
  rating?: DoctorRating;
}

/**
 * Mock data for testing
 */
const specialties = [
  "Family Medicine", "Internal Medicine", "Pediatrics", "Cardiology", 
  "Dermatology", "Neurology", "Oncology", "Orthopedics", "Psychiatry",
  "Obstetrics & Gynecology", "Ophthalmology", "ENT", "Gastroenterology",
  "Urology", "Endocrinology", "Rheumatology", "Pulmonology"
];

const hospitals = [
  "General Hospital", "University Medical Center", "Memorial Hospital",
  "Community Health Center", "Regional Medical Center", "Children's Hospital",
  "Specialty Care Center", "Heart & Vascular Institute", "Cancer Center"
];

const insurances = [
  "Medicare", "Medicaid", "Blue Cross", "UnitedHealthcare", "Aetna",
  "Cigna", "Humana", "Kaiser Permanente", "Anthem", "TRICARE"
];

const languages = ["English", "Spanish", "French", "Mandarin", "Arabic", "Hindi", "Portuguese", "Russian", "Japanese", "German"];

// Generate realistic mock data for doctors
const generateMockDoctors = (count: number, userLocation: [number, number]): Doctor[] => {
  const doctors: Doctor[] = [];
  
  for (let i = 0; i < count; i++) {
    const id = `doctor-${i + 1}`;
    const specialty = specialties[Math.floor(Math.random() * specialties.length)];
    const experience = 1 + Math.floor(Math.random() * 40); // 1-40 years
    const hospital = Math.random() > 0.3 ? hospitals[Math.floor(Math.random() * hospitals.length)] : undefined;
    
    // Distance from user (0.5 to 15 km)
    const distanceKm = 0.5 + Math.random() * 14.5;
    
    // Random availability
    const hasAvailability = Math.random() > 0.2;
    const availabilityOptions = ["Today", "Tomorrow", "Next Monday", "Next Tuesday", "Next Wednesday", "Next Thursday", "Next Friday"];
    const nextAvailable = hasAvailability ? 
      `${availabilityOptions[Math.floor(Math.random() * availabilityOptions.length)]} at ${Math.floor(Math.random() * 12) + 1}:00 ${Math.random() > 0.5 ? 'AM' : 'PM'}` : 
      undefined;
    
    // Random doctor languages
    const docLanguages = ["English"];
    if (Math.random() > 0.6) {
      // Add 1-3 additional languages
      const additionalLanguagesCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < additionalLanguagesCount; j++) {
        const lang = languages[Math.floor(Math.random() * languages.length)];
        if (!docLanguages.includes(lang)) {
          docLanguages.push(lang);
        }
      }
    }
    
    // Random rating between 3 and 5
    const rating = 3 + Math.random() * 2;
    const reviewCount = Math.floor(Math.random() * 200) + 1;
    
    // Random insurance acceptance (3-7 insurance providers)
    const docInsurances: string[] = [];
    const insuranceCount = 3 + Math.floor(Math.random() * 5);
    for (let j = 0; j < insuranceCount; j++) {
      const insurance = insurances[Math.floor(Math.random() * insurances.length)];
      if (!docInsurances.includes(insurance)) {
        docInsurances.push(insurance);
      }
    }
    
    // Generate some reviews
    const reviews = [];
    const reviewsToGenerate = Math.min(reviewCount, 3 + Math.floor(Math.random() * 5));
    for (let j = 0; j < reviewsToGenerate; j++) {
      const reviewRating = Math.max(1, Math.min(5, Math.floor(rating + (Math.random() * 2 - 1))));
      reviews.push({
        patientId: `patient-${Math.floor(Math.random() * 10000)}`,
        rating: reviewRating,
        comment: getRandomReview(reviewRating, specialty),
        date: getRandomDate()
      });
    }
    
    // Create the doctor object
    doctors.push({
      id,
      name: getRandomDoctorName(),
      specialty,
      hospital,
      clinic: hospital ? undefined : `${specialty} Clinic`,
      address: `${1000 + Math.floor(Math.random() * 9000)} Main St`,
      city: "Anytown",
      state: "CA",
      zipCode: `9${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      phoneNumber: `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      email: Math.random() > 0.5 ? `doctor${i + 1}@example.com` : undefined,
      website: Math.random() > 0.7 ? `https://doctor${i + 1}.example.com` : undefined,
      distanceKm,
      acceptingNewPatients: Math.random() > 0.2,
      languages: docLanguages,
      education: [
        `MD, ${["Harvard", "Stanford", "Johns Hopkins", "UCLA", "Mayo Clinic", "NYU", "Columbia", "Duke", "Penn", "Michigan"][Math.floor(Math.random() * 10)]} Medical School`,
        `Residency, ${specialty}, ${hospitals[Math.floor(Math.random() * hospitals.length)]}`
      ],
      experience,
      insuranceAccepted: docInsurances,
      availability: {
        hasAvailability,
        nextAvailable
      },
      telemedicine: Math.random() > 0.3,
      inPerson: Math.random() > 0.1,
      rating: {
        average: parseFloat(rating.toFixed(1)),
        count: reviewCount,
        reviews
      },
      specializations: getSpecializations(specialty),
      profileImage: Math.random() > 0.2 ? `/doctors/doctor-${1 + Math.floor(Math.random() * 10)}.jpg` : undefined
    });
  }
  
  return doctors;
};

// Helper functions for generating mock data
function getRandomDoctorName(): string {
  const firstNames = [
    "James", "Robert", "John", "Michael", "David", "William", "Thomas", "Mary", 
    "Patricia", "Jennifer", "Linda", "Elizabeth", "Susan", "Nancy", "Sarah",
    "Mohammed", "Jose", "Carlos", "Maria", "Aisha", "Wei", "Li", "Hiroshi", 
    "Fatima", "Raj", "Priya", "Olga", "Ivan", "Chen", "Kim"
  ];
  
  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson",
    "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson",
    "Garcia", "Martinez", "Rodriguez", "Patel", "Kim", "Lee", "Nguyen", "Chen",
    "Wang", "Singh", "Kumar", "Ali", "Khan", "Ibrahim", "Ivanov"
  ];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `Dr. ${firstName} ${lastName}`;
}

function getRandomDate(): string {
  const now = new Date();
  const monthsAgo = Math.floor(Math.random() * 18); // 0-18 months ago
  const date = new Date(now);
  date.setMonth(now.getMonth() - monthsAgo);
  
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getRandomReview(rating: number, specialty: string): string {
  if (rating >= 4.5) {
    return [
      `Excellent ${specialty} doctor who really listened to my concerns.`,
      `Dr. was very thorough and explained everything clearly.`,
      `Best healthcare experience I've had. Highly recommend!`,
      `Very knowledgeable and caring physician. Took time to address all my questions.`,
      `Outstanding care and follow-up. Made me feel comfortable from the start.`
    ][Math.floor(Math.random() * 5)];
  } else if (rating >= 3.5) {
    return [
      `Good doctor overall. Wait time was a bit long though.`,
      `Knowledgeable doctor but the staff could be more friendly.`,
      `Decent care but rushed through the appointment.`,
      `Helpful advice but office is disorganized.`,
      `Competent physician but doesn't always explain things thoroughly.`
    ][Math.floor(Math.random() * 5)];
  } else {
    return [
      `Doctor seemed rushed and didn't address all my concerns.`,
      `Long wait time and short consultation.`,
      `Office staff was rude. The doctor was okay.`,
      `Didn't feel like the doctor was listening to me.`,
      `Wouldn't recommend. Had to seek a second opinion.`
    ][Math.floor(Math.random() * 5)];
  }
}

function getSpecializations(specialty: string): string[] {
  const specializationMap: Record<string, string[]> = {
    "Family Medicine": ["Preventive Care", "Chronic Disease Management", "Geriatric Care", "Pediatric Care"],
    "Internal Medicine": ["Chronic Disease Management", "Preventive Medicine", "Geriatrics", "Hospital Medicine"],
    "Pediatrics": ["Newborn Care", "Adolescent Medicine", "Developmental Disorders", "Pediatric Immunology"],
    "Cardiology": ["Heart Failure", "Arrhythmias", "Coronary Artery Disease", "Preventive Cardiology"],
    "Dermatology": ["Acne", "Skin Cancer", "Psoriasis", "Cosmetic Dermatology", "Pediatric Dermatology"],
    "Neurology": ["Headaches", "Epilepsy", "Multiple Sclerosis", "Stroke", "Movement Disorders"],
    "Oncology": ["Breast Cancer", "Lung Cancer", "Colon Cancer", "Lymphoma", "Leukemia"],
    "Orthopedics": ["Sports Medicine", "Joint Replacement", "Spine Surgery", "Fracture Care", "Hand Surgery"],
    "Psychiatry": ["Depression", "Anxiety Disorders", "ADHD", "Bipolar Disorder", "Schizophrenia"],
    "Obstetrics & Gynecology": ["Prenatal Care", "High-Risk Pregnancy", "Gynecologic Surgery", "Infertility", "Menopause"],
    "Ophthalmology": ["Cataracts", "Glaucoma", "Diabetic Eye Disease", "LASIK", "Pediatric Ophthalmology"],
    "ENT": ["Sinus Disorders", "Hearing Loss", "Voice Disorders", "Sleep Apnea", "Head and Neck Cancer"],
    "Gastroenterology": ["GERD", "IBS", "Inflammatory Bowel Disease", "Liver Disease", "Colonoscopy"],
    "Urology": ["Prostate Health", "Kidney Stones", "Incontinence", "Men's Sexual Health", "Urologic Oncology"],
    "Endocrinology": ["Diabetes", "Thyroid Disorders", "Osteoporosis", "Adrenal Disorders", "Pituitary Disorders"],
    "Rheumatology": ["Arthritis", "Lupus", "Fibromyalgia", "Gout", "Vasculitis"],
    "Pulmonology": ["Asthma", "COPD", "Sleep Disorders", "Lung Cancer", "Pulmonary Fibrosis"]
  };
  
  // Return specializations for the given specialty, or default to empty array
  const possibleSpecializations = specializationMap[specialty] || [];
  
  // Randomly select 2-4 specializations
  const count = 2 + Math.floor(Math.random() * 3);
  const result: string[] = [];
  
  for (let i = 0; i < Math.min(count, possibleSpecializations.length); i++) {
    const index = Math.floor(Math.random() * possibleSpecializations.length);
    const specialization = possibleSpecializations[index];
    
    if (!result.includes(specialization)) {
      result.push(specialization);
    }
  }
  
  return result;
}

/**
 * Mock function to get doctors near a location
 * In a real implementation, this would call a geospatial API
 * 
 * @param latitude User's latitude
 * @param longitude User's longitude
 * @param specialty Optional specialty filter
 * @param maxDistance Maximum distance in kilometers
 * @returns Array of nearby doctors
 */
export async function getDoctorsNearLocation(
  latitude: number,
  longitude: number,
  specialty?: DoctorSpecialty,
  maxDistance: number = 10
): Promise<Doctor[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Get all doctors from mock data
  const allDoctors = getMockDoctors();
  
  // Filter by specialty if provided
  let filteredDoctors = specialty 
    ? allDoctors.filter(doctor => doctor.specialty === specialty)
    : allDoctors;
  
  // Filter by distance
  // In a real implementation, this would use a proper geospatial calculation
  filteredDoctors = filteredDoctors.filter(doctor => {
    const distance = calculateDistance(
      [latitude, longitude], 
      doctor.location.coordinates
    );
    return distance <= maxDistance;
  });
  
  // Sort by distance
  filteredDoctors.sort((a, b) => {
    const distanceA = calculateDistance(
      [latitude, longitude], 
      a.location.coordinates
    );
    const distanceB = calculateDistance(
      [latitude, longitude], 
      b.location.coordinates
    );
    return distanceA - distanceB;
  });
  
  return filteredDoctors;
}

/**
 * Calculate the distance between two coordinates in kilometers
 */
function calculateDistance(
  point1: [number, number], 
  point2: [number, number]
): number {
  // Implementation using Haversine formula
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;
  
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Submit a rating for a doctor
 * 
 * @param doctorId Doctor ID
 * @param consultationId Consultation ID
 * @param rating Rating data
 * @returns Success status
 */
export async function submitDoctorRating(
  doctorId: string,
  consultationId: string,
  rating: Omit<DoctorRating, 'date' | 'patientId' | 'consultationId'>
): Promise<{ success: boolean; message: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real implementation, this would validate the rating and save to a database
  
  // Mock successful submission
  return {
    success: true,
    message: 'Rating submitted successfully'
  };
}

/**
 * Get doctor's AI evaluation
 * 
 * @param doctorId Doctor ID
 * @returns AI evaluation data
 */
export async function getDoctorAIEvaluation(doctorId: string): Promise<DoctorAIEvaluation> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // In a real implementation, this would fetch from a real API/database
  
  // Mock data
  return {
    doctorId,
    evaluationId: `eval-${Date.now()}`,
    date: new Date().toISOString(),
    prescriptionAnalysis: {
      appropriatenessScore: 85 + Math.floor(Math.random() * 10),
      overprescribingRisk: Math.random() > 0.7 ? 'moderate' : 'low',
      commonlyPrescribedMedications: [
        'Amoxicillin',
        'Lisinopril',
        'Metformin',
        'Atorvastatin'
      ],
      concerns: Math.random() > 0.7 ? ['Potential overuse of antibiotics for viral infections'] : []
    },
    patientEngagement: {
      averageConsultationTime: 12 + Math.floor(Math.random() * 8), // 12-20 minutes
      followUpRate: 65 + Math.floor(Math.random() * 20), // 65-85%
      patientRetentionRate: 70 + Math.floor(Math.random() * 25), // 70-95%
      score: 75 + Math.floor(Math.random() * 20) // 75-95
    },
    patientFeedbackAnalysis: {
      positiveAspects: [
        'Clear communication',
        'Thorough explanations',
        'Listens to patient concerns'
      ],
      areasForImprovement: Math.random() > 0.6 ? 
        ['Could spend more time discussing preventative care'] : [],
      sentimentScore: 80 + Math.floor(Math.random() * 15) // 80-95
    },
    recommendedActions: [
      'Continue current practice patterns',
      'Consider following up with patients who have chronic conditions more frequently'
    ]
  };
}

/**
 * Get a doctor's consultations
 * 
 * @param doctorId Doctor ID
 * @param status Optional status filter
 * @param limit Maximum number of consultations to return
 * @returns Array of consultations
 */
export async function getDoctorConsultations(
  doctorId: string,
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no_show',
  limit: number = 10
): Promise<Consultation[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Generate mock consultations
  const consultations: Consultation[] = [];
  
  for (let i = 0; i < 20; i++) {
    // Generate a random date within the last 30 days
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    // Determine status (more completed in the past, more scheduled in the future)
    let consultStatus: Consultation['status'];
    if (date > new Date()) {
      consultStatus = Math.random() > 0.1 ? 'scheduled' : 'cancelled';
    } else {
      consultStatus = Math.random() > 0.2 ? 
        'completed' : (Math.random() > 0.5 ? 'cancelled' : 'no_show');
    }
    
    // If a status filter is provided, skip consultations that don't match
    if (status && consultStatus !== status) continue;
    
    const consultation: Consultation = {
      id: `consult-${i}-${doctorId}`,
      doctorId,
      patientId: `patient-${Math.floor(Math.random() * 1000)}`,
      date: date.toISOString(),
      duration: 15 + Math.floor(Math.random() * 30), // 15-45 minutes
      type: Math.random() > 0.6 ? 'in_person' : 
            (Math.random() > 0.5 ? 'video' : 'phone'),
      status: consultStatus,
      chiefComplaint: ['Fever and cough', 'Headache', 'Back pain', 'Annual checkup', 
                       'Skin rash', 'Digestive issues', 'Anxiety', 'High blood pressure follow-up']
                      [Math.floor(Math.random() * 8)]
    };
    
    // Add additional details for completed consultations
    if (consultation.status === 'completed') {
      consultation.diagnosis = ['Common cold', 'Hypertension', 'Type 2 diabetes', 
                               'Anxiety disorder', 'Gastroenteritis', 'Migraine']
                              .filter(() => Math.random() > 0.5);
                              
      if (Math.random() > 0.3) {
        consultation.prescriptions = [
          {
            medication: ['Amoxicillin', 'Lisinopril', 'Metformin', 
                        'Atorvastatin', 'Sertraline', 'Ibuprofen']
                       [Math.floor(Math.random() * 6)],
            dosage: ['500mg', '10mg', '20mg', '25mg', '50mg', '100mg']
                   [Math.floor(Math.random() * 6)],
            instructions: ['Take twice daily with food', 
                          'Take once daily in the morning',
                          'Take as needed for pain',
                          'Take at bedtime']
                         [Math.floor(Math.random() * 4)],
            duration: ['7 days', '14 days', '30 days', 'ongoing']
                     [Math.floor(Math.random() * 4)]
          }
        ];
        
        if (Math.random() > 0.7) {
          consultation.prescriptions.push({
            medication: ['Hydrochlorothiazide', 'Losartan', 'Levothyroxine', 
                        'Albuterol', 'Omeprazole', 'Acetaminophen']
                       [Math.floor(Math.random() * 6)],
            dosage: ['25mg', '50mg', '100mcg', '90mcg', '20mg', '500mg']
                   [Math.floor(Math.random() * 6)],
            instructions: ['Take once daily', 
                          'Take twice daily',
                          'Take as needed',
                          'Take with water']
                         [Math.floor(Math.random() * 4)],
            duration: ['7 days', '14 days', '30 days', 'ongoing']
                     [Math.floor(Math.random() * 4)]
          });
        }
      }
      
      consultation.notes = Math.random() > 0.3 ? 
        'Patient responding well to treatment. Continue current plan.' : undefined;
        
      consultation.followUp = {
        recommended: Math.random() > 0.4,
        timeframe: Math.random() > 0.5 ? '2 weeks' : '1 month',
        reason: 'Check progress and adjust treatment if necessary'
      };
      
      // Add rating for some completed consultations
      if (Math.random() > 0.3) {
        const baseRating = 3 + Math.random() * 2; // 3-5 rating
        consultation.rating = {
          average: Math.min(5, baseRating + (Math.random() - 0.5)),
          count: Math.min(5, baseRating),
          reviews: [
            {
              patientId: consultation.patientId,
              rating: Math.min(5, baseRating),
              comment: Math.random() > 0.5 ? 
                'Doctor was very helpful and knowledgeable.' : 
                'Good experience overall.',
              date: new Date(date.getTime() + 1000 * 60 * 60 * 2).toISOString() // 2 hours after consultation
            }
          ]
        };
      }
    }
    
    consultations.push(consultation);
  }
  
  // Sort by date (most recent first)
  consultations.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Apply limit
  return consultations.slice(0, limit);
}

/**
 * Get user's health circle (family & friends)
 * 
 * @param userId User ID
 * @returns Array of connected users
 */
export async function getHealthCircle(userId: string): Promise<{
  id: string;
  name: string;
  relationship: string;
  profileImage?: string;
  permissions: {
    viewMedications: boolean;
    viewAppointments: boolean;
    viewVitals: boolean;
    viewAlerts: boolean;
    receiveAlerts: boolean;
  };
  lastUpdate: string; // ISO date string
  overallStatus: 'healthy' | 'attention' | 'warning';
  recentAlerts: {
    type: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
  }[];
}[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock health circle data
  return [
    {
      id: 'user123',
      name: 'Sarah Johnson',
      relationship: 'Mother',
      profileImage: 'https://randomuser.me/api/portraits/women/65.jpg',
      permissions: {
        viewMedications: true,
        viewAppointments: true,
        viewVitals: true,
        viewAlerts: true,
        receiveAlerts: true
      },
      lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
      overallStatus: 'attention',
      recentAlerts: [
        {
          type: 'medication',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
          severity: 'medium',
          message: 'Missed evening blood pressure medication'
        }
      ]
    },
    {
      id: 'user456',
      name: 'Michael Johnson',
      relationship: 'Father',
      profileImage: 'https://randomuser.me/api/portraits/men/52.jpg',
      permissions: {
        viewMedications: true,
        viewAppointments: false,
        viewVitals: true,
        viewAlerts: true,
        receiveAlerts: true
      },
      lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
      overallStatus: 'healthy',
      recentAlerts: []
    },
    {
      id: 'user789',
      name: 'Emma Wilson',
      relationship: 'Sister',
      profileImage: 'https://randomuser.me/api/portraits/women/32.jpg',
      permissions: {
        viewMedications: false,
        viewAppointments: true,
        viewVitals: false,
        viewAlerts: true,
        receiveAlerts: true
      },
      lastUpdate: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      overallStatus: 'healthy',
      recentAlerts: []
    },
    {
      id: 'user101',
      name: 'Robert Smith',
      relationship: 'Grandfather',
      profileImage: 'https://randomuser.me/api/portraits/men/75.jpg',
      permissions: {
        viewMedications: true,
        viewAppointments: true,
        viewVitals: true,
        viewAlerts: true,
        receiveAlerts: true
      },
      lastUpdate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      overallStatus: 'warning',
      recentAlerts: [
        {
          type: 'vital_signs',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 36 hours ago
          severity: 'high',
          message: 'Elevated blood pressure: 160/95 mmHg'
        },
        {
          type: 'activity',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 48 hours ago
          severity: 'medium',
          message: 'Decreased activity level over past 3 days'
        }
      ]
    }
  ];
}

/**
 * Generate mock doctor data
 * 
 * @returns Array of mock doctors
 */
function getMockDoctors(): Doctor[] {
  return [
    {
      id: 'doc001',
      name: 'Dr. Jennifer Martinez',
      profileImage: 'https://randomuser.me/api/portraits/women/28.jpg',
      specialty: 'cardiology',
      credentials: ['MD', 'FACC', 'Board Certified'],
      experience: 12,
      languages: ['English', 'Spanish'],
      location: {
        address: '123 Medical Center Blvd',
        city: 'Boston',
        state: 'MA',
        zipCode: '02115',
        country: 'USA',
        coordinates: {
          latitude: 42.336458,
          longitude: -71.095425
        },
        telehealth: true
      },
      availability: {
        monday: generateTimeSlots(9, 17),
        tuesday: generateTimeSlots(9, 17),
        wednesday: generateTimeSlots(9, 17),
        thursday: generateTimeSlots(9, 17),
        friday: generateTimeSlots(9, 15),
        saturday: [],
        sunday: [],
        nextAvailable: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days from now
        acceptingNewPatients: true
      },
      ratings: {
        average: {
          empathy: 4.7,
          effectiveness: 4.8,
          clarity: 4.6,
          punctuality: 4.2,
          overall: 4.7
        },
        count: 124,
        recent: []
      },
      insurance: ['BlueCross', 'Aetna', 'Medicare', 'Cigna'],
      fees: {
        initial: 250,
        followUp: 150,
        currency: 'USD'
      },
      bio: 'Dr. Martinez is a board-certified cardiologist with over 12 years of experience in treating complex cardiac conditions. She specializes in preventative cardiology and heart disease management.'
    },
    {
      id: 'doc002',
      name: 'Dr. Michael Chen',
      profileImage: 'https://randomuser.me/api/portraits/men/34.jpg',
      specialty: 'general_practice',
      credentials: ['MD', 'Board Certified'],
      experience: 8,
      languages: ['English', 'Mandarin'],
      location: {
        address: '456 Health Parkway',
        city: 'Boston',
        state: 'MA',
        zipCode: '02116',
        country: 'USA',
        coordinates: {
          latitude: 42.348461,
          longitude: -71.081299
        },
        telehealth: true
      },
      availability: {
        monday: generateTimeSlots(8, 16),
        tuesday: generateTimeSlots(8, 16),
        wednesday: [],
        thursday: generateTimeSlots(8, 16),
        friday: generateTimeSlots(8, 16),
        saturday: generateTimeSlots(9, 12),
        sunday: [],
        nextAvailable: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 1 day from now
        acceptingNewPatients: true
      },
      ratings: {
        average: {
          empathy: 4.9,
          effectiveness: 4.5,
          clarity: 4.7,
          punctuality: 4.6,
          overall: 4.8
        },
        count: 87,
        recent: []
      },
      insurance: ['BlueCross', 'UnitedHealthcare', 'Aetna', 'Harvard Pilgrim'],
      fees: {
        initial: 180,
        followUp: 120,
        currency: 'USD'
      },
      bio: 'Dr. Chen focuses on comprehensive primary care for patients of all ages. He emphasizes preventative medicine and building long-term relationships with his patients to promote better health outcomes.'
    },
    {
      id: 'doc003',
      name: 'Dr. Sarah Johnson',
      profileImage: 'https://randomuser.me/api/portraits/women/42.jpg',
      specialty: 'endocrinology',
      credentials: ['MD', 'PhD', 'Board Certified'],
      experience: 15,
      languages: ['English'],
      location: {
        address: '789 Diabetes Care Center',
        city: 'Cambridge',
        state: 'MA',
        zipCode: '02139',
        country: 'USA',
        coordinates: {
          latitude: 42.373611,
          longitude: -71.110558
        },
        telehealth: true
      },
      availability: {
        monday: generateTimeSlots(10, 18),
        tuesday: generateTimeSlots(10, 18),
        wednesday: generateTimeSlots(10, 18),
        thursday: generateTimeSlots(10, 18),
        friday: [],
        saturday: [],
        sunday: [],
        nextAvailable: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days from now
        acceptingNewPatients: false
      },
      ratings: {
        average: {
          empathy: 4.3,
          effectiveness: 4.9,
          clarity: 4.8,
          punctuality: 4.0,
          overall: 4.6
        },
        count: 156,
        recent: []
      },
      insurance: ['Medicare', 'BlueCross', 'Tufts Health Plan', 'Cigna'],
      fees: {
        initial: 300,
        followUp: 175,
        currency: 'USD'
      },
      bio: 'Dr. Johnson is a leading endocrinologist specializing in diabetes management, thyroid disorders, and other hormonal conditions. Her research on new diabetes treatments has been published in several leading medical journals.'
    },
    {
      id: 'doc004',
      name: 'Dr. Robert Williams',
      profileImage: 'https://randomuser.me/api/portraits/men/45.jpg',
      specialty: 'neurology',
      credentials: ['MD', 'Board Certified'],
      experience: 20,
      languages: ['English', 'French'],
      location: {
        address: '101 Neuro Sciences Building',
        city: 'Boston',
        state: 'MA',
        zipCode: '02118',
        country: 'USA',
        coordinates: {
          latitude: 42.335946,
          longitude: -71.072473
        },
        telehealth: false
      },
      availability: {
        monday: generateTimeSlots(9, 16),
        tuesday: [],
        wednesday: generateTimeSlots(9, 16),
        thursday: [],
        friday: generateTimeSlots(9, 16),
        saturday: [],
        sunday: [],
        nextAvailable: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days from now
        acceptingNewPatients: true
      },
      ratings: {
        average: {
          empathy: 4.0,
          effectiveness: 4.8,
          clarity: 4.2,
          punctuality: 3.9,
          overall: 4.3
        },
        count: 203,
        recent: []
      },
      insurance: ['Medicare', 'BlueCross', 'UnitedHealthcare', 'Mass General Brigham Health Plan'],
      fees: {
        initial: 350,
        followUp: 200,
        currency: 'USD'
      },
      bio: 'Dr. Williams is a neurologist with two decades of experience in treating complex neurological disorders. He specializes in headache disorders, epilepsy, and neurodegenerative diseases.',
      aiEvaluation: {
        prescriptionAppropriatenessScore: 92,
        patientEngagementScore: 78,
        complaintsLevel: 'low',
        recommendedImprovements: [
          'Improve appointment punctuality',
          'Provide more detailed follow-up instructions'
        ],
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString() // 30 days ago
      }
    },
    {
      id: 'doc005',
      name: 'Dr. Emily Davis',
      profileImage: 'https://randomuser.me/api/portraits/women/23.jpg',
      specialty: 'pediatrics',
      credentials: ['MD', 'FAAP', 'Board Certified'],
      experience: 10,
      languages: ['English'],
      location: {
        address: '222 Children\'s Health Center',
        city: 'Brookline',
        state: 'MA',
        zipCode: '02445',
        country: 'USA',
        coordinates: {
          latitude: 42.331802,
          longitude: -71.121428
        },
        telehealth: true
      },
      availability: {
        monday: generateTimeSlots(8, 17),
        tuesday: generateTimeSlots(8, 17),
        wednesday: generateTimeSlots(8, 17),
        thursday: generateTimeSlots(8, 17),
        friday: generateTimeSlots(8, 12),
        saturday: [],
        sunday: [],
        nextAvailable: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days from now
        acceptingNewPatients: true
      },
      ratings: {
        average: {
          empathy: 4.9,
          effectiveness: 4.7,
          clarity: 4.8,
          punctuality: 4.5,
          overall: 4.8
        },
        count: 178,
        recent: []
      },
      insurance: ['BlueCross', 'UnitedHealthcare', 'Aetna', 'Tufts Health Plan'],
      fees: {
        initial: 200,
        followUp: 125,
        currency: 'USD'
      },
      bio: 'Dr. Davis provides compassionate pediatric care from newborns to adolescents. She has a special interest in childhood development, preventative health, and managing chronic conditions in children.'
    }
  ];
}

/**
 * Generate time slots for a day
 * 
 * @param startHour Start hour (24-hour format)
 * @param endHour End hour (24-hour format)
 * @returns Array of time slots
 */
function generateTimeSlots(startHour: number, endHour: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    // Add two slots per hour (30-minute intervals)
    const slot1: TimeSlot = {
      start: `${hour.toString().padStart(2, '0')}:00`,
      end: `${hour.toString().padStart(2, '0')}:30`,
      available: Math.random() > 0.3 // 70% chance of being available
    };
    
    const slot2: TimeSlot = {
      start: `${hour.toString().padStart(2, '0')}:30`,
      end: `${(hour + 1).toString().padStart(2, '0')}:00`,
      available: Math.random() > 0.3 // 70% chance of being available
    };
    
    slots.push(slot1, slot2);
  }
  
  return slots;
}

/**
 * Get doctors near a given location
 */
export async function getNearbyDoctors(
  location: [number, number],
  options?: {
    specialty?: string;
    maxDistance?: number;
    acceptingNewPatients?: boolean;
    telemedicine?: boolean;
    minRating?: number;
    insuranceProvider?: string;
    language?: string;
  }
): Promise<Doctor[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate mock doctors
  let doctors = generateMockDoctors(30, location);
  
  // Apply filters if provided
  if (options) {
    if (options.specialty) {
      doctors = doctors.filter(d => d.specialty.toLowerCase().includes(options.specialty!.toLowerCase()));
    }
    
    if (options.maxDistance) {
      doctors = doctors.filter(d => d.distanceKm <= options.maxDistance!);
    }
    
    if (options.acceptingNewPatients !== undefined) {
      doctors = doctors.filter(d => d.acceptingNewPatients === options.acceptingNewPatients);
    }
    
    if (options.telemedicine !== undefined) {
      doctors = doctors.filter(d => d.telemedicine === options.telemedicine);
    }
    
    if (options.minRating) {
      doctors = doctors.filter(d => d.rating.average >= options.minRating!);
    }
    
    if (options.insuranceProvider) {
      doctors = doctors.filter(d => 
        d.insuranceAccepted.some(i => 
          i.toLowerCase().includes(options.insuranceProvider!.toLowerCase())
        )
      );
    }
    
    if (options.language) {
      doctors = doctors.filter(d => 
        d.languages.some(l => 
          l.toLowerCase().includes(options.language!.toLowerCase())
        )
      );
    }
  }
  
  // Sort by distance
  doctors.sort((a, b) => a.distanceKm - b.distanceKm);
  
  return doctors;
}

/**
 * Get user's current location
 */
export function getUserLocation(): Promise<[number, number]> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          resolve([position.coords.latitude, position.coords.longitude]);
        },
        error => {
          // Default to San Francisco if geolocation fails
          console.error("Geolocation error:", error);
          resolve([37.7749, -122.4194]);
        },
        { timeout: 10000 }
      );
    } else {
      // Default to San Francisco if geolocation not available
      resolve([37.7749, -122.4194]);
    }
  });
}

/**
 * Get doctor details by ID
 */
export async function getDoctorById(id: string): Promise<Doctor | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would fetch from an API
  const doctorLocation: [number, number] = [37.7749, -122.4194]; // San Francisco
  const doctors = generateMockDoctors(20, doctorLocation);
  const doctor = doctors.find(doc => doc.id === id);
  
  return doctor || null;
}

/**
 * Format distance for display
 */
export function formatDistance(doctor: Doctor): string {
  if (doctor.distanceKm < 1) {
    return `${Math.round(doctor.distanceKm * 1000)}m away`;
  } else {
    return `${doctor.distanceKm.toFixed(1)}km away`;
  }
}

/**
 * Submit a rating for a doctor
 */
export async function submitDoctorRating(
  doctorId: string,
  rating: number,
  comment: string
): Promise<{ success: boolean; message: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Simulate success with 95% probability
  if (Math.random() > 0.05) {
    return {
      success: true,
      message: "Thank you for your feedback! Your review has been submitted."
    };
  } else {
    return {
      success: false,
      message: "An error occurred while submitting your review. Please try again later."
    };
  }
} 