'use client';

import { useSession } from '@/lib/auth';
import axios from 'axios';

// Types for health calculations and predictions
export type HealthMetric = {
  value: number;
  unit: string;
  timestamp: Date;
  status: 'normal' | 'warning' | 'critical';
};

export type HealthMetrics = {
  bloodPressure: {
    systolic: HealthMetric;
    diastolic: HealthMetric;
  };
  heartRate: HealthMetric;
  weight: HealthMetric;
  bmi: HealthMetric;
  bloodGlucose: HealthMetric;
  cholesterol: {
    total: HealthMetric;
    hdl: HealthMetric;
    ldl: HealthMetric;
  };
  steps: HealthMetric;
  sleepHours: HealthMetric;
  waterIntake: HealthMetric;
  calories: HealthMetric;
};

export type UserProfile = {
  id: string;
  name: string;
  age: number;
  gender: string;
  location: {
    country: string;
    city: string;
    latitude?: number;
    longitude?: number;
  };
  metrics: HealthMetrics;
  medicalHistory: {
    conditions: string[];
    allergies: string[];
    medications: string[];
    familyHistory: string[];
  };
  lifestyle: {
    dietType: string;
    activityLevel: number;
    smoker: boolean;
    alcoholConsumption: number;
    stressLevel: number;
  };
};

export type NewsAlert = {
  id: string;
  title: string;
  source: string;
  date: string;
  relevanceScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  description: string;
  region: string;
  affectedDemographics?: string[];
  symptoms?: string[];
  precautions?: string[];
  url: string;
};

export type HealthPrediction = {
  userId: string;
  timestamp: Date;
  risk: {
    heart: number;
    diabetes: number;
    hypertension: number;
    obesity: number;
    overall: number;
  };
  recommendations: string[];
  insights: string[];
  nextSteps: string[];
  relatedNews: HealthNews[];
};

export type HealthNews = {
  title: string;
  source: string;
  url: string;
  relevanceScore: number;
  summary: string;
  date: Date;
};

// Calculate BMI
export function calculateBMI(weight: number, height: number): number {
  // Weight in kg, height in meters
  return weight / (height * height);
}

// Calculate BMR using Mifflin-St Jeor Equation
export function calculateBMR(
  weight: number, 
  height: number, 
  age: number, 
  gender: string
): number {
  // Mifflin-St Jeor Equation
  // Weight in kg, height in cm, age in years
  const bmr = 10 * weight + 6.25 * height - 5 * age;
  return gender.toLowerCase() === 'male' ? bmr + 5 : bmr - 161;
}

// Calculate heart rate zones
export function calculateHeartRateZones(age: number): {
  rest: number;
  fatBurn: [number, number];
  cardio: [number, number];
  peak: [number, number];
  max: number;
} {
  const maxHR = 220 - age;
  return {
    rest: 70, // Average resting heart rate
    fatBurn: [Math.round(maxHR * 0.5), Math.round(maxHR * 0.6)],
    cardio: [Math.round(maxHR * 0.6), Math.round(maxHR * 0.7)],
    peak: [Math.round(maxHR * 0.7), Math.round(maxHR * 0.85)],
    max: maxHR
  };
}

