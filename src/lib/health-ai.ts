// health-ai.ts - AI-powered health calculations and predictions

import { getHealth } from './health-data';
import { getNewsData } from './news-data';
import { getUserBehavior } from './user-behavior';

// Types for health data
export type HealthData = {
  age: number;
  weight: number; // in kg
  height: number; // in cm
  gender: 'male' | 'female' | 'other';
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  bloodGlucose?: number;
  cholesterol?: {
    total: number;
    hdl: number;
    ldl: number;
  };
};

export type LifestyleData = {
  smoking: boolean;
  alcoholConsumption: 'none' | 'occasional' | 'moderate' | 'heavy';
  exerciseFrequency: 'none' | 'light' | 'moderate' | 'active' | 'very active';
  dietType: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo' | 'other';
  sleepHours: number;
  stressLevel: 'low' | 'moderate' | 'high';
};

export type BehaviorData = {
  adherenceToPlan: number; // 0-100%
  appEngagement: number; // 0-100%
  consistencyScore: number; // 0-100%
  recentActivities: string[];
  preferredCommunicationStyle: 'direct' | 'motivational' | 'educational' | 'gentle';
};

export type DiseaseRiskScores = {
  [disease: string]: {
    score: number; // 0-100
    factors: string[];
    trend: 'increasing' | 'decreasing' | 'stable';
  };
};

export type HealthPrediction = {
  riskScores: DiseaseRiskScores;
  recommendations: string[];
  insights: string[];
  localTrends?: {
    disease: string;
    prevalence: number;
    change: number;
  }[];
};

/**
 * Calculate Body Mass Index (BMI)
 */
export function calculateBMI(height: number, weight: number): number {
  // Height in meters, weight in kg
  const heightInMeters = height / 100;
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
}

/**
 * Interpret BMI category
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  if (bmi < 35) return 'Obesity (Class 1)';
  if (bmi < 40) return 'Obesity (Class 2)';
  return 'Obesity (Class 3)';
}

/**
 * Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation
 */
export function calculateBMR(height: number, weight: number, age: number, gender: string): number {
  if (gender === 'male') {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  } else {
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }
}

/**
 * Calculate heart rate zones based on estimated max heart rate
 */
export function calculateHeartRateZones(age: number): {
  max: number;
  zones: { name: string; min: number; max: number }[];
} {
  const maxHR = 220 - age;
  
  return {
    max: maxHR,
    zones: [
      { name: 'Rest', min: 0, max: Math.round(maxHR * 0.5) },
      { name: 'Fat Burn', min: Math.round(maxHR * 0.5) + 1, max: Math.round(maxHR * 0.6) },
      { name: 'Cardio', min: Math.round(maxHR * 0.6) + 1, max: Math.round(maxHR * 0.7) },
      { name: 'Aerobic', min: Math.round(maxHR * 0.7) + 1, max: Math.round(maxHR * 0.8) },
      { name: 'Anaerobic', min: Math.round(maxHR * 0.8) + 1, max: Math.round(maxHR * 0.9) },
      { name: 'Maximum', min: Math.round(maxHR * 0.9) + 1, max: maxHR },
    ],
  };
}

/**
 * Simulate BERT-based disease prediction using health and lifestyle data
 * In a real implementation, this would call an actual ML model endpoint
 */
export async function predictDiseaseWithBERT(
  healthData: HealthData,
  lifestyleData: LifestyleData
): Promise<DiseaseRiskScores> {
  // This is a simulation - in a real app, this would call a trained ML model

  const risks: DiseaseRiskScores = {};
  
  // Calculate Type 2 Diabetes risk
  const diabetesScore = calculateDiabetesRisk(healthData, lifestyleData);
  risks['Type 2 Diabetes'] = {
    score: diabetesScore,
    factors: getDiabetesRiskFactors(healthData, lifestyleData),
    trend: diabetesScore > 50 ? 'increasing' : 'decreasing',
  };

  // Calculate Heart Disease risk
  const heartScore = calculateHeartDiseaseRisk(healthData, lifestyleData);
  risks['Cardiovascular Disease'] = {
    score: heartScore,
    factors: getHeartDiseaseRiskFactors(healthData, lifestyleData),
    trend: heartScore > 40 ? 'increasing' : 'stable',
  };

  // Calculate Hypertension risk
  const bpScore = calculateHypertensionRisk(healthData, lifestyleData);
  risks['Hypertension'] = {
    score: bpScore,
    factors: getHypertensionRiskFactors(healthData, lifestyleData),
    trend: bpScore > 60 ? 'increasing' : 'decreasing',
  };

  // Simulate processing delay to mimic ML model inference time
  await new Promise(resolve => setTimeout(resolve, 1000));

  return risks;
}

