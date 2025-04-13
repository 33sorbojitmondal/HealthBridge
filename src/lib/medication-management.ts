// medication-management.ts - Medication tracking, reminders, and interactions

/**
 * Medication type definitions
 */
export type MedicationForm = 'tablet' | 'capsule' | 'liquid' | 'injection' | 'inhaler' | 'patch' | 'cream' | 'drops' | 'other';
export type MedicationSchedule = 'once_daily' | 'twice_daily' | 'three_times_daily' | 'four_times_daily' | 'weekly' | 'monthly' | 'as_needed' | 'custom';
export type MedicationStatus = 'active' | 'completed' | 'discontinued' | 'on_hold';
export type MedicationTiming = 'morning' | 'afternoon' | 'evening' | 'bedtime' | 'with_food' | 'before_food' | 'after_food' | 'custom';
export type InteractionSeverity = 'none' | 'mild' | 'moderate' | 'severe';

/**
 * Medication interface
 */
export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  form: MedicationForm;
  schedule: MedicationSchedule;
  timings: MedicationTiming[];
  startDate: string; // ISO date string
  endDate?: string; // ISO date string, optional for ongoing medications
  instructions?: string;
  reason?: string;
  status: MedicationStatus;
  prescribedBy?: string;
  pharmacy?: string;
  refillsRemaining?: number;
  nextRefillDate?: string;
  notes?: string;
}

/**
 * Medication reminder interface
 */
export interface MedicationReminder {
  id: string;
  medicationId: string;
  scheduledTime: string; // ISO datetime string
  isTaken: boolean;
  takenAt?: string; // ISO datetime string when medication was taken
  skipped: boolean;
  skippedReason?: string;
  notificationSent: boolean;
  notificationTime?: string; // ISO datetime string when notification was sent
}

/**
 * Medication interaction result
 */
export interface MedicationInteraction {
  medicationsInvolved: string[];
  severity: InteractionSeverity;
  description: string;
  recommendation: string;
  source?: string;
}

/**
 * Medication adherence report
 */
export interface MedicationAdherenceReport {
  medicationId: string;
  medicationName: string;
  adherenceRate: number; // 0-1, percentage of taken doses
  missedDoses: number;
  takenDoses: number;
  totalScheduledDoses: number;
  averageTimeliness: number; // minutes deviation from scheduled time (average)
  streak: number; // current streak of consecutive taken doses
  mostCommonSkipReason?: string;
  trends: {
    period: 'week' | 'month';
    data: { date: string; adherenceRate: number }[];
  };
}

/**
 * Mock function to get a user's medications
 * In a real implementation, this would fetch from a database
 * 
 * @param userId User ID
 * @returns Array of medications
 */
export async function getUserMedications(userId: string): Promise<Medication[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock medications data
  const medications: Medication[] = [
    {
      id: 'med1',
      name: 'Lisinopril',
      genericName: 'Lisinopril',
      dosage: '10mg',
      form: 'tablet',
      schedule: 'once_daily',
      timings: ['morning'],
      startDate: '2023-01-15',
      status: 'active',
      instructions: 'Take one tablet by mouth every morning',
      reason: 'High blood pressure',
      prescribedBy: 'Dr. Sarah Johnson',
      pharmacy: 'MedPlus Pharmacy',
      refillsRemaining: 2,
      nextRefillDate: '2023-06-15'
    },
    {
      id: 'med2',
      name: 'Metformin',
      genericName: 'Metformin HCl',
      dosage: '500mg',
      form: 'tablet',
      schedule: 'twice_daily',
      timings: ['morning', 'evening'],
      startDate: '2022-11-08',
      status: 'active',
      instructions: 'Take with food to minimize stomach upset',
      reason: 'Type 2 Diabetes',
      prescribedBy: 'Dr. James Wilson',
      pharmacy: 'HealthSmart Pharmacy',
      refillsRemaining: 1,
      nextRefillDate: '2023-05-22'
    },
    {
      id: 'med3',
      name: 'Atorvastatin',
      genericName: 'Atorvastatin Calcium',
      dosage: '20mg',
      form: 'tablet',
      schedule: 'once_daily',
      timings: ['bedtime'],
      startDate: '2022-07-12',
      status: 'active',
      instructions: 'Take one tablet at bedtime',
      reason: 'High cholesterol',
      prescribedBy: 'Dr. Sarah Johnson',
      pharmacy: 'MedPlus Pharmacy',
      refillsRemaining: 3,
      nextRefillDate: '2023-07-10'
    },
    {
      id: 'med4',
      name: 'Albuterol',
      genericName: 'Albuterol Sulfate',
      dosage: '90mcg',
      form: 'inhaler',
      schedule: 'as_needed',
      timings: ['as_needed' as any],
      startDate: '2023-02-18',
      status: 'active',
      instructions: 'Use as needed for shortness of breath or wheezing',
      reason: 'Asthma',
      prescribedBy: 'Dr. Emily Rodriguez',
      pharmacy: 'HealthSmart Pharmacy',
      refillsRemaining: 5,
      nextRefillDate: '2023-08-18'
    },
    {
      id: 'med5',
      name: 'Ibuprofen',
      genericName: 'Ibuprofen',
      dosage: '200mg',
      form: 'tablet',
      schedule: 'as_needed',
      timings: ['as_needed' as any],
      startDate: '2023-03-01',
      status: 'active',
      instructions: 'Take 1-2 tablets every 6 hours as needed for pain',
      reason: 'Pain relief',
      prescribedBy: 'Dr. James Wilson',
      pharmacy: 'Over the counter',
      notes: 'Do not take on empty stomach'
    }
  ];
  
  return medications;
}

