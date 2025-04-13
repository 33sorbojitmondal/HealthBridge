// health-alerts.ts - Health alert and emergency notification management

/**
 * Health alert severity levels
 */
export type AlertSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

/**
 * Health alert types
 */
export type AlertType = 
  | 'vital_signs' 
  | 'medication' 
  | 'lab_result' 
  | 'appointment' 
  | 'device' 
  | 'fall_detection'
  | 'emergency_contact'
  | 'health_goal'
  | 'symptom'
  | 'behavior_change';

/**
 * Alert status in system
 */
export type AlertStatus = 'new' | 'acknowledged' | 'resolved' | 'dismissed';

/**
 * Health alert data structure
 */
export interface HealthAlert {
  id: string;
  userId: string;
  timestamp: string; // ISO date string
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  status: AlertStatus;
  readByUser: boolean;
  data?: Record<string, any>; // Additional data specific to alert type
  resolvedAt?: string;
  resolvedBy?: string;
  resolvedNotes?: string;
  notificationsSent?: {
    method: 'app' | 'sms' | 'email' | 'whatsapp' | 'emergency_contact';
    sentAt: string;
    recipient?: string;
  }[];
}

/**
 * Alert threshold configuration
 */
export interface AlertThreshold {
  id: string;
  userId: string;
  metricName: string; // e.g., 'heart_rate', 'blood_pressure', 'blood_glucose'
  lowThreshold?: number;
  highThreshold?: number;
  units: string;
  enabled: boolean;
  severity: AlertSeverity;
  notifyUser: boolean;
  notifyContacts: boolean;
  cooldownMinutes: number; // Time between repeated alerts
  lastTriggered?: string; // ISO date string
}

/**
 * Emergency contact
 */
export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isVerified: boolean;
  priority: number; // 1 = primary, higher numbers = lower priority
  canReceiveAlerts: boolean;
  alertThresholds: AlertSeverity[]; // Which severity levels trigger contact
  lastNotified?: string; // ISO date string
}

/**
 * Mock function to get user's health alerts
 * 
 * @param userId User ID
 * @param limit Maximum number of alerts to return
 * @param status Optional filter by alert status
 * @returns Array of health alerts
 */