/**
 * Calculate Type 2 Diabetes risk score based on health and lifestyle data
 */
function calculateDiabetesRisk(healthData: HealthData, lifestyleData: LifestyleData): number {
  let score = 0;
  
  // Age factor (risk increases with age)
  if (healthData.age > 45) score += 10;
  if (healthData.age > 60) score += 10;
  
  // BMI factor
  const bmi = calculateBMI(healthData.height, healthData.weight);
  if (bmi >= 25) score += 10;
  if (bmi >= 30) score += 15;
  
  // Blood glucose if available
  if (healthData.bloodGlucose) {
    if (healthData.bloodGlucose > 100) score += 15;
    if (healthData.bloodGlucose > 125) score += 25;
  }
  
  // Lifestyle factors
  if (lifestyleData.exerciseFrequency === 'none') score += 10;
  if (lifestyleData.dietType === 'keto' || lifestyleData.dietType === 'paleo') score += 5;
  
  // Cap the score at 100
  return Math.min(Math.max(score, 5), 100);
}

/**
 * Get risk factors for Type 2 Diabetes
 */
function getDiabetesRiskFactors(healthData: HealthData, lifestyleData: LifestyleData): string[] {
  const factors: string[] = [];
  const bmi = calculateBMI(healthData.height, healthData.weight);
  
  if (healthData.age > 45) factors.push('Age over 45');
  if (bmi >= 25) factors.push('Elevated BMI');
  if (healthData.bloodGlucose && healthData.bloodGlucose > 100) factors.push('Elevated blood glucose');
  if (lifestyleData.exerciseFrequency === 'none' || lifestyleData.exerciseFrequency === 'light') 
    factors.push('Insufficient physical activity');
  
  return factors;
}

/**
 * Calculate Heart Disease risk score
 */
function calculateHeartDiseaseRisk(healthData: HealthData, lifestyleData: LifestyleData): number {
  let score = 0;
  
  // Age factor
  if (healthData.age > 45 && healthData.gender === 'male') score += 10;
  if (healthData.age > 55 && healthData.gender === 'female') score += 10;
  
  // Blood pressure if available
  if (healthData.bloodPressure) {
    if (healthData.bloodPressure.systolic > 140 || healthData.bloodPressure.diastolic > 90) score += 20;
  }
  
  // Cholesterol if available
  if (healthData.cholesterol) {
    if (healthData.cholesterol.total > 200) score += 10;
    if (healthData.cholesterol.ldl > 130) score += 15;
  }
  
  // Lifestyle factors
  if (lifestyleData.smoking) score += 20;
  if (lifestyleData.alcoholConsumption === 'heavy') score += 15;
  if (lifestyleData.exerciseFrequency === 'none') score += 10;
  if (lifestyleData.stressLevel === 'high') score += 10;
  
  return Math.min(Math.max(score, 5), 100);
}

/**
 * Get risk factors for Heart Disease
 */
function getHeartDiseaseRiskFactors(healthData: HealthData, lifestyleData: LifestyleData): string[] {
  const factors: string[] = [];
  
  if ((healthData.gender === 'male' && healthData.age > 45) || 
      (healthData.gender === 'female' && healthData.age > 55)) {
    factors.push('Age factor');
  }
  
  if (healthData.bloodPressure && 
      (healthData.bloodPressure.systolic > 140 || healthData.bloodPressure.diastolic > 90)) {
    factors.push('High blood pressure');
  }
  
  if (lifestyleData.smoking) factors.push('Smoking');
  if (lifestyleData.alcoholConsumption === 'heavy') factors.push('Heavy alcohol consumption');
  if (lifestyleData.stressLevel === 'high') factors.push('High stress levels');
  
  return factors;
}

/**
 * Calculate Hypertension risk score
 */
function calculateHypertensionRisk(healthData: HealthData, lifestyleData: LifestyleData): number {
  let score = 0;
  
  // Age factor (risk increases with age)
  if (healthData.age > 45) score += 10;
  if (healthData.age > 65) score += 10;
  
  // Blood pressure if available is direct indicator
  if (healthData.bloodPressure) {
    if (healthData.bloodPressure.systolic > 120 || healthData.bloodPressure.diastolic > 80) score += 15;
    if (healthData.bloodPressure.systolic > 130 || healthData.bloodPressure.diastolic > 85) score += 10;
    if (healthData.bloodPressure.systolic > 140 || healthData.bloodPressure.diastolic > 90) score += 20;
  }
  
  // BMI factor
  const bmi = calculateBMI(healthData.height, healthData.weight);
  if (bmi >= 25) score += 5;
  if (bmi >= 30) score += 10;
  
  // Lifestyle factors
  if (lifestyleData.smoking) score += 10;
  if (lifestyleData.alcoholConsumption === 'moderate' || lifestyleData.alcoholConsumption === 'heavy') score += 10;
  if (lifestyleData.stressLevel === 'high') score += 15;
  if (lifestyleData.exerciseFrequency === 'none') score += 10;
  
  return Math.min(Math.max(score, 5), 100);
}