/**
 * Mock function to get medication reminders for a specific day
 * 
 * @param userId User ID
 * @param date ISO date string (YYYY-MM-DD)
 * @returns Array of medication reminders
 */
export async function getMedicationReminders(
  userId: string,
  date: string
): Promise<MedicationReminder[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Get user medications first
  const medications = await getUserMedications(userId);
  
  // Generate reminders based on medications and their schedules
  const reminders: MedicationReminder[] = [];
  const targetDate = new Date(date);
  
  medications.forEach(medication => {
    if (medication.status !== 'active') return;
    
    // Skip medications that haven't started yet or have already ended
    const startDate = new Date(medication.startDate);
    if (startDate > targetDate) return;
    
    if (medication.endDate) {
      const endDate = new Date(medication.endDate);
      if (endDate < targetDate) return;
    }
    
    // For as-needed medications, don't create automatic reminders
    if (medication.schedule === 'as_needed') return;
    
    // For weekly medications, check if target date matches the day of week for the start date
    if (medication.schedule === 'weekly') {
      const startDay = new Date(medication.startDate).getDay();
      if (targetDate.getDay() !== startDay) return;
    }
    
    // For monthly medications, check if target date matches the day of month for the start date
    if (medication.schedule === 'monthly') {
      const startDayOfMonth = new Date(medication.startDate).getDate();
      if (targetDate.getDate() !== startDayOfMonth) return;
    }
    
    // Create reminders based on schedule and timings
    medication.timings.forEach((timing, index) => {
      let hour: number;
      let isTaken = false;
      let takenAt: string | undefined = undefined;
      
      // Determine hour based on timing
      switch (timing) {
        case 'morning':
          hour = 8;
          break;
        case 'afternoon':
          hour = 13;
          break;
        case 'evening':
          hour = 18;
          break;
        case 'bedtime':
          hour = 22;
          break;
        case 'with_food':
        case 'before_food':
        case 'after_food':
          // These would depend on meal times, here just use reasonable defaults
          hour = index === 0 ? 8 : index === 1 ? 13 : 18;
          break;
        default:
          hour = 8 + (index * 4); // Space reminders 4 hours apart
      }
      
      // Create the scheduled time
      const scheduledDateTime = new Date(targetDate);
      scheduledDateTime.setHours(hour, 0, 0, 0);
      
      // Determine if the reminder is in the past, and if so, randomly mark some as taken
      const now = new Date();
      if (scheduledDateTime < now) {
        // 80% chance that a past reminder was taken
        isTaken = Math.random() < 0.8;
        
        if (isTaken) {
          // Simulate that medication was taken within 30 minutes of scheduled time
          const takenTime = new Date(scheduledDateTime);
          takenTime.setMinutes(Math.floor(Math.random() * 30));
          takenAt = takenTime.toISOString();
        }
      }
      
      reminders.push({
        id: `reminder-${medication.id}-${date}-${index}`,
        medicationId: medication.id,
        scheduledTime: scheduledDateTime.toISOString(),
        isTaken,
        takenAt,
        skipped: scheduledDateTime < now && !isTaken,
        skippedReason: scheduledDateTime < now && !isTaken ? 
          ['Forgot', 'Side effects', 'Felt better', 'Out of medication'][Math.floor(Math.random() * 4)] : 
          undefined,
        notificationSent: scheduledDateTime < now,
        notificationTime: scheduledDateTime < now ? 
          new Date(scheduledDateTime.getTime() - 5 * 60000).toISOString() : 
          undefined
      });
    });
  });
  
  return reminders;
}

/**
 * Mark a medication as taken
 * 
 * @param reminderId Reminder ID to mark as taken
 * @param takenAt ISO datetime string when the medication was taken (defaults to now)
 * @returns Updated reminder
 */
