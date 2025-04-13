import { NextResponse } from 'next/server';

// Emergency alert types
type EmergencyLevel = 'critical' | 'urgent' | 'moderate';

// Add audio trigger type
type TriggerMethod = 'manual' | 'voice' | 'device' | 'threshold';

// Add more detailed location type
type Location = {
  lat: number;
  long: number;
  address?: string;
  accuracy?: number;
  timestamp: number;
};

// Enhanced emergency alert type
type EmergencyAlert = {
  userId: string;
  phoneNumber: string;
  message: string;
  level: EmergencyLevel;
  timestamp: number;
  location?: Location;
  vitalSigns?: {
    heartRate?: number;
    bloodPressure?: string;
    bloodGlucose?: number;
    temperature?: number;
    oxygenLevel?: number;
    lastUpdated?: number;
  };
  triggerMethod: TriggerMethod;
  triggerDetails?: {
    voiceCommand?: string;
    deviceId?: string;
    deviceType?: string;
    thresholdExceeded?: string;
  };
  notifiedContacts?: string[];
  emergencyServices?: {
    notified: boolean;
    serviceId?: string;
    responseStatus?: string;
  };
};

// Store emergency alerts history
const emergencyAlertsHistory: EmergencyAlert[] = [];

// Process voice commands for emergency
function processVoiceCommand(command: string): { 
  recognized: boolean; 
  level: EmergencyLevel; 
  message: string 
} {
  command = command.toLowerCase().trim();
  
  // Keywords for emergency detection
  const criticalKeywords = ['emergency', 'help me', 'urgent', 'critical', 'ambulance', 'heart attack', 'stroke', 'can\'t breathe'];
  const urgentKeywords = ['need help', 'pain', 'injured', 'fell', 'accident', 'hurt'];
  const moderateKeywords = ['assistance', 'dizzy', 'not feeling well', 'sick'];
  
  // Check for critical keywords first
  for (const keyword of criticalKeywords) {
    if (command.includes(keyword)) {
      return { 
        recognized: true, 
        level: 'critical', 
        message: `Voice emergency: "${command}"` 
      };
    }
  }
  
  // Check for urgent keywords
  for (const keyword of urgentKeywords) {
    if (command.includes(keyword)) {
      return { 
        recognized: true, 
        level: 'urgent', 
        message: `Voice request for help: "${command}"` 
      };
    }
  }
  
  // Check for moderate keywords
  for (const keyword of moderateKeywords) {
    if (command.includes(keyword)) {
      return { 
        recognized: true, 
        level: 'moderate', 
        message: `Voice assistance request: "${command}"` 
      };
    }
  }
  
  // Default response if no keywords are found
  return {
    recognized: false,
    level: 'moderate',
    message: `Unrecognized command: "${command}"`
  };
}

// Fetch latest vital signs for a user
async function fetchLatestVitalSigns(userId: string) {
  try {
    // In a real app, this would be a database query
    // For now, try to fetch from our monitoring API
    const response = await fetch(`/api/device-monitoring?userId=${userId}&limit=1`, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.vitalSigns || data.vitalSigns.length === 0) return null;
    
    // Process vital signs into our format
    const vitalSigns: Record<string, any> = {
      lastUpdated: Date.now()
    };
    
    for (const vital of data.vitalSigns) {
      if (vital.type === 'heartRate') vitalSigns.heartRate = vital.value;
      else if (vital.type === 'bloodPressure') vitalSigns.bloodPressure = vital.value;
      else if (vital.type === 'bloodGlucose') vitalSigns.bloodGlucose = vital.value;
      else if (vital.type === 'temperature') vitalSigns.temperature = vital.value;
      else if (vital.type === 'oxygenLevel') vitalSigns.oxygenLevel = vital.value;
    }
    
    return Object.keys(vitalSigns).length > 1 ? vitalSigns : null;
    
  } catch (error) {
    console.error('Error fetching vital signs:', error);
    return null;
  }
}

