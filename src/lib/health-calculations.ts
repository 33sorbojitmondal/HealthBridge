// health-calculations.ts - Functions for various health metric calculations

/**
 * Calculate Body Mass Index (BMI)
 * Formula: weight (kg) / height² (m²)
 * 
 * @param weight Weight in kilograms
 * @param height Height in meters
 * @returns BMI value and category
 */
export function calculateBMI(weight: number, height: number): { 
  value: number; 
  category: string;
  healthRisk: string;
} {
  if (weight <= 0 || height <= 0) {
    throw new Error('Weight and height must be positive values');
  }
  
  const bmi = weight / (height * height);
  
  // Determine BMI category and health risk
  let category: string;
  let healthRisk: string;
  
  if (bmi < 16.0) {
    category = 'Severe Thinness';
    healthRisk = 'Severe';
  } else if (bmi < 17.0) {
    category = 'Moderate Thinness';
    healthRisk = 'Moderate';
  } else if (bmi < 18.5) {
    category = 'Mild Thinness';
    healthRisk = 'Mild';
  } else if (bmi < 25.0) {
    category = 'Normal';
    healthRisk = 'Low';
  } else if (bmi < 30.0) {
    category = 'Overweight';
    healthRisk = 'Increased';
  } else if (bmi < 35.0) {
    category = 'Obese Class I';
    healthRisk = 'High';
  } else if (bmi < 40.0) {
    category = 'Obese Class II';
    healthRisk = 'Very High';
  } else {
    category = 'Obese Class III';
    healthRisk = 'Extremely High';
  }
  
  return {
    value: parseFloat(bmi.toFixed(1)),
    category,
    healthRisk
  };
}

/**
 * Gender type for BMR calculation
 */
export type Gender = 'male' | 'female';

/**
 * Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation
 * 
 * @param weight Weight in kilograms
 * @param height Height in centimeters
 * @param age Age in years
 * @param gender 'male' or 'female'
 * @returns BMR in calories per day
 */
export function calculateBMR(weight: number, height: number, age: number, gender: Gender): number {
  if (weight <= 0 || height <= 0 || age <= 0) {
    throw new Error('Weight, height, and age must be positive values');
  }
  
  // Mifflin-St Jeor Equation
  let bmr: number;
  
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  return Math.round(bmr);
}

/**
 * Activity level multipliers for TDEE calculation
 */
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * 
 * @param bmr Basal Metabolic Rate in calories
 * @param activityLevel Activity level
 * @returns TDEE in calories per day
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,      // Little or no exercise
    light: 1.375,        // Light exercise 1-3 days/week
    moderate: 1.55,      // Moderate exercise 3-5 days/week
    active: 1.725,       // Heavy exercise 6-7 days/week
    very_active: 1.9     // Very heavy exercise, physical job or training twice a day
  };
  
  return Math.round(bmr * multipliers[activityLevel]);
}

/**
 * Calculate Heart Rate Zones based on Karvonen formula
 * 
 * @param age Age in years
 * @param restingHR Resting heart rate in bpm
 * @returns Heart rate zones in bpm
 */
export function calculateHeartRateZones(age: number, restingHR: number): {
  zone1: [number, number]; // Recovery - 50-60%
  zone2: [number, number]; // Aerobic - 60-70%
  zone3: [number, number]; // Endurance - 70-80%
  zone4: [number, number]; // Strength - 80-90%
  zone5: [number, number]; // Anaerobic - 90-100%
} {
  if (age <= 0 || restingHR <= 0) {
    throw new Error('Age and resting heart rate must be positive values');
  }
  
  // Maximum heart rate using the Tanaka formula
  const maxHR = 208 - (0.7 * age);
  
  // Heart rate reserve
  const hrReserve = maxHR - restingHR;
  
  // Calculate zones using Karvonen formula
  const calculateZone = (lowerPercent: number, upperPercent: number): [number, number] => {
    const lower = Math.round(restingHR + (hrReserve * lowerPercent));
    const upper = Math.round(restingHR + (hrReserve * upperPercent));
    return [lower, upper];
  };
  
  return {
    zone1: calculateZone(0.5, 0.6),
    zone2: calculateZone(0.6, 0.7),
    zone3: calculateZone(0.7, 0.8),
    zone4: calculateZone(0.8, 0.9),
    zone5: calculateZone(0.9, 1.0)
  };
}

/**
 * Health metrics interface for risk score calculation
 */
