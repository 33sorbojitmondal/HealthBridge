/**
 * Client-side utility for accessing AI health features
 */

import { 
  UserHealthData, 
  BehaviorData, 
  LifestyleData, 
  HealthPrediction,
  HealthCoachMessage
} from './health-ai';

interface HealthCalculationResult {
  bmi: number;
  bmr: number;
  heartRateZones: {
    rest: number;
    fat: [number, number];
    cardio: [number, number];
    peak: [number, number];
  };
}

interface DiseaseRiskResult {
  risks: {
    disease: string;
    risk: 'low' | 'moderate' | 'high';
    score: number;
    factors: string[];
  }[];
}

interface HealthTrendsResult {
  trends: {
    trendingConditions: string[];
    seasonalConditions: string[];
    localOutbreaks: string[];
    recommendations: string[];
  };
}

interface BehaviorAnalysisResult {
  sleepInsight: string;
  exerciseInsight: string;
  medicationInsight: string;
  nutritionInsight: string;
  recommendations: string[];
}

/**
 * Get health calculations (BMI, BMR, heart rate zones)
 */
export async function getHealthCalculations(userData: UserHealthData): Promise<HealthCalculationResult> {
  const response = await fetch('/api/ai-health', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'healthCalculations',
      userData,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get health calculations');
  }

  return await response.json();
}

/**
 * Get disease risk assessment
 */
export async function getDiseaseRiskAssessment(
  userData: UserHealthData,
  lifestyleData: LifestyleData
): Promise<DiseaseRiskResult> {
  const response = await fetch('/api/ai-health', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'diseaseRisk',
      userData,
      lifestyleData,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get disease risk assessment');
  }

  return await response.json();
}

/**
 * Get health trends based on location
 */
export async function getHealthTrends(location: string): Promise<HealthTrendsResult> {
  const response = await fetch('/api/ai-health', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'healthTrends',
      location,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get health trends');
  }

  return await response.json();
}

/**
 * Get personalized health prediction
 */
export async function getHealthPrediction(
  userData: UserHealthData,
  behaviorData: BehaviorData,
  lifestyleData: LifestyleData
): Promise<{ prediction: HealthPrediction }> {
  const response = await fetch('/api/ai-health', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'healthPrediction',
      userData,
      behaviorData,
      lifestyleData,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get health prediction');
  }

  return await response.json();
}

/**
 * Get health coach messages
 */
export async function getHealthCoachMessages(
  userData: UserHealthData,
  behaviorData: BehaviorData
): Promise<{ messages: HealthCoachMessage[] }> {
  const response = await fetch('/api/ai-health', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'healthCoach',
      userData,
      behaviorData,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get health coach messages');
  }

  return await response.json();
}

/**
 * Get behavior pattern analysis
 */
export async function getBehaviorAnalysis(
  behaviorData: BehaviorData
): Promise<BehaviorAnalysisResult> {
  const response = await fetch('/api/ai-health', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'behaviorAnalysis',
      behaviorData,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get behavior analysis');
  }

  return await response.json();
} 