// Calculate disease risk scores based on demographics
export function calculateDiseaseRiskScores(
  profile: UserProfile
): Record<string, number> {
  const { age, gender, metrics, medicalHistory, lifestyle } = profile;
  
  // This would be a complex ML model in production
  // Here we're using a simple formula for demonstration
  
  // Heart disease risk (0-100)
  const heartRisk = Math.min(100, Math.max(0,
    age * 0.5 +
    (metrics.bloodPressure.systolic.value > 140 ? 15 : 0) +
    (metrics.cholesterol.ldl.value > 130 ? 20 : 0) +
    (lifestyle.smoker ? 25 : 0) +
    (lifestyle.activityLevel < 3 ? 10 : 0) +
    (medicalHistory.familyHistory.includes('heart disease') ? 15 : 0)
  ));
  
  // Diabetes risk (0-100)
  const diabetesRisk = Math.min(100, Math.max(0,
    age * 0.3 +
    (metrics.bloodGlucose.value > 100 ? 30 : 0) +
    (calculateBMI(metrics.weight.value, 1.75) > 30 ? 25 : 0) +
    (lifestyle.activityLevel < 2 ? 15 : 0) +
    (medicalHistory.familyHistory.includes('diabetes') ? 20 : 0)
  ));
  
  // Hypertension risk (0-100)
  const hypertensionRisk = Math.min(100, Math.max(0,
    age * 0.4 +
    (metrics.bloodPressure.systolic.value > 130 ? 25 : 0) +
    (metrics.bloodPressure.diastolic.value > 80 ? 20 : 0) +
    (lifestyle.stressLevel > 7 ? 15 : 0) +
    (lifestyle.smoker ? 10 : 0) +
    (lifestyle.alcoholConsumption > 2 ? 10 : 0)
  ));
  
  // Obesity risk (0-100)
  const obesityRisk = Math.min(100, Math.max(0,
    age * 0.1 +
    (calculateBMI(metrics.weight.value, 1.75) > 25 ? 30 : 0) +
    (lifestyle.activityLevel < 2 ? 30 : 0) +
    (lifestyle.dietType === 'high-calorie' ? 25 : 0) +
    (metrics.calories.value > 2500 ? 15 : 0)
  ));
  
  // Overall health risk
  const overallRisk = Math.round(
    (heartRisk + diabetesRisk + hypertensionRisk + obesityRisk) / 4
  );
  
  return {
    heart: Math.round(heartRisk),
    diabetes: Math.round(diabetesRisk),
    hypertension: Math.round(hypertensionRisk),
    obesity: Math.round(obesityRisk),
    overall: overallRisk
  };
}

// Analyze news for disease outbreaks
export async function analyzeNewsForHealthRisks(
  location: string
): Promise<HealthNews[]> {
  // In a real app, this would call a news API and process results
  // For demonstration, we'll return mock data
  
  // Here you would use a real news API like NewsAPI or The Guardian
  // const response = await axios.get(`https://newsapi.org/v2/everything?q=health+${location}&apiKey=YOUR_API_KEY`);
  
  // Mock data
  const mockNews: HealthNews[] = [
    {
      title: `New Flu Strain Reported in ${location}`,
      source: 'Health Daily',
      url: 'https://example.com/news/1',
      relevanceScore: 0.85,
      summary: `Health officials have reported a new strain of influenza affecting residents in ${location}. Vaccination efforts are underway.`,
      date: new Date(Date.now() - 86400000) // Yesterday
    },
    {
      title: 'Study Links Air Quality to Respiratory Health',
      source: 'Medical Journal',
      url: 'https://example.com/news/2',
      relevanceScore: 0.75,
      summary: 'A new study has found strong correlations between air quality index values and respiratory hospital admissions.',
      date: new Date(Date.now() - 172800000) // 2 days ago
    },
    {
      title: 'Breakthrough in Diabetes Treatment Research',
      source: 'Science Today',
      url: 'https://example.com/news/3',
      relevanceScore: 0.65,
      summary: 'Researchers have identified a new mechanism that could lead to more effective diabetes treatments with fewer side effects.',
      date: new Date(Date.now() - 259200000) // 3 days ago
    }
  ];
  
  return mockNews;
}