export async function getUserAlerts(
  userId: string,
  limit: number = 10,
  status?: AlertStatus
): Promise<HealthAlert[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Mock alerts data
  const allAlerts: HealthAlert[] = [
    {
      id: 'alert1',
      userId,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      type: 'vital_signs',
      severity: 'high',
      title: 'Elevated Blood Pressure',
      description: 'Your blood pressure reading of 150/95 mmHg is above your target range.',
      status: 'new',
      readByUser: false,
      data: {
        metric: 'blood_pressure',
        systolic: 150,
        diastolic: 95,
        thresholdSystolic: 140,
        thresholdDiastolic: 90,
        units: 'mmHg'
      },
      notificationsSent: [
        {
          method: 'app',
          sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: 'alert2',
      userId,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      type: 'medication',
      severity: 'medium',
      title: 'Missed Medication',
      description: 'You missed your evening dose of Metformin (500mg).',
      status: 'acknowledged',
      readByUser: true,
      data: {
        medicationId: 'med2',
        medicationName: 'Metformin',
        scheduledTime: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
        dosage: '500mg'
      },
      notificationsSent: [
        {
          method: 'app',
          sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        },
        {
          method: 'sms',
          sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: 'alert3',
      userId,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      type: 'lab_result',
      severity: 'medium',
      title: 'New Lab Results Available',
      description: 'Your recent blood work results are now available for review.',
      status: 'resolved',
      readByUser: true,
      resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      data: {
        labId: 'lab123',
        provider: 'City Medical Lab',
        testTypes: ['Complete Blood Count', 'Comprehensive Metabolic Panel']
      },
      notificationsSent: [
        {
          method: 'app',
          sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          method: 'email',
          sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: 'alert4',
      userId,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      type: 'appointment',
      severity: 'info',
      title: 'Upcoming Appointment',
      description: 'You have a follow-up appointment with Dr. Sarah Johnson tomorrow at 10:00 AM.',
      status: 'resolved',
      readByUser: true,
      resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      data: {
        appointmentId: 'apt567',
        provider: 'Dr. Sarah Johnson',
        location: 'City Medical Center, Suite 302',
        dateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString()
      },
      notificationsSent: [
        {
          method: 'app',
          sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: 'alert5',
      userId,
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      type: 'device',
      severity: 'low',
      title: 'Device Battery Low',
      description: 'Your connected blood glucose meter battery is below 20%. Please charge soon.',
      status: 'new',
      readByUser: false,
      data: {
        deviceId: 'device789',
        deviceType: 'Blood Glucose Monitor',
        batteryLevel: 18
      },
      notificationsSent: [
        {
          method: 'app',
          sentAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: 'alert6',
      userId,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      type: 'health_goal',
      severity: 'info',
      title: 'Daily Step Goal Achieved',
      description: "Congratulations! You've reached your daily step goal of 10,000 steps.",
      status: 'new',
      readByUser: false,
      data: {
        metric: 'steps',
        achieved: 10250,
        goal: 10000
      },
      notificationsSent: [
        {
          method: 'app',
          sentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        }
      ]
    }
  ];
  
  // Filter by status if provided
  let filteredAlerts = status 
    ? allAlerts.filter(alert => alert.status === status)
    : allAlerts;
  
  // Sort by timestamp (most recent first)
  filteredAlerts = filteredAlerts.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Apply limit
  return filteredAlerts.slice(0, limit);
}

/**
 * Mock function to get a user's alert thresholds
 * 
 * @param userId User ID
 * @returns Array of alert thresholds
 */
export async function getUserAlertThresholds(userId: string): Promise<AlertThreshold[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock thresholds data
  const thresholds: AlertThreshold[] = [
    {
      id: 'threshold1',
      userId,
      metricName: 'heart_rate',
      lowThreshold: 45,
      highThreshold: 120,
      units: 'bpm',
      enabled: true,
      severity: 'medium',
      notifyUser: true,
      notifyContacts: false,
      cooldownMinutes: 60
    },
    {
      id: 'threshold2',
      userId,
      metricName: 'blood_pressure_systolic',
      highThreshold: 140,
      units: 'mmHg',
      enabled: true,
      severity: 'high',
      notifyUser: true,
      notifyContacts: true,
      cooldownMinutes: 120,
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'threshold3',
      userId,
      metricName: 'blood_pressure_diastolic',
      highThreshold: 90,
      units: 'mmHg',
      enabled: true,
      severity: 'high',
      notifyUser: true,
      notifyContacts: true,
      cooldownMinutes: 120,
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'threshold4',
      userId,
      metricName: 'blood_glucose',
      lowThreshold: 70,
      highThreshold: 180,
      units: 'mg/dL',
      enabled: true,
      severity: 'high',
      notifyUser: true,
      notifyContacts: true,
      cooldownMinutes: 120
    },
    {
      id: 'threshold5',
      userId,
      metricName: 'oxygen_saturation',
      lowThreshold: 92,
      units: '%',
      enabled: true,
      severity: 'critical',
      notifyUser: true,
      notifyContacts: true,
      cooldownMinutes: 30
    },
    {
      id: 'threshold6',
      userId,
      metricName: 'temperature',
      highThreshold: 100.4,
      units: '°F',
      enabled: true,
      severity: 'medium',
      notifyUser: true,
      notifyContacts: false,
      cooldownMinutes: 240
    }
  ];
  
  return thresholds;
}

/**
 * Mock function to get a user's emergency contacts
 * 
 * @param userId User ID
 * @returns Array of emergency contacts
 */
export async function getUserEmergencyContacts(userId: string): Promise<EmergencyContact[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 250));
  
  // Mock contacts data
  const contacts: EmergencyContact[] = [
    {
      id: 'contact1',
      userId,
      name: 'Sarah Johnson',
      relationship: 'Spouse',
      phone: '+1-555-123-4567',
      email: 'sarah.johnson@example.com',
      isVerified: true,
      priority: 1,
      canReceiveAlerts: true,
      alertThresholds: ['high', 'critical']
    },
    {
      id: 'contact2',
      userId,
      name: 'Michael Johnson',
      relationship: 'Son',
      phone: '+1-555-987-6543',
      email: 'michael.johnson@example.com',
      isVerified: true,
      priority: 2,
      canReceiveAlerts: true,
      alertThresholds: ['critical']
    },
    {
      id: 'contact3',
      userId,
      name: 'Dr. James Wilson',
      relationship: 'Primary Care Physician',
      phone: '+1-555-456-7890',
      email: 'dr.wilson@healthclinic.example.com',
      isVerified: true,
      priority: 3,
      canReceiveAlerts: false,
      alertThresholds: []
    }
  ];
  
  return contacts;
}

/**
 * Update the status of a health alert
 * 
 * @param alertId Alert ID to update
 * @param status New status
 * @param notes Optional notes about the status change
 * @returns Updated alert
 */
export async function updateAlertStatus(
  alertId: string,
  status: AlertStatus,
  notes?: string
): Promise<HealthAlert> {
  // In a real implementation, this would update a database
  // For now, simulate an API call
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Mock updated alert (this would normally be fetched and updated)
  const updatedAlert: HealthAlert = {
    id: alertId,
    userId: 'user123',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    type: 'vital_signs',
    severity: 'high',
    title: 'Elevated Blood Pressure',
    description: 'Your blood pressure reading of A 150/95 mmHg is above your target range.',
    status: status,
    readByUser: true,
    data: {
      metric: 'blood_pressure',
      systolic: 150,
      diastolic: 95,
      thresholdSystolic: 140,
      thresholdDiastolic: 90,
      units: 'mmHg'
    },
    notificationsSent: [
      {
        method: 'app',
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ]
  };
  
  if (status === 'resolved' || status === 'dismissed') {
    updatedAlert.resolvedAt = new Date().toISOString();
    updatedAlert.resolvedBy = 'user';
    updatedAlert.resolvedNotes = notes;
  }
  
  return updatedAlert;
}

/**
 * Create a new health alert
 * 
 * @param userId User ID
 * @param alertData Alert data
 * @returns Created alert
 */
export async function createHealthAlert(
  userId: string,
  alertData: Omit<HealthAlert, 'id' | 'userId' | 'timestamp' | 'status' | 'readByUser' | 'notificationsSent'>
): Promise<HealthAlert> {
  // In a real implementation, this would insert into a database
  // For now, simulate an API call
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Generate an ID and create the alert
  const id = `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  const newAlert: HealthAlert = {
    id,
    userId,
    timestamp: new Date().toISOString(),
    status: 'new',
    readByUser: false,
    notificationsSent: [
      {
        method: 'app',
        sentAt: new Date().toISOString()
      }
    ],
    ...alertData
  };
  
  return newAlert;
}

/**
 * Update alert threshold settings
 * 
 * @param thresholdId Threshold ID to update
 * @param updates Partial threshold data to update
 * @returns Updated threshold
 */
export async function updateAlertThreshold(
  thresholdId: string,
  updates: Partial<AlertThreshold>
): Promise<AlertThreshold> {
  // In a real implementation, this would update a database
  // For now, simulate an API call
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Mock the threshold data that would be retrieved from the database
  const existingThreshold: AlertThreshold = {
    id: thresholdId,
    userId: 'user123',
    metricName: updates.metricName || 'heart_rate',
    lowThreshold: 45,
    highThreshold: 120,
    units: updates.units || 'bpm',
    enabled: true,
    severity: 'medium',
    notifyUser: true,
    notifyContacts: false,
    cooldownMinutes: 60
  };
  
  // Apply updates
  const updatedThreshold: AlertThreshold = {
    ...existingThreshold,
    ...updates
  };
  
  return updatedThreshold;
}

/**
 * Check if a health measurement should trigger an alert
 * 
 * @param userId User ID
 * @param metric Metric name
 * @param value Current value
 * @returns Alert info if threshold exceeded, null otherwise
 */
export async function checkAlertThreshold(
  userId: string,
  metric: string,
  value: number
): Promise<{
  thresholdExceeded: boolean;
  alert?: HealthAlert;
  threshold?: AlertThreshold;
}> {
  // Get user's thresholds
  const thresholds = await getUserAlertThresholds(userId);
  
  // Find the matching threshold for this metric
  const threshold = thresholds.find(t => t.metricName === metric);
  
  if (!threshold || !threshold.enabled) {
    return { thresholdExceeded: false };
  }
  
  // Check if the value exceeds the threshold
  let thresholdExceeded = false;
  
  if (threshold.lowThreshold !== undefined && value < threshold.lowThreshold) {
    thresholdExceeded = true;
  } else if (threshold.highThreshold !== undefined && value > threshold.highThreshold) {
    thresholdExceeded = true;
  }
  
  if (!thresholdExceeded) {
    return { thresholdExceeded: false };
  }
  
  // Check cooldown period
  if (threshold.lastTriggered) {
    const lastTriggeredDate = new Date(threshold.lastTriggered);
    const cooldownExpires = new Date(lastTriggeredDate.getTime() + threshold.cooldownMinutes * 60 * 1000);
    
    if (new Date() < cooldownExpires) {
      // Still in cooldown period
      return { thresholdExceeded: true, threshold };
    }
  }
  
  // Create an alert
  let alertTitle: string;
  let alertDescription: string;
  
  if (threshold.lowThreshold !== undefined && value < threshold.lowThreshold) {
    alertTitle = `Low ${formatMetricName(metric)}`;
    alertDescription = `Your ${formatMetricName(metric)} reading of ${value} ${threshold.units} is below the threshold of ${threshold.lowThreshold} ${threshold.units}.`;
  } else {
    alertTitle = `High ${formatMetricName(metric)}`;
    alertDescription = `Your ${formatMetricName(metric)} reading of ${value} ${threshold.units} is above the threshold of ${threshold.highThreshold} ${threshold.units}.`;
  }
  
  const alert = await createHealthAlert(userId, {
    type: 'vital_signs',
    severity: threshold.severity,
    title: alertTitle,
    description: alertDescription,
    data: {
      metric,
      value,
      threshold: threshold.lowThreshold !== undefined && value < threshold.lowThreshold 
        ? threshold.lowThreshold 
        : threshold.highThreshold,
      units: threshold.units,
      exceedsLow: threshold.lowThreshold !== undefined && value < threshold.lowThreshold,
      exceedsHigh: threshold.highThreshold !== undefined && value > threshold.highThreshold
    }
  });
  
  // Update threshold's lastTriggered timestamp
  await updateAlertThreshold(threshold.id, {
    lastTriggered: new Date().toISOString()
  });
  
  return {
    thresholdExceeded: true,
    alert,
    threshold
  };
}

/**
 * Helper function to format metric names for display
 */
function formatMetricName(metric: string): string {
  return metric
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
} 