export interface HealthMetrics {
  age: number;
  gender: Gender;
  weight: number; // kg
  height: number; // m
  isSmoker: boolean;
  hasDiabetes: boolean;
  hasFamilyHistoryOfHeartDisease: boolean;
  systolicBP: number; // mmHg
  diastolicBP: number; // mmHg
  cholesterolTotal: number; // mg/dL
  cholesterolHDL: number; // mg/dL (good cholesterol)
  physicalActivityMinutesPerWeek: number;
  alcoholDrinksPerWeek: number;
  veggieServingsPerDay: number;
}

/**
 * Calculate cardiovascular disease (CVD) risk score
 * This is a simplified risk model for educational purposes
 * A real medical risk score would use validated algorithms like Framingham or QRISK
 * 
 * @param metrics Health metrics
 * @returns Risk score (0-100) and classification
 */
export function calculateCVDRiskScore(metrics: HealthMetrics): {
  score: number;
  classification: string;
  explanation: string[];
} {
  // Starting score
  let score = 0;
  const explanation: string[] = [];
  
  // Age factor (age is a major risk factor)
  if (metrics.age > 65) {
    score += 20;
    explanation.push('Age over 65 significantly increases cardiovascular risk');
  } else if (metrics.age > 55) {
    score += 15;
    explanation.push('Age 55-65 moderately increases cardiovascular risk');
  } else if (metrics.age > 45) {
    score += 10;
    explanation.push('Age 45-55 slightly increases cardiovascular risk');
  } else if (metrics.age > 35) {
    score += 5;
    explanation.push('Age 35-45 has a small effect on cardiovascular risk');
  }
  
  // BMI factor
  const bmi = calculateBMI(metrics.weight, metrics.height);
  if (bmi.value >= 30) {
    score += 15;
    explanation.push('Obesity significantly increases cardiovascular risk');
  } else if (bmi.value >= 25) {
    score += 10;
    explanation.push('Being overweight increases cardiovascular risk');
  }
  
  // Smoking
  if (metrics.isSmoker) {
    score += 20;
    explanation.push('Smoking is a major risk factor for cardiovascular disease');
  }
  
  // Diabetes
  if (metrics.hasDiabetes) {
    score += 15;
    explanation.push('Diabetes significantly increases risk of cardiovascular problems');
  }
  
  // Family history
  if (metrics.hasFamilyHistoryOfHeartDisease) {
    score += 15;
    explanation.push('Family history of heart disease indicates genetic risk factors');
  }
  
  // Blood pressure
  if (metrics.systolicBP >= 140 || metrics.diastolicBP >= 90) {
    score += 15;
    explanation.push('Hypertension significantly increases cardiovascular risk');
  } else if (metrics.systolicBP >= 130 || metrics.diastolicBP >= 85) {
    score += 10;
    explanation.push('Elevated blood pressure increases cardiovascular risk');
  }
  
  // Cholesterol
  if (metrics.cholesterolTotal > 240) {
    score += 15;
    explanation.push('High total cholesterol is a significant risk factor');
  } else if (metrics.cholesterolTotal > 200) {
    score += 10;
    explanation.push('Borderline high cholesterol increases risk');
  }
  
  // HDL (good cholesterol) - higher is better
  if (metrics.cholesterolHDL < 40) {
    score += 10;
    explanation.push('Low HDL cholesterol increases cardiovascular risk');
  } else if (metrics.cholesterolHDL > 60) {
    score -= 10; // Protective effect
    explanation.push('High HDL cholesterol has a protective effect');
  }
  
  // Physical activity - protective
  if (metrics.physicalActivityMinutesPerWeek >= 150) {
    score -= 10;
    explanation.push('Regular physical activity reduces cardiovascular risk');
  } else if (metrics.physicalActivityMinutesPerWeek >= 75) {
    score -= 5;
    explanation.push('Some physical activity helps reduce cardiovascular risk');
  } else {
    score += 5;
    explanation.push('Insufficient physical activity increases risk');
  }
  
  // Alcohol consumption
  if (metrics.alcoholDrinksPerWeek > 14) {
    score += 10;
    explanation.push('Excessive alcohol consumption increases risk');
  } else if (metrics.alcoholDrinksPerWeek > 7) {
    score += 5;
    explanation.push('Moderate to high alcohol consumption may increase risk');
  }
  
  // Diet - protective
  if (metrics.veggieServingsPerDay >= 5) {
    score -= 5;
    explanation.push('A diet rich in vegetables and fruits reduces risk');
  } else if (metrics.veggieServingsPerDay < 2) {
    score += 5;
    explanation.push('Low consumption of vegetables and fruits may increase risk');
  }
  
  // Ensure score is within 0-100 range
  score = Math.max(0, Math.min(100, score));
  
  // Determine classification
  let classification: string;
  if (score < 20) {
    classification = 'Low Risk';
  } else if (score < 40) {
    classification = 'Moderate Risk';
  } else if (score < 60) {
    classification = 'High Risk';
  } else {
    classification = 'Very High Risk';
  }
  
  return {
    score,
    classification,
    explanation
  };
}

