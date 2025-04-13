// device-monitoring.ts - Functions for connecting and monitoring health devices

/**
 * Type definitions for device data
 */
export type DeviceType = 'smartwatch' | 'fitnessBand' | 'glucoseMeter' | 'bloodPressureMonitor' | 'smartScale' | 'sleepTracker';

export type DeviceStatus = 'connected' | 'disconnected' | 'pairing' | 'error' | 'low_battery';

export type DeviceReading = {
  timestamp: string;
  metricType: string;
  value: number;
  unit: string;
};

export type HealthDevice = {
  id: string;
  name: string;
  type: DeviceType;
  manufacturer: string;
  model: string;
  connectionType: 'bluetooth' | 'wifi' | 'manual';
  status: DeviceStatus;
  batteryLevel?: number;
  lastSyncTime?: string;
  readings: DeviceReading[];
};

/**
 * Get all registered health devices for a user
 * In a production app, this would connect to a real API/database
 */
export async function getUserDevices(): Promise<HealthDevice[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Return mock devices
  return [
    {
      id: 'dev-001',
      name: 'Apple Watch',
      type: 'smartwatch',
      manufacturer: 'Apple',
      model: 'Series 7',
      connectionType: 'bluetooth',
      status: 'connected',
      batteryLevel: 72,
      lastSyncTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
      readings: []
    },
    {
      id: 'dev-002',
      name: 'Omron BP Monitor',
      type: 'bloodPressureMonitor',
      manufacturer: 'Omron',
      model: 'Platinum',
      connectionType: 'bluetooth',
      status: 'disconnected',
      lastSyncTime: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      readings: []
    },
    {
      id: 'dev-003',
      name: 'Withings Scale',
      type: 'smartScale',
      manufacturer: 'Withings',
      model: 'Body+',
      connectionType: 'wifi',
      status: 'connected',
      lastSyncTime: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 36 hours ago
      readings: []
    }
  ];
}

/**
 * Connect to a health device
 */
export async function connectDevice(deviceId: string): Promise<{ 
  success: boolean;
  message: string;
  device?: HealthDevice;
}> {
  // Simulate connection delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Get devices
  const devices = await getUserDevices();
  const device = devices.find(d => d.id === deviceId);
  
  if (!device) {
    return {
      success: false,
      message: 'Device not found'
    };
  }
  
  // Simulate successful connection 80% of the time
  const connectionSuccess = Math.random() > 0.2;
  
  if (connectionSuccess) {
    const updatedDevice = {
      ...device,
      status: 'connected' as DeviceStatus,
      lastSyncTime: new Date().toISOString()
    };
    
    return {
      success: true,
      message: `Successfully connected to ${device.name}`,
      device: updatedDevice
    };
  } else {
    return {
      success: false,
      message: `Failed to connect to ${device.name}. Please ensure the device is powered on and within range.`
    };
  }
}

/**
 * Get recent health data from connected devices
 */
export async function getDeviceData(deviceId: string, days: number = 7): Promise<DeviceReading[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Get devices
  const devices = await getUserDevices();
  const device = devices.find(d => d.id === deviceId);
  
  if (!device || device.status !== 'connected') {
    return [];
  }
  
  // Generate mock data based on device type
  const readings: DeviceReading[] = [];
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  
  // Generate a reading for each day
  for (let i = 0; i < days; i++) {
    const date = new Date(now.getTime() - (i * dayMs));
    const timestamp = date.toISOString();
    
    // Generate different metrics based on device type
    switch (device.type) {
      case 'smartwatch':
        // Heart rate (average for the day)
        readings.push({
          timestamp,
          metricType: 'heartRate',
          value: 60 + Math.floor(Math.random() * 20), // 60-80 bpm
          unit: 'bpm'
        });
        
        // Steps for the day
        readings.push({
          timestamp,
          metricType: 'steps',
          value: 4000 + Math.floor(Math.random() * 8000), // 4000-12000 steps
          unit: 'steps'
        });
        
        // Sleep duration
        readings.push({
          timestamp,
          metricType: 'sleepDuration',
          value: 5 + Math.floor(Math.random() * 4), // 5-9 hours
          unit: 'hours'
        });
        break;
        
      case 'bloodPressureMonitor':
        // Systolic pressure
        readings.push({
          timestamp,
          metricType: 'systolicPressure',
          value: 110 + Math.floor(Math.random() * 30), // 110-140 mmHg
          unit: 'mmHg'
        });
        
        // Diastolic pressure
        readings.push({
          timestamp,
          metricType: 'diastolicPressure',
          value: 70 + Math.floor(Math.random() * 20), // 70-90 mmHg
          unit: 'mmHg'
        });
        break;
        
      case 'smartScale':
        // Weight
        readings.push({
          timestamp,
          metricType: 'weight',
          value: 70 + (Math.random() * 2 - 1), // 69-71 kg with slight variation
          unit: 'kg'
        });
        
        // Body fat percentage
        readings.push({
          timestamp,
          metricType: 'bodyFat',
          value: 15 + (Math.random() * 2 - 1), // 14-16% with slight variation
          unit: '%'
        });
        break;
        
      default:
        break;
    }
  }
  
  // Sort by timestamp descending (most recent first)
  return readings.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Synchronize data with a connected device
 */
export async function syncDeviceData(deviceId: string): Promise<{
  success: boolean;
  message: string;
  newReadings?: number;
}> {
  // Simulate sync delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Get devices
  const devices = await getUserDevices();
  const device = devices.find(d => d.id === deviceId);
  
  if (!device) {
    return {
      success: false,
      message: 'Device not found'
    };
  }
  
  if (device.status !== 'connected') {
    return {
      success: false,
      message: `${device.name} is not connected. Please connect the device first.`
    };
  }
  
  // Simulate successful sync 90% of the time
  const syncSuccess = Math.random() > 0.1;
  
  if (syncSuccess) {
    const newReadings = Math.floor(Math.random() * 10) + 1; // 1-10 new readings
    
    return {
      success: true,
      message: `Successfully synchronized with ${device.name}`,
      newReadings
    };
  } else {
    return {
      success: false,
      message: `Failed to synchronize with ${device.name}. Please try again.`
    };
  }
}

/**
 * Disconnect a health device
 */
export async function disconnectDevice(deviceId: string): Promise<{
  success: boolean;
  message: string;
}> {
  // Simulate disconnect delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Get devices
  const devices = await getUserDevices();
  const device = devices.find(d => d.id === deviceId);
  
  if (!device) {
    return {
      success: false,
      message: 'Device not found'
    };
  }
  
  return {
    success: true,
    message: `Successfully disconnected from ${device.name}`
  };
} 