/**
 * Get risk factors for Hypertension
 */
function getHypertensionRiskFactors(healthData: HealthData, lifestyleData: LifestyleData): string[] {
  const factors: string[] = [];
  
  if (healthData.age > 45) factors.push('Age over 45');
  
  if (healthData.bloodPressure && 
      (healthData.bloodPressure.systolic > 120 || healthData.bloodPressure.diastolic > 80)) {
    factors.push('Elevated blood pressure');
  }
  
  const bmi = calculateBMI(healthData.height, healthData.weight);
  if (bmi >= 25) factors.push('Elevated BMI');
  
  if (lifestyleData.smoking) factors.push('Smoking');
  if (lifestyleData.alcoholConsumption === 'moderate' || lifestyleData.alcoholConsumption === 'heavy') 
    factors.push('Alcohol consumption');
  if (lifestyleData.stressLevel === 'high') factors.push('High stress levels');
  
  return factors;
}

/**
 * Generate personalized health recommendations based on health data and risk scores
 */
export function generateHealthRecommendations(
  healthData: HealthData,
  lifestyleData: LifestyleData,
  riskScores: DiseaseRiskScores
): string[] {
  const recommendations: string[] = [];
  const bmi = calculateBMI(healthData.height, healthData.weight);

  // General recommendations for everyone
  recommendations.push('Stay hydrated by drinking at least 8 glasses of water daily');
  recommendations.push('Aim for 7-9 hours of quality sleep each night');

  // BMI-based recommendations
  if (bmi < 18.5) {
    recommendations.push('Consider increasing caloric intake with nutrient-dense foods');
    recommendations.push('Consult with a healthcare provider about healthy weight gain strategies');
  } else if (bmi >= 25 && bmi < 30) {
    recommendations.push('Aim for a 5-10% reduction in body weight to improve overall health');
    recommendations.push('Focus on portion control and balanced meals');
  } else if (bmi >= 30) {
    recommendations.push('A structured weight management program may be beneficial');
    recommendations.push('Consider consulting with a healthcare provider about weight management options');
  }

  // Lifestyle-based recommendations
  if (lifestyleData.exerciseFrequency === 'none' || lifestyleData.exerciseFrequency === 'light') {
    recommendations.push('Start with 30 minutes of moderate exercise, like brisk walking, most days of the week');
    recommendations.push('Look for opportunities to increase daily movement, such as taking stairs instead of elevators');
  }

  if (lifestyleData.smoking) {
    recommendations.push('Quitting smoking is one of the most important steps you can take for your health');
    recommendations.push('Consider nicotine replacement therapy or other smoking cessation aids');
  }

  if (lifestyleData.alcoholConsumption === 'moderate' || lifestyleData.alcoholConsumption === 'heavy') {
    recommendations.push('Reduce alcohol consumption to no more than 1 drink per day for women or 2 for men');
  }

  if (lifestyleData.stressLevel === 'high') {
    recommendations.push('Practice stress reduction techniques like meditation, deep breathing, or yoga');
    recommendations.push('Consider speaking with a mental health professional about stress management strategies');
  }

  // Disease-specific recommendations
  if (riskScores['Type 2 Diabetes']?.score > 50) {
    recommendations.push('Limit intake of refined carbohydrates and added sugars');
    recommendations.push('Consider regular blood glucose monitoring');
  }

  if (riskScores['Cardiovascular Disease']?.score > 40) {
    recommendations.push('Focus on heart-healthy eating patterns like the Mediterranean diet');
    recommendations.push('Incorporate heart-healthy omega-3 fatty acids from sources like fish or walnuts');
  }

  if (riskScores['Hypertension']?.score > 40) {
    recommendations.push('Reduce sodium intake to less than 2,300mg per day');
    recommendations.push('Consider home blood pressure monitoring');
  }

  return recommendations;
}

/**
 * Analyze news data for health trends that could affect the user
 * In a real implementation, this would use a real news API and NLP processing
 */
export async function analyzeNewsForHealthTrends(location: string): Promise<{
  disease: string;
  trend: string;
  source: string;
}[]> {
  // This is a simulation - in a real app, this would fetch actual news data
  // and analyze it with NLP techniques
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Return mock data
  return [
    {
      disease: 'Influenza',
      trend: 'Seasonal flu cases rising 15% above average in your area',
      source: 'County Health Department'
    },
    {
      disease: 'COVID-19',
      trend: 'New variant reported in neighboring counties',
      source: 'CDC Weekly Report'
    },
    {
      disease: 'Allergies',
      trend: 'Pollen counts unusually high for this time of year',
      source: 'National Allergy Bureau'
    }
  ];
}

