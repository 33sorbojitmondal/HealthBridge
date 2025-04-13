import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Define types for health monitoring
type VitalSign = {
  type: 'heartRate' | 'bloodPressure' | 'bloodGlucose' | 'oxygenLevel' | 'temperature' | 'steps' | 'sleep' | 'weight';
  value: number | string;
  unit: string;
  timestamp: number;
  deviceId?: string;
  deviceType?: string;
};

type HealthThreshold = {
  type: string;
  min?: number;
  max?: number;
  change?: number; // Percentage or absolute change that triggers an alert
  timeWindow?: number; // Time window in milliseconds to consider for rapid changes
};

type UserHealthProfile = {
  userId: string;
  vitalSigns: VitalSign[];
  thresholds: HealthThreshold[];
  emergencyContacts: {
    type: 'doctor' | 'family' | 'emergency';
    name: string;
    phoneNumber: string;
    email?: string;
    notificationPreference: 'all' | 'critical' | 'none';
  }[];
  lastNotification?: number;
  notificationCooldown?: number; // Cooldown period in milliseconds to prevent alert spam
};

// In-memory storage (would be a database in production)
const userHealthProfiles: Map<string, UserHealthProfile> = new Map();

// Default thresholds (these would be customizable per user in a real app)
const defaultThresholds: HealthThreshold[] = [
  { type: 'heartRate', min: 40, max: 120 },
  { type: 'bloodPressure', max: '160/100', min: '90/60' },
  { type: 'bloodGlucose', min: 70, max: 180 },
  { type: 'oxygenLevel', min: 90 },
  { type: 'temperature', min: 35, max: 38 }
];

// Helper function to check if a vital sign exceeds thresholds
function checkThresholds(
  vitalSign: VitalSign,
  thresholds: HealthThreshold[],
  recentVitals: VitalSign[]
): { exceeded: boolean; severity: 'critical' | 'warning' | 'normal'; message: string } {
  const threshold = thresholds.find(t => t.type === vitalSign.type);
  
  if (!threshold) {
    return { exceeded: false, severity: 'normal', message: `No threshold defined for ${vitalSign.type}` };
  }
  
  // Handle blood pressure specially since it's a string like "120/80"
  if (vitalSign.type === 'bloodPressure' && typeof vitalSign.value === 'string') {
    const [systolic, diastolic] = vitalSign.value.split('/').map(v => parseInt(v, 10));
    const [maxSys, maxDia] = threshold.max ? (threshold.max as string).split('/').map(v => parseInt(v, 10)) : [999, 999];
    const [minSys, minDia] = threshold.min ? (threshold.min as string).split('/').map(v => parseInt(v, 10)) : [0, 0];
    
    if (systolic > maxSys || diastolic > maxDia) {
      return {
        exceeded: true,
        severity: 'critical',
        message: `High blood pressure detected: ${vitalSign.value} mmHg`
      };
    } else if (systolic < minSys || diastolic < minDia) {
      return {
        exceeded: true,
        severity: 'critical',
        message: `Low blood pressure detected: ${vitalSign.value} mmHg`
      };
    }
  } else {
    // For numerical values
    const value = typeof vitalSign.value === 'string' ? parseFloat(vitalSign.value) : vitalSign.value;
    
    if (threshold.max !== undefined && value > threshold.max) {
      return {
        exceeded: true,
        severity: 'critical',
        message: `High ${vitalSign.type} detected: ${value} ${vitalSign.unit}`
      };
    } else if (threshold.min !== undefined && value < threshold.min) {
      return {
        exceeded: true,
        severity: 'critical',
        message: `Low ${vitalSign.type} detected: ${value} ${vitalSign.unit}`
      };
    }
    
    // Check for rapid changes if there's historical data
    if (threshold.change && threshold.timeWindow && recentVitals.length > 0) {
      const recentValues = recentVitals
        .filter(v => v.type === vitalSign.type && 
                    v.timestamp >= (Date.now() - (threshold.timeWindow || 3600000)))
        .map(v => typeof v.value === 'string' ? parseFloat(v.value) : v.value)
        .filter(v => !isNaN(v as number)) as number[];
      
      if (recentValues.length > 0) {
        const avgRecent = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
        const currentValue = typeof value === 'string' ? parseFloat(value) : value;
        const percentChange = Math.abs((currentValue - avgRecent) / avgRecent * 100);
        
        if (percentChange > threshold.change) {
          return {
            exceeded: true,
            severity: 'warning',
            message: `Rapid change in ${vitalSign.type}: ${percentChange.toFixed(1)}% in last ${(threshold.timeWindow / 3600000).toFixed(1)} hours`
          };
        }
      }
    }
  }
  
  return { exceeded: false, severity: 'normal', message: `${vitalSign.type} is normal` };
}

