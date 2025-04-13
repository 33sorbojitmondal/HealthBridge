import { NextResponse } from 'next/server';

// Alert types
type AlertPriority = 'critical' | 'high' | 'medium' | 'low';

type HealthAlert = {
  id: string;
  userId: string;
  phoneNumber: string;
  message: string;
  priority: AlertPriority;
  timestamp: number;
  acknowledged: boolean;
  category: string;
  source: 'device' | 'manual' | 'automated';
};

// Mock database for health alerts
const healthAlerts: HealthAlert[] = [];

// Alert counter for generating IDs
let alertCounter = 0;

// Create a new health alert
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, phoneNumber, message, priority, category, source } = data;
    
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }
    
    // Create a new alert
    const newAlert: HealthAlert = {
      id: `alert-${++alertCounter}`,
      userId: userId || 'unknown',
      phoneNumber,
      message,
      priority: priority || 'medium',
      timestamp: Date.now(),
      acknowledged: false,
      category: category || 'general',
      source: source || 'manual'
    };
    
    healthAlerts.push(newAlert);
    
    // In a real application, this would trigger sending an SMS or making a call
    // based on the priority of the alert
    if (newAlert.priority === 'critical') {
      console.log(`[EMERGENCY CALL SIMULATION] Calling ${phoneNumber} with message: ${message}`);
    } else {
      console.log(`[SMS SIMULATION] Sending to ${phoneNumber}: ${message}`);
    }
    
    return NextResponse.json({
      success: true,
      alert: newAlert
    });
    
  } catch (error) {
    console.error('Error creating health alert:', error);
    return NextResponse.json(
      { error: 'Failed to create health alert' },
      { status: 500 }
    );
  }
}

// Get all health alerts or alerts for a specific user or phone number
export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const phoneNumber = url.searchParams.get('phoneNumber');
  
  let filteredAlerts = [...healthAlerts];
  
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

// Update an alert (e.g., mark as acknowledged)
export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { alertId, acknowledged } = data;
    
    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }
    
    const alertIndex = healthAlerts.findIndex(alert => alert.id === alertId);
    
    if (alertIndex === -1) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }
    
    // Update acknowledgement status if provided
    if (acknowledged !== undefined) {
      healthAlerts[alertIndex].acknowledged = acknowledged;
    }
    
    return NextResponse.json({
      success: true,
      alert: healthAlerts[alertIndex]
    });
    
  } catch (error) {
    console.error('Error updating health alert:', error);
    return NextResponse.json(
      { error: 'Failed to update health alert' },
      { status: 500 }
    );
  }
} 