// Generate personalized health recommendations
export function generateHealthRecommendations(
  profile: UserProfile,
  risks: Record<string, number>
): string[] {
  const recommendations: string[] = [];
  
  // Diet recommendations
  if (profile.lifestyle.dietType === 'high-calorie' || risks.obesity > 50) {
    recommendations.push('Consider reducing caloric intake and focusing on nutrient-dense foods like vegetables and lean proteins.');
  }
  
  if (risks.diabetes > 50) {
    recommendations.push('Monitor carbohydrate intake and consider a lower glycemic index diet to help manage blood glucose levels.');
  }
  
  if (risks.heart > 60 || risks.hypertension > 60) {
    recommendations.push('Reduce sodium intake to less than 2,300mg per day and increase consumption of heart-healthy foods like fish, nuts, and olive oil.');
  }
  
  // Exercise recommendations
  if (profile.lifestyle.activityLevel < 3) {
    recommendations.push('Aim for at least 150 minutes of moderate-intensity aerobic activity per week, plus muscle-strengthening activities twice weekly.');
  }
  
  if (risks.heart > 50 || risks.hypertension > 50) {
    recommendations.push('Include regular cardiovascular exercise like walking, swimming, or cycling to improve heart health.');
  }
  
  // Lifestyle recommendations
  if (profile.lifestyle.smoker) {
    recommendations.push('Quitting smoking can dramatically reduce your risk of heart disease, cancer, and respiratory conditions.');
  }
  
  if (profile.lifestyle.alcoholConsumption > 2) {
    recommendations.push('Consider limiting alcohol consumption to reduce risks of liver disease, hypertension, and other health issues.');
  }
  
  if (profile.lifestyle.stressLevel > 7) {
    recommendations.push('Incorporate stress-reduction techniques like meditation, deep breathing, or yoga into your daily routine.');
  }
  
  // Sleep recommendations
  if (profile.metrics.sleepHours.value < 7) {
    recommendations.push('Aim for 7-9 hours of quality sleep per night to improve overall health and reduce chronic disease risk.');
  }
  
  // Water intake
  if (profile.metrics.waterIntake.value < 2000) {
    recommendations.push('Increase water intake to at least 2-3 liters per day to maintain proper hydration and support bodily functions.');
  }
  
  return recommendations;
}

// Generate mock health prediction
export function generateMockHealthPrediction(userId: string): HealthPrediction {
  // This would be replaced with real ML-based prediction in production
  // Create a mock user profile
  const mockProfile: UserProfile = {
    id: userId,
    name: 'John Doe',
    age: 45,
    gender: 'male',
    location: {
      country: 'United States',
      city: 'Chicago',
    },
    metrics: {
      bloodPressure: {
        systolic: { value: 125, unit: 'mmHg', timestamp: new Date(), status: 'normal' },
        diastolic: { value: 82, unit: 'mmHg', timestamp: new Date(), status: 'normal' }
      },
      heartRate: { value: 72, unit: 'bpm', timestamp: new Date(), status: 'normal' },
      weight: { value: 80, unit: 'kg', timestamp: new Date(), status: 'normal' },
      bmi: { value: 26.2, unit: 'kg/m²', timestamp: new Date(), status: 'warning' },
      bloodGlucose: { value: 95, unit: 'mg/dL', timestamp: new Date(), status: 'normal' },
      cholesterol: {
        total: { value: 190, unit: 'mg/dL', timestamp: new Date(), status: 'normal' },
        hdl: { value: 45, unit: 'mg/dL', timestamp: new Date(), status: 'normal' },
        ldl: { value: 125, unit: 'mg/dL', timestamp: new Date(), status: 'normal' }
      },
      steps: { value: 7500, unit: 'steps', timestamp: new Date(), status: 'normal' },
      sleepHours: { value: 6.5, unit: 'hours', timestamp: new Date(), status: 'warning' },
      waterIntake: { value: 1500, unit: 'ml', timestamp: new Date(), status: 'warning' },
      calories: { value: 2200, unit: 'kcal', timestamp: new Date(), status: 'normal' }
    },
    medicalHistory: {
      conditions: ['mild hypertension'],
      allergies: ['pollen'],
      medications: ['lisinopril'],
      familyHistory: ['heart disease', 'type 2 diabetes']
    },
    lifestyle: {
      dietType: 'mixed',
      activityLevel: 2,
      smoker: false,
      alcoholConsumption: 1,
      stressLevel: 6
    }
  };
  
  // Calculate disease risks
  const risks = calculateDiseaseRiskScores(mockProfile);
  
  // Generate recommendations
  const recommendations = generateHealthRecommendations(mockProfile, risks);
  
  // Generate insights
  const insights = [
    'Your sleep pattern shows consistent insufficiency which may impact your blood pressure.',
    'Recent increases in stress levels correlate with higher blood pressure readings.',
    'Your heart rate variability suggests improved fitness compared to last month.',
    'Water intake is consistently below recommended levels on weekdays.'
  ];
  
  // Generate next steps
  const nextSteps = [
    'Schedule a follow-up with your primary care physician within 30 days.',
    'Consider consulting a nutritionist about a heart-healthy diet plan.',
    'Begin a sleep tracking program to improve sleep duration and quality.',
    'Set reminders to increase water intake throughout the day.'
  ];
  
  return {
    userId,
    timestamp: new Date(),
    risk: {
      heart: risks.heart,
      diabetes: risks.diabetes,
      hypertension: risks.hypertension,
      obesity: risks.obesity,
      overall: risks.overall
    },
    recommendations,
    insights,
    nextSteps,
    relatedNews: [] // Would be populated from analyzeNewsForHealthRisks in real implementation
  };
}