// POST endpoint to receive vital sign data from devices
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, vitalSign, deviceInfo } = data;
    
    if (!userId || !vitalSign || !vitalSign.type || vitalSign.value === undefined) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }
    
    // Get or create user health profile
    let userProfile = userHealthProfiles.get(userId);
    if (!userProfile) {
      userProfile = {
        userId,
        vitalSigns: [],
        thresholds: [...defaultThresholds],
        emergencyContacts: [],
        notificationCooldown: 900000 // 15 minutes default cooldown
      };
      userHealthProfiles.set(userId, userProfile);
    }
    
    // Add device info to the vital sign
    const completeVitalSign: VitalSign = {
      ...vitalSign,
      timestamp: vitalSign.timestamp || Date.now(),
      deviceId: deviceInfo?.deviceId,
      deviceType: deviceInfo?.deviceType
    };
    
    // Add to user's vital signs history
    userProfile.vitalSigns.push(completeVitalSign);
    
    // Limit history size (keep last 1000 readings)
    if (userProfile.vitalSigns.length > 1000) {
      userProfile.vitalSigns = userProfile.vitalSigns.slice(-1000);
    }
    
    // Check thresholds and send alerts if needed
    const recentVitals = userProfile.vitalSigns.filter(
      v => v.type === completeVitalSign.type
    ).slice(-10);
    
    const thresholdCheck = checkThresholds(
      completeVitalSign,
      userProfile.thresholds,
      recentVitals
    );
    
    // If threshold exceeded and we're not in cooldown period, send alert
    let alertSent = false;
    if (thresholdCheck.exceeded && 
        (!userProfile.lastNotification || 
         Date.now() - userProfile.lastNotification > (userProfile.notificationCooldown || 0))) {
      
      // In a real app, we would fetch the user's emergency contacts from the database
      // For now, use the saved ones or create a default one
      if (userProfile.emergencyContacts.length === 0) {
        userProfile.emergencyContacts.push({
          type: 'doctor',
          name: 'Dr. Smith',
          phoneNumber: '+1234567890',
          notificationPreference: 'all'
        });
      }
      
      // Send alerts to appropriate contacts
      for (const contact of userProfile.emergencyContacts) {
        if (contact.notificationPreference === 'all' || 
           (contact.notificationPreference === 'critical' && thresholdCheck.severity === 'critical')) {
          
          try {
            // Call the emergency alert API to send notification
            await fetch('/api/alerts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                phoneNumber: contact.phoneNumber,
                message: `Health Alert: ${thresholdCheck.message}`,
                priority: thresholdCheck.severity === 'critical' ? 'high' : 'medium',
                category: 'health-monitor',
                source: 'device',
                vitalSign: completeVitalSign
              })
            });
            
            alertSent = true;
            
          } catch (error) {
            console.error('Failed to send health alert:', error);
          }
        }
      }
      
      // Update last notification timestamp
      if (alertSent) {
        userProfile.lastNotification = Date.now();
      }
    }
    
    // Update the map with the modified profile
    userHealthProfiles.set(userId, userProfile);
    
    // Revalidate the health tracking page to show updated data
    revalidatePath('/health-tracking');
    
    return NextResponse.json({
      success: true,
      vitalSign: completeVitalSign,
      thresholdExceeded: thresholdCheck.exceeded,
      severity: thresholdCheck.severity,
      message: thresholdCheck.message,
      alertSent
    });
    
  } catch (error) {
    console.error('Error processing device data:', error);
    return NextResponse.json(
      { error: 'Failed to process health device data' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve a user's vital sign history
export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }
  
  const userProfile = userHealthProfiles.get(userId);
  
  if (!userProfile) {
    return NextResponse.json(
      { error: 'User health profile not found' },
      { status: 404 }
    );
  }
  
  // Filter parameters
  const type = url.searchParams.get('type');
  const limit = parseInt(url.searchParams.get('limit') || '100', 10);
  const since = parseInt(url.searchParams.get('since') || '0', 10);
  
  let filteredVitals = [...userProfile.vitalSigns];
  
  // Apply filters
  if (type) {
    filteredVitals = filteredVitals.filter(v => v.type === type);
  }
  
  if (since > 0) {
    filteredVitals = filteredVitals.filter(v => v.timestamp >= since);
  }
  
  // Sort by timestamp (most recent first) and apply limit
  filteredVitals.sort((a, b) => b.timestamp - a.timestamp);
  filteredVitals = filteredVitals.slice(0, limit);
  
  return NextResponse.json({
    userId: userProfile.userId,
    vitalSigns: filteredVitals,
    thresholds: userProfile.thresholds
  });
} 