export async function markMedicationAsTaken(
  reminderId: string,
  takenAt: string = new Date().toISOString()
): Promise<MedicationReminder> {
  // In a real implementation, this would update a database
  // For now, simulate an API call
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Mock response with updated reminder
  const updatedReminder: MedicationReminder = {
    id: reminderId,
    medicationId: 'med-' + reminderId.split('-')[2], // Extract from reminder ID format
    scheduledTime: new Date().toISOString(), // This would be the actual scheduled time in a real implementation
    isTaken: true,
    takenAt,
    skipped: false,
    notificationSent: true,
    notificationTime: new Date(new Date().getTime() - 10 * 60000).toISOString() // 10 minutes ago
  };
  
  return updatedReminder;
}

/**
 * Skip a medication dose
 * 
 * @param reminderId Reminder ID to mark as skipped
 * @param reason Reason for skipping
 * @returns Updated reminder
 */
export async function skipMedicationDose(
  reminderId: string,
  reason: string
): Promise<MedicationReminder> {
  // In a real implementation, this would update a database
  // For now, simulate an API call
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Mock response with updated reminder
  const updatedReminder: MedicationReminder = {
    id: reminderId,
    medicationId: 'med-' + reminderId.split('-')[2], // Extract from reminder ID format
    scheduledTime: new Date().toISOString(), // This would be the actual scheduled time in a real implementation
    isTaken: false,
    skipped: true,
    skippedReason: reason,
    notificationSent: true,
    notificationTime: new Date(new Date().getTime() - 10 * 60000).toISOString() // 10 minutes ago
  };
  
  return updatedReminder;
}

/**
 * Check for potential drug interactions between medications
 * In a real implementation, this would use a medical API or database
 * 
 * @param medicationIds Array of medication IDs to check for interactions
 * @returns Array of potential interactions
 */
export async function checkDrugInteractions(
  medicationIds: string[]
): Promise<MedicationInteraction[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock interaction database (very simplified)
  const interactionDatabase: Record<string, Record<string, MedicationInteraction>> = {
    'med2': { // Metformin interactions
      'med5': {
        medicationsInvolved: ['Metformin', 'Ibuprofen'],
        severity: 'mild',
        description: 'Ibuprofen may affect how the kidneys handle metformin in some patients.',
        recommendation: 'Monitor for side effects. Extended use may require adjusting metformin dosage.',
        source: 'Drug Interaction Database'
      }
    },
    'med3': { // Atorvastatin interactions
      'med5': {
        medicationsInvolved: ['Atorvastatin', 'Ibuprofen'],
        severity: 'mild',
        description: 'Both medications may cause similar side effects including stomach upset.',
        recommendation: 'Monitor for increased stomach discomfort or muscle pain.',
        source: 'Drug Interaction Database'
      }
    },
    'med1': { // Lisinopril interactions
      'med5': {
        medicationsInvolved: ['Lisinopril', 'Ibuprofen'],
        severity: 'moderate',
        description: 'NSAIDs like ibuprofen may reduce the blood pressure lowering effect of Lisinopril and may increase risk of kidney problems.',
        recommendation: 'Consider acetaminophen instead of ibuprofen if possible. If both must be used, monitor blood pressure closely.',
        source: 'Drug Interaction Database'
      }
    }
  };
  
  // Find interactions between the provided medications
  const interactions: MedicationInteraction[] = [];
  
  for (let i = 0; i < medicationIds.length; i++) {
    for (let j = i + 1; j < medicationIds.length; j++) {
      const medA = medicationIds[i];
      const medB = medicationIds[j];
      
      // Check if there's an interaction from A to B
      if (interactionDatabase[medA] && interactionDatabase[medA][medB]) {
        interactions.push(interactionDatabase[medA][medB]);
      }
      // Check if there's an interaction from B to A
      else if (interactionDatabase[medB] && interactionDatabase[medB][medA]) {
        interactions.push(interactionDatabase[medB][medA]);
      }
    }
  }
  
  return interactions;
}

/**
 * Get medication adherence statistics for a user
 * 
 * @param userId User ID
 * @param startDate Start date for report (ISO date string)
 * @param endDate End date for report (ISO date string)
 * @returns Array of adherence reports by medication
 */
