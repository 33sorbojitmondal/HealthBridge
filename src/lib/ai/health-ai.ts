import axios from 'axios';

/**
 * Health AI Type Definitions
 * Contains all type interfaces for the AI health prediction and analysis system
 */

/**
 * Basic user health data
 */
export interface UserHealthData {
  id: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  bloodType?: string;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
    timestamp: string;
  }[];
  heartRate?: number;
  bloodGlucose?: number; // in mg/dL
  cholesterol?: {
    total: number;
    hdl: number;
    ldl: number;
    triglycerides: number;
    timestamp: string;
  }[];
  medicalConditions?: string[];
  medications?: string[];
  allergies?: string[];
  bmi?: number;
  activity?: {
    steps: number;
    caloriesBurned: number;
    activeMinutes: number;
    timestamp: string;
  }[];
  sleep?: {
    duration: number;
    quality: number;
    timestamp: string;
  }[];
  conditions?: string[];
  familyHistory?: string[];
}

/**
 * User behavior data for analysis
 */
export interface BehaviorData {
  id: string;
  userId: string;
  sleepPattern: {
    averageHours: number;
    bedtimeConsistency: number; // 1-10
    qualityRating: number; // 1-10
    wakingTimes: string[];
    bedTimes: string[];
  };
  exerciseAdherence: {
    plannedSessions: number;
    completedSessions: number;
    averageIntensity: number; // 1-10
    preferredTimes: string[];
    skippedReasons?: string[];
  };
  medicationAdherence?: {
    prescribed: number;
    taken: number;
    missedReasons?: string[];
  };
  moodTracking?: {
    average: number; // 1-10
    fluctuation: number; // 1-10
    triggers?: string[];
  };
  appUsagePattern?: {
    frequency: number; // times per week
    averageDuration: number; // minutes
    mostUsedFeatures: string[];
  };
  sleep: {
    averageDuration: number;
    variability: number;
    bedtimeConsistency: number;
    wakeTimeConsistency: number;
  };
  exercise: {
    frequency: number;
    duration: number;
    intensity: number;
    consistency: number;
  };
  medication: {
    adherence: number;
    timeliness: number;
  };
  nutrition: {
    mealFrequency: number;
    mealTiming: number;
    waterConsumption: number;
    snackingFrequency: number;
  };
  stressManagement?: {
    relaxationActivities: number;
    mindfulness: number;
  };
}

/**
 * User lifestyle data
 */
export interface LifestyleData {
  id: string;
  userId: string;
  sleepHours: number;
  stressLevel: number; // 1-10
  exerciseMinutes: number;
  exerciseType?: string;
  dietType?: string;
  alcoholConsumption?: 'none' | 'light' | 'moderate' | 'heavy';
  smokingStatus?: 'non-smoker' | 'former' | 'occasional' | 'regular';
  waterIntake?: number; // in liters
  calorieIntake?: number;
  travelHistory?: {
    location: string;
    startDate: string;
    endDate: string;
  }[];
  diet: {
    fruitVegetableIntake: 'low' | 'medium' | 'high';
    processedFoodIntake: 'low' | 'medium' | 'high';
    sugarIntake: 'low' | 'medium' | 'high';
    sodiumIntake: 'low' | 'medium' | 'high';
  };
  exercise: {
    frequency: number; // times per week
    preferred: string[];
    averageDuration: number; // minutes
  };
  smoking: {
    status: 'never' | 'former' | 'current';
    frequency?: number; // per day if current
    quitDate?: string; // if former
  };
  alcohol: {
    consume: boolean;
    frequency?: 'daily' | 'weekly' | 'occasionally' | 'rarely';
    average?: number; // drinks per week
  };
  sleep: {
    averageHours: number;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
    issues: string[];
  };
  stress: {
    level: 'low' | 'moderate' | 'high';
    copingMechanisms: string[];
  };
  smokingStatus: 'never' | 'former' | 'current';
  alcoholConsumption: 'none' | 'light' | 'moderate' | 'heavy';
  exerciseFrequency: 'sedentary' | 'light' | 'moderate' | 'active' | 'very active';
  sleepQuality: 'poor' | 'fair' | 'good';
  stressLevel: 'low' | 'medium' | 'high';
  workEnvironment?: string;
  socialConnections?: 'isolated' | 'limited' | 'moderate' | 'strong';
}

/**
 * Health predictions
 */
export interface HealthPrediction {
  conditionName: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'very high';
  riskScore: number; // 0-100
  riskFactors: string[];
  protectiveFactors: string[];
  recommendations: string[];
  dataPoints: {
    name: string;
    value: number;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
  }[];
  nextSteps?: string[];
  confidenceLevel: number; // 0-1
}

/**
 * Health coaching message
 */