/**
 * Generate personalized health coach messages based on user behavior
 */
export function generateHealthCoachMessages(
  healthData: HealthData,
  lifestyleData: LifestyleData,
  behaviorData: BehaviorData
): string[] {
  const messages: string[] = [];
  const { preferredCommunicationStyle, adherenceToPlan, appEngagement } = behaviorData;
  
  // Base message templates based on communication style
  const templates = {
    direct: [
      "Your current progress shows {metric}. You need to {action}.",
      "Based on your data, you should {action} immediately.",
      "Your {metric} is {status}. {action} to improve."
    ],
    motivational: [
      "You're making progress! Keep going with {action} to see even better results.",
      "I believe in you! Your {metric} will improve if you {action}.",
      "You've got this! Focus on {action} to boost your {metric}."
    ],
    educational: [
      "Research shows that {action} can significantly improve your {metric}.",
      "Improving your {metric} through {action} can lead to multiple health benefits including {benefit}.",
      "The science is clear: {action} directly impacts {metric}, which affects {benefit}."
    ],
    gentle: [
      "Perhaps consider {action} when you have time? It might help with {metric}.",
      "Would you be open to trying {action}? It could gently improve your {metric}.",
      "At your own pace, incorporating {action} might be something to consider for {metric}."
    ]
  };
  
  // Select template based on user's preferred style
  const selectedTemplates = templates[preferredCommunicationStyle] || templates.motivational;
  
  // Generate personalized messages based on health data and behavior
  if (adherenceToPlan < 50) {
    const template = selectedTemplates[0];
    messages.push(template
      .replace('{metric}', 'plan adherence')
      .replace('{action}', 'set more achievable daily goals')
      .replace('{status}', 'below target')
      .replace('{benefit}', 'consistent progress'));
  }
  
  const bmi = calculateBMI(healthData.height, healthData.weight);
  if (bmi > 25 && lifestyleData.exerciseFrequency === 'none') {
    const template = selectedTemplates[1];
    messages.push(template
      .replace('{metric}', 'physical activity level')
      .replace('{action}', 'incorporate a 10-minute walk after meals')
      .replace('{status}', 'lower than recommended')
      .replace('{benefit}', 'weight management and heart health'));
  }
  
  if (lifestyleData.stressLevel === 'high') {
    const template = selectedTemplates[2];
    messages.push(template
      .replace('{metric}', 'stress level')
      .replace('{action}', 'practice the 5-5-5 breathing technique twice daily')
      .replace('{status}', 'elevated')
      .replace('{benefit}', 'mental clarity and reduced blood pressure'));
  }
  
  return messages;
}

/**
 * Main function to generate a comprehensive health prediction and personalized recommendations
 */
export async function generateHealthPrediction(
  healthData: HealthData,
  lifestyleData: LifestyleData,
  behaviorData?: BehaviorData,
  location?: string
): Promise<HealthPrediction> {
  // Get disease risk scores
  const riskScores = await predictDiseaseWithBERT(healthData, lifestyleData);
  
  // Generate recommendations
  const recommendations = generateHealthRecommendations(healthData, lifestyleData, riskScores);
  
  // Generate insights
  const insights: string[] = [];
  
  // Add BMI insight
  const bmi = calculateBMI(healthData.height, healthData.weight);
  const bmiCategory = getBMICategory(bmi);
  insights.push(`Your BMI is ${bmi}, which is classified as ${bmiCategory}.`);
  
  // Add heart rate zone insight if heart rate data is available
  if (healthData.heartRate) {
    const zones = calculateHeartRateZones(healthData.age);
    const currentZone = zones.zones.find(zone => 
      healthData.heartRate! >= zone.min && healthData.heartRate! <= zone.max
    );
    if (currentZone) {
      insights.push(`Your current heart rate of ${healthData.heartRate} bpm places you in the ${currentZone.name} zone.`);
    }
  }
  
  // Add local trends if location is provided
  let localTrends;
  if (location) {
    const newsTrends = await analyzeNewsForHealthTrends(location);
    localTrends = newsTrends.map(item => ({
      disease: item.disease,
      prevalence: Math.random() * 10, // Simulated data
      change: Math.random() * 5 - 2.5 // Simulated change (-2.5 to +2.5)
    }));
    
    // Add news-based insight
    insights.push(`Based on local health reports, ${newsTrends[0].disease} cases are ${newsTrends[0].trend}.`);
  }
  
  return {
    riskScores,
    recommendations,
    insights,
    localTrends
  };
} 