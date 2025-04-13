'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from '@/lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PhoneIcon, BellIcon, BellAlertIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import EmergencyVoiceTrigger from '@/components/EmergencyVoiceTrigger';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  
  // States for WhatsApp emergency notification
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isWhatsappVerified, setIsWhatsappVerified] = useState(false);
  const [enableEmergencyNotifications, setEnableEmergencyNotifications] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState(false);
  const [notificationError, setNotificationError] = useState('');

  // Add this new type for emergency config
  type EmergencyConfig = {
    enabled: boolean;
    lastTested: string | null;
    contacts: string[];
    messages: string[];
    selectedMessage: string;
  };

  // In the ProfilePage component, add these new state variables
  const [emergencyConfig, setEmergencyConfig] = useState<EmergencyConfig>({
    enabled: false,
    lastTested: null,
    contacts: [],
    messages: [
      "Medical emergency! Need immediate assistance!",
      "Health alert! Please check on me ASAP!",
      "I need help! Please contact emergency services!",
      "Critical situation - please respond immediately!"
    ],
    selectedMessage: "Medical emergency! Need immediate assistance!"
  });
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isSendingEmergency, setIsSendingEmergency] = useState(false);
  const [emergencyResponse, setEmergencyResponse] = useState<{ success?: boolean; error?: string } | null>(null);

  useEffect(() => {
    // Wait a moment to avoid flickering during auth state check
    const timer = setTimeout(() => setLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Redirect to login if not authenticated after checking
  useEffect(() => {
    if (loaded && status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile');
    }
  }, [loaded, status, router]);

  // Reset notification status after 5 seconds
  useEffect(() => {
    if (notificationSuccess || notificationError) {
      const timer = setTimeout(() => {
        setNotificationSuccess(false);
        setNotificationError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notificationSuccess, notificationError]);

  if (!loaded || status === 'loading') {
    return (
      <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect via useEffect
  }

  // Dummy user data
  const userData = {
    name: session?.user?.name || 'John Doe',
    email: session?.user?.email || 'john.doe@example.com',
    avatar: session?.user?.image || 'https://randomuser.me/api/portraits/men/32.jpg',
    joinedDate: '2023-01-15',
    phone: '+1 (555) 123-4567',
    address: '123 Health St, Medical City, MC 12345',
    emergencyContact: 'Jane Doe (+1 555-987-6543)',
    bloodType: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    medications: [
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }
    ],
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    insurance: {
      provider: 'HealthPlus Insurance',
      policyNumber: 'HP123456789',
      groupNumber: 'GP987654',
      expirationDate: '2024-12-31'
    }
  };

  // Quick stats
  const quickStats = [
    { label: 'Upcoming Appointments', value: 2, link: '/appointments?view=upcoming', icon: (
      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
    { label: 'Health Goals', value: '3 of 5', link: '/health-tracking', icon: (
      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { label: 'Medication Adherence', value: '92%', link: '/medications', icon: (
      <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    )},
    { label: 'Messages', value: 3, link: '/messages', icon: (
      <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    )}
  ];

  // Action cards
  const actionCards = [
    { 
      title: 'Track Your Health',
      description: 'Monitor vital signs, activity, and more to stay on top of your health journey.',
      link: '/health-tracking',
      icon: (
        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'blue'
    },
    { 
      title: 'Manage Appointments',
      description: 'Schedule, view, and manage your healthcare appointments in one place.',
      link: '/appointments',
      icon: (
        <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'purple'
    },
    { 
      title: 'Check Symptoms',
      description: 'Use our AI-powered symptom checker to get insights about your health concerns.',
      link: '/symptom-checker',
      icon: (
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'green'
    },
    { 
      title: 'Find Doctors',
      description: 'Search our directory to find healthcare professionals in your area.',
      link: '/medical-directory',
      icon: (
        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'red'
    },
    { 
      title: 'Join Community',
      description: 'Connect with others, share experiences and get support from our community.',
      link: '/community-forum',
      icon: (
        <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'indigo'
    },
    { 
      title: 'Virtual Consultation',
      description: 'Connect with healthcare providers through secure video consultations.',
      link: '/virtual-consultation',
      icon: (
        <svg className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: 'teal'
    }
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Handle WhatsApp number verification
  const handleVerifyWhatsapp = () => {
    // Validate the phone number format
    if (!whatsappNumber || !/^\+?[1-9]\d{9,14}$/.test(whatsappNumber)) {
      setNotificationError('Please enter a valid WhatsApp number with country code (e.g., +1234567890)');
      return;
    }
    
    // In a real app, you would send a verification code to the WhatsApp number
    // For demo purposes, we'll just set it as verified
    setIsWhatsappVerified(true);
    setNotificationSuccess(true);
  };

  // Handle sending a test emergency notification
  const handleTestEmergency = async () => {
    if (!isWhatsappVerified || !enableEmergencyNotifications) {
      setNotificationError('Please verify your WhatsApp number and enable emergency notifications first');
      return;
    }

    setIsSending(true);
    setNotificationError('');
    setNotificationSuccess(false);

    try {
      // Call the WhatsApp API to send a test message
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: whatsappNumber,
          message: '[TEST] This is a test emergency notification from AI HealthBridge',
          sessionId: 'test-emergency'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setNotificationSuccess(true);
      } else {
        setNotificationError(data.error || 'Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      setNotificationError('An unexpected error occurred');
    } finally {
      setIsSending(false);
    }
  };

  // Add this new function to handle emergency alerts
  const handleEmergency = async () => {
    if (!userData?.phone) {
      setEmergencyResponse({ 
        error: "Please add a phone number to your profile before sending emergency alerts." 
      });
      return;
    }
    
    if (!emergencyConfig.enabled) {
      setEmergencyResponse({ 
        error: "Emergency alerts are not enabled. Please enable them in settings." 
      });
      return;
    }
    
    setIsSendingEmergency(true);
    setEmergencyResponse(null);
    
    try {
      const userId = session?.user && 'id' in session.user ? session.user.id : 'unknown';
      
      const response = await fetch('/api/emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          phoneNumber: userData?.phone,
          message: emergencyConfig.selectedMessage,
          level: 'urgent',
          // In a real app, we would include location data if available
          location: null,
          // In a real app, we would include vital sign data if available
          vitalSigns: null,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEmergencyResponse({ success: true });
        // Update last tested timestamp
        setEmergencyConfig(prev => ({
          ...prev,
          lastTested: new Date().toISOString()
        }));
      } else {
        setEmergencyResponse({ error: data.error || 'Failed to send emergency alert' });
      }
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      setEmergencyResponse({ error: 'An unexpected error occurred' });
    } finally {
      setIsSendingEmergency(false);
    }
  };

  const toggleEmergencyAlerts = () => {
    setEmergencyConfig(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };

  const handleMessageSelect = (message: string) => {
    setEmergencyConfig(prev => ({
      ...prev,
      selectedMessage: message
    }));
    setIsEmergencyModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto pt-8 pb-12">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <div className="h-24 w-24 rounded-full border-4 border-white overflow-hidden">
                <img 
                  src={userData.avatar} 
                  alt={userData.name} 
                  className="h-full w-full object-cover" 
                />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-white">{userData.name}</h1>
                <p className="text-blue-100">Member since {new Date(userData.joinedDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button 
                onClick={() => router.push('/profile/edit')}
                className="px-4 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50 transition"
              >
                Edit Profile
              </button>
              <button 
                onClick={handleSignOut}
                className="px-4 py-2 bg-blue-700 text-white rounded-md font-medium hover:bg-blue-800 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => (
              <Link
                key={index}
                href={stat.link}
                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex-shrink-0 bg-white p-2 rounded-full">
                  {stat.icon}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Personal Info and Emergency WhatsApp */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1 text-sm text-gray-900">{userData.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="mt-1 text-sm text-gray-900">{userData.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="mt-1 text-sm text-gray-900">{userData.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Emergency Contact</p>
                  <p className="mt-1 text-sm text-gray-900">{userData.emergencyContact}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Emergency WhatsApp Notification Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Emergency WhatsApp</h2>
              <Link 
                href="/profile/communication-settings" 
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Advanced settings
              </Link>
            </div>
            <div className="px-6 py-4">
              {notificationSuccess && (
                <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        {isWhatsappVerified 
                          ? 'WhatsApp number verified successfully!' 
                          : 'Test emergency notification sent successfully!'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {notificationError && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{notificationError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Set up emergency WhatsApp notifications to alert your contacts in case of a health emergency.
                </p>
                
                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Number
                  </label>
                  <div className="flex">
                    <input
                      id="whatsapp"
                      type="tel"
                      placeholder="+1234567890"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      disabled={isWhatsappVerified}
                    />
                    {isWhatsappVerified ? (
                      <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        Verified
                        <svg className="ml-1.5 h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleVerifyWhatsapp}
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Enter with country code (e.g., +1 for US)</p>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="enable-emergency"
                    type="checkbox"
                    checked={enableEmergencyNotifications}
                    onChange={(e) => setEnableEmergencyNotifications(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={!isWhatsappVerified}
                  />
                  <label htmlFor="enable-emergency" className="ml-2 block text-sm text-gray-700">
                    Enable emergency notifications
                  </label>
                </div>
                
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleTestEmergency}
                    disabled={!isWhatsappVerified || !enableEmergencyNotifications || isSending}
                    className={`w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      isWhatsappVerified && enableEmergencyNotifications
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    } transition-colors`}
                  >
                    {isSending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Test Emergency Notification'
                    )}
                  </button>
                  <p className="mt-2 text-xs text-center text-gray-500">
                    This will send a test emergency notification to your WhatsApp
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Medical Information</h2>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Blood Type</p>
                  <p className="mt-1 text-sm text-gray-900">{userData.bloodType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Allergies</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {userData.allergies.map((allergy, index) => (
                      <span key={index} className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Medications</p>
                  <div className="mt-1 space-y-2">
                    {userData.medications.map((med, index) => (
                      <div key={index} className="text-sm text-gray-900">
                        <p className="font-medium">{med.name} ({med.dosage})</p>
                        <p className="text-gray-500">{med.frequency}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Conditions</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {userData.conditions.map((condition, index) => (
                      <span key={index} className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Insurance</p>
                  <div className="mt-1 text-sm text-gray-900">
                    <p>{userData.insurance.provider}</p>
                    <p className="text-gray-500">Policy: {userData.insurance.policyNumber}</p>
                    <p className="text-gray-500">Group: {userData.insurance.groupNumber}</p>
                    <p className="text-gray-500">
                      Expires: {new Date(userData.insurance.expirationDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Actions */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Health Management</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {actionCards.map((card, index) => (
                  <Link
                    key={index}
                    href={card.link}
                    className={`block p-6 border rounded-lg hover:shadow-md transition bg-${card.color}-50 border-${card.color}-100`}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 bg-${card.color}-100 p-3 rounded-full`}>
                        {card.icon}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{card.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{card.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-md font-medium text-gray-900">Blood Pressure Recording</h3>
                    <p className="mt-1 text-sm text-gray-500">You recorded a blood pressure reading of 120/80 mmHg.</p>
                    <p className="mt-1 text-xs text-gray-400">Today at 9:30 AM</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 text-purple-600">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-md font-medium text-gray-900">Appointment Scheduled</h3>
                    <p className="mt-1 text-sm text-gray-500">You scheduled an appointment with Dr. Robert Smith on July 2, 2023.</p>
                    <p className="mt-1 text-xs text-gray-400">Yesterday at 2:45 PM</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-600">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-md font-medium text-gray-900">Goal Achieved</h3>
                    <p className="mt-1 text-sm text-gray-500">You reached your daily step goal of 10,000 steps!</p>
                    <p className="mt-1 text-xs text-gray-400">3 days ago</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-100 text-red-600">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-md font-medium text-gray-900">Symptom Check Completed</h3>
                    <p className="mt-1 text-sm text-gray-500">You used the symptom checker for "Headache and fatigue".</p>
                    <p className="mt-1 text-xs text-gray-400">5 days ago</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  View All Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add the Emergency Alert Card */}
      <div className="w-full p-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Emergency Alert Card */}
          <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 relative overflow-hidden">
            <div className="absolute -right-3 -top-3 bg-red-100 dark:bg-red-900/20 rounded-full p-3">
              <ExclamationTriangleIcon className="h-7 w-7 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Emergency Alert</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {emergencyConfig.enabled ? 
                "Emergency alerts are enabled and will be sent to your WhatsApp number." :
                "Emergency alerts are currently disabled. Enable them for quick assistance in critical situations."}
            </p>
            
            <div className="flex items-center mb-4">
              <label className="inline-flex relative items-center mr-5 cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={emergencyConfig.enabled}
                  onChange={toggleEmergencyAlerts}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  {emergencyConfig.enabled ? "Enabled" : "Disabled"}
                </span>
              </label>
            </div>
            
            {userData?.phone ? (
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400 flex items-center">
                <PhoneIcon className="h-4 w-4 mr-1" />
                <span>Alerts will be sent to: {userData.phone}</span>
              </div>
            ) : (
              <div className="mb-4 text-sm text-red-500 flex items-center">
                <PhoneIcon className="h-4 w-4 mr-1" />
                <span>No phone number set. Please update your profile.</span>
              </div>
            )}
            
            {emergencyConfig.lastTested && (
              <div className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                Last tested: {new Date(emergencyConfig.lastTested).toLocaleString()}
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsEmergencyModalOpen(true)}
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center"
              >
                <span>Current message: "{emergencyConfig.selectedMessage}"</span>
              </button>
              
              <button
                onClick={handleEmergency}
                disabled={isSendingEmergency || !emergencyConfig.enabled || !userData?.phone}
                className={`w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  emergencyConfig.enabled && userData?.phone
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isSendingEmergency ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <BellAlertIcon className="h-5 w-5 mr-2" />
                    Test Emergency Alert
                  </>
                )}
              </button>
            </div>
            
            {emergencyResponse && (
              <div className={`mt-3 text-sm ${emergencyResponse.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {emergencyResponse.success 
                  ? "Emergency alert sent successfully!" 
                  : `Error: ${emergencyResponse.error}`}
              </div>
            )}
          </div>
          
          {/* Voice Emergency Trigger */}
          <div className="md:col-span-1">
            <EmergencyVoiceTrigger 
              onEmergencyTriggered={(result) => {
                // Update last tested timestamp if successful
                if (result.success) {
                  setEmergencyConfig(prev => ({
                    ...prev,
                    lastTested: new Date().toISOString()
                  }));
                }
              }} 
            />
          </div>
          
          {/* Connected Health Devices Card */}
          <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Health Devices</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Connect your health monitoring devices to enable automatic alerts for critical health changes.
            </p>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Connected Devices</span>
                <span className="text-xs text-blue-600 dark:text-blue-400">3 active</span>
              </div>
              
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Apple Watch Series 7</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">5 min ago</span>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">Glucose Monitor</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</span>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">BP Monitor</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">1 day ago</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Link
                href="/device-monitoring"
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Manage Health Devices
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Message Modal */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Select Emergency Message
              </h3>
              <div className="space-y-2">
                {emergencyConfig.messages.map((message, index) => (
                  <button
                    key={index}
                    onClick={() => handleMessageSelect(message)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {message}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsEmergencyModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 