// Enhanced emergency alert handling
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { 
      userId, 
      phoneNumber, 
      message, 
      level, 
      location, 
      vitalSigns,
      triggerMethod = 'manual',
      voiceCommand,
      deviceInfo 
    } = data;
    
    // Validate required fields
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }
    
    let emergencyLevel: EmergencyLevel = level || 'urgent';
    let emergencyMessage = message;
    let triggerDetails: Record<string, any> = {};
    
    // Process voice command if provided
    if (triggerMethod === 'voice' && voiceCommand) {
      const voiceResult = processVoiceCommand(voiceCommand);
      
      if (voiceResult.recognized) {
        emergencyLevel = voiceResult.level;
        emergencyMessage = voiceResult.message;
        triggerDetails.voiceCommand = voiceCommand;
      } else {
        return NextResponse.json(
          { error: 'Voice command not recognized as emergency', command: voiceCommand },
          { status: 400 }
        );
      }
    }
    
    // Add device details if provided
    if (deviceInfo) {
      triggerDetails.deviceId = deviceInfo.deviceId;
      triggerDetails.deviceType = deviceInfo.deviceType;
    }
    
    // Fetch latest vital signs if not provided
    let healthData = vitalSigns;
    if (!healthData && userId) {
      healthData = await fetchLatestVitalSigns(userId);
    }
    
    // Create a new emergency alert
    const newAlert: EmergencyAlert = {
      userId: userId || 'unknown',
      phoneNumber,
      message: emergencyMessage || 'Emergency alert triggered',
      level: emergencyLevel,
      timestamp: Date.now(),
      location: location,
      vitalSigns: healthData,
      triggerMethod,
      triggerDetails,
      notifiedContacts: [],
      emergencyServices: {
        notified: false
      }
    };
    
    emergencyAlertsHistory.push(newAlert);
    
    // First, send WhatsApp message for immediate notification
    let whatsappResponse;
    try {
      // Prepare a detailed message with vital signs if available
      let detailedMessage = `🚨 EMERGENCY ALERT: ${newAlert.message}`;
      
      if (newAlert.location) {
        detailedMessage += `\n📍 Location: https://maps.google.com/?q=${newAlert.location.lat},${newAlert.location.long}`;
      }
      
      if (newAlert.vitalSigns) {
        detailedMessage += '\n\n📊 Vital Signs:';
        if (newAlert.vitalSigns.heartRate) detailedMessage += `\n❤️ Heart Rate: ${newAlert.vitalSigns.heartRate} bpm`;
        if (newAlert.vitalSigns.bloodPressure) detailedMessage += `\n🩸 BP: ${newAlert.vitalSigns.bloodPressure} mmHg`;
        if (newAlert.vitalSigns.oxygenLevel) detailedMessage += `\n💨 O2: ${newAlert.vitalSigns.oxygenLevel}%`;
        if (newAlert.vitalSigns.temperature) detailedMessage += `\n🌡️ Temp: ${newAlert.vitalSigns.temperature}°C`;
      }
      
      whatsappResponse = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'system',
          to: phoneNumber,
          message: detailedMessage,
          sessionId: `emergency-${Date.now()}`,
          urgent: true
        })
      }).then(res => res.json());
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
    }
    
    // Then, create a health alert for broader notification (SMS, calls to emergency contacts)
    let alertResponse;
    try {
      alertResponse = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'unknown',
          phoneNumber,
          message: `🚨 EMERGENCY: ${newAlert.message}`,
          priority: newAlert.level === 'critical' ? 'critical' : (newAlert.level === 'urgent' ? 'high' : 'medium'),
          category: 'emergency',
          source: triggerMethod,
          location: newAlert.location,
          vitalSigns: newAlert.vitalSigns
        })
      }).then(res => res.json());
      
      if (alertResponse?.alert?.id) {
        // Update our record with the alert ID and notified contacts
        const alertIndex = emergencyAlertsHistory.findIndex(a => 
          a.phoneNumber === phoneNumber && a.timestamp === newAlert.timestamp
        );
        
        if (alertIndex !== -1) {
          emergencyAlertsHistory[alertIndex].notifiedContacts = ['system'];
          
          // If emergency services were notified, update that too
          if (alertResponse?.emergencyServices?.notified) {
            emergencyAlertsHistory[alertIndex].emergencyServices = {
              notified: true,
              serviceId: alertResponse.emergencyServices.id || undefined,
              responseStatus: alertResponse.emergencyServices.status || undefined
            };
          }
        }
      }
    } catch (error) {
      console.error('Error creating health alert:', error);
    }
    
    // For critical emergencies, check if we need to notify emergency services directly
    if (newAlert.level === 'critical' && newAlert.location && newAlert.vitalSigns) {
      // This would be implemented in a real system to make API calls to emergency service providers
      console.log('CRITICAL EMERGENCY: Would notify emergency services in production');
      
      // Update emergency services notification status
      const alertIndex = emergencyAlertsHistory.findIndex(a => 
        a.phoneNumber === phoneNumber && a.timestamp === newAlert.timestamp
      );
      
      if (alertIndex !== -1) {
        emergencyAlertsHistory[alertIndex].emergencyServices = {
          notified: true,
          serviceId: 'simulated-emergency-service',
          responseStatus: 'dispatched'
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      alert: newAlert,
      whatsappDelivered: !!whatsappResponse?.success,
      alertCreated: !!alertResponse?.success,
      emergencyServicesNotified: newAlert.level === 'critical'
    });
    
  } catch (error) {
    console.error('Error processing emergency alert:', error);
    return NextResponse.json(
      { error: 'Failed to process emergency alert' },
      { status: 500 }
    );
  }
}

// Get emergency alert history for a specific user or phone number
export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const phoneNumber = url.searchParams.get('phoneNumber');
  
  let filteredAlerts = [...emergencyAlertsHistory];
  
  // Filter by userId if provided
  if (userId) {
    filteredAlerts = filteredAlerts.filter(alert => alert.userId === userId);
  }
  
  // Filter by phoneNumber if provided
  if (phoneNumber) {
    filteredAlerts = filteredAlerts.filter(alert => alert.phoneNumber === phoneNumber);
  }
  
  // Sort by timestamp (most recent first)
  filteredAlerts.sort((a, b) => b.timestamp - a.timestamp);
  
  return NextResponse.json({
    alerts: filteredAlerts
  });
} 