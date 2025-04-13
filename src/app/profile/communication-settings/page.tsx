'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type CommunicationSettings = {
  phone: string;
  isPhoneVerified: boolean;
  useWhatsApp: boolean;
  whatsAppNotifications: {
    appointments: boolean;
    medicationReminders: boolean;
    healthTips: boolean;
    communityUpdates: boolean;
  };
  voicePreferences: {
    language: string;
    missedCallTriage: boolean;
    voiceEmergencyActivation: boolean;
  };
  emergencyAlerts: {
    criticalAlerts: boolean;
    contactBySMS: boolean;
    contactByCall: boolean;
    contactEmergencyServices: boolean;
  };
  emergencyContacts: {
    name: string;
    relation: string;
    phone: string;
  }[];
};

// Supported languages for voice assistance
const supportedLanguages = [
  { code: 'english', name: 'English' },
  { code: 'spanish', name: 'Spanish (Español)' },
  { code: 'french', name: 'French (Français)' },
  { code: 'hindi', name: 'Hindi (हिन्दी)' },
  { code: 'mandarin', name: 'Mandarin (普通话)' }
];

export default function CommunicationSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // For phone verification
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  
  // Mock data - would be fetched from API in a real application
  const [settings, setSettings] = useState<CommunicationSettings>({
    phone: '',
    isPhoneVerified: false,
    useWhatsApp: false,
    whatsAppNotifications: {
      appointments: true,
      medicationReminders: true,
      healthTips: false,
      communityUpdates: false
    },
    voicePreferences: {
      language: 'english',
      missedCallTriage: false,
      voiceEmergencyActivation: false
    },
    emergencyAlerts: {
      criticalAlerts: true,
      contactBySMS: true,
      contactByCall: false,
      contactEmergencyServices: false
    },
    emergencyContacts: []
  });
  
  // For adding new emergency contacts
  const [newContact, setNewContact] = useState({
    name: '',
    relation: '',
    phone: ''
  });
  
  // OTP resend timer countdown
  useEffect(() => {
    if (otpResendTimer > 0) {
      const interval = setInterval(() => {
        setOtpResendTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpResendTimer]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile/communication-settings');
    } else if (status === 'authenticated') {
      // In a real app, fetch user's communication settings
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [status, router]);
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      phone: e.target.value,
      isPhoneVerified: false
    }));
  };
  
  const handleVerifyPhone = () => {
    if (!settings.phone || !/^\+?[1-9]\d{9,14}$/.test(settings.phone)) {
      setErrorMessage('Please enter a valid phone number');
      return;
    }
    
    setIsResending(true);
    
    // Mock API call to send verification code
    setTimeout(() => {
      setShowVerificationInput(true);
      setOtpResendTimer(60);
      setIsResending(false);
      setSuccessMessage('Verification code sent. For demo purposes, use code "123456"');
      setTimeout(() => setSuccessMessage(''), 5000);
    }, 1000);
  };
  
  const handleSubmitVerification = () => {
    if (verificationCode !== '123456') { // Mock verification
      setErrorMessage('Invalid verification code');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    setSettings(prev => ({
      ...prev,
      isPhoneVerified: true
    }));
    
    setShowVerificationInput(false);
    setVerificationCode('');
    setSuccessMessage('Phone number verified successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  const toggleWhatsApp = () => {
    setSettings(prev => ({
      ...prev,
      useWhatsApp: !prev.useWhatsApp
    }));
  };
  
  const handleWhatsAppNotificationChange = (setting: keyof typeof settings.whatsAppNotifications) => {
    setSettings(prev => ({
      ...prev,
      whatsAppNotifications: {
        ...prev.whatsAppNotifications,
        [setting]: !prev.whatsAppNotifications[setting]
      }
    }));
  };
  
  const handleVoicePreferenceChange = (setting: keyof typeof settings.voicePreferences, value: any) => {
    setSettings(prev => ({
      ...prev,
      voicePreferences: {
        ...prev.voicePreferences,
        [setting]: value
      }
    }));
  };
  
  const handleEmergencyAlertChange = (setting: keyof typeof settings.emergencyAlerts) => {
    setSettings(prev => ({
      ...prev,
      emergencyAlerts: {
        ...prev.emergencyAlerts,
        [setting]: !prev.emergencyAlerts[setting]
      }
    }));
  };
  
  const handleAddEmergencyContact = () => {
    if (!newContact.name || !newContact.phone) {
      setErrorMessage('Name and phone number are required for emergency contacts');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    setSettings(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, { ...newContact }]
    }));
    
    setNewContact({
      name: '',
      relation: '',
      phone: ''
    });
  };
  
  const handleRemoveEmergencyContact = (index: number) => {
    setSettings(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }));
  };
  
  const saveSettings = () => {
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    // Mock API call to save settings
    setTimeout(() => {
      setIsSaving(false);
      setSuccessMessage('Communication settings saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1500);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading your communication settings...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto pt-8 pb-12 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Communication Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage how AI HealthBridge communicates with you across different channels
          </p>
        </div>
        
        <Link
          href="/profile"
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition"
        >
          Back to Profile
        </Link>
      </div>
      
      {successMessage && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-8">
        {/* Phone Number Verification Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Phone Number</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Your Phone Number
              </label>
              <div className="flex">
                <input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={settings.phone}
                  onChange={handlePhoneChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSaving || settings.isPhoneVerified}
                />
                {settings.isPhoneVerified ? (
                  <span className="ml-3 inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <svg className="-ml-1 mr-1.5 h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleVerifyPhone}
                    disabled={isResending || !settings.phone || isSaving}
                    className="ml-3 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                  >
                    {isResending ? 'Sending...' : 'Verify'}
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter your phone number with country code (e.g., +1 for US)
              </p>
            </div>
            
            {/* Phone Verification Input */}
            {showVerificationInput && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Verification Code
                </label>
                <div className="flex">
                  <input
                    id="verificationCode"
                    type="text"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-wide"
                  />
                  <button
                    type="button"
                    onClick={handleSubmitVerification}
                    disabled={verificationCode.length !== 6 || isSaving}
                    className="ml-3 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                  >
                    Submit
                  </button>
                </div>
                
                <div className="mt-2 text-center">
                  {otpResendTimer > 0 ? (
                    <p className="text-sm text-gray-600">
                      Resend code in {otpResendTimer} seconds
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleVerifyPhone}
                      disabled={isResending || isSaving}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Resend Code
                    </button>
                  )}
                </div>
                
                <p className="mt-1 text-xs text-gray-500 text-center">
                  For demo purposes, the verification code is "123456"
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* WhatsApp Settings Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-1">WhatsApp Integration</h2>
              <p className="text-gray-600 text-sm">
                Receive health updates, reminders, and communicate with AI assistant via WhatsApp
              </p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                type="button"
                disabled={!settings.isPhoneVerified || isSaving}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${
                  settings.useWhatsApp ? 'bg-blue-600' : 'bg-gray-200'
                } ${!settings.isPhoneVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={toggleWhatsApp}
              >
                <span 
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition ease-in-out duration-200 ${
                    settings.useWhatsApp ? 'translate-x-5' : 'translate-x-0'
                  }`} 
                />
              </button>
            </div>
          </div>
          
          {!settings.isPhoneVerified && (
            <div className="mt-2 text-sm text-amber-600">
              Please verify your phone number first to enable WhatsApp integration
            </div>
          )}
          
          {settings.isPhoneVerified && settings.useWhatsApp && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h3 className="text-md font-medium text-gray-700 mb-3">WhatsApp Notification Preferences</h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="whatsapp-appointments"
                    type="checkbox"
                    checked={settings.whatsAppNotifications.appointments}
                    onChange={() => handleWhatsAppNotificationChange('appointments')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isSaving}
                  />
                  <label htmlFor="whatsapp-appointments" className="ml-3 block text-sm text-gray-700">
                    Appointment reminders
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="whatsapp-medications"
                    type="checkbox"
                    checked={settings.whatsAppNotifications.medicationReminders}
                    onChange={() => handleWhatsAppNotificationChange('medicationReminders')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isSaving}
                  />
                  <label htmlFor="whatsapp-medications" className="ml-3 block text-sm text-gray-700">
                    Medication reminders
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="whatsapp-tips"
                    type="checkbox"
                    checked={settings.whatsAppNotifications.healthTips}
                    onChange={() => handleWhatsAppNotificationChange('healthTips')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isSaving}
                  />
                  <label htmlFor="whatsapp-tips" className="ml-3 block text-sm text-gray-700">
                    Daily health tips and education
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="whatsapp-community"
                    type="checkbox"
                    checked={settings.whatsAppNotifications.communityUpdates}
                    onChange={() => handleWhatsAppNotificationChange('communityUpdates')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isSaving}
                  />
                  <label htmlFor="whatsapp-community" className="ml-3 block text-sm text-gray-700">
                    Community updates and group notifications
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Voice & Call Assistance Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Voice & Call Assistance</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="voice-language" className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Language for Voice Assistance
              </label>
              <select
                id="voice-language"
                value={settings.voicePreferences.language}
                onChange={(e) => handleVoicePreferenceChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={!settings.isPhoneVerified || isSaving}
              >
                {supportedLanguages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                id="missed-call-triage"
                type="checkbox"
                checked={settings.voicePreferences.missedCallTriage}
                onChange={() => handleVoicePreferenceChange('missedCallTriage', !settings.voicePreferences.missedCallTriage)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={!settings.isPhoneVerified || isSaving}
              />
              <label htmlFor="missed-call-triage" className="ml-3 block text-sm text-gray-700">
                Enable missed-call-based triage (Our system will call you back when you give a missed call)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="voice-emergency"
                type="checkbox"
                checked={settings.voicePreferences.voiceEmergencyActivation}
                onChange={() => handleVoicePreferenceChange('voiceEmergencyActivation', !settings.voicePreferences.voiceEmergencyActivation)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={!settings.isPhoneVerified || isSaving}
              />
              <label htmlFor="voice-emergency" className="ml-3 block text-sm text-gray-700">
                Enable voice-activated emergency help ("Hey HealthBridge, emergency help")
              </label>
            </div>
          </div>
          
          {!settings.isPhoneVerified && (
            <div className="mt-3 text-sm text-amber-600">
              Please verify your phone number first to enable voice assistance features
            </div>
          )}
        </div>
        
        {/* Emergency Health Alerts Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Emergency Health Alerts</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="critical-alerts"
                type="checkbox"
                checked={settings.emergencyAlerts.criticalAlerts}
                onChange={() => handleEmergencyAlertChange('criticalAlerts')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={!settings.isPhoneVerified || isSaving}
              />
              <label htmlFor="critical-alerts" className="ml-3 block text-sm text-gray-700">
                Receive critical health alerts based on your health data
              </label>
            </div>
            
            <div className="pl-7 space-y-3">
              <div className="flex items-center">
                <input
                  id="alert-sms"
                  type="checkbox"
                  checked={settings.emergencyAlerts.contactBySMS}
                  onChange={() => handleEmergencyAlertChange('contactBySMS')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={!settings.isPhoneVerified || !settings.emergencyAlerts.criticalAlerts || isSaving}
                />
                <label htmlFor="alert-sms" className="ml-3 block text-sm text-gray-700">
                  Contact me by SMS for alerts
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="alert-call"
                  type="checkbox"
                  checked={settings.emergencyAlerts.contactByCall}
                  onChange={() => handleEmergencyAlertChange('contactByCall')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={!settings.isPhoneVerified || !settings.emergencyAlerts.criticalAlerts || isSaving}
                />
                <label htmlFor="alert-call" className="ml-3 block text-sm text-gray-700">
                  Contact me by phone call for critical alerts
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="alert-emergency"
                  type="checkbox"
                  checked={settings.emergencyAlerts.contactEmergencyServices}
                  onChange={() => handleEmergencyAlertChange('contactEmergencyServices')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={!settings.isPhoneVerified || !settings.emergencyAlerts.criticalAlerts || isSaving}
                />
                <label htmlFor="alert-emergency" className="ml-3 block text-sm text-gray-700">
                  In life-threatening situations, contact emergency services
                </label>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 mt-4">
              <h3 className="text-md font-medium text-gray-700 mb-3">Emergency Contacts</h3>
              
              {settings.emergencyContacts.length > 0 ? (
                <div className="mb-4 space-y-3">
                  {settings.emergencyContacts.map((contact, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <div className="text-sm font-medium text-gray-800">{contact.name}</div>
                        <div className="text-xs text-gray-500">{contact.relation} • {contact.phone}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEmergencyContact(index)}
                        className="text-red-600 hover:text-red-800"
                        disabled={isSaving}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic mb-4">No emergency contacts added yet</p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                    disabled={!settings.isPhoneVerified || isSaving}
                  />
                </div>
                
                <div>
                  <label htmlFor="contact-relation" className="block text-xs font-medium text-gray-700 mb-1">
                    Relation
                  </label>
                  <input
                    id="contact-relation"
                    type="text"
                    value={newContact.relation}
                    onChange={(e) => setNewContact({...newContact, relation: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Spouse, Parent, etc."
                    disabled={!settings.isPhoneVerified || isSaving}
                  />
                </div>
                
                <div>
                  <label htmlFor="contact-phone" className="block text-xs font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="flex">
                    <input
                      id="contact-phone"
                      type="tel"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1234567890"
                      disabled={!settings.isPhoneVerified || isSaving}
                    />
                    <button
                      type="button"
                      onClick={handleAddEmergencyContact}
                      className="px-3 py-2 border border-gray-300 border-l-0 rounded-r-md bg-gray-50 hover:bg-gray-100 focus:outline-none"
                      disabled={!settings.isPhoneVerified || !newContact.name || !newContact.phone || isSaving}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {!settings.isPhoneVerified && (
            <div className="mt-3 text-sm text-amber-600">
              Please verify your phone number first to enable emergency alerts
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 flex justify-end space-x-4">
        <Link
          href="/profile"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={saveSettings}
          disabled={isSaving}
          className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors disabled:bg-blue-300"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  );
} 