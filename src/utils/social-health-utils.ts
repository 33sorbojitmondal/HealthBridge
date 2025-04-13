// Utilities for social health tracking and management

export type ConnectionType = 'family' | 'friend' | 'caregiver' | 'doctor' | 'other';

export type PermissionLevel = 'none' | 'basic' | 'detailed' | 'full';

export type SharingPreference = {
  dataType: string; // e.g., 'heartRate', 'medication', 'weight', 'steps', etc.
  level: PermissionLevel;
  lastUpdated: Date;
};

export type HealthConnection = {
  id: string;
  userId: string;
  connectionUserId: string;
  name: string;
  relationship: ConnectionType;
  email?: string;
  phone?: string;
  dateConnected: Date;
  status: 'pending' | 'active' | 'declined' | 'blocked';
  profileImage?: string;
  sharingPreferences: SharingPreference[];
  emergencyContact: boolean;
  notes?: string;
};

export type HealthUpdate = {
  id: string;
  userId: string;
  timestamp: Date;
  dataType: string;
  value: any;
  notes?: string;
  visibleTo: string[]; // Array of userIds who can see this update
};

// Mock data for testing
export const mockConnections: HealthConnection[] = [
  {
    id: 'conn1',
    userId: 'currentUser',
    connectionUserId: 'family1',
    name: 'Lisa Johnson',
    relationship: 'family',
    email: 'lisa.johnson@example.com',
    phone: '555-123-4567',
    dateConnected: new Date('2023-10-15'),
    status: 'active',
    profileImage: '/images/profiles/lisa.jpg',
    sharingPreferences: [
      {
        dataType: 'heartRate',
        level: 'detailed',
        lastUpdated: new Date('2023-10-15')
      },
      {
        dataType: 'medication',
        level: 'full',
        lastUpdated: new Date('2023-10-15')
      },
      {
        dataType: 'weight',
        level: 'basic',
        lastUpdated: new Date('2023-11-20')
      }
    ],
    emergencyContact: true,
    notes: 'My sister, emergency contact'
  },
  {
    id: 'conn2',
    userId: 'currentUser',
    connectionUserId: 'friend1',
    name: 'Michael Chen',
    relationship: 'friend',
    email: 'michael.chen@example.com',
    dateConnected: new Date('2023-11-05'),
    status: 'active',
    profileImage: '/images/profiles/michael.jpg',
    sharingPreferences: [
      {
        dataType: 'steps',
        level: 'detailed',
        lastUpdated: new Date('2023-11-05')
      },
      {
        dataType: 'weight',
        level: 'none',
        lastUpdated: new Date('2023-11-05')
      }
    ],
    emergencyContact: false
  },
  {
    id: 'conn3',
    userId: 'currentUser',
    connectionUserId: 'doctor1',
    name: 'Dr. Sarah Johnson',
    relationship: 'doctor',
    email: 'sarah.johnson@example.com',
    phone: '555-987-6543',
    dateConnected: new Date('2023-09-10'),
    status: 'active',
    profileImage: '/images/doctors/sarah-johnson.jpg',
    sharingPreferences: [
      {
        dataType: 'heartRate',
        level: 'full',
        lastUpdated: new Date('2023-09-10')
      },
      {
        dataType: 'medication',
        level: 'full',
        lastUpdated: new Date('2023-09-10')
      },
      {
        dataType: 'weight',
        level: 'full',
        lastUpdated: new Date('2023-09-10')
      },
      {
        dataType: 'bloodGlucose',
        level: 'full',
        lastUpdated: new Date('2023-09-10')
      }
    ],
    emergencyContact: true,
    notes: 'Primary care physician'
  },
  {
    id: 'conn4',
    userId: 'currentUser',
    connectionUserId: 'caregiver1',
    name: 'Robert Williams',
    relationship: 'caregiver',
    email: 'robert.williams@example.com',
    phone: '555-456-7890',
    dateConnected: new Date('2023-12-01'),
    status: 'active',
    profileImage: '/images/profiles/robert.jpg',
    sharingPreferences: [
      {
        dataType: 'medication',
        level: 'full',
        lastUpdated: new Date('2023-12-01')
      },
      {
        dataType: 'appointments',
        level: 'full',
        lastUpdated: new Date('2023-12-01')
      }
    ],
    emergencyContact: true,
    notes: 'Home health aide, visits on weekdays'
  }
];