export async function getMedicationAdherenceReport(
  userId: string,
  startDate: string,
  endDate: string
): Promise<MedicationAdherenceReport[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Get user medications
  const medications = await getUserMedications(userId);
  
  // Generate adherence reports
  const reports: MedicationAdherenceReport[] = [];
  
  for (const medication of medications) {
    // Skip non-active medications
    if (medication.status !== 'active') continue;
    
    // For this mock, generate random adherence data
    const adherenceRate = 0.65 + Math.random() * 0.3; // 65-95% adherence
    const totalScheduledDoses = Math.floor(Math.random() * 30) + 15; // 15-45 doses
    const takenDoses = Math.floor(totalScheduledDoses * adherenceRate);
    const missedDoses = totalScheduledDoses - takenDoses;
    
    // Generate weekly trend data
    const trendData = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysBetween = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    
    // Generate data points for each week
    for (let i = 0; i < daysBetween; i += 7) {
      const weekStart = new Date(start);
      weekStart.setDate(weekStart.getDate() + i);
      
      trendData.push({
        date: weekStart.toISOString().split('T')[0],
        adherenceRate: Math.min(1, Math.max(0.5, adherenceRate + (Math.random() * 0.2 - 0.1))) // ±10% variation
      });
    }
    
    reports.push({
      medicationId: medication.id,
      medicationName: medication.name,
      adherenceRate,
      missedDoses,
      takenDoses,
      totalScheduledDoses,
      averageTimeliness: Math.floor(Math.random() * 20), // 0-20 minutes average deviation
      streak: Math.floor(Math.random() * 10) + 1, // 1-10 day streak
      mostCommonSkipReason: ['Forgot', 'Side effects', 'Felt better', 'Out of medication'][Math.floor(Math.random() * 4)],
      trends: {
        period: 'week',
        data: trendData
      }
    });
  }
  
  return reports;
}

/**
 * Create a new medication in the system
 * 
 * @param userId User ID
 * @param medication Medication data
 * @returns Created medication with ID
 */
export async function addMedication(userId: string, medication: Omit<Medication, 'id'>): Promise<Medication> {
  // In a real implementation, this would insert into a database
  // For now, simulate an API call
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Generate a random ID
  const id = `med-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Return the medication with the generated ID
  return {
    id,
    ...medication
  };
}

/**
 * Update an existing medication
 * 
 * @param medicationId Medication ID
 * @param updates Partial medication data to update
 * @returns Updated medication
 */
export async function updateMedication(
  medicationId: string,
  updates: Partial<Medication>
): Promise<Medication> {
  // In a real implementation, this would update a database
  // For now, simulate an API call
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock the updated medication (in reality, would merge with existing data)
  const updatedMedication: Medication = {
    id: medicationId,
    name: updates.name || 'Medication Name',
    dosage: updates.dosage || '10mg',
    form: updates.form || 'tablet',
    schedule: updates.schedule || 'once_daily',
    timings: updates.timings || ['morning'],
    startDate: updates.startDate || new Date().toISOString().split('T')[0],
    status: updates.status || 'active',
    instructions: updates.instructions,
    reason: updates.reason,
    prescribedBy: updates.prescribedBy,
    pharmacy: updates.pharmacy,
    refillsRemaining: updates.refillsRemaining,
    nextRefillDate: updates.nextRefillDate,
    notes: updates.notes,
  };
  
  return updatedMedication;
}

/**
 * Generate statistics about prescription refill needs
 * 
 * @param userId User ID
 * @returns Refill statistics
 */
export async function getRefillStatistics(userId: string): Promise<{
  totalMedications: number;
  needingRefillSoon: number; // Within 7 days
  outOfRefills: number;
  refillsByMonth: { month: string; count: number }[];
}> {
  // Get user medications
  const medications = await getUserMedications(userId);
  
  // Calculate statistics
  const now = new Date();
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(now.getDate() + 7);
  
  const needingRefillSoon = medications.filter(med => {
    if (!med.nextRefillDate) return false;
    const refillDate = new Date(med.nextRefillDate);
    return refillDate <= sevenDaysFromNow && refillDate >= now;
  }).length;
  
  const outOfRefills = medications.filter(med => 
    med.status === 'active' && med.refillsRemaining !== undefined && med.refillsRemaining <= 0
  ).length;
  
  // Group refills by month for the next 6 months
  const refillsByMonth: { month: string; count: number }[] = [];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
  
  for (let i = 0; i < 6; i++) {
    const targetMonth = new Date(now);
    targetMonth.setMonth(now.getMonth() + i);
    
    const monthName = monthNames[targetMonth.getMonth()];
    const year = targetMonth.getFullYear();
    const monthLabel = `${monthName} ${year}`;
    
    const count = medications.filter(med => {
      if (!med.nextRefillDate) return false;
      const refillDate = new Date(med.nextRefillDate);
      return refillDate.getMonth() === targetMonth.getMonth() && 
             refillDate.getFullYear() === targetMonth.getFullYear();
    }).length;
    
    refillsByMonth.push({ month: monthLabel, count });
  }
  
  return {
    totalMedications: medications.length,
    needingRefillSoon,
    outOfRefills,
    refillsByMonth
  };
} 