/**
 * Diabetes risk factors
 */
export interface DiabetesRiskFactors {
  age: number;
  gender: Gender;
  bmi: number;
  waistCircumference: number; // cm
  hasFamilyHistoryOfDiabetes: boolean;
  hasGestationalDiabetesHistory: boolean;
  hasPolycysticOvarySyndrome: boolean;
  hasHighBloodPressure: boolean;
  isPhysicallyActive: boolean;
  fastingGlucose?: number; // mg/dL, optional
}

/**
 * Calculate Type 2 Diabetes risk score
 * This is a simplified risk model for educational purposes
 * 
 * @param factors Risk factors
 * @returns Risk score (0-100) and classification
 */
export function calculateDiabetesRiskScore(factors: DiabetesRiskFactors): {
  score: number;
  classification: string;
  explanation: string[];
} {
  let score = 0;
  const explanation: string[] = [];
  
  // Age is a major factor
  if (factors.age >= 65) {
    score += 15;
    explanation.push('Age 65+ significantly increases diabetes risk');
  } else if (factors.age >= 45) {
    score += 10;
    explanation.push('Age 45-64 moderately increases diabetes risk');
  } else if (factors.age >= 25) {
    score += 5;
    explanation.push('Age 25-44 slightly increases diabetes risk');
  }
  
  // BMI
  if (factors.bmi >= 35) {
    score += 20;
    explanation.push('Severe obesity is a major risk factor for Type 2 diabetes');
  } else if (factors.bmi >= 30) {
    score += 15;
    explanation.push('Obesity increases diabetes risk');
  } else if (factors.bmi >= 25) {
    score += 10;
    explanation.push('Being overweight increases diabetes risk');
  }
  
  // Waist circumference - abdominal fat is a risk factor
  if (factors.gender === 'male' && factors.waistCircumference >= 102) {
    score += 10;
    explanation.push('High waist circumference in men indicates abdominal obesity, a risk factor');
  } else if (factors.gender === 'female' && factors.waistCircumference >= 88) {
    score += 10;
    explanation.push('High waist circumference in women indicates abdominal obesity, a risk factor');
  }
  
  // Family history
  if (factors.hasFamilyHistoryOfDiabetes) {
    score += 15;
    explanation.push('Family history of diabetes indicates genetic risk factors');
  }
  
  // Hypertension
  if (factors.hasHighBloodPressure) {
    score += 10;
    explanation.push('High blood pressure is associated with increased diabetes risk');
  }
  
  // Gender-specific risk factors
  if (factors.gender === 'female') {
    if (factors.hasGestationalDiabetesHistory) {
      score += 15;
      explanation.push('History of gestational diabetes significantly increases future diabetes risk');
    }
    
    if (factors.hasPolycysticOvarySyndrome) {
      score += 10;
      explanation.push('Polycystic ovary syndrome is associated with insulin resistance');
    }
  }
  
  // Physical activity - protective
  if (factors.isPhysicallyActive) {
    score -= 10;
    explanation.push('Regular physical activity reduces diabetes risk');
  } else {
    score += 5;
    explanation.push('Lack of physical activity increases diabetes risk');
  }
  
  // Fasting glucose (if available)
  if (factors.fastingGlucose) {
    if (factors.fastingGlucose >= 126) {
      score += 30;
      explanation.push('Fasting glucose ≥126 mg/dL indicates possible diabetes diagnosis');
    } else if (factors.fastingGlucose >= 100) {
      score += 20;
      explanation.push('Fasting glucose 100-125 mg/dL indicates prediabetes');
    }
  }
  
  // Ensure score is within 0-100 range
  score = Math.max(0, Math.min(100, score));
  
  // Determine classification
  let classification: string;
  if (score < 20) {
    classification = 'Low Risk';
  } else if (score < 40) {
    classification = 'Moderate Risk';
  } else if (score < 60) {
    classification = 'High Risk';
  } else {
    classification = 'Very High Risk';
  }
  
  return {
    score,
    classification,
    explanation
  };
} 