export const mockHealthUpdates: HealthUpdate[] = [
  {
    id: 'update1',
    userId: 'currentUser',
    timestamp: new Date('2024-03-15T08:30:00'),
    dataType: 'heartRate',
    value: 72,
    notes: 'Morning reading, resting',
    visibleTo: ['family1', 'doctor1']
  },
  {
    id: 'update2',
    userId: 'currentUser',
    timestamp: new Date('2024-03-15T14:00:00'),
    dataType: 'medication',
    value: {
      name: 'Lisinopril',
      dosage: '10mg',
      taken: true
    },
    visibleTo: ['family1', 'doctor1', 'caregiver1']
  },
  {
    id: 'update3',
    userId: 'currentUser',
    timestamp: new Date('2024-03-15T19:00:00'),
    dataType: 'steps',
    value: 8472,
    visibleTo: ['friend1', 'family1']
  },
  {
    id: 'update4',
    userId: 'currentUser',
    timestamp: new Date('2024-03-15T20:00:00'),
    dataType: 'weight',
    value: 168.5,
    notes: 'After dinner',
    visibleTo: ['doctor1', 'family1']
  }
];

// Functions for managing connections and health data sharing

export async function getUserConnections(userId: string): Promise<HealthConnection[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // In a real app, this would query a database
  // For now, return mock data for the "currentUser"
  if (userId === 'currentUser') {
    return mockConnections;
  }
  return [];
}

export async function getConnectionById(connectionId: string): Promise<HealthConnection | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Find connection by ID
  const connection = mockConnections.find(conn => conn.id === connectionId);
  return connection || null;
}

export async function updateSharingPreferences(
  connectionId: string,
  dataType: string,
  level: PermissionLevel
): Promise<{ success: boolean; message: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In a real app, this would update a database
  // For now, just return a success response
  return {
    success: true,
    message: `Sharing preferences updated for ${dataType}`
  };
}

export async function addNewConnection(
  userId: string,
  connectionDetails: Omit<HealthConnection, 'id' | 'userId' | 'dateConnected' | 'status'>
): Promise<{ success: boolean; message: string; connectionId?: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real app, this would create a new connection in the database
  // For now, just return a success response with a fake ID
  return {
    success: true,
    message: 'Connection request sent',
    connectionId: `conn${Date.now()}`
  };
}

export async function getUserHealthUpdates(
  userId: string,
  connectionId?: string,
  dataTypes?: string[],
  from?: Date,
  to?: Date
): Promise<HealthUpdate[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // In a real app, this would query a database with filters
  // For now, return filtered mock data
  let updates = [...mockHealthUpdates];
  
  // Filter by data types if provided
  if (dataTypes && dataTypes.length > 0) {
    updates = updates.filter(update => dataTypes.includes(update.dataType));
  }
  
  // Filter by date range if provided
  if (from) {
    updates = updates.filter(update => update.timestamp >= from);
  }
  if (to) {
    updates = updates.filter(update => update.timestamp <= to);
  }
  
  // Filter by connection visibility if provided
  if (connectionId) {
    const connection = mockConnections.find(conn => conn.id === connectionId);
    if (connection) {
      updates = updates.filter(update => update.visibleTo.includes(connection.connectionUserId));
    }
  }
  
  return updates;
}

export async function shareHealthUpdate(
  userId: string,
  dataType: string,
  value: any,
  notes?: string,
  visibleTo: string[] = []
): Promise<{ success: boolean; message: string; updateId?: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In a real app, this would create a new health update in the database
  // For now, just return a success response with a fake ID
  return {
    success: true,
    message: 'Health update shared successfully',
    updateId: `update${Date.now()}`
  };
} 