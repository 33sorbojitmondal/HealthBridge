import { NextResponse } from 'next/server';

// Mock database for missed calls and voice interactions
type MissedCallRecord = {
  timestamp: number;
  processed: boolean;
  followupSent: boolean;
  category?: string;
};

type EmergencyContact = {
  name: string;
  relation: string;
  phone: string;
};

type UserVoiceProfile = {
  language: string;
  emergencyContacts: EmergencyContact[];
  medicalConditions: string[];
  primaryDoctor?: string;
  primaryDoctorPhone?: string;
};

// Store missed calls with their triage status
const missedCalls: Record<string, MissedCallRecord[]> = {};

// Store user voice preferences and emergency contacts
const userVoiceProfiles: Record<string, UserVoiceProfile> = {
  '+12345678900': {
    language: 'english',
    emergencyContacts: [
      { name: 'Jane Doe', relation: 'Spouse', phone: '+12345678901' },
      { name: 'Bob Smith', relation: 'Son', phone: '+12345678902' }
    ],
    medicalConditions: ['Diabetes Type 2', 'Hypertension'],
    primaryDoctor: 'Dr. Johnson',
    primaryDoctorPhone: '+19876543210'
  },
  '+9876543210': {
    language: 'spanish',
    emergencyContacts: [
      { name: 'Maria Rodriguez', relation: 'Daughter', phone: '+9876543211' }
    ],
    medicalConditions: ['Asthma'],
    primaryDoctor: 'Dr. Garcia',
    primaryDoctorPhone: '+19876543220'
  }
};

// Supported languages for voice assistance
const supportedLanguages = ['english', 'spanish', 'french', 'hindi', 'mandarin'];

// Record a missed call for triage
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { phone, action, category, language } = data;
    
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }
    
    // Handle different types of voice API actions
    switch (action) {
      case 'missed-call':
        // Record a new missed call for triage
        if (!missedCalls[phone]) {
          missedCalls[phone] = [];
        }
        
        missedCalls[phone].push({
          timestamp: Date.now(),
          processed: false,
          followupSent: false,
          category: category || 'general'
        });
        
        // In a real system, this would trigger an automated call back or SMS
        return NextResponse.json({
          success: true,
          message: 'Missed call recorded, a healthcare provider will call you back shortly.'
        });
        
      case 'emergency-activation':
        // Handle voice-activated emergency requests
        const userProfile = userVoiceProfiles[phone];
        
        if (!userProfile) {
          // Create a basic profile if not exists
          userVoiceProfiles[phone] = {
            language: language || 'english',
            emergencyContacts: [],
            medicalConditions: []
          };
        }
        
        // In a real system, this would initiate emergency protocols
        // 1. Call the user back
        // 2. If no response, notify emergency contacts
        // 3. Connect to emergency services if configured
        
        return NextResponse.json({
          success: true,
          message: 'Emergency activation received. Initiating emergency protocol.',
          // Return emergency contacts if available
          emergencyContacts: userVoiceProfiles[phone]?.emergencyContacts || []
        });
        
      case 'language-preference':
        // Update language preference for voice interactions
        if (!language || !supportedLanguages.includes(language.toLowerCase())) {
          return NextResponse.json(
            { error: 'Valid language preference is required' },
            { status: 400 }
          );
        }
        
        if (!userVoiceProfiles[phone]) {
          userVoiceProfiles[phone] = {
            language: language.toLowerCase(),
            emergencyContacts: [],
            medicalConditions: []
          };
        } else {
          userVoiceProfiles[phone].language = language.toLowerCase();
        }
        
        return NextResponse.json({
          success: true,
          message: `Language preference updated to ${language}.`,
          language: language.toLowerCase()
        });
        
      case 'add-emergency-contact':
        // Add emergency contact to user profile
        const { contactName, contactPhone, relation } = data;
        
        if (!contactName || !contactPhone) {
          return NextResponse.json(
            { error: 'Contact name and phone are required' },
            { status: 400 }
          );
        }
        
        if (!userVoiceProfiles[phone]) {
          userVoiceProfiles[phone] = {
            language: 'english',
            emergencyContacts: [],
            medicalConditions: []
          };
        }
        
        userVoiceProfiles[phone].emergencyContacts.push({
          name: contactName,
          relation: relation || 'Contact',
          phone: contactPhone
        });
        
        return NextResponse.json({
          success: true,
          message: `Emergency contact ${contactName} added.`,
          emergencyContacts: userVoiceProfiles[phone].emergencyContacts
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing voice request:', error);
    return NextResponse.json(
      { error: 'Failed to process voice request' },
      { status: 500 }
    );
  }
}

// Get voice profile and missed calls for a phone number
export async function GET(request: Request) {
  const url = new URL(request.url);
  const phone = url.searchParams.get('phone');
  
  if (!phone) {
    return NextResponse.json(
      { error: 'Phone number is required' },
      { status: 400 }
    );
  }
  
  const profile = userVoiceProfiles[phone] || null;
  const calls = missedCalls[phone] || [];
  
  return NextResponse.json({
    phone,
    profile,
    missedCalls: calls,
    supportedLanguages
  });
} 