// Behavior analysis functions
export function analyzeUserBehavior(userId: string): BehaviorAnalysisResult {
  // In production, this would analyze real user interaction data
  // For demonstration, we'll return mock data
  
  return {
    userId,
    engagementPattern: 'regular',
    contentPreferences: ['health-tips', 'exercise-tracking', 'nutrition'],
    appUsageStats: {
      featureUsage: {
        'symptom-checker': 10,
        'medication-tracking': 25,
        'vital-signs': 15,
        'health-articles': 7
      },
      timeSpent: {
        'symptom-checker': 45, // minutes
        'medication-tracking': 120,
        'vital-signs': 60,
        'health-articles': 35
      }
    },
    preferredCommunicationStyle: 'friendly',
    responseToRecommendations: 'receptive'
  };
}

// Adapt communication based on user preferences
export function adaptCommunicationStyle(
  message: string,
  style: CommunicationStyle
): string {
  switch (style) {
    case 'clinical':
      return message
        .replace(/good/gi, 'satisfactory')
        .replace(/bad/gi, 'suboptimal')
        .replace(/great/gi, 'excellent');
      
    case 'friendly':
      return message
        .replace(/It is recommended/gi, 'We suggest')
        .replace(/You should/gi, 'It might help to')
        .replace(/\./g, '! ');
      
    case 'motivational':
      return message
        .replace(/should/gi, 'can')
        .replace(/try to/gi, 'challenge yourself to')
        .replace(/reduce/gi, 'improve by reducing');
      
    case 'detailed':
      // Would add more detailed explanations in real implementation
      return message + ' This is based on clinical evidence and personalized to your health profile.';
      
    case 'simple':
      // Would simplify language in real implementation
      return message
        .replace(/cardiovascular/gi, 'heart')
        .replace(/hypertension/gi, 'high blood pressure')
        .replace(/glucose/gi, 'sugar');
      
    default:
      return message;
  }
}