export interface HealthCoachMessage {
  id: string;
  type: 'reminder' | 'encouragement' | 'alert' | 'education' | 'celebration';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  triggerMetric?: string;
  actionable: boolean;
  suggestedAction?: string;
  deliveryTime?: string;
  expiresAfter?: string;
  imageUrl?: string;
}

/**
 * Behavior insight results
 */
export interface BehaviorInsight {
  category: 'sleep' | 'exercise' | 'medication' | 'mood' | 'nutrition' | 'general';
  title: string;
  description: string;
  score: number; // 0-100
  trend: 'improving' | 'declining' | 'stable';
  recommendations: string[];
  relatedMetrics: {
    name: string;
    value: number;
    target: number;
    unit: string;
  }[];
  priority: 'low' | 'medium' | 'high';
}

/**
 * Health news trend
 */
export interface HealthTrend {
  id: string;
  title: string;
  description: string;
  category: 'disease' | 'lifestyle' | 'seasonal' | 'global' | 'local';
  severity: 'low' | 'medium' | 'high';
  region: string;
  source: string;
  lastUpdated: string;
  relevanceScore: number; // 0-10
  actionItems?: string[];
  relatedConditions?: string[];
  keywords: string[];
}

/**
 * Health calculation types
 */
export interface BMIResult {
  bmi: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese' | 'severely obese';
  healthRisk: 'low' | 'moderate' | 'high' | 'very high';
  recommendedWeightRange: {
    min: number;
    max: number;
    unit: string;
  };
  interpretation: string;
}

export interface HeartRateZones {
  maxHeartRate: number;
  restingHeartRate: number;
  zones: {
    zone: 'rest' | 'warmup' | 'fatBurn' | 'cardio' | 'peak' | 'maximal';
    min: number;
    max: number;
    description: string;
    targetDurationMinutes?: number;
  }[];
  interpretation: string;
}