// Hook for using AI health predictions
export function useHealthPredictions(userId?: string) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<HealthPrediction | null>(null);
  
  // Fetch health predictions from API
  const fetchPredictions = useCallback(async () => {
    if (!userId && !session?.user?.id) {
      setError('User ID is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/health-predictions?userId=${userId || session?.user?.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch health predictions');
      }
      
      const data = await response.json();
      setPredictions(data);
    } catch (err) {
      console.error('Error fetching health predictions:', err);
      setError('Failed to fetch health predictions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId, session]);
  
  // Fetch predictions on component mount
  useEffect(() => {
    if (session?.user?.id || userId) {
      fetchPredictions();
    }
  }, [fetchPredictions, session, userId]);
  
  return { predictions, loading, error, refreshPredictions: fetchPredictions };
}

// Mock data for testing
export function generateMockHealthProfile(): UserProfile {
  return {
    id: 'mock-user',
    name: 'John Doe',
    age: 42,
    gender: 'male',
    location: {
      country: 'United States',
      city: 'Chicago',
    },
    metrics: {
      bloodPressure: {
        systolic: { value: 120, unit: 'mmHg', timestamp: new Date(), status: 'normal' },
        diastolic: { value: 80, unit: 'mmHg', timestamp: new Date(), status: 'normal' }
      },
      heartRate: { value: 72, unit: 'bpm', timestamp: new Date(), status: 'normal' },
      weight: { value: 82, unit: 'kg', timestamp: new Date(), status: 'normal' },
      bmi: { value: 26.2, unit: 'kg/m²', timestamp: new Date(), status: 'warning' },
      bloodGlucose: { value: 98, unit: 'mg/dL', timestamp: new Date(), status: 'normal' },
      cholesterol: {
        total: { value: 190, unit: 'mg/dL', timestamp: new Date(), status: 'normal' },
        hdl: { value: 45, unit: 'mg/dL', timestamp: new Date(), status: 'normal' },
        ldl: { value: 125, unit: 'mg/dL', timestamp: new Date(), status: 'normal' }
      },
      steps: { value: 7500, unit: 'steps', timestamp: new Date(), status: 'normal' },
      sleepHours: { value: 6.5, unit: 'hours', timestamp: new Date(), status: 'warning' },
      waterIntake: { value: 1500, unit: 'ml', timestamp: new Date(), status: 'warning' },
      calories: { value: 2200, unit: 'kcal', timestamp: new Date(), status: 'normal' }
    },
    medicalHistory: {
      conditions: ['Hypertension', 'Seasonal allergies'],
      allergies: ['pollen'],
      medications: ['Lisinopril 10mg'],
      familyHistory: ['Father: Heart disease, Type 2 diabetes', 'Mother: Breast cancer']
    },
    lifestyle: {
      dietType: 'mixed',
      activityLevel: 2,
      smoker: false,
      alcoholConsumption: 1,
      stressLevel: 6
    }
  };
}

export function generateMockVitalSigns() {
  return [
    {
      type: 'heartRate',
      value: 72,
      unit: 'bpm',
      timestamp: Date.now() - 1000 * 60 * 60 * 3 // 3 hours ago
    },
    {
      type: 'bloodPressure',
      value: '128/82',
      unit: 'mmHg',
      timestamp: Date.now() - 1000 * 60 * 60 * 24 // 1 day ago
    },
    {
      type: 'bloodGlucose',
      value: 98,
      unit: 'mg/dL',
      timestamp: Date.now() - 1000 * 60 * 60 * 12 // 12 hours ago
    },
    {
      type: 'weight',
      value: 82,
      unit: 'kg',
      timestamp: Date.now() - 1000 * 60 * 60 * 24 * 3 // 3 days ago
    },
    {
      type: 'oxygenLevel',
      value: 98,
      unit: '%',
      timestamp: Date.now() - 1000 * 60 * 60 * 6 // 6 hours ago
    }
  ];
}

export function generateMockActivities() {
  return [
    {
      type: 'exercise',
      category: 'cardio',
      duration: 30, // minutes
      intensity: 'moderate',
      caloriesBurned: 250,
      timestamp: Date.now() - 1000 * 60 * 60 * 24 // 1 day ago
    },
    {
      type: 'sleep',
      duration: 6.5, // hours
      quality: 'moderate',
      deepSleepPercentage: 20,
      timestamp: Date.now() - 1000 * 60 * 60 * 8 // 8 hours ago
    },
    {
      type: 'food',
      items: [
        { name: 'Oatmeal', calories: 150, carbs: 27, protein: 5, fat: 3 },
        { name: 'Banana', calories: 105, carbs: 27, protein: 1, fat: 0 },
        { name: 'Coffee with milk', calories: 30, carbs: 2, protein: 1, fat: 1 }
      ],
      mealType: 'breakfast',
      timestamp: Date.now() - 1000 * 60 * 60 * 4 // 4 hours ago
    }
  ];
}

import { useState, useEffect, useCallback } from 'react'; 