// Health calculation functions using BERT-based models
export const calculateBMI = (weight: number, height: number): number => {
  // BMI = weight(kg) / height(m)²
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

export const calculateBMR = (userData: UserHealthData): number => {
  // Mifflin-St Jeor Equation
  const { weight, height, age, gender } = userData;
  
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  // Apply activity multiplier
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  return Math.round(bmr * activityMultipliers[userData.activityLevel]);
};

export const calculateHeartRateZones = (age: number): {
  max: number;
  zones: { name: string; min: number; max: number }[];
} => {
  const maxHR = 220 - age;
  
  return {
    max: maxHR,
    zones: [
      { name: 'Rest', min: 40, max: Math.round(maxHR * 0.5) },
      { name: 'Very Light', min: Math.round(maxHR * 0.5) + 1, max: Math.round(maxHR * 0.6) },
      { name: 'Light', min: Math.round(maxHR * 0.6) + 1, max: Math.round(maxHR * 0.7) },
      { name: 'Moderate', min: Math.round(maxHR * 0.7) + 1, max: Math.round(maxHR * 0.8) },
      { name: 'Hard', min: Math.round(maxHR * 0.8) + 1, max: Math.round(maxHR * 0.9) },
      { name: 'Maximum', min: Math.round(maxHR * 0.9) + 1, max: maxHR }
    ]
  };
};

// Disease risk scoring using BERT model simulation
export const calculateDiseaseRisk = async (
  userData: UserHealthData,
  lifestyle: LifestyleData
): Promise<Record<string, number>> => {
  // This would normally call an API with a trained BERT model
  // For now we'll simulate with calculations
  
  // Calculate base scores for common conditions
  const risks: Record<string, number> = {
    'Heart Disease': 0,
    'Type 2 Diabetes': 0,
    'Hypertension': 0,
    'Stroke': 0,
    'Obesity': 0
  };
  
  // BMI factor
  const bmi = calculateBMI(userData.weight, userData.height);
  if (bmi >= 30) {
    risks['Heart Disease'] += 15;
    risks['Type 2 Diabetes'] += 20;
    risks['Hypertension'] += 15;
    risks['Stroke'] += 10;
    risks['Obesity'] = 70;
  } else if (bmi >= 25) {
    risks['Heart Disease'] += 10;
    risks['Type 2 Diabetes'] += 10;
    risks['Hypertension'] += 10;
    risks['Stroke'] += 5;
    risks['Obesity'] = 30;
  }
  
  // Age factor
  if (userData.age > 50) {
    risks['Heart Disease'] += 15;
    risks['Type 2 Diabetes'] += 10;
    risks['Hypertension'] += 15;
    risks['Stroke'] += 15;
  } else if (userData.age > 40) {
    risks['Heart Disease'] += 10;
    risks['Type 2 Diabetes'] += 5;
    risks['Hypertension'] += 10;
    risks['Stroke'] += 5;
  }
  
  // Blood pressure factor
  if (userData.bloodPressure) {
    const { systolic, diastolic } = userData.bloodPressure;
    if (systolic >= 140 || diastolic >= 90) {
      risks['Heart Disease'] += 20;
      risks['Stroke'] += 25;
      risks['Hypertension'] += 50;
    } else if (systolic >= 130 || diastolic >= 80) {
      risks['Heart Disease'] += 10;
      risks['Stroke'] += 15;
      risks['Hypertension'] += 30;
    }
  }
  
  // Lifestyle factors
  if (lifestyle.smokingStatus !== 'non_smoker') {
    risks['Heart Disease'] += lifestyle.smokingStatus === 'heavy_smoker' ? 25 : 15;
    risks['Stroke'] += lifestyle.smokingStatus === 'heavy_smoker' ? 25 : 15;
  }
  
  if (lifestyle.alcoholConsumption === 'heavy') {
    risks['Heart Disease'] += 15;
    risks['Hypertension'] += 15;
    risks['Stroke'] += 20;
  }
  
  if (lifestyle.exerciseFrequency < 2) {
    risks['Heart Disease'] += 10;
    risks['Type 2 Diabetes'] += 10;
    risks['Obesity'] += 15;
  }
  
  // Cap risks at 100
  Object.keys(risks).forEach(key => {
    risks[key] = Math.min(100, Math.max(0, risks[key]));
  });
  
  return risks;
};

// Fetch and analyze health news for local disease trends
export const fetchHealthTrends = async (location: string): Promise<any> => {
  try {
    // In a real implementation, this would call a news API with NLP processing
    // For now, we'll simulate the response
    
    // Simulated trending health concerns based on location
    const trendingConditions = {
      'New York': ['Seasonal allergies', 'Influenza', 'Covid variants'],
      'California': ['Air quality concerns', 'Heat-related illnesses', 'Valley fever'],
      'Florida': ['Dengue fever', 'Skin cancer risk', 'Respiratory infections'],
      // Add more locations as needed
    };
    
    // Default to general trends if location not found
    const locationTrends = trendingConditions[location as keyof typeof trendingConditions] || 
      ['Seasonal flu', 'Common cold', 'Covid-19'];
    
    return {
      trendingConditions: locationTrends,
      alertLevel: Math.floor(Math.random() * 3) + 1, // 1-3 scale
      recommendations: [
        'Stay updated on local health advisories',
        'Practice frequent handwashing',
        'Consider wearing masks in crowded areas'
      ]
    };
  } catch (error) {
    console.error('Error fetching health trends:', error);
    return {
      trendingConditions: [],
      alertLevel: 1,
      recommendations: ['Unable to fetch current trends. Please check back later.']
    };
  }
};

// Generate personalized health predictions using behavior and lifestyle data
export const generateHealthPrediction = async (
  userData: UserHealthData,
  behaviorData: BehaviorData,
  lifestyleData: LifestyleData
): Promise<HealthPrediction> => {
  // Calculate risk factors from all data sources
  const diseaseRisks = await calculateDiseaseRisk(userData, lifestyleData);
  
  // Evaluate behavior patterns
  const averageSleep = behaviorData.sleepPattern.reduce((a, b) => a + b, 0) / behaviorData.sleepPattern.length;
  const averageExercise = behaviorData.exerciseMinutes.reduce((a, b) => a + b, 0) / behaviorData.exerciseMinutes.length;
  
  // Determine highest risk condition
  let highestRiskCondition = '';
  let highestRiskScore = 0;
  
  Object.entries(diseaseRisks).forEach(([condition, score]) => {
    if (score > highestRiskScore) {
      highestRiskScore = score;
      highestRiskCondition = condition;
    }
  });
  
  // Generate suggested actions
  const suggestedActions = [];
  
  if (averageSleep < 7) {
    suggestedActions.push('Increase sleep duration to at least 7 hours per night');
  }
  
  if (averageExercise < 30) {
    suggestedActions.push('Aim for at least 30 minutes of physical activity daily');
  }
  
  if (userData.bloodPressure && (userData.bloodPressure.systolic > 130 || userData.bloodPressure.diastolic > 80)) {
    suggestedActions.push('Monitor blood pressure regularly and consult healthcare provider');
  }
  
  if (lifestyleData.diet === 'other' && highestRiskCondition === 'Heart Disease') {
    suggestedActions.push('Consider a Mediterranean or DASH diet for heart health');
  }
  
  // Add general recommendations
  suggestedActions.push('Stay hydrated with at least 8 glasses of water daily');
  suggestedActions.push('Practice stress management techniques like meditation');
  
  // Determine overall risk level
  let riskLevel: 'low' | 'moderate' | 'high' = 'low';
  if (highestRiskScore > 70) {
    riskLevel = 'high';
  } else if (highestRiskScore > 40) {
    riskLevel = 'moderate';
  }
  
  // Create potential conditions list
  const potentialConditions = Object.entries(diseaseRisks)
    .filter(([_, score]) => score > 30)
    .map(([condition, _]) => condition);
  
  return {
    riskLevel,
    riskScore: highestRiskScore,
    suggestedActions,
    potentialConditions: potentialConditions.length > 0 ? potentialConditions : undefined,
    confidenceLevel: 0.85 // In a real implementation, this would be calculated by the model
  };
};

// AI health coach with personalized messages based on user behavior
export const generateHealthCoachMessages = (
  userData: UserHealthData,
  behaviorData: BehaviorData
): HealthCoachMessage[] => {
  const messages: HealthCoachMessage[] = [];
  
  // Check sleep patterns
  const latestSleep = behaviorData.sleepPattern.reduce((a, b) => a + b, 0) / behaviorData.sleepPattern.length;
  if (latestSleep < 6) {
    messages.push({
      message: "I've noticed you're not getting enough sleep lately. Aim for 7-9 hours to improve your health and energy levels.",
      type: 'education',
      priority: 'medium',
      actionable: false
    });
  }
  
  // Check exercise consistency
  const exerciseStreak = behaviorData.exerciseMinutes.filter(min => min > 0).length;
  if (exerciseStreak < 3) {
    messages.push({
      message: "You've been missing your exercise goals. Even short 10-minute walks can make a difference!",
      type: 'encouragement',
      priority: 'medium',
      actionable: false
    });
  } else if (exerciseStreak >= 5) {
    messages.push({
      message: "Great job maintaining your exercise routine! You're building healthy habits that will benefit you long-term.",
      type: 'encouragement',
      priority: 'low',
      actionable: false
    });
  }
  
  // Medication adherence
  if (behaviorData.medicationAdherence && behaviorData.medicationAdherence.prescribed > 0 && behaviorData.medicationAdherence.taken < behaviorData.medicationAdherence.prescribed) {
    messages.push({
      message: "I noticed you might be missing some medication doses. Would you like me to set up reminders?",
      type: 'alert',
      priority: 'high',
      actionable: true
    });
  }
  
  // Water intake
  const averageWater = behaviorData.waterIntake.reduce((a, b) => a + b, 0) / behaviorData.waterIntake.length;
  if (averageWater < 6) {
    messages.push({
      message: "Your water intake has been below recommendations. Try keeping a water bottle with you throughout the day.",
      type: 'reminder',
      priority: 'medium',
      actionable: false
    });
  }
  
  // Add custom message based on health condition if applicable
  if (userData.conditions?.includes('diabetes')) {
    messages.push({
      message: "Remember to check your blood glucose levels regularly and log them in the app.",
      type: 'reminder',
      priority: 'high',
      actionable: true
    });
  }
  
  return messages;
};

// Analyze behavior patterns to identify health insights
export const analyzeBehaviorPatterns = (behaviorData: BehaviorData): {
  insights: string[];
  recommendations: string[];
} => {
  const insights: string[] = [];
  const recommendations: string[] = [];
  
  // Analyze sleep consistency
  const sleepVariance = calculateVariance(behaviorData.sleepPattern.reduce((a, b) => a + b, 0));
  if (sleepVariance > 2) {
    insights.push("Your sleep schedule shows significant variability");
    recommendations.push("Try to maintain a consistent sleep schedule, even on weekends");
  }
  
  // Analyze meal timing
  const mealTimes = behaviorData.sleepPattern.map(pattern => {
    const [hours, minutes] = pattern.wakingTimes[0].split(':').map(Number);
    return hours * 60 + minutes;
  });
  
  const mealVariance = calculateVariance(mealTimes);
  if (mealVariance > 60) { // More than 60 minutes variance
    insights.push("Your meal times are irregular");
    recommendations.push("Consistent meal timing can help regulate metabolism and energy levels");
  }
  
  // Analyze stress patterns
  const avgStress = behaviorData.moodTracking?.average || 0;
  if (avgStress > 7) {
    insights.push("Your stress levels are consistently high");
    recommendations.push("Consider daily meditation or mindfulness practices");
    recommendations.push("Schedule regular breaks during your workday");
  }
  
  // General insights
  insights.push(`You average ${Math.round(averageArray(behaviorData.exerciseMinutes))} minutes of exercise daily`);
  
  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push("Continue your current healthy habits");
    recommendations.push("Consider setting new health goals to challenge yourself");
  }
  
  return { insights, recommendations };
};

// Helper functions
function calculateVariance(arr: number[]): number {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

function averageArray(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
} 